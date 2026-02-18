using SIRG.Domain.Entities;

namespace SIRG.Application.Dtos.EntitiesDto
{
    public class OrdersStatusDto
    {
        public required int StatusID { get; set; }
        public string? StatusName { get; set; }
        public List<OrdersDto>? Orders { get; set; }
    }
}
