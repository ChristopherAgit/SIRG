// Ignore Spelling: SIRG Persistences

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class SalesEntityConfigurations : IEntityTypeConfiguration<Sales>
    {
        public void Configure(EntityTypeBuilder<Sales> builder)
        {
            builder.HasKey(s => s.SaleID);
            builder.ToTable(nameof(Sales));

            builder.HasOne(s => s.Order)
                .WithOne(o => o.Sale)
                .HasForeignKey<Sales>(s => s.OrderID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
