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

            // Especificar precisión para propiedades decimal para evitar truncamiento
            modelBuilder.Entity<DishIngredients>(entity =>
            {
                entity.Property(d => d.QuantityRequired).HasPrecision(18, 2);
            });

            modelBuilder.Entity<Dishes>(entity =>
            {
                entity.Property(d => d.Price).HasPrecision(18, 2);
                entity.HasOne(d => d.Category)
                      .WithMany(c => c.Dishes)
                      .HasForeignKey(d => d.CategoryID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Ingredients>(entity =>
            {
                entity.Property(i => i.MinimunStock).HasPrecision(18, 2);
            });

            modelBuilder.Entity<Inventory>(entity =>
            {
                entity.Property(i => i.CurrentStock).HasPrecision(18, 2);
            });

            modelBuilder.Entity<InventoryMovements>(entity =>
            {
                entity.Property(im => im.Quantity).HasPrecision(18, 2);
            });

            modelBuilder.Entity<OrderDetails>(entity =>
            {
                entity.Property(od => od.UnitPrice).HasPrecision(18, 2);
            });

            modelBuilder.Entity<SaleDetails>(entity =>
            {
                entity.Property(sd => sd.UnitPrice).HasPrecision(18, 2);
            });

            modelBuilder.Entity<Sales>(entity =>
            {
                entity.Property(s => s.TotalAmount).HasPrecision(18, 2);
            });
        }
    }
}
