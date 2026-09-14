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
            Hi, {user?.fullname || 'friend'}
          </Text>
          <Text style={styles.subText}>Your chats</Text>
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
              <Avatar icon="◎" size={46} backgroundColor={colors.primary} />
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
              <Avatar icon="⚡" size={46} backgroundColor={colors.ai} />
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
              <Avatar icon="＋" size={46} backgroundColor={colors.textSecondary} />
              <View style={styles.userMeta}>
                <Text style={styles.aiName}>New Group</Text>
                <Text style={styles.aiSubtitle} numberOfLines={1}>
                  Chat with multiple contacts at once
                </Text>
              </View>
            </AnimatedPressable>
            {onOpenGalleryBackup && (
              <AnimatedPressable style={styles.aiRow} onPress={onOpenGalleryBackup}>
                <Avatar icon="☁️" size={46} backgroundColor={colors.primary} />
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
                <Avatar icon="🛡️" size={46} backgroundColor={colors.textPrimary} />
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
              <Avatar label={item.fullname} size={44} />
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
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
  },
  topBarText: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutText: {
    color: colors.white,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  aiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.aiSoft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#b6ebe9',
  },
  aiName: {
    color: colors.aiDark,
    fontSize: 16,
    fontWeight: '800',
  },
  aiSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  sectionLabel: {
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 4,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 16,
  },
  userRowPinned: {
    backgroundColor: colors.primarySoft,
  },
  userMeta: {
    flex: 1,
    marginLeft: 12,
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
    fontWeight: '700',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 12,
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
    width: 12,
    height: 12,
    borderRadius: 6,
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
