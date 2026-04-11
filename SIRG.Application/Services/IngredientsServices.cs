using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    internal class IngredientsServices : BaseServices<Ingredients, IngredientsDto>, IIgredientsServices
    {
        private readonly IMapper _mapper;
        private readonly IIgredientsRepository _repository;
        public IngredientsServices(IMapper mapper, IIgredientsRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
