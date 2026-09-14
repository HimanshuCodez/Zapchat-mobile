import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useAudioPlayer } from 'expo-audio';
import Avatar from '../components/Avatar';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors } from '../theme/colors';

const STATUS_DURATION_MS = 5000;

export default function StatusViewerScreen({ navigation, group, currentUserId, onView, onDelete }) {
  const statuses = group.statuses;
  const [index, setIndex] = useState(0);
  const progress = useSharedValue(0);
  const player = useAudioPlayer(null);
  const timeoutRef = useRef(null);

  const current = statuses[index];
  const isOwn = group.user._id === currentUserId;

  const goNext = () => {
    if (index >= statuses.length - 1) {
      navigation.goBack();
      return;
    }
    setIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (index <= 0) return;
    setIndex((i) => i - 1);
  };

  useEffect(() => {
    if (!current) return;

    onView(current._id);

    if (current.song?.url) {
      player.replace(current.song.url);
      player.play();
    } else {
      player.pause();
    }

    progress.value = 0;
    progress.value = withTiming(1, { duration: STATUS_DURATION_MS });

    timeoutRef.current = setTimeout(goNext, STATUS_DURATION_MS);
    return () => {
      clearTimeout(timeoutRef.current);
      player.pause();
    };
  }, [index, current?._id]);

  useEffect(() => () => player.pause(), []);

  if (!current) {
    return null;
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.progressRow}>
        {statuses.map((status, i) => (
          <View key={status._id} style={styles.progressTrack}>
            <ProgressFill active={i === index} complete={i < index} shared={progress} />
          </View>
        ))}
      </View>

      <View style={styles.header}>
        <Avatar label={group.user.fullname} size={38} />
        <View style={styles.headerMeta}>
          <Text style={styles.headerName}>{group.user.fullname}</Text>
          <Text style={styles.headerTime}>{new Date(current.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </AnimatedPressable>
      </View>

      <View style={[styles.body, current.backgroundColor && !current.image && { backgroundColor: current.backgroundColor }]}>
        {current.image ? (
          <Image source={{ uri: current.image }} style={styles.image} resizeMode="contain" />
        ) : (
          <Text style={styles.caption}>{current.caption}</Text>
        )}
        {current.image && current.caption ? (
          <View style={styles.captionOverlay}>
            <Text style={styles.captionOverlayText}>{current.caption}</Text>
          </View>
        ) : null}
        {current.song && (
          <View style={styles.songBadge}>
            <Text style={styles.songBadgeText} numberOfLines={1}>
              🎵 {current.song.title} · {current.song.artist}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.tapZones} pointerEvents="box-none">
        <Pressable style={styles.tapZone} onPress={goPrev} />
        <Pressable style={styles.tapZone} onPress={goNext} />
      </View>

      {isOwn && (
        <AnimatedPressable
          style={styles.deleteButton}
          onPress={() => {
            onDelete(current._id);
            if (statuses.length <= 1) {
              navigation.goBack();
            } else {
              goNext();
            }
          }}
        >
          <Text style={styles.deleteButtonText}>Delete this update</Text>
        </AnimatedPressable>
      )}
    </SafeAreaView>
  );
}

function ProgressFill({ active, complete, shared }) {
  const style = useAnimatedStyle(() => ({
    width: active ? `${shared.value * 100}%` : complete ? '100%' : '0%',
  }));

  return <Animated.View style={[styles.progressFill, style]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 10,
    paddingTop: 6,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerMeta: {
    flex: 1,
    marginLeft: 10,
  },
  headerName: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  headerTime: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  closeText: {
    color: colors.white,
    fontSize: 20,
    paddingHorizontal: 8,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  caption: {
    color: colors.white,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  captionOverlay: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 10,
  },
  captionOverlayText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '600',
  },
  songBadge: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    maxWidth: '85%',
  },
  songBadgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  tapZones: {
    position: 'absolute',
    top: 60,
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    backgroundColor: colors.danger,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  deleteButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
});
