import { BudgetNode } from "../../domain/entities/BudgetNode";

// Busca recursivamente un nodo por su id dentro del árbol
export function findNodeById(
  node: BudgetNode,
  id: string
): BudgetNode | null {
  // Si el id coincide, retorna el nodo actual
  if (node.id === id) return node;

  // Recorre los hijos para buscar el nodo
  const children = node.children ?? [];
  for (const child of children) {
    const found = findNodeById(child, id);
    if (found) return found;
  }

  // No se encontró el nodo
  return null;
}

// Verifica si existe un nodo con el id dado dentro del árbol
export function existsNodeId(node: BudgetNode, id: string): boolean {
  // Coincidencia directa
  if (node.id === id) return true;

  // Busca recursivamente en los hijos
  const children = node.children ?? [];
  return children.some((c) => existsNodeId(c, id));
}

// Actualiza el monto de un nodo hoja identificado por id
export function updateNodeAmount(
  node: BudgetNode,
  id: string,
  value: number
): BudgetNode {
  const children = node.children ?? [];
  const isLeaf = children.length === 0;

  // Solo permite cambiar el monto si es un nodo hoja
  if (node.id === id && isLeaf) {
    return { ...node, amount: value };
  }

  // Aplica la actualización de forma recursiva a los hijos
  return {
    ...node,
    children: children.map((c) => updateNodeAmount(c, id, value)),
  };
}

// Actualiza el nombre de un nodo identificado por id
export function updateNodeName(
  node: BudgetNode,
  id: string,
  name: string
): BudgetNode {
  const children = node.children ?? [];

  // Si el nodo coincide, actualiza su nombre
  if (node.id === id) return { ...node, name };

  // Aplica la actualización de forma recursiva a los hijos
  return {
    ...node,
    children: children.map((c) => updateNodeName(c, id, name)),
  };
}

// Agrega un nuevo nodo hijo a un nodo padre identificado por parentId
export function addChildNode(
  node: BudgetNode,
  parentId: string
): BudgetNode {
  const children = node.children ?? [];

  // Si es el nodo padre, agrega un nuevo hijo
  if (node.id === parentId) {
    const nextIndex = children.length + 1;

    return {
      ...node,
      children: [
        ...children,
        {
          // Id jerárquico basado en el id del padre
          id: `${node.id}.${nextIndex}`,
          // Nombre por defecto del nuevo nodo
          name: "Nueva categoría",
          amount: 0,
          children: [],
        },
      ],
    };
  }

  // Continúa buscando el padre en los hijos
  return {
    ...node,
    children: children.map((c) => addChildNode(c, parentId)),
  };
}

/**
 * Elimina un nodo (y todo su subárbol) por id.
 * - No elimina la raíz: si el id coincide con la raíz, no hace cambios.
 */
export function removeNodeById(
  node: BudgetNode,
  id: string
): BudgetNode {
  // Protección para no eliminar la raíz
  if (node.id === id) return node;

  const children = node.children ?? [];

  // Filtra el nodo a eliminar y aplica recursivamente en los hijos restantes
  const nextChildren = children
    .filter((c) => c.id !== id)
    .map((c) => removeNodeById(c, id));

  return { ...node, children: nextChildren };
}
