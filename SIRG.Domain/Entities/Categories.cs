// Ignore Spelling: SIRG

namespace SIRG.Domain.Entities
{
    public class Categories
    {
        public required int CategoryID { get; set; }
        public required string CategoryName { get; set; }
        public string? Description { get; set; }

        public List<Dishes>? Dishes { get; set; }
    }
}
