using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class InventoryMovementServices :  BaseServices<InventoryMovements, InventoryMovementDto>, IInventoryMovementServices
    {
        private readonly IMapper _mapper;
        private readonly IInventoryMovementsRepository _repository;
        public InventoryMovementServices(IMapper mapper, IInventoryMovementsRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
