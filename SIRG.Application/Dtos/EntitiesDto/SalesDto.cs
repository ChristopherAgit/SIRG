namespace SIRG.Application.Dtos.EntitiesDto
{
    public class SalesDto
    {
        public required int SaleID { get; set; }
        public required int OrderID { get; set; }
        public DateTime? SaleDate { get; set; } = DateTime.Now;
        public required decimal TotalAmount { get; set; }
        public List<SaleDetailsDto>? saleDetailsDto { get; set; }
    }
}
