import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors } from '../theme/colors';

function formatBytes(bytes = 0) {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function AdminScreen({ navigation, admin }) {
  const { users, globalStats, fetchUsers, fetchGlobalStats, openUser } = admin;
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchGlobalStats();
  }, [fetchUsers, fetchGlobalStats]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchUsers(query.trim() || undefined), 300);
    return () => clearTimeout(timeout);
  }, [query, fetchUsers]);

  const handleSelectUser = async (user) => {
    await openUser(user);
    navigation.navigate('AdminUserPhotos');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Back</Text>
        </AnimatedPressable>
        <Text style={styles.title}>Admin Dashboard</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.noticeBanner}>
        <Text style={styles.noticeText}>
          Every photo you open here is logged with your admin account, the user, and the time.
        </Text>
      </View>

      {globalStats && (
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{globalStats.userCount}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{globalStats.backupEnabledCount}</Text>
            <Text style={styles.statLabel}>Backup on</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{globalStats.photoCount}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatBytes(globalStats.totalBytes)}</Text>
            <Text style={styles.statLabel}>Storage</Text>
          </View>
        </View>
      )}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search users by name or email"
        placeholderTextColor={colors.placeholder}
        style={styles.searchInput}
      />

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        renderItem={({ item }) => (
          <AnimatedPressable style={styles.userRow} onPress={() => handleSelectUser(item)}>
            <Avatar label={item.fullname} size={44} />
            <View style={styles.userMeta}>
              <Text style={styles.userName} numberOfLines={1}>
                {item.fullname}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {item.email}
              </Text>
            </View>
            <View style={styles.userStats}>
              <Text style={styles.userStatsText}>{item.backupPhotoCount} photos</Text>
              <Text style={styles.userStatsText}>{formatBytes(item.backupTotalBytes)}</Text>
            </View>
          </AnimatedPressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
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
  noticeBanner: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  noticeText: { color: '#92400e', fontSize: 12, lineHeight: 17 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 8,
  },
  statCard: {
    flexBasis: '23%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  searchInput: {
    marginHorizontal: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.white,
    color: colors.textPrimary,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  userMeta: { flex: 1, marginLeft: 12 },
  userName: { fontWeight: '700', color: colors.textPrimary, fontSize: 15 },
  userEmail: { color: colors.textSecondary, fontSize: 12 },
  userStats: { alignItems: 'flex-end' },
  userStatsText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  emptyText: { textAlign: 'center', color: colors.textSecondary, marginTop: 18 },
});
