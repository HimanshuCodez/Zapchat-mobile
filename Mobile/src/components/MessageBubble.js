import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { colors } from '../theme/colors';

export default function MessageBubble({ text, isMine, accentColor = colors.primary, timestamp }) {
  return (
    <Animated.View
      entering={FadeInUp.duration(260).springify().damping(16)}
      style={[
        styles.bubble,
        isMine
          ? [styles.bubbleMine, { backgroundColor: accentColor }]
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
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  textMine: {
    color: colors.white,
  },
  textOther: {
    color: colors.textPrimary,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  timeMine: {
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'right',
  },
  timeOther: {
    color: colors.textMuted,
  },
});
