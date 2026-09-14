import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors } from '../theme/colors';

export default function AuthScreen({
  authMode,
  setAuthMode,
  loginData,
  setLoginData,
  signupData,
  setSignupData,
  forgotData,
  setForgotData,
  onSubmit,
  onForgotSubmit,
}) {
  if (authMode === 'forgot') {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.card}>
              <Animated.Text entering={FadeInDown.delay(100)} style={styles.logo}>
                Z
              </Animated.Text>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                Confirm your email and phone number to set a new password.
              </Text>

              <TextInput
                value={forgotData.email}
                onChangeText={(value) => setForgotData({ ...forgotData, email: value })}
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.placeholder}
              />
              <TextInput
                value={forgotData.number}
                onChangeText={(value) => setForgotData({ ...forgotData, number: value })}
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor={colors.placeholder}
              />
              <TextInput
                value={forgotData.newPassword}
                onChangeText={(value) => setForgotData({ ...forgotData, newPassword: value })}
                style={styles.input}
                placeholder="New password"
                secureTextEntry
                placeholderTextColor={colors.placeholder}
              />

              <AnimatedPressable style={styles.primaryButton} onPress={onForgotSubmit}>
                <Text style={styles.primaryButtonText}>Reset password</Text>
              </AnimatedPressable>

              <AnimatedPressable onPress={() => setAuthMode('login')}>
                <Text style={styles.switchText}>Back to sign in</Text>
              </AnimatedPressable>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(400).springify()} style={styles.card}>
            <Animated.Text entering={FadeInDown.delay(100)} style={styles.logo}>
              Z
            </Animated.Text>
            <Text style={styles.title}>{authMode === 'login' ? 'Welcome back' : 'Create account'}</Text>
            <Text style={styles.subtitle}>
              {authMode === 'login'
                ? 'Sign in to continue your conversations.'
                : 'Set up your account and start chatting.'}
            </Text>

            {authMode === 'signup' && (
              <TextInput
                value={signupData.fullname}
                onChangeText={(value) => setSignupData({ ...signupData, fullname: value })}
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={colors.placeholder}
              />
            )}

            <TextInput
              value={authMode === 'login' ? loginData.email : signupData.email}
              onChangeText={(value) =>
                authMode === 'login'
                  ? setLoginData({ ...loginData, email: value })
                  : setSignupData({ ...signupData, email: value })
              }
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.placeholder}
            />

            {authMode === 'login' ? (
              <TextInput
                value={loginData.password}
                onChangeText={(value) => setLoginData({ ...loginData, password: value })}
                style={styles.input}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor={colors.placeholder}
              />
            ) : (
              <>
                <TextInput
                  value={signupData.number}
                  onChangeText={(value) => setSignupData({ ...signupData, number: value })}
                  style={styles.input}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                  placeholderTextColor={colors.placeholder}
                />
                <TextInput
                  value={signupData.password}
                  onChangeText={(value) => setSignupData({ ...signupData, password: value })}
                  style={styles.input}
                  placeholder="Password"
                  secureTextEntry
                  placeholderTextColor={colors.placeholder}
                />
              </>
            )}

            {authMode === 'login' && (
              <TextInput
                value={loginData.number}
                onChangeText={(value) => setLoginData({ ...loginData, number: value })}
                style={styles.input}
                placeholder="Phone number"
                keyboardType="phone-pad"
                placeholderTextColor={colors.placeholder}
              />
            )}

            <AnimatedPressable style={styles.primaryButton} onPress={onSubmit}>
              <Text style={styles.primaryButtonText}>{authMode === 'login' ? 'Sign in' : 'Create account'}</Text>
            </AnimatedPressable>

            {authMode === 'login' && (
              <AnimatedPressable onPress={() => setAuthMode('forgot')}>
                <Text style={styles.switchText}>Forgot password?</Text>
              </AnimatedPressable>
            )}

            <AnimatedPressable onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
              <Text style={styles.switchText}>
                {authMode === 'login' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
              </Text>
            </AnimatedPressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.surface,
    borderRadius: 22,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  logo: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    lineHeight: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  switchText: {
    marginTop: 18,
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
  },
});
