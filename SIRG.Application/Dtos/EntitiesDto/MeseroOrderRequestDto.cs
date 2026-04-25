namespace SIRG.Application.Dtos.EntitiesDto
{
    public class MeseroOrderRequestDto
    {
        public int ReservationId { get; set; }
        public List<MeseroOrderItemDto> Items { get; set; } = new();
    }

    public class MeseroOrderItemDto
    {
        public int DishId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
