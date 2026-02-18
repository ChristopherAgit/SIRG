using SIRG.Domain.Entities;

namespace SIRG.Application.Dtos.EntitiesDto
{
    public class InventoryDto
    {
        public required int InventoryID { get; set; }
        public required int IngredientID { get; set; }
        public required decimal CurrentStock { get; set; } = 0;
        public DateTime? LastUpdated { get; set; }
        public IngredientsDto? IngredientDto { get; set; }
    }
}
