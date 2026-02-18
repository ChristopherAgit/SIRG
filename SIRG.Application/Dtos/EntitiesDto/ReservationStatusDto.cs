namespace SIRG.Application.Dtos.EntitiesDto
{
    public class ReservationStatusDto
    {
        public required int StatusID { get; set; }
        public string? StatusName { get; set; }
        public List<ReservationsDto>? ReservationsDto { get; set; }
    }
}
