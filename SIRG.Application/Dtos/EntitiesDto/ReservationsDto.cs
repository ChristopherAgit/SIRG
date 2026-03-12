namespace SIRG.Application.Dtos.EntitiesDto
{
    public class ReservationsDto
    {
        public required int ReservationID { get; set; }
        public required int TableID { get; set; }
        public required int StatusID { get; set; }
        public required DateOnly ReservationDate { get; set; }
        public required TimeOnly ReservationTime { get; set; }
        public required int NumberOfPeople { get; set; }
        public DateTime? CreatedAt { get; set; } = DateTime.Now;

        //Navigation properties
        public RestaurantTablesDto? RestaurantTablesDto { get; set; }
        public ReservationStatusDto? ReservationStatusDto { get; set; }
        public CustomersDto? CustomersDto { get; set; }
        public List<OrdersDto>? OrdersDto { get; set; }
    }
}
