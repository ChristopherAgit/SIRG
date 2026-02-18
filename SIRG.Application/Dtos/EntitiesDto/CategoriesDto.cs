namespace SIRG.Application.Dtos.EntitiesDto
{
    public class CategoriesDto
    {
        public required int CategoryID { get; set; }
        public required string CategoryName { get; set; }
        public string? Description { get; set; }

        public List<DishesDto>? DishesDto { get; set; }
    }
}
