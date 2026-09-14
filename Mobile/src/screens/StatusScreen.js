import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import Avatar from '../components/Avatar';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors } from '../theme/colors';

export default function StatusScreen({ navigation, user, statusGroups, myStatusGroup, onOpenGroup }) {
  const contactGroups = statusGroups.filter((group) => group.user._id !== user._id);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'‹'} Back</Text>
        </AnimatedPressable>
        <Text style={styles.title}>Status</Text>
        <View style={styles.backSpacer} />
      </View>

      <FlatList
        data={contactGroups}
        keyExtractor={(item) => item.user._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.duration(300)}>
            <AnimatedPressable
              style={styles.row}
              onPress={() =>
                myStatusGroup
                  ? onOpenGroup(myStatusGroup)
                  : navigation.navigate('CreateStatus')
              }
              onLongPress={() => navigation.navigate('CreateStatus')}
            >
              <Avatar
                label={user.fullname}
                size={50}
                ringColor={myStatusGroup ? colors.success : undefined}
              />
              <View style={styles.meta}>
                <Text style={styles.name}>My status</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {myStatusGroup ? `${myStatusGroup.statuses.length} update(s) · tap to view` : 'Tap to add a status update'}
                </Text>
              </View>
              <AnimatedPressable style={styles.addButton} onPress={() => navigation.navigate('CreateStatus')}>
                <Text style={styles.addButtonText}>+</Text>
              </AnimatedPressable>
            </AnimatedPressable>
            <Text style={styles.sectionLabel}>Recent updates</Text>
          </Animated.View>
        }
        renderItem={({ item, index }) => {
          const hasUnseen = item.statuses.some((status) => !status.viewedByMe);
          return (
            <Animated.View entering={FadeInRight.delay(Math.min(index, 8) * 40).duration(300)}>
              <AnimatedPressable style={styles.row} onPress={() => onOpenGroup(item)}>
                <Avatar
                  label={item.user.fullname}
                  size={50}
                  ringColor={hasUnseen ? colors.primary : colors.borderStrong}
                />
                <View style={styles.meta}>
                  <Text style={styles.name} numberOfLines={1}>
                    {item.user.fullname}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {item.statuses.length} update(s)
                    {item.statuses[item.statuses.length - 1]?.song ? ` · 🎵 ${item.statuses[item.statuses.length - 1].song.title}` : ''}
                  </Text>
                </View>
              </AnimatedPressable>
            </Animated.View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No status updates from your contacts yet</Text>}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  backText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  backSpacer: {
    width: 44,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionLabel: {
    marginTop: 16,
    marginBottom: 4,
    marginLeft: 18,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 14,
    marginTop: 10,
    borderRadius: 16,
  },
  meta: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    marginTop: -2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 24,
  },
});
