using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class OrderStatus
    {
        [Key]

        public required int StatusID { get; set; }
        public string? StatusName { get; set; }
        //Navigation property
        public List<Orders>? Orders { get; set; }
    }
}
