using SIRG.Domain.Entities;

namespace SIRG.Application.Dtos.EntitiesDto
{
    public class RestaurantTablesDto
    {
        public required int TableID { get; set; }
        public required int TableNumber { get; set; }
        public required int Capacity { get; set; }
        public bool IsActive { get; set; } = true;
        public List<ReservationsDto>? Reservations { get; set; }
    }
}
