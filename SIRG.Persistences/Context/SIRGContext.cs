using Microsoft.EntityFrameworkCore;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.Context
{
    public class SIRGContext : DbContext
    {
        public SIRGContext(DbContextOptions<SIRGContext> options) : base(options) 
        {
        
        }

        public DbSet<Categories> Categories { get; set; }
        public DbSet<Customers> Customers { get; set; }
        public DbSet<Dishes> Dishes { get; set; }
        public DbSet<DishIngredients> DishIngredients { get; set; }
        public DbSet<Ingredients> Ingredients { get; set; }
        public DbSet<Inventory> Inventory { get; set; }
        public DbSet<InventoryMovements> InventoryMovements { get; set; }
        public DbSet<OrderDetails> OrderDetails { get; set; }
        public DbSet<Orders> Orders { get; set; }
        public DbSet<OrderStatus> OrderStatus { get; set; }
        public DbSet<Reservations> Reservations { get; set; }
        public DbSet<ReservationStatus> ReservationStatus { get; set; }
        public DbSet<RestaurantTables> RestaurantTables { get; set; }
        public DbSet<MeseroSessions> MeseroSessions { get; set; }
        public DbSet<SaleDetails> SaleDetails { get; set; }
        public DbSet<Sales> Sales { get; set; }
    }
}
