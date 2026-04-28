using SIRG.Persistences.Context;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.Seeds
{
    public static class DefaultSampleData
    {
        public static async Task SeedAsync(SIRGContext context)
        {
            // Ensure DB created (context migrations already applied in Program.cs)
            try
            {
                // Tables
                if (!context.RestaurantTables.Any())
                {
                    var tables = new List<RestaurantTables>
                    {
                        new RestaurantTables { TableID = 0, TableNumber = 1, Capacity = 2, IsActive = true },
                        new RestaurantTables { TableID = 0, TableNumber = 2, Capacity = 4, IsActive = true },
                        new RestaurantTables { TableID = 0, TableNumber = 3, Capacity = 4, IsActive = true },
                        new RestaurantTables { TableID = 0, TableNumber = 4, Capacity = 6, IsActive = true },
                        new RestaurantTables { TableID = 0, TableNumber = 5, Capacity = 2, IsActive = true },
                        new RestaurantTables { TableID = 0, TableNumber = 6, Capacity = 8, IsActive = true },
                    };
                    context.RestaurantTables.AddRange(tables);
                }

                // Categories + Dishes
                if (!context.Categories.Any())
                {
                    var cat = new Categories { CategoryID = 0, CategoryName = "Entrantes", Description = "Entradas y entradas para compartir" };
                    context.Categories.Add(cat);
                    await context.SaveChangesAsync();

                    if (!context.Dishes.Any())
                    {
                        var d1 = new Dishes { DishID = 0, CategoryID = cat.CategoryID, DishName = "Hamburguesa clásica", Price = 8.50M, IsActive = true };
                        var d2 = new Dishes { DishID = 0, CategoryID = cat.CategoryID, DishName = "Papas fritas", Price = 3.00M, IsActive = true };
                        var d3 = new Dishes { DishID = 0, CategoryID = cat.CategoryID, DishName = "Ensalada fresca", Price = 5.25M, IsActive = true };
                        context.Dishes.AddRange(d1, d2, d3);
                    }
                }

                // Ingredients
                if (!context.Ingredients.Any())
                {
                    var i1 = new Ingredients { IngredientId = 0, IngredientName = "Carne", Unit = "g", MinimunStock = 1000 };
                    var i2 = new Ingredients { IngredientId = 0, IngredientName = "Papas", Unit = "g", MinimunStock = 500 };
                    var i3 = new Ingredients { IngredientId = 0, IngredientName = "Aceite", Unit = "ml", MinimunStock = 2000 };
                    context.Ingredients.AddRange(i1, i2, i3);
                }

                await context.SaveChangesAsync();
            }
            catch
            {
                // ignore seed failures (admin should review logs)
            }
        }
    }
}
