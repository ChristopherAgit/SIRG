import type { Dish, Ingredient, InventoryMovement, Recipe, Role } from '../models';
import { readJson, writeJson, uid } from './storage';
import { STORAGE_KEYS } from './seed';

export const roleRepo = {
  list(): Role[] {
    return readJson<Role[]>(STORAGE_KEYS.roles, []).sort((a, b) => a.name.localeCompare(b.name));
  },
  create(input: Pick<Role, 'name' | 'description'>): Role {
    const all = readJson<Role[]>(STORAGE_KEYS.roles, []);
    const now = new Date().toISOString();
    const role: Role = { id: uid('role'), name: input.name.trim(), description: input.description?.trim() || undefined, createdAt: now };
    writeJson(STORAGE_KEYS.roles, [...all, role]);
    return role;
  },
  update(id: string, patch: Partial<Pick<Role, 'name' | 'description'>>): Role | null {
    const all = readJson<Role[]>(STORAGE_KEYS.roles, []);
    const idx = all.findIndex((r) => r.id === id);
    if (idx < 0) return null;
    const next: Role = {
      ...all[idx],
      name: patch.name !== undefined ? patch.name.trim() : all[idx].name,
      description: patch.description !== undefined ? patch.description.trim() || undefined : all[idx].description,
    };
    all[idx] = next;
    writeJson(STORAGE_KEYS.roles, all);
    return next;
  },
  remove(id: string): boolean {
    const all = readJson<Role[]>(STORAGE_KEYS.roles, []);
    const role = all.find((r) => r.id === id);
    if (!role) return false;
    if (role.isSystem) return false;
    writeJson(STORAGE_KEYS.roles, all.filter((r) => r.id !== id));
    return true;
  },
};

export const ingredientRepo = {
  list(): Ingredient[] {
    return readJson<Ingredient[]>(STORAGE_KEYS.ingredients, []).sort((a, b) => a.name.localeCompare(b.name));
  },
  create(input: Pick<Ingredient, 'name' | 'unit' | 'minStock'>): Ingredient {
    const all = readJson<Ingredient[]>(STORAGE_KEYS.ingredients, []);
    const now = new Date().toISOString();
    const ing: Ingredient = {
      id: uid('ing'),
      name: input.name.trim(),
      unit: input.unit.trim(),
      minStock: input.minStock,
      isActive: true,
      createdAt: now,
    };
    writeJson(STORAGE_KEYS.ingredients, [...all, ing]);
    return ing;
  },
  update(id: string, patch: Partial<Pick<Ingredient, 'name' | 'unit' | 'minStock' | 'isActive'>>): Ingredient | null {
    const all = readJson<Ingredient[]>(STORAGE_KEYS.ingredients, []);
    const idx = all.findIndex((i) => i.id === id);
    if (idx < 0) return null;
    const next: Ingredient = {
      ...all[idx],
      name: patch.name !== undefined ? patch.name.trim() : all[idx].name,
      unit: patch.unit !== undefined ? patch.unit.trim() : all[idx].unit,
      minStock: patch.minStock !== undefined ? patch.minStock : all[idx].minStock,
      isActive: patch.isActive !== undefined ? patch.isActive : all[idx].isActive,
    };
    all[idx] = next;
    writeJson(STORAGE_KEYS.ingredients, all);
    return next;
  },
  remove(id: string): void {
    // soft delete
    ingredientRepo.update(id, { isActive: false });
  },
};

export const dishRepo = {
  list(): Dish[] {
    return readJson<Dish[]>(STORAGE_KEYS.dishes, []).sort((a, b) => a.name.localeCompare(b.name));
  },
  create(input: Pick<Dish, 'name' | 'category' | 'price'>): Dish {
    const all = readJson<Dish[]>(STORAGE_KEYS.dishes, []);
    const now = new Date().toISOString();
    const dish: Dish = {
      id: uid('dish'),
      name: input.name.trim(),
      category: input.category?.trim() || undefined,
      price: input.price,
      isActive: true,
      createdAt: now,
    };
    writeJson(STORAGE_KEYS.dishes, [...all, dish]);
    return dish;
  },
  update(id: string, patch: Partial<Pick<Dish, 'name' | 'category' | 'price' | 'isActive'>>): Dish | null {
    const all = readJson<Dish[]>(STORAGE_KEYS.dishes, []);
    const idx = all.findIndex((d) => d.id === id);
    if (idx < 0) return null;
    const next: Dish = {
      ...all[idx],
      name: patch.name !== undefined ? patch.name.trim() : all[idx].name,
      category: patch.category !== undefined ? patch.category?.trim() || undefined : all[idx].category,
      price: patch.price !== undefined ? patch.price : all[idx].price,
      isActive: patch.isActive !== undefined ? patch.isActive : all[idx].isActive,
    };
    all[idx] = next;
    writeJson(STORAGE_KEYS.dishes, all);
    return next;
  },
  remove(id: string): void {
    dishRepo.update(id, { isActive: false });
  },
};

export const recipeRepo = {
  list(): Recipe[] {
    return readJson<Recipe[]>(STORAGE_KEYS.recipes, []);
  },
  getByDishId(dishId: string): Recipe | null {
    return recipeRepo.list().find((r) => r.dishId === dishId) ?? null;
  },
  upsert(recipe: Omit<Recipe, 'updatedAt'>): Recipe {
    const all = readJson<Recipe[]>(STORAGE_KEYS.recipes, []);
    const now = new Date().toISOString();
    const next: Recipe = { ...recipe, updatedAt: now };
    const idx = all.findIndex((r) => r.dishId === recipe.dishId);
    if (idx >= 0) all[idx] = next;
    else all.push(next);
    writeJson(STORAGE_KEYS.recipes, all);
    return next;
  },
};

export const movementRepo = {
  list(): InventoryMovement[] {
    return readJson<InventoryMovement[]>(STORAGE_KEYS.movements, []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  add(input: Omit<InventoryMovement, 'id' | 'createdAt'>): InventoryMovement {
    const all = readJson<InventoryMovement[]>(STORAGE_KEYS.movements, []);
    const mov: InventoryMovement = { ...input, id: uid('mov'), createdAt: new Date().toISOString() };
    writeJson(STORAGE_KEYS.movements, [...all, mov]);
    return mov;
  },
  remove(id: string): boolean {
    const all = readJson<InventoryMovement[]>(STORAGE_KEYS.movements, []);
    if (!all.some((m) => m.id === id)) return false;
    writeJson(
      STORAGE_KEYS.movements,
      all.filter((m) => m.id !== id),
    );
    return true;
  },
};

export function computeStock(ingredientId: string): number {
  // Importante: el stock se calcula en base al historial de movimientos (no se guarda una columna "stock" fija).
  const movements = movementRepo.list().filter((m) => m.ingredientId === ingredientId);
  let stock = 0;
  for (const m of movements) {
    if (m.type === 'in') stock += m.qty;
    if (m.type === 'out') stock -= m.qty;
    // Ajuste (set): establece el stock absoluto (útil para conteos físicos).
    if (m.type === 'adjust') stock = m.qty;
  }
  return stock;
}

