using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class Ingredients
    {
        [Key]

        public required int IngredientId { get; set; }
        public required string IngredientName { get; set; }
        public required string Unit { get; set; }
        public required decimal MinimunStock { get; set; }

        //navigation property
        public List<DishIngredients>? DishIngredients { get; set; }
    }
}
