import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

export default function LoadingScreen() {
  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    opacity.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.4, { duration: 700 })), -1, true);
    scale.value = withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0.92, { duration: 700 })), -1, true);
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <SafeAreaView style={styles.screen}>
      <Animated.View style={[styles.logo, animatedStyle]}>
        <Text style={styles.logoText}>Z</Text>
      </Animated.View>
      <Text style={styles.loadingText}>Loading ZapChat...</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '800',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
