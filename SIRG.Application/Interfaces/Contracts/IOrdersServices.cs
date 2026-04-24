using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Domain.Entities;

namespace SIRG.Application.Interfaces.Contracts
{
    public interface IOrdersServices : IBaseServices<Orders, OrdersDto>
    {
        Task<OrdersDto?> CreateOrderWithDetailsAsync(CreateOrderDto dto, int? waiterID = null, int? userID = null);
        Task<bool> UpdateOrderStatusAsync(int orderId, int statusId);
        Task<List<OrdersDto>> GetOrdersByReservationAsync(int reservationId);
        Task<List<OrdersDto>> GetAllWithDetailsAsync();
        Task<OrdersDto?> AddDetailAsync(int orderId, int dishId, int quantity, decimal unitPrice);
        Task<bool> RemoveDetailAsync(int orderId, int detailId);
    }
}
