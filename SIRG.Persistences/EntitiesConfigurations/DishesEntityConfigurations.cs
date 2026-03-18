// Ignore Spelling: SIRG Persistences

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class DishesEntityConfigurations : IEntityTypeConfiguration<Dishes>
    {
        public void Configure(EntityTypeBuilder<Dishes> builder)
        {
            builder.HasKey(x => x.DishID);
            builder.ToTable(nameof(Dishes));

            builder.Property(d => d.DishName).HasMaxLength(100).IsRequired();

            //Relaciones
            builder.HasOne(d => d.Category)
                .WithMany(c => c.Dishes)
                .HasForeignKey(d => d.CategoryID)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
