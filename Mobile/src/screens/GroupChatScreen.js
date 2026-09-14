import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import AnimatedPressable from '../components/AnimatedPressable';
import MessageBubble from '../components/MessageBubble';
import { colors } from '../theme/colors';

export default function GroupChatScreen({ navigation, currentUser, group, messages, onSendMessage }) {
  const [draft, setDraft] = useState('');
  const insets = useSafeAreaInsets();

  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const memberNameById = useMemo(() => {
    const map = {};
    (group?.members || []).forEach((member) => {
      map[member._id] = member.fullname;
    });
    return map;
  }, [group]);

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendMessage(draft);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <Avatar label={group?.name} size={34} backgroundColor={colors.primary} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {group?.name}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {(group?.members || []).map((member) => member.fullname).join(', ')}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        style={styles.messagesWrap}
        contentContainerStyle={styles.messagesContent}
        data={reversedMessages}
        inverted
        keyExtractor={(message) => message._id || `${message.senderId}-${message.createdAt || Math.random()}`}
        renderItem={({ item: message }) => {
          const isMine = message.senderId === currentUser._id;
          return (
            <View style={isMine ? styles.bubbleAlignMine : styles.bubbleAlignOther}>
              {!isMine && (
                <Text style={styles.senderName}>{memberNameById[message.senderId] || 'Member'}</Text>
              )}
              <MessageBubble text={message.text} isMine={isMine} />
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.emptyText}>Start the conversation</Text>}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}
      >
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a message"
            style={styles.chatInput}
            placeholderTextColor={colors.placeholder}
            multiline
          />
          <AnimatedPressable style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
  backText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  headerTextWrap: {
    marginLeft: 10,
    flexShrink: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  messagesWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  messagesContent: {
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bubbleAlignMine: {
    alignItems: 'flex-end',
  },
  bubbleAlignOther: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
    marginLeft: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 18,
    transform: [{ scaleY: -1 }],
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  chatInput: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.background,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
    marginRight: 10,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: '700',
  },
});
