// Ignore Spelling: SIRG Persistences

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class RestaurantTablesEntityConfigurations : IEntityTypeConfiguration<RestaurantTables>
    {
        public void Configure(EntityTypeBuilder<RestaurantTables> builder)
        {
            builder.HasKey(x => x.TableID);
            builder.ToTable(nameof(RestaurantTables));

            builder.Property(rt => rt.TableNumber).IsRequired();
            builder.Property(rt => rt.Capacity).IsRequired();
        }
    }
}
