import React from "react";
import { Platform, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = ViewProps & {
  children: React.ReactNode;
};

export function SafeArea({ style, children, ...props }: Props) {
  if (Platform.OS === "web") {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  return (
    <SafeAreaView style={style} {...props}>
      {children}
    </SafeAreaView>
  );
}
