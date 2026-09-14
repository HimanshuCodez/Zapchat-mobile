import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors } from '../theme/colors';

export default function MessageBubble({ text, isMine, accentColor, timestamp }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(220).springify().damping(18)}
      style={[
        styles.bubble,
        isMine
          ? [styles.bubbleMine, accentColor ? { backgroundColor: accentColor } : null]
          : styles.bubbleOther,
      ]}
    >
      <Text style={[styles.text, isMine ? styles.textMine : styles.textOther]}>{text}</Text>
      {!!timestamp && (
        <Text style={[styles.time, isMine ? styles.timeMine : styles.timeOther]}>{timestamp}</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.bubbleMine,
    borderTopRightRadius: 2,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderTopLeftRadius: 2,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMine: {
    color: colors.textPrimary,
  },
  textOther: {
    color: colors.textPrimary,
  },
  time: {
    fontSize: 10,
    marginTop: 3,
  },
  timeMine: {
    color: colors.textSecondary,
    textAlign: 'right',
  },
  timeOther: {
    color: colors.textMuted,
    textAlign: 'right',
  },
});
