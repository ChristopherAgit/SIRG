export type Role = {
  id: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  createdAt: string;
};

export type Ingredient = {
  id: string;
  name: string;
  unit: string; // e.g. g, kg, ml, unidad
  minStock?: number;
  isActive: boolean;
  createdAt: string;
};

export type Dish = {
  id: string;
  name: string;
  category?: string;
  price: number;
  /**
   * Imagen del plato en formato Data URL (base64) o URL externa.
   * Nota: se guarda en localStorage (solo frontend).
   */
  image?: string;
  isActive: boolean;
  createdAt: string;
};

export type RecipeLine = {
  ingredientId: string;
  qty: number; // quantity of ingredient per 1 dish
};

export type Recipe = {
  dishId: string;
  lines: RecipeLine[];
  updatedAt: string;
};

export type InventoryMovementType = 'in' | 'out' | 'adjust';

export type InventoryMovement = {
  id: string;
  ingredientId: string;
  type: InventoryMovementType;
  qty: number; // positive number
  reason?: string;
  createdAt: string;
};

export type RestaurantTable = {
  id: string;
  number: number;
  seats: number;
  isActive: boolean;
  createdAt: string;
};

