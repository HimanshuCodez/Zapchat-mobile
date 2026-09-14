import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors } from '../theme/colors';

export default function CreateGroupScreen({ navigation, chatUsers, onSubmit }) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMember = (userId) => {
    setSelectedIds((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const canSubmit = name.trim().length > 0 && selectedIds.length > 0 && !isSubmitting;

  const handleCreate = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), memberIds: selectedIds });
      navigation.goBack();
    } catch (error) {
      // failure alert already shown by the caller
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Cancel</Text>
        </AnimatedPressable>
        <Text style={styles.title}>New Group</Text>
        <AnimatedPressable onPress={handleCreate} style={styles.createButton} disabled={!canSubmit}>
          <Text style={[styles.createText, !canSubmit && styles.createTextDisabled]}>
            {isSubmitting ? 'Creating…' : 'Create'}
          </Text>
        </AnimatedPressable>
      </View>

      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Group name"
        placeholderTextColor={colors.placeholder}
        style={styles.nameInput}
      />

      <Text style={styles.sectionLabel}>
        Select members {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
      </Text>

      <FlatList
        data={chatUsers}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item._id);
          return (
            <AnimatedPressable
              style={[styles.memberRow, isSelected && styles.memberRowSelected]}
              onPress={() => toggleMember(item._id)}
            >
              <Avatar label={item.fullname} size={40} />
              <Text style={styles.memberName} numberOfLines={1}>
                {item.fullname}
              </Text>
              <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </AnimatedPressable>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>No contacts yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  createButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  createText: {
    color: colors.primary,
    fontWeight: '700',
  },
  createTextDisabled: {
    color: colors.textMuted,
  },
  nameInput: {
    marginHorizontal: 14,
    marginTop: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    marginHorizontal: 14,
    marginTop: 18,
    marginBottom: 6,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  listContent: {
    paddingBottom: 24,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 14,
  },
  memberRowSelected: {
    backgroundColor: colors.primarySoft,
  },
  memberName: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 18,
  },
});
