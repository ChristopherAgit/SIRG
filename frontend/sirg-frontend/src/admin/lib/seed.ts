import type { Dish, Ingredient, Recipe, RestaurantTable, Role } from '../models';
import { readJson, uid, writeJson } from './storage';

const KEYS = {
  roles: 'sirg_admin_roles',
  ingredients: 'sirg_admin_ingredients',
  dishes: 'sirg_admin_dishes',
  recipes: 'sirg_admin_recipes',
  movements: 'sirg_admin_inventory_movements',
  tables: 'sirg_admin_tables',
} as const;

export function ensureAdminSeedData() {
  // Roles
  const roles = readJson<Role[]>(KEYS.roles, []);
  if (roles.length === 0) {
    const now = new Date().toISOString();
    writeJson<Role[]>(KEYS.roles, [
      { id: uid('role'), name: 'Admin', description: 'Acceso total', isSystem: true, createdAt: now },
      { id: uid('role'), name: 'Mesero', description: 'Atención en mesa', isSystem: true, createdAt: now },
      { id: uid('role'), name: 'Cocinero', description: 'Preparación', isSystem: true, createdAt: now },
      { id: uid('role'), name: 'Host', description: 'Recepción y confirmación de reservas', isSystem: true, createdAt: now },
    ]);
  }

  // Ingredients
  const ingredients = readJson<Ingredient[]>(KEYS.ingredients, []);
  if (ingredients.length === 0) {
    const now = new Date().toISOString();
    writeJson<Ingredient[]>(KEYS.ingredients, [
      { id: uid('ing'), name: 'Carne', unit: 'g', minStock: 500, isActive: true, createdAt: now },
      { id: uid('ing'), name: 'Papas', unit: 'g', minStock: 1000, isActive: true, createdAt: now },
      { id: uid('ing'), name: 'Aceite', unit: 'ml', minStock: 800, isActive: true, createdAt: now },
      { id: uid('ing'), name: 'Sal', unit: 'g', minStock: 200, isActive: true, createdAt: now },
    ]);
  }

  // Dishes
  const dishes = readJson<Dish[]>(KEYS.dishes, []);
  if (dishes.length === 0) {
    const now = new Date().toISOString();
    writeJson<Dish[]>(KEYS.dishes, [
      { id: uid('dish'), name: 'Hamburguesa clásica', category: 'Comidas', price: 350, isActive: true, createdAt: now },
      { id: uid('dish'), name: 'Papas fritas', category: 'Acompañamientos', price: 180, isActive: true, createdAt: now },
    ]);
  }

  // Recipes
  const recipes = readJson<Recipe[]>(KEYS.recipes, []);
  if (recipes.length === 0) {
    const now = new Date().toISOString();
    const seededIngredients = readJson<Ingredient[]>(KEYS.ingredients, []);
    const seededDishes = readJson<Dish[]>(KEYS.dishes, []);
    const carne = seededIngredients.find((i) => i.name === 'Carne')?.id;
    const papas = seededIngredients.find((i) => i.name === 'Papas')?.id;
    const aceite = seededIngredients.find((i) => i.name === 'Aceite')?.id;
    const sal = seededIngredients.find((i) => i.name === 'Sal')?.id;
    const burger = seededDishes.find((d) => d.name === 'Hamburguesa clásica')?.id;
    const fries = seededDishes.find((d) => d.name === 'Papas fritas')?.id;

    const seeded: Recipe[] = [];
    if (burger && carne && sal) {
      seeded.push({
        dishId: burger,
        updatedAt: now,
        lines: [
          { ingredientId: carne, qty: 180 },
          { ingredientId: sal, qty: 2 },
        ],
      });
    }
    if (fries && papas && aceite && sal) {
      seeded.push({
        dishId: fries,
        updatedAt: now,
        lines: [
          { ingredientId: papas, qty: 200 },
          { ingredientId: aceite, qty: 20 },
          { ingredientId: sal, qty: 1 },
        ],
      });
    }
    writeJson<Recipe[]>(KEYS.recipes, seeded);
  }

  // Mesas
  const tables = readJson<RestaurantTable[]>(KEYS.tables, []);
  if (tables.length === 0) {
    const now = new Date().toISOString();
    writeJson<RestaurantTable[]>(KEYS.tables, [
      { id: uid('table'), number: 1, seats: 4, isActive: true, createdAt: now },
      { id: uid('table'), number: 2, seats: 4, isActive: true, createdAt: now },
    ]);
  }
}

export const STORAGE_KEYS = KEYS;

