import { useState } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { palette } from '../lib/palette';

type PrimaryButtonProps = Omit<PressableProps, 'style' | 'onHoverIn' | 'onHoverOut'> & {
  style: StyleProp<ViewStyle>;
};

export function PrimaryButton({ style, ...props }: PrimaryButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        style,
        !props.disabled && (hovered || pressed) && { backgroundColor: palette.wine },
      ]}
    />
  );
}
