using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class Sales
    {
        [Key]
        public required int SaleID { get; set; }
        public required int OrderID { get; set; }
        public DateTime? SaleDate { get; set; } = DateTime.Now;
        public required decimal TotalAmount { get; set; }

        //Navigation properties
        public List<SaleDetails>? SaleDetails { get; set; }
    }
}
