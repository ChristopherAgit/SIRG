using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class DishesServices : BaseServices<Dishes, DishesDto>, IDisherServices
    {
        private readonly IMapper _mapper;
        private readonly IDishersRepository _repository;
        public DishesServices(IMapper mapper, IDishersRepository dishersRepository) : base(dishersRepository, mapper)
        {

            _mapper = mapper;
            _repository = dishersRepository;

        }
    }
}
