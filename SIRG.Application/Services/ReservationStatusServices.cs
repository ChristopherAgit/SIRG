using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class ReservationStatusServices : BaseServices<ReservationStatus, ReservationStatusDto>, IReservationStatusServices
    {
        private readonly IMapper _mapper;
        private readonly IReservationStatusRepository _repository;
        public ReservationStatusServices(IMapper mapper, IReservationStatusRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
