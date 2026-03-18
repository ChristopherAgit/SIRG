// Ignore Spelling: Persistences SIRG

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class SalesDetailsEntityConfigurations : IEntityTypeConfiguration<SaleDetails>
    {
        public void Configure(EntityTypeBuilder<SaleDetails> builder)
        {
            builder.HasKey(sd => sd.SaleDetailsID);
            builder.ToTable(nameof(SaleDetails));

            builder.Property(sd => sd.Quantity).IsRequired();
            builder.Property(sd => sd.UnitPrice).IsRequired();

            //Relaciones
            builder.HasOne(sd => sd.Sales)
                       .WithMany(s => s.SaleDetails)
                       .HasForeignKey(sd => sd.SaleID)
                       .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(sd => sd.Dishes)
                       .WithMany(d => d.SaleDetails)
                       .HasForeignKey(sd => sd.DishID)
                       .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
