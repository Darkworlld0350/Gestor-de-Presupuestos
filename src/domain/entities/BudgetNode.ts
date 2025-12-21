export interface BudgetNode {
  id: string;
  name: string;
  amount: number;
  children: BudgetNode[];
}
