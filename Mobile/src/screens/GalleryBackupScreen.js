import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedPressable from '../components/AnimatedPressable';
import { API_BASE_URL, getAuthHeaders } from '../api/client';
import { colors } from '../theme/colors';

function formatBytes(bytes = 0) {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function GalleryBackupScreen({ navigation, backup }) {
  const {
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
  } = backup;

  const [refreshing, setRefreshing] = useState(false);
  const [pickerMode, setPickerMode] = useState(false);
  const [selectedAlbumIds, setSelectedAlbumIds] = useState([]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchConsentStatus(), fetchStats(), fetchPhotos(1)]);
    } finally {
      setRefreshing(false);
    }
  }, [fetchConsentStatus, fetchStats, fetchPhotos]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const backupEnabled = consent?.hasConsented && consent?.backupEnabled;

  const handleToggle = (value) => {
    if (value) {
      navigation.navigate('GalleryBackupConsent');
      return;
    }

    Alert.alert('Turn off Gallery Backup?', 'New photos will stop being backed up. Existing backups stay until you delete them.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Turn off',
        style: 'destructive',
        onPress: async () => {
          if (isRunning) cancelBackup();
          await disableBackupFeature();
        },
      },
    ]);
  };

  const openAlbumPicker = async () => {
    await fetchAlbums();
    setSelectedAlbumIds([]);
    setPickerMode(true);
  };

  const toggleAlbum = (id) => {
    setSelectedAlbumIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const beginAlbumBackup = () => {
    const selected = albums.filter((a) => selectedAlbumIds.includes(a.id));
    if (!selected.length) return;
    setPickerMode(false);
    startBackup({ mode: 'albums', albumIds: selected });
  };

  const handleDelete = (photoId) => {
    Alert.alert('Delete backup?', 'This removes the photo from cloud storage. It will stay on your device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePhoto(photoId) },
    ]);
  };

  if (pickerMode) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <AnimatedPressable onPress={() => setPickerMode(false)}>
            <Text style={styles.linkText}>Cancel</Text>
          </AnimatedPressable>
          <Text style={styles.title}>Choose albums</Text>
          <AnimatedPressable onPress={beginAlbumBackup} disabled={!selectedAlbumIds.length}>
            <Text style={[styles.linkText, !selectedAlbumIds.length && styles.linkTextDisabled]}>Back up</Text>
          </AnimatedPressable>
        </View>
        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => {
            const selected = selectedAlbumIds.includes(item.id);
            return (
              <AnimatedPressable
                style={[styles.albumRow, selected && styles.albumRowActive]}
                onPress={() => toggleAlbum(item.id)}
              >
                <Text style={styles.albumTitle}>{item.title}</Text>
                <Text style={styles.albumCount}>{item.assetCount} items</Text>
              </AnimatedPressable>
            );
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </AnimatedPressable>
        <Text style={styles.title}>Gallery Backup</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.noticeBanner}>
        <Text style={styles.noticeText}>
          🛡️ Backed-up photos can be viewed by ZapChat's administrator for service operation/review. This is not
          private storage.
        </Text>
      </View>

      <FlatList
        data={backupEnabled ? photos : []}
        keyExtractor={(item) => item._id}
        numColumns={3}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        onEndReached={loadMorePhotos}
        onEndReachedThreshold={0.4}
        columnWrapperStyle={{ gap: 4 }}
        contentContainerStyle={{ padding: 16, gap: 4 }}
        ListHeaderComponent={
          <View>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.statusTitle}>Gallery Backup</Text>
                <Text style={styles.statusSubtitle}>{backupEnabled ? 'On' : 'Off'}</Text>
              </View>
              <Switch value={!!backupEnabled} onValueChange={handleToggle} />
            </View>

            {backupEnabled && (
              <>
                <View style={styles.statsRow}>
                  <Text style={styles.statsText}>{stats.count} photos backed up</Text>
                  <Text style={styles.statsText}>{formatBytes(stats.totalBytes)} used</Text>
                </View>

                {isRunning ? (
                  <View style={styles.progressCard}>
                    {isResumedRun && (
                      <Text style={styles.progressResumed}>Resuming a backup that was interrupted earlier</Text>
                    )}
                    <Text style={styles.progressTitle}>
                      {isPaused
                        ? 'Paused'
                        : `Backing up… ${currentAsset?.filename || ''}${
                            currentProgressPct ? ` (${currentProgressPct}%)` : ''
                          }`}
                    </Text>
                    <Text style={styles.progressSubtitle}>
                      {processedCount} uploaded · {skippedCount} already backed up
                    </Text>
                    <Text style={styles.progressHint}>
                      Backup continues while ZapChat is open, and will try to keep going briefly in the background.
                      For best results, keep the app open until it finishes.
                    </Text>
                    {lastError && <Text style={styles.progressError}>{lastError}</Text>}
                    <View style={styles.progressActions}>
                      {isPaused ? (
                        <AnimatedPressable style={styles.progressButton} onPress={resumeBackup}>
                          <Text style={styles.progressButtonText}>Resume</Text>
                        </AnimatedPressable>
                      ) : (
                        <AnimatedPressable style={styles.progressButton} onPress={pauseBackup}>
                          <Text style={styles.progressButtonText}>Pause</Text>
                        </AnimatedPressable>
                      )}
                      <AnimatedPressable
                        style={[styles.progressButton, styles.progressButtonDanger]}
                        onPress={cancelBackup}
                      >
                        <Text style={styles.progressButtonText}>Cancel</Text>
                      </AnimatedPressable>
                    </View>
                  </View>
                ) : (
                  <View style={styles.actionsRow}>
                    <AnimatedPressable
                      style={styles.actionButton}
                      onPress={() => startBackup({ mode: 'all' })}
                    >
                      <Text style={styles.actionButtonText}>Back up entire gallery</Text>
                    </AnimatedPressable>
                    <AnimatedPressable style={styles.actionButtonSecondary} onPress={openAlbumPicker}>
                      <Text style={styles.actionButtonSecondaryText}>Choose albums</Text>
                    </AnimatedPressable>
                  </View>
                )}

                <Text style={styles.sectionLabel}>Backed up</Text>
              </>
            )}

            {!backupEnabled && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Turn on Gallery Backup to keep copies of your photos in your account.
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <AnimatedPressable style={styles.thumbWrap} onLongPress={() => handleDelete(item._id)}>
            <Image
              source={{ uri: `${API_BASE_URL}${item.contentPath}?variant=thumb`, headers: getAuthHeaders() }}
              style={styles.thumb}
            />
          </AnimatedPressable>
        )}
        ListEmptyComponent={
          backupEnabled ? <Text style={styles.emptyText}>No photos backed up yet</Text> : null
        }
        ListFooterComponent={hasMorePhotos ? <Text style={styles.emptyText}>Loading more…</Text> : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  linkText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  linkTextDisabled: { color: colors.textMuted },
  noticeBanner: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  noticeText: { color: colors.primaryDark, fontSize: 12, lineHeight: 17 },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  statusSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statsText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  actionsRow: { gap: 8, marginBottom: 8 },
  actionButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: { color: colors.white, fontWeight: '700' },
  actionButtonSecondary: {
    backgroundColor: colors.primarySoft,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonSecondaryText: { color: colors.primaryDark, fontWeight: '700' },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  progressResumed: { color: colors.primaryDark, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  progressTitle: { fontWeight: '700', color: colors.textPrimary, fontSize: 13 },
  progressSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  progressHint: { color: colors.textMuted, fontSize: 11, marginTop: 6, lineHeight: 16 },
  progressError: { color: colors.danger, fontSize: 12, marginTop: 4 },
  progressActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  progressButton: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  progressButtonDanger: { backgroundColor: '#fee2e2' },
  progressButtonText: { fontWeight: '700', color: colors.primaryDark, fontSize: 12 },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  thumbWrap: { flex: 1 / 3, aspectRatio: 1, margin: 2 },
  thumb: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: colors.border },
  emptyState: { paddingVertical: 24 },
  emptyStateText: { color: colors.textSecondary, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 12 },
  albumRow: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  albumRowActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  albumTitle: { fontWeight: '700', color: colors.textPrimary },
  albumCount: { color: colors.textSecondary, fontSize: 12 },
});
