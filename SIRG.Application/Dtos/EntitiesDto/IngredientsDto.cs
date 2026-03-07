namespace SIRG.Application.Dtos.EntitiesDto
{
    public class IngredientsDto
    {
        public required int IngredientId { get; set; }
        public required string IngredientName { get; set; }
        public required string Unit { get; set; }
        public required decimal MinimunStock { get; set; }
        public List<DishIngredientsDto>? DishIngredientsDto { get; set; }
    }
}
