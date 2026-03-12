using AutoMapper;
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
    }
}
