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
    }
}
