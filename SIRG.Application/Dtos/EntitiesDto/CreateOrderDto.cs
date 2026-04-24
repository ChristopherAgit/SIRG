namespace SIRG.Application.Dtos.EntitiesDto
{
    public class CreateOrderDto
    {
        public int? ReservationID { get; set; }
        public List<CreateOrderDetailDto> Items { get; set; } = new();
    }

    public class CreateOrderDetailDto
    {
        public int DishID { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
