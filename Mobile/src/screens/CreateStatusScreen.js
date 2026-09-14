import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import AnimatedPressable from '../components/AnimatedPressable';
import { colors, statusBackgrounds } from '../theme/colors';
import { STATUS_SONGS } from '../constants/songs';

export default function CreateStatusScreen({ navigation, onSubmit }) {
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [caption, setCaption] = useState('');
  const [backgroundColor, setBackgroundColor] = useState(statusBackgrounds[0]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [posting, setPosting] = useState(false);

  const player = useAudioPlayer(null);
  const playerStatus = useAudioPlayerStatus(player);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    setImageUri(asset.uri);

    const file = new File(asset.uri);
    const base64 = await file.base64();
    setImageBase64(`data:image/jpeg;base64,${base64}`);
  };

  const toggleSong = (song) => {
    if (selectedSong?.id === song.id) {
      player.pause();
      setSelectedSong(null);
      return;
    }

    setSelectedSong(song);
    player.replace(song.url);
    player.play();
  };

  const handlePost = async () => {
    if (!imageBase64 && !caption.trim()) {
      return;
    }

    setPosting(true);
    try {
      player.pause();
      await onSubmit({
        image: imageBase64,
        caption: caption.trim() || undefined,
        backgroundColor: imageBase64 ? undefined : backgroundColor,
        song: selectedSong || undefined,
      });
      navigation.goBack();
    } finally {
      setPosting(false);
    }
  };

  const previewBackground = imageUri ? undefined : backgroundColor;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </AnimatedPressable>
        <Text style={styles.title}>New status</Text>
        <AnimatedPressable onPress={handlePost} disabled={posting || (!imageBase64 && !caption.trim())}>
          <Text
            style={[
              styles.postText,
              (posting || (!imageBase64 && !caption.trim())) && styles.postTextDisabled,
            ]}
          >
            {posting ? 'Posting…' : 'Post'}
          </Text>
        </AnimatedPressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.preview, previewBackground && { backgroundColor: previewBackground }]}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <Text style={styles.previewText} numberOfLines={6}>
              {caption || 'Type a caption or add a photo'}
            </Text>
          )}
          {selectedSong && (
            <View style={styles.songBadge}>
              <Text style={styles.songBadgeText} numberOfLines={1}>
                🎵 {selectedSong.title}
              </Text>
            </View>
          )}
        </View>

        <TextInput
          value={caption}
          onChangeText={setCaption}
          style={styles.captionInput}
          placeholder="Add a caption"
          placeholderTextColor={colors.placeholder}
          multiline
        />

        <AnimatedPressable style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.photoButtonText}>{imageUri ? 'Change photo' : 'Add a photo'}</Text>
        </AnimatedPressable>

        {!imageUri && (
          <>
            <Text style={styles.sectionLabel}>Background</Text>
            <View style={styles.swatchRow}>
              {statusBackgrounds.map((color) => (
                <AnimatedPressable
                  key={color}
                  style={[
                    styles.swatch,
                    { backgroundColor: color },
                    backgroundColor === color && styles.swatchActive,
                  ]}
                  onPress={() => setBackgroundColor(color)}
                />
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>Add a song</Text>
        {STATUS_SONGS.map((song) => {
          const isActive = selectedSong?.id === song.id;
          const isPlaying = isActive && playerStatus.playing;
          return (
            <AnimatedPressable
              key={song.id}
              style={[styles.songRow, isActive && styles.songRowActive]}
              onPress={() => toggleSong(song)}
            >
              <View style={styles.playDot}>
                <Text style={styles.playDotText}>{isPlaying ? '❚❚' : '▶'}</Text>
              </View>
              <View style={styles.songMeta}>
                <Text style={styles.songTitle}>{song.title}</Text>
                <Text style={styles.songArtist}>{song.artist}</Text>
              </View>
            </AnimatedPressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.surface,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  postText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  postTextDisabled: {
    color: colors.textMuted,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  preview: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewText: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  songBadge: {
    position: 'absolute',
    bottom: 14,
    alignSelf: 'center',
    backgroundColor: 'rgba(17,24,39,0.65)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    maxWidth: '85%',
  },
  songBadgeText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 12,
  },
  captionInput: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    minHeight: 50,
  },
  photoButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
  },
  photoButtonText: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  sectionLabel: {
    marginTop: 20,
    marginBottom: 10,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: colors.textPrimary,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  songRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  playDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playDotText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  songMeta: {
    marginLeft: 12,
  },
  songTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
  songArtist: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
});
