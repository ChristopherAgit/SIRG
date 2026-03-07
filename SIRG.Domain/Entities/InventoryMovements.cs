using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class InventoryMovements
    {
        [Key]

        public required int MovementID { get; set; }
        public required int IngredientID { get; set; }
        public string? MovementType { get; set; }
        public required decimal Quantity { get; set; }
        public DateTime MovementDate { get; set; } = DateTime.Now;
        public string? Reference { get; set; } = string.Empty;

        //Navigation property
        public Ingredients? Ingredient { get; set; }
    }
}
