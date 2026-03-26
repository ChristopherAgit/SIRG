using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class RestaurantTables
    {
        [Key]

        public required int TableID { get; set; }
        public required int TableNumber { get; set; }
        public required int Capacity { get; set; }
        public bool IsActive { get; set; } = true;
        public List<Reservations>? Reservations { get; set; }


    }
}
