// Ignore Spelling: Persistences SIRG

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class OrdersStatusEntityConfigurations : IEntityTypeConfiguration<OrderStatus>
    {
        public void Configure(EntityTypeBuilder<OrderStatus> builder)
        {
            builder.HasKey(os => os.StatusID);
            builder.ToTable(nameof(OrderStatus));

            builder.Property(os => os.StatusName).HasMaxLength(50).IsRequired();
        }
    }
}
