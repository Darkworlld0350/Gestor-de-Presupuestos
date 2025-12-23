import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { BudgetTree } from "../components/organisms/BudgetTree";
import { BudgetNode } from "../../domain/entities/BudgetNode";

const data: BudgetNode = {
  id: "1",
  name: "Presupuesto General",
  amount: 0,
  children: [
    {
      id: "1.1",
      name: "Marketing",
      amount: 0,
      children: [
        { id: "1.1.1", name: "Ads", amount: 500 },
        { id: "1.1.2", name: "Eventos", amount: 300 },
      ],
    },
    {
      id: "1.2",
      name: "IT",
      amount: 200,
      children: [{ id: "1.2.1", name: "Infraestructura", amount: 800 }],
    },
  ],
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <BudgetTree node={data} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 26,
  },
});
