namespace SIRG.Application.Dtos.EntitiesDto
{
    public class OrdersDto
    {
        public required int OrderID { get; set; }
        public required int ReservationID { get; set; }
        public required int WaiterID { get; set; }
        public required int StatusID { get; set; }
        public required int UserID { get; set; }
        public required DateTime OrderDate { get; set; } = DateTime.Now;

        public ReservationsDto? ReservationsDto { get; set; }
        public List<OrdersDetailsDto>? OrderDetailsDto { get; set; }
        public OrdersStatusDto? OrderStatusDto { get; set; }
    }
}
