using AutoMapper;
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
        private readonly IOrderDetailsRepository _orderDetailsRepository;
        public OrdersServices(IMapper mapper, IOrdersRepository repository, IOrderDetailsRepository orderDetailsRepository) : base(repository, mapper)
        {
            _mapper = mapper;
            _repository = repository;
            _orderDetailsRepository = orderDetailsRepository;
        }

        public override async Task<OrdersDto?> SaveDtoAsync(OrdersDto dtoSave)
        {
            //Este método hay que modificarlo porque puede ser que el cliente llegue al restaurante sin reservación, entonces se le asigna una orden sin reservación, pero si el cliente tiene una reservación, entonces se le asigna la orden con la reservación, por lo tanto hay que validar si el cliente tiene una reservación o no, y si tiene una reservación, entonces se le asigna la orden con la reservación, pero si no tiene una reservación, entonces se le asigna la orden sin reservación.
            var isReservationExists = await _repository.GetAllQuerry().Where(o => o.ReservationID == dtoSave.ReservationID)
                                                                                                        .Select(o => new
                                                                                                        {
                                                                                                            o.OrderID,
                                                                                                            ReservationStatus = o.Reservations != null ? o.Reservations.ReservationStatus!.StatusName : "Sin Reservación"
                                                                                                        })
                                                                                                        .FirstOrDefaultAsync();
            if (isReservationExists == null) return null;

            return await base.SaveDtoAsync(dtoSave);
        }

        public async Task<OrdersDto?> GetOrderByWaiter(int waiterId)
        {
            try
            {
                var order = await _repository.GetAllQuerry().Where(o => o.WaiterID == waiterId)
                                                                                       .Include(o => o.OrderDetails)
                                                                                       .Include(o => o.OrderStatus)
                                                                                       .ToListAsync();
                if (order == null)
                {
                    return null;
                }
                OrdersDto? orderDto = _mapper.Map<OrdersDto>(order);
                return orderDto;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<OrdersDto?> GetAllOrdersByStatus(int statusId)
        {
            try
            {
                var orders = await _repository.GetAllQuerry().Where(o => o.StatusID == statusId)
                                                                                        .Include(o => o.OrderStatus)
                                                                                        .Include(o => o.OrderDetails)
                                                                                        .ToListAsync();

                if (orders is null) return null;

                OrdersDto? ordersDto = _mapper.Map<OrdersDto>(orders);
                return ordersDto;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public async Task<bool> UpdateOrderStatus(int orderId, int orderStatusId)
        {
            var result = await _repository.GetAllQuerry().Where(o => o.OrderID == orderId)
                                                                                   .ExecuteUpdateAsync(o => o.SetProperty(o => o.StatusID, orderStatusId));
            return result > 0;
        }
    }
}
