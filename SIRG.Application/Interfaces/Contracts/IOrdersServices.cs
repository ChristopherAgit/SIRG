using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Domain.Entities;

namespace SIRG.Application.Interfaces.Contracts
{
    public interface IOrdersServices : IBaseServices<Orders, OrdersDto>
    {
        public Task<OrdersDto?> GetOrderByWaiter(int waiterId);
        public Task<OrdersDto?> GetAllOrdersByStatus(int statusId);
        public Task<bool> UpdateOrderStatus(int orderId, int orderStatusId);
    }
}
