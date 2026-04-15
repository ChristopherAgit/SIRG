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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Alinea las propiedades del modelo con las columnas existentes en la base de datos
            // Algunas migraciones anteriores crearon columnas con nombres como "CustomersCustomerID"
            // mientras que las clases de dominio usan la propiedad `CustomerID`. Mapear aquí evita
            // discrepancias y errores "Invalid column name 'CustomerID'".
            modelBuilder.Entity<Reservations>(entity =>
            {
                // Mapear la propiedad del FK al nombre de columna existente
                entity.Property(r => r.CustomerID).HasColumnName("CustomersCustomerID");
            });
        }
    }
}
