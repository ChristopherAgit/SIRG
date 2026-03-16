using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class OrdersDetailsServices : BaseServices<OrderDetails, OrdersDetailsDto>, IOrderDetailsServices
    {
        private readonly IMapper _mapper;
        private readonly IOrderDetailsRepository _repository;
        public OrdersDetailsServices(IMapper mapper, IOrderDetailsRepository repository) : base(repository, mapper)
        {
            _mapper = mapper;
            _repository = repository;
        }

        public override async Task<bool> DeleteDtoAync(int dtoDelete)
        {
            //Solo se puede eliminar un detalle de orden si el estado de la orden es "Pendiente"
            var orderDetails = await _repository.GetAllQuerry().Where(od => od.OrderDetailsID == dtoDelete)
                                                                                              .Select(od => new
                                                                                              {
                                                                                                  OrderStatus = od.Orders!.OrderStatus!.StatusName
                                                                                              }).FirstOrDefaultAsync();

            if (orderDetails is not null && orderDetails.OrderStatus == "Pending")
                return await base.DeleteDtoAync(dtoDelete);

            return false;
        }
    }
}
