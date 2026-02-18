using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class OrdersStatusServices : BaseServices<OrderStatus, OrdersStatusDto>, IOrdersStatusServices
    {
        private readonly IMapper _mapper;
        private readonly IOrderStatusRepository _repository;
        public OrdersStatusServices(IMapper mapper, IOrderStatusRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
