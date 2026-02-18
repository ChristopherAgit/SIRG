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
    public class InventoryServices : BaseServices<Inventory, InventoryDto>, IInventoryServices
    {
        private readonly IMapper _mapper;
        private readonly IInventoryRepository _repository;
        public InventoryServices(IMapper mapper, IInventoryRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
