using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class MeseroSessions
    {
        [Key]
        public required string ServiceId { get; set; }

        // Keep as string to be compatible with front-end table ids (local or remote)
        public string? TableId { get; set; }

        public int TableNumber { get; set; }

        public required DateTime OpenedAt { get; set; }

        public required string Status { get; set; }
    }
}
