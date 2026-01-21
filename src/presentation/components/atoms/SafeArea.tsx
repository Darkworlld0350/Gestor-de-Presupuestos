import React from "react";
import { Platform, View, ViewProps } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Props del componente SafeArea
// Extiende ViewProps y requiere children
type Props = ViewProps & {
  children: React.ReactNode;
};

// Componente contenedor que maneja Safe Area según la plataforma
export function SafeArea({ style, children, ...props }: Props) {
  // En web no existe SafeAreaView, se usa un View normal
  if (Platform.OS === "web") {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  // En mobile se usa SafeAreaView para respetar notch y barras del sistema
  return (
    <SafeAreaView style={style} {...props}>
      {children}
    </SafeAreaView>
  );
}
