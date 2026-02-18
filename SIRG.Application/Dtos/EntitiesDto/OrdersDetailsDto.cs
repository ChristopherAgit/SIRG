namespace SIRG.Application.Dtos.EntitiesDto
{
    public class OrdersDetailsDto
    {
        public required int OrderDetailsID { get; set; }
        public required int OrderID { get; set; }
        public required int DishID { get; set; }
        public required int Quantity { get; set; }
        public required decimal UnitPrice { get; set; }

        public OrdersDto? Orders { get; set; }
        public DishesDto? Dishes { get; set; }
    }
}
