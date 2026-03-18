// Ignore Spelling: Persistences sirg

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
            builder.Property(r => r.NumberOfPeople).IsRequired();

            //Relaciones
            builder.HasOne(r => r.RestaurantTables)
                        .WithMany(rt => rt.Reservations)
                        .HasForeignKey(r => r.TableID)
                        .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.ReservationStatus)
                        .WithMany(rs => rs.Reservations)
                        .HasForeignKey(r => r.StatusID)
                        .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(r => r.Customer)
                        .WithMany(c => c.Reservation)
                        .HasForeignKey(r => r.CustomerID)
                        .OnDelete(DeleteBehavior.Restrict);

        }
    }
}
