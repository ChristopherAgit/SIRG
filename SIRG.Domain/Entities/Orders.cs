using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class Orders
    {
        [Key]

        public required int OrderID { get; set; }
        public int? ReservationID { get; set; }
        public int? WaiterID { get; set; }
        public required int StatusID { get; set; }
        public int? UserID { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        //Navigation properties
        public Reservations? Reservations { get; set; }
        public List<OrderDetails>? OrderDetails { get; set; }
        public OrderStatus? OrderStatus { get; set; }
    }
}
