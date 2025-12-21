import { View } from "react-native";
import { AppText } from "../atoms/AppText";

export const BudgetItem = ({ name, total }: { name: string; total: number }) => (
  <View style={{ paddingLeft: 16 }}>
    <AppText>{`${name}: $${total}`}</AppText>
  </View>
);
