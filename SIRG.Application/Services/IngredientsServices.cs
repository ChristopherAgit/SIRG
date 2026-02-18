using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIRG.Application.Services
{
    internal class IngredientsServices : BaseServices<DishIngredients, DishIngredientsDto>, IDishIngredientsServices
    {
        private readonly IMapper _mapper;
        private readonly IDishIngredientsRepository _repository;
        public DishIngredientsServices(IMapper mapper, IDishIngredientsRepository dishersRepository) : base(dishersRepository, mapper)
        {

            _mapper = mapper;
            _repository = dishersRepository;

        }
    }
}
