// Ignore Spelling: SIRG Persistences

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class CategoriesEntityConfigurations : IEntityTypeConfiguration<Categories>
    {
        public void Configure(EntityTypeBuilder<Categories> builder)
        {
            builder.HasKey(x => x.CategoryID);
            builder.ToTable(nameof(Categories));

            builder.Property(c => c.CategoryName).HasMaxLength(50).IsRequired();
            builder.Property(c => c.CategoryName).HasMaxLength(255).IsRequired(false);
        }
    }
}
