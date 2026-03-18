// Ignore Spelling: SIRG

using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class Dishes
    {
        [Key]
        public required int DishID { get; set; }
        public required int CategoryID { get; set; }
        public required string DishName { get; set; }
        public decimal? Price { get; set; }
        public bool IsActive { get; set; }

        //Navigation property
        public Categories? Category { get; set; }
        public List<DishIngredients>? DishIngredients { get; set; }
        public List<OrderDetails>? OrderDetails { get; set; }
        public List<SaleDetails>? SaleDetails { get; set; }
    }
}
