namespace SIRG.Domain.Entities
{
    public class Ingredients
    {
        public required int IngredientID { get; set; }
        public required string IngredientName { get; set; }
        public required string Unit { get; set; }
        public required decimal MinimunStock { get; set; }

        //navigation property
        public List<DishIngredients>? DishIngredients { get; set; }
    }
}
