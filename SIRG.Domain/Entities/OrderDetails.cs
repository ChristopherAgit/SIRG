namespace SIRG.Domain.Entities
{
    public class OrderDetails
    {
        public required int OrderDetailsID { get; set; }
        public required int OrderID { get; set; }
        public required int DishID { get; set; }
        public required int Quantity { get; set; }
        public required decimal UnitPrice { get; set; }

        //Navigation properties
        public Orders? Orders { get; set; }
        public Dishes? Dishes { get; set; }
    }
}
