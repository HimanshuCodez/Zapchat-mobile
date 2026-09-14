import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export default function Avatar({ label, icon, size = 44, backgroundColor = colors.primary, ringColor }) {
  const dimensionStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
  };

  const avatar = (
    <View style={[styles.base, dimensionStyle]}>
      <Text style={[styles.text, { fontSize: size * 0.42 }]}>{icon || label?.charAt(0)?.toUpperCase() || 'U'}</Text>
    </View>
  );

  if (!ringColor) {
    return avatar;
  }

  const ringSize = size + 8;
  return (
    <View
      style={[
        styles.ring,
        { width: ringSize, height: ringSize, borderRadius: ringSize / 2, borderColor: ringColor },
      ]}
    >
      {avatar}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: '800',
  },
});
