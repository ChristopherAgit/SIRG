namespace SIRG.Application.Dtos.EntitiesDto
{
    public class DishIngredientsDto
    {
        public required int DishIngredientsId { get; set; }

        public required int DishID { get; set; }
        public required int IngredientID { get; set; }
        public decimal? QuantityRequired { get; set; }
        public DishesDto? DishDto { get; set; }
        public IngredientsDto? IngredientsDto { get; set; }
    }
}
