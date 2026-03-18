// Ignore Spelling: Persistences SIRG

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class OrdersEntityConfigurations : IEntityTypeConfiguration<Orders>
    {
        public void Configure(EntityTypeBuilder<Orders> builder)
        {
            builder.HasKey(x => x.OrderID);
            builder.ToTable(nameof(Orders));

            //Relaciones

            builder.HasOne(o => o.Reservations)
                       .WithMany(r => r.Orders)
                       .HasForeignKey(o => o.OrderID)
                       .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.OrderStatus)
                       .WithMany(os => os.Orders)
                       .HasForeignKey(o => o.StatusID)
                       .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
