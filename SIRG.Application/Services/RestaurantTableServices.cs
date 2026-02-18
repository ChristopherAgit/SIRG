using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class RestaurantTableServices : BaseServices<RestaurantTables, RestaurantTablesDto>, IRestaurantTablesServices
    {
        private readonly IRetaurantTableRepository _repository;
        private readonly IMapper _mapper;
        public RestaurantTableServices(IRetaurantTableRepository repository, IMapper mapper) : base(repository, mapper) 
        {
            _repository = repository;
            _mapper = mapper;
            
        }
    }
}
