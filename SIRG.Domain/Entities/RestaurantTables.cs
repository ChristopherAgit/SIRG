// Ignore Spelling: SIRG

namespace SIRG.Domain.Entities
{
    public class RestaurantTables
    {
        public required int TableID { get; set; }
        public required int TableNumber { get; set; }
        public required int Capacity { get; set; }
        public bool IsActive { get; set; } = true;

        //Navigation property
        public List<Reservations>? Reservations { get; set; }
    }
}
