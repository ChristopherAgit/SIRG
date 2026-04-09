using SIRG.Application.Dtos.Categories;

namespace SIRG.Application.Dtos.EntitiesDto
{
    public class DishesDto
    {
        public required int DishID { get; set; }
        public required string CategoryID { get; set; }
        public required string DishName { get; set; }
        public decimal? Price { get; set; }
        public bool IsActive { get; set; }

        //Navigation property
        public CategoriesDto? CategoryDto { get; set; }
        public List<DishIngredientsDto>? DishIngredientsDto { get; set; }
        public List<OrdersDetailsDto>? OrderDetailsDto { get; set; }
        public List<SaleDetailsDto>? SaleDetailsDto { get; set; }
    }
}
