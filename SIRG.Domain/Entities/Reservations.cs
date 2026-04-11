using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class Reservations
    {
        [Key]

        public required int ReservationID { get; set; }
        public required int TableID { get; set; }
        public required int StatusID { get; set; }
        public required DateOnly ReservationDate { get; set; }
        public required TimeOnly ReservationTime { get; set; }
        public required int NumberOfPeople { get; set; }
        public DateTime? CreatedAt { get; set; } = DateTime.Now;

        //Navigation properties
        public RestaurantTables? RestaurantTables { get; set; }
        public ReservationStatus? ReservationStatus { get; set; }
        public Customers? Customers { get; set; }
        public List<Orders>? Orders { get; set; }
    }
}
