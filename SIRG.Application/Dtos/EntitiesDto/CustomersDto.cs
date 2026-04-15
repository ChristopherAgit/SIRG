namespace SIRG.Application.Dtos.EntitiesDto
{
    public class CustomersDto
    {
        public int? CustomerID { get; set; }
        public required string FullName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
