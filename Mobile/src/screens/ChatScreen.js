import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from '../components/Avatar';
import AnimatedPressable from '../components/AnimatedPressable';
import MessageBubble from '../components/MessageBubble';
import { colors } from '../theme/colors';

function formatLastSeen(lastSeen) {
  if (!lastSeen) return 'Offline';

  const date = new Date(lastSeen);
  const now = new Date();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (date.toDateString() === now.toDateString()) {
    return `last seen today at ${time}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `last seen yesterday at ${time}`;
  }

  return `last seen ${date.toLocaleDateString()} at ${time}`;
}

export default function ChatScreen({ navigation, currentUser, selectedUser, messages, onSendMessage }) {
  const [draft, setDraft] = useState('');
  const insets = useSafeAreaInsets();

  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const handleSend = () => {
    if (!draft.trim()) return;
    onSendMessage(draft);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <Avatar label={selectedUser?.fullname} size={36} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.chatTitle} numberOfLines={1}>
              {selectedUser?.fullname}
            </Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {selectedUser?.isOnline ? 'online' : formatLastSeen(selectedUser?.lastSeen)}
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
          return <MessageBubble text={message.text} isMine={isMine} />;
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
            <Text style={styles.sendButtonText}>➤</Text>
          </AnimatedPressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.chatBackground,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: colors.primary,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  backText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 28,
    lineHeight: 28,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 2,
    marginRight: 8,
  },
  headerTextWrap: {
    marginLeft: 10,
    flexShrink: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
  messagesWrap: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContent: {
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'flex-end',
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
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.chatBackground,
  },
  chatInput: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    marginRight: 8,
    maxHeight: 120,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 18,
  },
});
