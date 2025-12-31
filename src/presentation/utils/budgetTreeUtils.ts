import { BudgetNode } from "../../domain/entities/BudgetNode";

export function updateNodeAmount(
  node: BudgetNode,
  id: string,
  value: number
): BudgetNode {
  if (node.id === id && node.children.length === 0) {
    return { ...node, amount: value };
  }

  return {
    ...node,
    children: node.children.map((c) =>
      updateNodeAmount(c, id, value)
    ),
  };
}

export function updateNodeName(
  node: BudgetNode,
  id: string,
  name: string
): BudgetNode {
  if (node.id === id) {
    return { ...node, name };
  }

  return {
    ...node,
    children: node.children.map((c) =>
      updateNodeName(c, id, name)
    ),
  };
}

export function addChildNode(
  node: BudgetNode,
  parentId: string
): BudgetNode {
  if (node.id === parentId) {
    return {
      ...node,
      children: [
        ...node.children,
        {
          id: `${parentId}.${node.children.length + 1}`,
          name: "Nueva categoría",
          amount: 0,
          children: [],
        },
      ],
    };
  }

  return {
    ...node,
    children: node.children.map((c) =>
      addChildNode(c, parentId)
    ),
  };
}
