using AutoMapper;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class ReservationsServices : BaseServices<Reservations, ReservationsDto>, IReservationsServices
    {
        private readonly IMapper _mapper;
        private readonly IReservationsRepository _repository;
        public ReservationsServices(IMapper mapper, IReservationsRepository repository) : base(repository, mapper)
        {

            _mapper = mapper;
            _repository = repository;

        }
    }
}
