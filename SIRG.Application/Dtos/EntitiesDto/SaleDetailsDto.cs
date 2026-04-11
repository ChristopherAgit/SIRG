namespace SIRG.Application.Dtos.EntitiesDto
{
    public class SaleDetailsDto
    {
        public required int SaleDetailsID { get; set; }
        public required int SaleID { get; set; }
        public required int DishID { get; set; }
        public required int Quantity { get; set; }
        public required decimal UnitPrice { get; set; }

        public SalesDto? SalesDto { get; set; }
        public DishesDto? DishesDto { get; set; }
    }
}
