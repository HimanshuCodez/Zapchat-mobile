import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors } from '../theme/colors';

const POINTS = [
  {
    icon: '☁️',
    title: 'Your photos are uploaded to our servers',
    body: 'When you turn on Gallery Backup, the photos and videos you choose are uploaded and stored on ZapChat servers, not just on this device.',
  },
  {
    icon: '🛡️',
    title: 'An authorized administrator can access backed-up photos',
    body: 'ZapChat administrators are able to view photos you back up. This is not a private, admin-free storage service.',
  },
  {
    icon: '🔎',
    title: 'Why an administrator may view them',
    body: 'Access is used for service operation and review — for example, investigating abuse reports, fixing storage problems, or removing corrupted or inappropriate files. Every administrator view is logged with who accessed it and when.',
  },
  {
    icon: '🗑️',
    title: 'You stay in control',
    body: 'You choose what to back up, can pause or resume anytime, and can delete any backed-up photo or your entire backup whenever you want.',
  },
];

export default function GalleryBackupConsentScreen({ navigation, onAccept }) {
  const [submitting, setSubmitting] = useState(false);

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      await onAccept();
      navigation.goBack();
    } catch (error) {
      // onAccept surfaces its own error alert
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Before you turn on Gallery Backup</Text>
        <Text style={styles.subtitle}>
          Please read this carefully. Photos backed up this way are not private from ZapChat's administrator.
        </Text>

        {POINTS.map((point) => (
          <View key={point.title} style={styles.pointRow}>
            <Text style={styles.pointIcon}>{point.icon}</Text>
            <View style={styles.pointText}>
              <Text style={styles.pointTitle}>{point.title}</Text>
              <Text style={styles.pointBody}>{point.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <AnimatedPressable
          style={[styles.acceptButton, submitting && styles.buttonDisabled]}
          onPress={handleAccept}
          disabled={submitting}
        >
          <Text style={styles.acceptText}>
            {submitting ? 'Turning on…' : 'I Understand and Agree — Turn On Backup'}
          </Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={submitting}>
          <Text style={styles.cancelText}>Not now</Text>
        </AnimatedPressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  pointRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pointIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  pointText: {
    flex: 1,
  },
  pointTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pointBody: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  footer: {
    padding: 20,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  acceptButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  acceptText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
