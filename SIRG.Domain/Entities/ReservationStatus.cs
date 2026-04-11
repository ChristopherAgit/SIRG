using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class ReservationStatus
    {
        [Key]

        public required int StatusID { get; set; }
        public string? StatusName { get; set; }
        //Navigation property
        public List<Reservations>? Reservations { get; set; }
    }
}
