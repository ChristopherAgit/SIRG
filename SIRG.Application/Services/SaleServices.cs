using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class SaleServices : BaseServices<Sales, SalesDto>, ISalesServices
    {
        private readonly IMapper _mapper;
        private readonly ISalesRepository _repository;
        public SaleServices(IMapper mapper, ISalesRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
