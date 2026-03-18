// Ignore Spelling: SIRG

namespace SIRG.Domain.Entities
{
    public class SaleDetails
    {
        public required int SaleDetailsID { get; set; }
        public required int SaleID { get; set; }
        public required int DishID { get; set; }
        public required int Quantity { get; set; }
        public required decimal UnitPrice { get; set; }

        //Navigation properties
        public Sales? Sales { get; set; }
        public Dishes? Dishes { get; set; }
    }
}
