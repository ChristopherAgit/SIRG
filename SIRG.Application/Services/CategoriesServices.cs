using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class CategoriesServices : BaseServices<Categories, CategoriesDto>, ICategoriesServices
    {
        private readonly ICategoriesRepository _repository;
        private readonly IMapper _mapper;
        public CategoriesServices(ICategoriesRepository repository, IMapper mapper) : base(repository, mapper)
        {
            _repository = repository;
            _mapper = mapper;

        }
    }
}
