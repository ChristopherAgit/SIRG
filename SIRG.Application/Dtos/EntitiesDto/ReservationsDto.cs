namespace SIRG.Application.Dtos.EntitiesDto
{
    public class ReservationsDto
    {
        public int ReservationID { get; set; }
        public required int TableID { get; set; }
        public required int StatusID { get; set; }
        public required DateOnly ReservationDate { get; set; }
        public required TimeOnly ReservationTime { get; set; }
        public required int NumberOfPeople { get; set; }
        public int? CustomerID { get; set; }
        public string? ConfirmationToken { get; set; }
        public bool IsConfirmed { get; set; } = false;
        public DateTime? ConfirmedAt { get; set; }
        public DateTime? CreatedAt { get; set; } = DateTime.Now;

        //Navigation properties (all optional for flexibility)
        public RestaurantTablesDto? RestaurantTablesDto { get; set; }
        public ReservationStatusDto? ReservationStatusDto { get; set; }
        public CustomersDto? CustomersDto { get; set; }
        public List<OrdersDto>? OrdersDto { get; set; }
    }
}
