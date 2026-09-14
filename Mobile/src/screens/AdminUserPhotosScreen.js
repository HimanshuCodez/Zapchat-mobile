import React, { useState } from 'react';
import { Alert, FlatList, Image, StyleSheet, Text, View } from 'react-native';
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

export default function AdminUserPhotosScreen({ navigation, admin }) {
  const { selectedUser, userPhotos, hasMoreUserPhotos, loadMoreUserPhotos, deletePhoto } = admin;
  const [query, setQuery] = useState('');

  const filtered = query
    ? userPhotos.filter((p) => (p.albumName || '').toLowerCase().includes(query.toLowerCase()))
    : userPhotos;

  const handleOpenPhoto = (photo) => {
    navigation.navigate('AdminPhotoViewer', { photo });
  };

  const handleDelete = (photo) => {
    Alert.alert('Delete this photo?', 'This permanently removes it from storage.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deletePhoto(photo._id) },
    ]);
  };

  if (!selectedUser) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>
            {selectedUser.fullname}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {selectedUser.email}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        numColumns={3}
        columnWrapperStyle={{ gap: 4 }}
        contentContainerStyle={{ padding: 16, gap: 4 }}
        onEndReached={loadMoreUserPhotos}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <AnimatedPressable
            style={styles.thumbWrap}
            onPress={() => handleOpenPhoto(item)}
            onLongPress={() => handleDelete(item)}
          >
            <Image
              source={{ uri: `${API_BASE_URL}${item.contentPath}?variant=thumb`, headers: getAuthHeaders() }}
              style={styles.thumb}
            />
          </AnimatedPressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No backed-up photos</Text>}
        ListFooterComponent={hasMoreUserPhotos ? <Text style={styles.emptyText}>Loading more…</Text> : null}
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
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  subtitle: { fontSize: 11, color: colors.textSecondary },
  linkText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  thumbWrap: { flex: 1 / 3, aspectRatio: 1, margin: 2 },
  thumb: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: colors.border },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 18 },
});
