using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SIRG.Domain.Entities;

namespace SIRG.Persistences.EntitiesConfigurations
{
    public class ReservationsEntityConfigurations : IEntityTypeConfiguration<Reservations>
    {
        public void Configure(EntityTypeBuilder<Reservations> builder)
        {
            // Configuración básica para la entidad Reservations
            builder.HasKey(r => r.ReservationID);
            builder.ToTable(nameof(Reservations));

            // Configuración de las propiedades
        }
    }
}
