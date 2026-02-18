using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class Customers
    {
        [Key]
        public required int CustomerID { get; set; }
        public required string FullName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime? CreatedAt { get; set; }

    }
}
