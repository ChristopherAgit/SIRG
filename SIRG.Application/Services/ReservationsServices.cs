using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class ReservationsServices
        : BaseServices<Reservations, ReservationsDto>, IReservationsServices
    {
        private readonly IReservationsRepository _reservationRepository;
        private readonly IRetaurantTableRepository _tableRepository;
        private readonly IMapper _mapper;

        public ReservationsServices(IReservationsRepository reservationRepository,
                                    IRetaurantTableRepository tableRepository,
                                    IMapper mapper) : base(reservationRepository, mapper)
        {
            _reservationRepository = reservationRepository;
            _tableRepository = tableRepository;
            _mapper = mapper;
        }

        public async Task<List<ReservationsDto>> GetAllReservationsAsync(
            DateOnly? date,
            TimeOnly? time,
            int? statusId)
        {
            var query = _reservationRepository.GetAllQuerry()
                .Include(r => r.RestaurantTables)
                .Include(r => r.ReservationStatus)
                .AsQueryable();

            if (date.HasValue)
                query = query.Where(r => r.ReservationDate == date.Value);

            if (time.HasValue)
                query = query.Where(r => r.ReservationTime == time.Value);

            if (statusId.HasValue)
                query = query.Where(r => r.StatusID == statusId.Value);

            return await query
                .ProjectTo<ReservationsDto>(_mapper.ConfigurationProvider)
                .ToListAsync();
        }

        public async Task<ReservationsDto?> SaveReservationAsync(ReservationsDto dto)
        {
            var table = await _tableRepository.GetEntityByIdAsync(dto.TableID);

            if (table == null)
                throw new Exception("La mesa no existe.");

            if (!table.IsActive)
                throw new Exception("La mesa está inactiva.");

            if (dto.NumberOfPeople > table.Capacity)
                throw new Exception("La cantidad de personas excede la capacidad.");

            bool conflict = await _reservationRepository.GetAllQuerry()
                .AnyAsync(r =>
                    r.TableID == dto.TableID &&
                    r.ReservationDate == dto.ReservationDate &&
                    r.ReservationTime == dto.ReservationTime &&
                    (r.StatusID == 1 || r.StatusID == 2));

            if (conflict)
                throw new Exception("Ya existe una reserva activa para esa mesa.");

            dto.CreatedAt = DateTime.Now;

            if (dto.StatusID == 0)
                dto.StatusID = 1;

            var entity = _mapper.Map<Reservations>(dto);

            var saved = await _reservationRepository.SaveEntityAsync(entity);

            return _mapper.Map<ReservationsDto>(saved);
        }

        public async Task<ReservationsDto?> UpdateReservationAsync(int id, ReservationsDto dto)
        {
            var current = await _reservationRepository.GetEntityByIdAsync(id);

            if (current == null)
                return null;

            bool conflict = await _reservationRepository.GetAllQuerry()
                .AnyAsync(r =>
                    r.ReservationID != id &&
                    r.TableID == dto.TableID &&
                    r.ReservationDate == dto.ReservationDate &&
                    r.ReservationTime == dto.ReservationTime &&
                    (r.StatusID == 1 || r.StatusID == 2));

            if (conflict)
                throw new Exception("Ya existe una reserva activa para esa mesa.");

            dto.ReservationID = id;
            dto.CreatedAt = current.CreatedAt;

            var entity = _mapper.Map<Reservations>(dto);

            var updated = await _reservationRepository.UpdateEntityAsync(id, entity);

            return _mapper.Map<ReservationsDto>(updated);
        }

        public async Task<bool> CancelReservationAsync(int id)
        {
            var reservation = await _reservationRepository.GetEntityByIdAsync(id);

            if (reservation == null)
                return false;

            reservation.StatusID = 3;

            var updated = await _reservationRepository.UpdateEntityAsync(id, reservation);

            return updated != null;
        }

        public async Task<bool> UpdateReservationStatusAsync(int id, int statusId)
        {
            var reservation = await _reservationRepository.GetEntityByIdAsync(id);

            if (reservation == null)
                return false;

            reservation.StatusID = statusId;

            var updated = await _reservationRepository.UpdateEntityAsync(id, reservation);

            return updated != null;
        }

        public async Task<List<ReservationsDto>> GetAllReservationsAsync(DateOnly? date = null, TimeOnly? time = null, int? statusId = null, string? reservationType = null)
        {
            try
            {
                var query = _reservationRepository.GetAllQuerry()
                    .Include(r => r.RestaurantTables)
                    .Include(r => r.ReservationStatus)
                    .AsQueryable();

                if (date.HasValue)
                    query = query.Where(r => r.ReservationDate == date.Value);

                if (time.HasValue)
                    query = query.Where(r => r.ReservationTime == time.Value);

                if (statusId.HasValue)
                    query = query.Where(r => r.StatusID == statusId.Value);

                return await query
                    .ProjectTo<ReservationsDto>(_mapper.ConfigurationProvider)
                    .ToListAsync();
            }
            catch
            {
                return [];
            }
        }

        public Task<ReservationsDto?> GetReservationWithDetailsById(int id)
        {
            throw new NotImplementedException();
        }
    }
}