namespace SIRG.Domain.Entities
{
    public class Inventory
    {
        public required int InventoryID { get; set; }
        public required int IngredientID { get; set; }
        public required decimal CurrentStock { get; set; } = 0;
        public DateTime? LastUpdated { get; set; }

        //Navigation property
        public Ingredients? Ingredient { get; set; }
    }
}
