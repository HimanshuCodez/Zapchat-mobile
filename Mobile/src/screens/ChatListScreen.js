import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import Avatar from '../components/Avatar';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors } from '../theme/colors';

export default function ChatListScreen({
  navigation,
  user,
  chatUsers,
  groups,
  onSelectUser,
  onSelectGroup,
  onLogout,
  onOpenStatus,
  onTogglePin,
  onOpenGalleryBackup,
  onOpenAdmin,
}) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <View style={styles.topBarText}>
          <Text style={styles.greeting} numberOfLines={1}>
            ZapChat
          </Text>
          <Text style={styles.subText}>Hi, {user?.fullname || 'friend'}</Text>
        </View>
        <AnimatedPressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </AnimatedPressable>
      </View>

      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.duration(350)}>
            <AnimatedPressable style={styles.aiRow} onPress={onOpenStatus}>
              <Avatar icon="◎" size={50} backgroundColor={colors.primary} />
              <View style={styles.userMeta}>
                <Text style={styles.aiName}>Status</Text>
                <Text style={styles.aiSubtitle} numberOfLines={1}>
                  Share a photo, text, or song update
                </Text>
              </View>
            </AnimatedPressable>
            <AnimatedPressable
              style={styles.aiRow}
              onPress={() => navigation.navigate('ZapAI')}
            >
              <Avatar icon="⚡" size={50} backgroundColor={colors.ai} />
              <View style={styles.userMeta}>
                <Text style={styles.aiName}>Zap AI</Text>
                <Text style={styles.aiSubtitle} numberOfLines={1}>
                  Ask me anything, anytime ✨
                </Text>
              </View>
            </AnimatedPressable>
            <AnimatedPressable
              style={styles.aiRow}
              onPress={() => navigation.navigate('CreateGroup')}
            >
              <Avatar icon="＋" size={50} backgroundColor={colors.textSecondary} />
              <View style={styles.userMeta}>
                <Text style={styles.aiName}>New Group</Text>
                <Text style={styles.aiSubtitle} numberOfLines={1}>
                  Chat with multiple contacts at once
                </Text>
              </View>
            </AnimatedPressable>
            {onOpenGalleryBackup && (
              <AnimatedPressable style={styles.aiRow} onPress={onOpenGalleryBackup}>
                <Avatar icon="☁️" size={50} backgroundColor={colors.primary} />
                <View style={styles.userMeta}>
                  <Text style={styles.aiName}>Gallery Backup</Text>
                  <Text style={styles.aiSubtitle} numberOfLines={1}>
                    Back up your photos to your account
                  </Text>
                </View>
              </AnimatedPressable>
            )}
            {onOpenAdmin && (
              <AnimatedPressable style={styles.aiRow} onPress={onOpenAdmin}>
                <Avatar icon="🛡️" size={50} backgroundColor={colors.textPrimary} />
                <View style={styles.userMeta}>
                  <Text style={styles.aiName}>Admin Dashboard</Text>
                  <Text style={styles.aiSubtitle} numberOfLines={1}>
                    Manage users and backed-up photos
                  </Text>
                </View>
              </AnimatedPressable>
            )}
            {groups?.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Groups</Text>
                {groups.map((group) => (
                  <AnimatedPressable
                    key={group._id}
                    style={styles.userRow}
                    onPress={() => onSelectGroup(group)}
                  >
                    <Avatar label={group.name} size={44} backgroundColor={colors.primary} />
                    <View style={styles.userMeta}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {group.name}
                      </Text>
                      <Text style={styles.userEmail} numberOfLines={1}>
                        {group.members?.length || 0} members
                      </Text>
                    </View>
                  </AnimatedPressable>
                ))}
                <Text style={styles.sectionLabel}>Chats</Text>
              </>
            )}
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInRight.delay(Math.min(index, 8) * 40).duration(300)}>
            <AnimatedPressable
              style={[styles.userRow, item.isPinned && styles.userRowPinned]}
              onPress={() => onSelectUser(item)}
              onLongPress={() => onTogglePin(item._id)}
            >
              <Avatar label={item.fullname} size={50} />
              <View style={styles.userMeta}>
                <View style={styles.nameRow}>
                  {item.isPinned && <Text style={styles.pinIcon}>📌</Text>}
                  <Text style={styles.userName} numberOfLines={1}>
                    {item.fullname}
                  </Text>
                </View>
                <Text style={styles.userEmail} numberOfLines={1}>
                  {item.isOnline ? 'Online' : item.email}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <AnimatedPressable hitSlop={10} onPress={() => onTogglePin(item._id)}>
                  <Text style={[styles.pinButton, item.isPinned && styles.pinButtonActive]}>📌</Text>
                </AnimatedPressable>
                <View style={[styles.onlineDot, item.isOnline && styles.onlineDotActive]} />
              </View>
            </AnimatedPressable>
          </Animated.View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No users yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
  },
  topBarText: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 21,
    fontWeight: '700',
    color: colors.white,
  },
  subText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 1,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aiName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  aiSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  sectionLabel: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 2,
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  userRowPinned: {
    backgroundColor: colors.primarySoft,
  },
  userMeta: {
    flex: 1,
    marginLeft: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinIcon: {
    fontSize: 11,
    marginRight: 4,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  rowActions: {
    alignItems: 'center',
    gap: 8,
  },
  pinButton: {
    fontSize: 16,
    opacity: 0.25,
  },
  pinButtonActive: {
    opacity: 1,
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.borderStrong,
  },
  onlineDotActive: {
    backgroundColor: colors.success,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 18,
  },
});
