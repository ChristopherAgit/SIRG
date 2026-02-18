using AutoMapper;
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
        public OrdersServices(IMapper mapper, IOrdersRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
