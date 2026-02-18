using System.ComponentModel.DataAnnotations;

namespace SIRG.Domain.Entities
{
    public class Categories
    {
        [Key]
        public required int CategoryID { get; set; }
        public required string CategoryName { get; set; }
        public string? Description { get; set; }

        //Navigation property
        public List<Dishes>? Dishes { get; set; }
    }
}
