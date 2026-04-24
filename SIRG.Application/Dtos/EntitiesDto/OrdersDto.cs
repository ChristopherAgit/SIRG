namespace SIRG.Application.Dtos.EntitiesDto
{
    public class OrdersDto
    {
        public int OrderID { get; set; }
        public int? ReservationID { get; set; }
        public int? WaiterID { get; set; }
        public int StatusID { get; set; } = 1;
        public int? UserID { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        public ReservationsDto? ReservationsDto { get; set; }
        public List<OrdersDetailsDto>? OrderDetailsDto { get; set; }
        public OrdersStatusDto? OrderStatusDto { get; set; }
    }
}
