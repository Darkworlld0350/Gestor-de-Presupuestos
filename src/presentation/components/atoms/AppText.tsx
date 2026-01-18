import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";
import { useThemeContext } from "../../theme/useThemeContext";

export function AppText(props: TextProps) {
  const { colors } = useThemeContext();

  return (
    <Text
      {...props}
      style={[
        styles.base,
        { color: colors.text },
        props.style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: 14,
  },
});
