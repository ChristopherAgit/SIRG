// Ignore Spelling: SIRG Persistences

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class CustomersEntityConfigurations : IEntityTypeConfiguration<Customers>
    {
        public void Configure(EntityTypeBuilder<Customers> builder)
        {
            builder.HasKey(c => c.CustomerID);
            builder.ToTable(nameof(Customers));

            builder.Property(c => c.FullName).HasMaxLength(255).IsRequired();
            builder.Property(c => c.Document).HasMaxLength(13).IsRequired();
            builder.Property(c => c.Phone).HasMaxLength(12).IsRequired();
            builder.Property(c => c.Email).HasMaxLength(255).IsRequired();
        }
    }
}
