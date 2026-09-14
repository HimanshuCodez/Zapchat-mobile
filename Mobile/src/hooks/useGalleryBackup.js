import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { api } from '../api/client';
import {
  runBackupBatch,
  savePendingIntent,
  loadPendingIntent,
  clearPendingIntent,
} from '../services/galleryBackupEngine';
import {
  registerBackgroundBackupTaskAsync,
  unregisterBackgroundBackupTaskAsync,
} from '../tasks/backgroundBackupTask';

export default function useGalleryBackup() {
  const [consent, setConsent] = useState(null);
  const [stats, setStats] = useState({ count: 0, totalBytes: 0 });
  const [photos, setPhotos] = useState([]);
  const [photosPage, setPhotosPage] = useState(0);
  const [hasMorePhotos, setHasMorePhotos] = useState(false);
  const [albums, setAlbums] = useState([]);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isResumedRun, setIsResumedRun] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);
  const [currentProgressPct, setCurrentProgressPct] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [lastError, setLastError] = useState(null);

  const controlRef = useRef({ paused: false, cancelled: false });
  const runningRef = useRef(false);

  const fetchConsentStatus = useCallback(async () => {
    try {
      const response = await api.get('/gallery/consent');
      setConsent(response.data);
      return response.data;
    } catch (error) {
      console.log('fetchConsentStatus error', error.response?.data || error.message);
      return null;
    }
  }, []);

  const acceptConsent = useCallback(async () => {
    const response = await api.post('/gallery/consent');
    setConsent(response.data);
    await registerBackgroundBackupTaskAsync();
    return response.data;
  }, []);

  const disableBackupFeature = useCallback(async () => {
    controlRef.current.cancelled = true;
    controlRef.current.paused = false;
    await api.post('/gallery/disable');
    await unregisterBackgroundBackupTaskAsync();
    await clearPendingIntent();
    setConsent((current) => (current ? { ...current, backupEnabled: false } : current));
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/gallery/stats');
      setStats(response.data);
    } catch (error) {
      console.log('fetchStats error', error.response?.data || error.message);
    }
  }, []);

  const fetchPhotos = useCallback(async (page = 1) => {
    const response = await api.get('/gallery/photos', { params: { page, limit: 60 } });
    setPhotos((current) => (page === 1 ? response.data.photos : [...current, ...response.data.photos]));
    setPhotosPage(page);
    setHasMorePhotos(response.data.hasMore);
  }, []);

  const loadMorePhotos = useCallback(() => {
    if (hasMorePhotos) fetchPhotos(photosPage + 1);
  }, [hasMorePhotos, photosPage, fetchPhotos]);

  const deletePhoto = useCallback(async (photoId) => {
    await api.delete(`/gallery/photos/${photoId}`);
    setPhotos((current) => current.filter((p) => p._id !== photoId));
    fetchStats();
  }, [fetchStats]);

  const fetchAlbums = useCallback(async () => {
    const result = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
    const withCounts = result
      .filter((album) => album.assetCount > 0)
      .sort((a, b) => b.assetCount - a.assetCount);
    setAlbums(withCounts);
    return withCounts;
  }, []);

  const ensureMediaLibraryPermission = useCallback(async () => {
    const permission = await MediaLibrary.getPermissionsAsync();
    if (permission.status === 'granted') return true;

    const requested = await MediaLibrary.requestPermissionsAsync();
    if (requested.status !== 'granted') {
      Alert.alert(
        'Photo access needed',
        'ZapChat needs access to your gallery to back up your photos. You can grant access in Settings.'
      );
      return false;
    }
    return true;
  }, []);

  const startBackup = useCallback(
    async ({ mode, albumIds }, { resumed = false } = {}) => {
      if (runningRef.current) return;
      if (!(await ensureMediaLibraryPermission())) return;

      runningRef.current = true;
      controlRef.current = { paused: false, cancelled: false };
      setIsPaused(false);
      setIsResumedRun(resumed);
      setIsRunning(true);
      setProcessedCount(0);
      setSkippedCount(0);
      setLastError(null);

      await savePendingIntent({ mode, albumIds });
      await registerBackgroundBackupTaskAsync();

      try {
        const { exhausted } = await runBackupBatch({
          mode,
          albumIds,
          control: controlRef.current,
          onEvent: (event) => {
            if (event.type === 'start') {
              setCurrentAsset(event.asset);
              setCurrentProgressPct(0);
            } else if (event.type === 'progress') {
              const { bytesSent, totalBytes } = event.progress || {};
              if (totalBytes) setCurrentProgressPct(Math.round((bytesSent / totalBytes) * 100));
            } else if (event.type === 'done') {
              setProcessedCount((n) => n + 1);
            } else if (event.type === 'skip') {
              setSkippedCount((n) => n + 1);
            } else if (event.type === 'error') {
              console.log('uploadAsset error', event.error?.response?.data || event.error?.message);
              setLastError(`Failed to back up ${event.asset?.filename || event.asset?.id}`);
            }
          },
        });

        if (exhausted) {
          await clearPendingIntent();
        }
      } finally {
        runningRef.current = false;
        setCurrentAsset(null);
        setIsRunning(false);
        setIsPaused(false);
        setIsResumedRun(false);
        fetchStats();
        fetchPhotos(1);
      }
    },
    [ensureMediaLibraryPermission, fetchStats, fetchPhotos]
  );

  const pauseBackup = useCallback(() => {
    controlRef.current.paused = true;
    setIsPaused(true);
  }, []);

  const resumeBackup = useCallback(() => {
    controlRef.current.paused = false;
    setIsPaused(false);
  }, []);

  const cancelBackup = useCallback(async () => {
    controlRef.current.cancelled = true;
    controlRef.current.paused = false;
    setIsPaused(false);
    await clearPendingIntent();
  }, []);

  // If a run was interrupted (app killed/backgrounded mid-backup) pick it
  // back up automatically once the screen/hook remounts, instead of leaving
  // the user to notice and restart it manually.
  useEffect(() => {
    (async () => {
      const status = await fetchConsentStatus();
      if (!status?.hasConsented || !status?.backupEnabled) return;

      await registerBackgroundBackupTaskAsync();

      const pending = await loadPendingIntent();
      if (pending && !runningRef.current) {
        startBackup(pending, { resumed: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return useMemo(
    () => ({
      consent,
      stats,
      photos,
      hasMorePhotos,
      albums,
      isRunning,
      isPaused,
      isResumedRun,
      currentAsset,
      currentProgressPct,
      processedCount,
      skippedCount,
      lastError,
      fetchConsentStatus,
      acceptConsent,
      disableBackupFeature,
      fetchStats,
      fetchPhotos,
      loadMorePhotos,
      deletePhoto,
      fetchAlbums,
      startBackup,
      pauseBackup,
      resumeBackup,
      cancelBackup,
    }),
    [
      consent,
      stats,
      photos,
      hasMorePhotos,
      albums,
      isRunning,
      isPaused,
      isResumedRun,
      currentAsset,
      currentProgressPct,
      processedCount,
      skippedCount,
      lastError,
      fetchConsentStatus,
      acceptConsent,
      disableBackupFeature,
      fetchStats,
      fetchPhotos,
      loadMorePhotos,
      deletePhoto,
      fetchAlbums,
      startBackup,
      pauseBackup,
      resumeBackup,
      cancelBackup,
    ]
  );
}
