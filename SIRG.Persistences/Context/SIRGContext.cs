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

            modelBuilder.Entity<Reservations>(entity =>
            {
                entity.Property(r => r.CustomerID).HasColumnName("CustomersCustomerID");
            });

            // Orders: ReservationID, WaiterID y UserID son opcionales (walk-ins no tienen reserva)
            modelBuilder.Entity<Orders>(entity =>
            {
                entity.Property(o => o.ReservationID).IsRequired(false);
                entity.Property(o => o.WaiterID).IsRequired(false);
                entity.Property(o => o.UserID).IsRequired(false);
            });

            // Seed de los 4 estados del ciclo de vida de una orden
            modelBuilder.Entity<OrderStatus>().HasData(
                new OrderStatus { StatusID = 1, StatusName = "Pendiente" },
                new OrderStatus { StatusID = 2, StatusName = "En preparación" },
                new OrderStatus { StatusID = 3, StatusName = "Listo para servir" },
                new OrderStatus { StatusID = 4, StatusName = "Entregado" });

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
