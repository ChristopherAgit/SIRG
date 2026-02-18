namespace SIRG.Domain.Entities
{
    public class DishIngredients
    {
        public required int DishID { get; set; }
        public required int IngredientID { get; set; }
        public decimal? QuantityRequired { get; set; }

        //Navigation properties
        public Dishes? Dish { get; set; }
        public Ingredients? Ingredients { get; set; }
    }
}
