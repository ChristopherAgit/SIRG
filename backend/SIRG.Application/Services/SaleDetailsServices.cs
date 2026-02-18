using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class SaleDetailsServices : BaseServices<SaleDetails, SaleDetailsDto>, ISaleDetailsServices
    {
        private readonly IMapper _mapper;
        private readonly ISalesDetailsRepository _repository;
        public SaleDetailsServices(IMapper mapper, ISalesDetailsRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
