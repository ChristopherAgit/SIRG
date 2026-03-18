// Ignore Spelling: SIRG

namespace SIRG.Domain.Entities
{
    public class Customers
    {
        public required int CustomerID { get; set; }
        public required string FullName { get; set; }
        public required string Document { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime? CreatedAt { get; set; }

        //Navigation property
        public ICollection<Reservations>? Reservation { get; set; }
    }
}
