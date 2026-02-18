namespace SIRG.Domain.Entities
{
    public class Orders
    {
        public required int OrderID { get; set; }
        public required int ReservationID { get; set; }
        public required int WaiterID { get; set; }
        public required int StatusID { get; set; }
        public required int UserID { get; set; }
        public required DateTime OrderDate { get; set; } = DateTime.Now;

        //Navigation properties
        public Reservations? Reservations { get; set; }
        public List<OrderDetails>? OrderDetails { get; set; }
        public OrderStatus? OrderStatus { get; set; }
    }
}
