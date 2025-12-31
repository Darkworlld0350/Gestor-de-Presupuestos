import { Text, TextProps } from "react-native";
import React from "react";

interface Props extends TextProps {
  children: React.ReactNode;
}

export function AppText({ children, style, ...props }: Props) {
  return (
    <Text style={style} {...props}>
      {children}
    </Text>
  );
}
