namespace SIRG.Domain.Entities
{
    public class OrderStatus
    {
        public required int StatusID { get; set; }
        public string? StatusName { get; set; }
        //Navigation property
        public List<Orders>? Orders { get; set; }
    }
}
