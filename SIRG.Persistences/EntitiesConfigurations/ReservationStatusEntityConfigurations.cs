// Ignore Spelling: SIRG Persistences

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class ReservationStatusEntityConfigurations : IEntityTypeConfiguration<ReservationStatus>
    {
        public void Configure(EntityTypeBuilder<ReservationStatus> builder)
        {
            builder.HasKey(x => x.StatusID);
            builder.ToTable(nameof(ReservationStatus));

            builder.Property(rt => rt.StatusName).HasMaxLength(50).IsRequired();
        }
    }
}
