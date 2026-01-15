import { View } from "react-native";
import { AppText } from "./AppText";

interface Props {
  color: string;
  label: string;
  value: number;
}

export function LegendItem({ color, label, value }: Props) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 2 }}>
      <AppText style={{ color, marginRight: 6 }}>●</AppText>
      <AppText>
        {label}: ${value}
      </AppText>
    </View>
  );
}
