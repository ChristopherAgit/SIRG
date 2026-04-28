using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Domain.Entities;

namespace SIRG.Application.Interfaces.Contracts
{
    public interface IReservationsServices : IBaseServices<Reservations, ReservationsDto>
    {
        Task<List<ReservationsDto>> GetAllReservationsAsync(
           DateOnly? date = null,
           TimeOnly? time = null,
           int? statusId = null,
           string? reservationType = null);

        Task<ReservationsDto?> GetReservationWithDetailsById(int id);

        Task<ReservationsDto?> SaveReservationAsync(ReservationsDto dto);
        Task<ReservationsDto?> UpdateReservationAsync(int id, ReservationsDto dto);
        Task<bool> CancelReservationAsync(int id);
        Task<bool> UpdateReservationStatusAsync(int id, int statusId);

        /// <summary>
        /// Obtiene las mesas disponibles para una fecha, hora y número de personas específicos.
        /// Filtra por capacidad y excluye mesas con reservas activas en esa fecha/hora.
        /// </summary>
        Task<List<RestaurantTablesDto>> GetAvailableTablesAsync(DateOnly date, TimeOnly time, int numberOfPeople);

        /// <summary>
        /// Confirma una reserva por token (desde email del cliente)
        /// </summary>
        Task<ReservationsDto?> ConfirmReservationByTokenAsync(string token);

        /// <summary>
        /// Cancela una reserva por token (desde email del cliente)
        /// </summary>
        Task<ReservationsDto?> CancelReservationByTokenAsync(string token);

        /// <summary>
        /// Envía email de cancelación al cliente
        /// </summary>
        Task SendCancellationEmailAsync(Reservations reservation, string reason = "Cancelada");
    }
}
