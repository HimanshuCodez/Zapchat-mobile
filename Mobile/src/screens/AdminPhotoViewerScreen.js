import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
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

export default function AdminPhotoViewerScreen({ navigation, route }) {
  const { photo } = route.params;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Close</Text>
        </AnimatedPressable>
        <Text style={styles.title}>Full resolution</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.imageWrap}>
        {error && <Text style={styles.errorText}>Could not load this photo</Text>}
        {!loaded && !error && <ActivityIndicator color={colors.white} />}
        {!error && (
          // Fetching this - the ?variant=full request - is the actual "view"
          // event the server records in the admin access log.
          <Image
            source={{ uri: `${API_BASE_URL}${photo.contentPath}?variant=full`, headers: getAuthHeaders() }}
            style={[styles.image, !loaded && styles.imageHidden]}
            resizeMode="contain"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {photo.width}×{photo.height} · {formatBytes(photo.bytes)}
        </Text>
        {photo.albumName && <Text style={styles.metaText}>Album: {photo.albumName}</Text>}
        <Text style={styles.metaText}>Backed up {new Date(photo.createdAt).toLocaleString()}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.white },
  linkText: { color: colors.white, fontWeight: '700', fontSize: 14 },
  imageWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  imageHidden: { opacity: 0 },
  errorText: { color: colors.white },
  meta: { padding: 16 },
  metaText: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginBottom: 2 },
});
