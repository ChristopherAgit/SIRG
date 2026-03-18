// Ignore Spelling: Persistences SIRG

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class OrderDetailsEntityConfigurations : IEntityTypeConfiguration<OrderDetails>
    {
        public void Configure(EntityTypeBuilder<OrderDetails> builder)
        {
            builder.HasKey(od => od.OrderDetailsID);
            builder.ToTable(nameof(OrderDetails));

            builder.Property(od => od.Quantity).IsRequired();
            builder.Property(od => od.UnitPrice).IsRequired();

            //Relaciones
            builder.HasOne(od => od.Orders)
                       .WithMany(o => o.OrderDetails)
                       .HasForeignKey(od => od.OrderID)
                       .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(od => od.Dishes)
                       .WithMany(d => d.OrderDetails)
                       .HasForeignKey(od => od.DishID)
                       .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
