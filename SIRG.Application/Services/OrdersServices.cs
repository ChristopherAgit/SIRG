using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class OrdersServices : BaseServices<Orders, OrdersDto>, IOrdersServices
    {
        private readonly IMapper _mapper;
        private readonly IOrdersRepository _repository;
        private readonly IOrderDetailsRepository _detailsRepository;

        public OrdersServices(
            IMapper mapper,
            IOrdersRepository repository,
            IOrderDetailsRepository detailsRepository)
            : base(repository, mapper)
        {
            _mapper = mapper;
            _repository = repository;
            _detailsRepository = detailsRepository;
        }

        public async Task<OrdersDto?> CreateOrderWithDetailsAsync(CreateOrderDto dto, int? waiterID = null, int? userID = null)
        {
            var order = new Orders
            {
                OrderID = 0,
                ReservationID = dto.ReservationID,
                WaiterID = waiterID,
                UserID = userID,
                StatusID = 1,
                OrderDate = DateTime.UtcNow,
            };

            var saved = await _repository.SaveEntityAsync(order);

            foreach (var item in dto.Items)
            {
                var detail = new OrderDetails
                {
                    OrderDetailsID = 0,
                    OrderID = saved.OrderID,
                    DishID = item.DishID,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                };
                await _detailsRepository.SaveEntityAsync(detail);
            }

            return await GetOrderWithDetailsById(saved.OrderID);
        }

        public async Task<bool> UpdateOrderStatusAsync(int orderId, int statusId)
        {
            var order = await _repository.GetEntityByIdAsync(orderId);
            if (order == null) return false;

            order.StatusID = statusId;
            var updated = await _repository.UpdateEntityAsync(orderId, order);
            return updated != null;
        }

        public async Task<List<OrdersDto>> GetOrdersByReservationAsync(int reservationId)
        {
            return await _repository.GetAllQuerry()
                .Where(o => o.ReservationID == reservationId)
                .Include(o => o.OrderDetails!).ThenInclude(d => d.Dishes)
                .Include(o => o.OrderStatus)
                .ProjectTo<OrdersDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<List<OrdersDto>> GetAllWithDetailsAsync()
        {
            return await _repository.GetAllQuerry()
                .Include(o => o.OrderDetails!).ThenInclude(d => d.Dishes)
                .Include(o => o.OrderStatus)
                .OrderByDescending(o => o.OrderDate)
                .ProjectTo<OrdersDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<OrdersDto?> AddDetailAsync(int orderId, int dishId, int quantity, decimal unitPrice)
        {
            var order = await _repository.GetEntityByIdAsync(orderId);
            if (order == null || order.StatusID != 1)
                return null;

            var detail = new OrderDetails
            {
                OrderDetailsID = 0,
                OrderID = orderId,
                DishID = dishId,
                Quantity = quantity,
                UnitPrice = unitPrice,
            };
            await _detailsRepository.SaveEntityAsync(detail);

            return await GetOrderWithDetailsById(orderId);
        }

        public async Task<bool> RemoveDetailAsync(int orderId, int detailId)
        {
            var order = await _repository.GetEntityByIdAsync(orderId);
            if (order == null || order.StatusID != 1)
                return false;

            var detail = await _detailsRepository.GetEntityByIdAsync(detailId);
            if (detail == null || detail.OrderID != orderId)
                return false;

            await _detailsRepository.RemoveAsync(detailId);
            return true;
        }

        private async Task<OrdersDto?> GetOrderWithDetailsById(int orderId)
        {
            var entity = await _repository.GetAllQuerry()
                .Include(o => o.OrderDetails!).ThenInclude(d => d.Dishes)
                .Include(o => o.OrderStatus)
                .FirstOrDefaultAsync(o => o.OrderID == orderId);

            return entity == null ? null : _mapper.Map<OrdersDto>(entity);
        }
    }
}
