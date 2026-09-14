import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Avatar from '../components/Avatar';
import AnimatedPressable from '../components/AnimatedPressable';
import MessageBubble from '../components/MessageBubble';
import TypingIndicator from '../components/TypingIndicator';
import { colors } from '../theme/colors';
import { getZapAiReply } from '../api/zapAi';

const WELCOME_MESSAGE = {
  _id: 'zap-ai-welcome',
  senderId: 'zap-ai',
  text: "Hey! I'm Zap AI ⚡ Ask me anything, or just say hi.",
};

export default function ZapAIScreen({ navigation, currentUser }) {
  const insets = useSafeAreaInsets();
  const storageKey = useMemo(() => `zapai_messages_${currentUser?._id || 'guest'}`, [currentUser]);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [draft, setDraft] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const hasLoaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch (error) {
        console.log('zap ai history load failed', error.message);
      } finally {
        hasLoaded.current = true;
      }
    })();
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoaded.current) return;
    AsyncStorage.setItem(storageKey, JSON.stringify(messages)).catch(() => {});
  }, [messages, storageKey]);

  const reversedMessages = useMemo(() => [...messages].reverse(), [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;

    const userMessage = {
      _id: `${currentUser?._id || 'me'}-${Date.now()}`,
      senderId: currentUser?._id || 'me',
      text,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft('');
    setIsTyping(true);

    try {
      const reply = await getZapAiReply(text);
      setMessages((current) => [
        ...current,
        { _id: `zap-ai-${Date.now()}`, senderId: 'zap-ai', text: reply },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AnimatedPressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </AnimatedPressable>
        <View style={styles.headerCenter}>
          <Avatar icon="⚡" size={34} backgroundColor={colors.ai} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.chatTitle}>Zap AI</Text>
            <Text style={styles.chatSubtitle}>{isTyping ? 'typing…' : 'Always available'}</Text>
          </View>
        </View>
        <View style={styles.statusDot} />
      </View>

      <FlatList
        style={styles.messagesWrap}
        contentContainerStyle={styles.messagesContent}
        data={reversedMessages}
        inverted
        keyExtractor={(message) => message._id}
        renderItem={({ item: message }) => {
          const isMine = message.senderId === (currentUser?._id || 'me');
          return <MessageBubble text={message.text} isMine={isMine} accentColor={colors.ai} />;
        }}
        ListHeaderComponent={
          isTyping ? (
            <View style={styles.typingRow}>
              <TypingIndicator />
            </View>
          ) : null
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 56}
      >
        <View style={styles.inputRow}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message Zap AI"
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
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  chatSubtitle: {
    fontSize: 11,
    color: colors.aiDark,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.ai,
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
  typingRow: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
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
    backgroundColor: colors.ai,
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
