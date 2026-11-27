import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { palette } from '../lib/palette';

export function FormInput({ style, onFocus, onBlur, ...props }: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      {...props}
      style={[styles.input, style, focused && styles.focused]}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    minHeight: 48,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.white,
    color: palette.indigo,
    fontSize: 16,
  },
  focused: {
    borderColor: palette.indigo,
    outlineColor: palette.indigo,
  },
});
