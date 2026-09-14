import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import { File, UploadType } from 'expo-file-system';
import { api } from '../api/client';

// Persists which backup run (if any) is in progress so it can resume after
// the app is backgrounded/killed and relaunched, or picked up by the
// periodic background task instead of restarting from scratch.
const PENDING_INTENT_KEY = 'zapchat_gallery_backup_pending_intent';

export async function savePendingIntent(intent) {
  await AsyncStorage.setItem(PENDING_INTENT_KEY, JSON.stringify(intent));
}

export async function loadPendingIntent() {
  const raw = await AsyncStorage.getItem(PENDING_INTENT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearPendingIntent() {
  await AsyncStorage.removeItem(PENDING_INTENT_KEY);
}

function guessMimeType(asset) {
  const ext = (asset.filename || '').split('.').pop()?.toLowerCase();
  if (asset.mediaType === 'video') {
    return ext === 'mov' ? 'video/quicktime' : 'video/mp4';
  }
  if (ext === 'png') return 'image/png';
  if (ext === 'heic') return 'image/heic';
  return 'image/jpeg';
}

// Walks the device gallery page by page instead of loading everything into
// memory up front, so pause/cancel/time-budget checks can act between pages
// even on very large libraries.
async function* iterateAssets({ mode, albumIds }) {
  const mediaType = ['photo', 'video'];
  const sortBy = [[MediaLibrary.SortBy.creationTime, false]];

  if (mode === 'all') {
    let after;
    for (;;) {
      const page = await MediaLibrary.getAssetsAsync({ first: 40, after, mediaType, sortBy });
      for (const asset of page.assets) yield asset;
      if (!page.hasNextPage) return;
      after = page.endCursor;
    }
  } else {
    for (const album of albumIds || []) {
      let after;
      for (;;) {
        const page = await MediaLibrary.getAssetsAsync({ album: album.id, first: 40, after, mediaType, sortBy });
        for (const asset of page.assets) yield { ...asset, __albumName: album.title };
        if (!page.hasNextPage) return;
        after = page.endCursor;
      }
    }
  }
}

export async function fetchBackedUpIds() {
  const response = await api.get('/gallery/backed-up-ids');
  return new Set(response.data.ids || []);
}

// Uses expo-file-system's native upload task (sessionType: 'background') so a
// single in-flight transfer can keep going on iOS even if the app is
// suspended mid-upload, instead of a plain fetch/axios call that dies with
// the JS runtime.
export async function uploadAsset(asset, { onProgress } = {}) {
  const info = await MediaLibrary.getAssetInfoAsync(asset);
  const localUri = info.localUri || asset.uri;
  const resourceType = asset.mediaType === 'video' ? 'video' : 'image';

  const signatureResponse = await api.post('/gallery/upload-signature', { resourceType });
  const { uploadUrl, apiKey, timestamp, signature, folder, publicId, type } = signatureResponse.data;

  const file = new File(localUri);
  const task = file.createUploadTask(uploadUrl, {
    uploadType: UploadType.MULTIPART,
    fieldName: 'file',
    mimeType: guessMimeType(asset),
    parameters: {
      api_key: apiKey,
      timestamp: String(timestamp),
      signature,
      folder,
      public_id: publicId,
      type,
    },
    sessionType: 'background',
    onProgress: onProgress ? ({ bytesSent, totalBytes }) => onProgress({ bytesSent, totalBytes }) : undefined,
  });

  const result = await task.uploadAsync();
  if (!result || result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed with status ${result?.status}`);
  }

  const uploaded = JSON.parse(result.body);

  await api.post('/gallery/photos', {
    publicId: uploaded.public_id,
    resourceType,
    localAssetId: asset.id,
    takenAt: asset.creationTime ? new Date(asset.creationTime).toISOString() : undefined,
    albumName: asset.__albumName,
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Runs (a slice of) a backup intent. `exhausted: true` in the result means the
// whole intended set (entire gallery or the chosen albums) was walked to the
// end with nothing left to upload - safe for a caller to clear the pending
// intent. `exhausted: false` means it stopped early (paused/cancelled/time
// budget) and should be resumed later from the same intent.
export async function runBackupBatch({ mode, albumIds, control, onEvent, timeBudgetMs }) {
  const startedAt = Date.now();
  const backedUpIds = await fetchBackedUpIds();
  let processed = 0;
  let skipped = 0;

  for await (const asset of iterateAssets({ mode, albumIds })) {
    if (control?.cancelled) return { processed, skipped, exhausted: false };

    while (control?.paused && !control?.cancelled) {
      await sleep(300);
    }
    if (control?.cancelled) return { processed, skipped, exhausted: false };

    if (timeBudgetMs && Date.now() - startedAt > timeBudgetMs) {
      return { processed, skipped, exhausted: false };
    }

    if (backedUpIds.has(asset.id)) {
      skipped += 1;
      onEvent?.({ type: 'skip', asset });
      continue;
    }

    onEvent?.({ type: 'start', asset });
    try {
      await uploadAsset(asset, {
        onProgress: (progress) => onEvent?.({ type: 'progress', asset, progress }),
      });
      backedUpIds.add(asset.id);
      processed += 1;
      onEvent?.({ type: 'done', asset });
    } catch (error) {
      onEvent?.({ type: 'error', asset, error });
    }
  }

  return { processed, skipped, exhausted: true };
}
