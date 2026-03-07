using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class DishIngredients
    {
        [Key]

        public required int DishIngredientsId { get; set; }
        public required int DishID { get; set; }
        public required int IngredientID { get; set; }
        public decimal? QuantityRequired { get; set; }

        //Navigation properties
        public Dishes? Dish { get; set; }
        public Ingredients? Ingredients { get; set; }
    }
}
