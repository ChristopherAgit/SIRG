using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class CustomersServices : BaseServices<Customers, CustomersDto>, ICustomersServices
    {
        private readonly ICustomersRepository _repository;
        private readonly IMapper _mapper;
        public CustomersServices(ICustomersRepository repository, IMapper mapper) : base(repository, mapper)
        {
            _repository = repository;
            _mapper = mapper;

        }
    }
}
