import { BudgetNode } from "../../domain/entities/BudgetNode";
import { BudgetModel } from "../models/BudgetModel";

// Mapper encargado de convertir entre modelos de datos y entidades de dominio
export class BudgetMapper {
  // Convierte un BudgetModel (capa de datos) a BudgetNode (capa de dominio)
  static toDomain(model: BudgetModel): BudgetNode {
    return {
      id: model.id,
      name: model.name,
      amount: model.amount,
      // Mapea recursivamente los hijos al dominio
      children: model.children.map(BudgetMapper.toDomain),
    };
  }

  // Convierte un BudgetNode (dominio) a BudgetModel (datos)
  static toModel(entity: BudgetNode): BudgetModel {
    return {
      id: entity.id,
      name: entity.name,
      amount: entity.amount,
      // Mapea recursivamente los hijos al modelo de datos
      children: entity.children.map(BudgetMapper.toModel),
    };
  }

  // Convierte un string JSON a una entidad de dominio BudgetNode
  static fromJson(json: string): BudgetNode {
    const model = JSON.parse(json) as BudgetModel;
    return BudgetMapper.toDomain(model);
  }

  // Convierte una entidad de dominio BudgetNode a string JSON
  static toJson(entity: BudgetNode): string {
    const model = BudgetMapper.toModel(entity);
    return JSON.stringify(model);
  }
}
