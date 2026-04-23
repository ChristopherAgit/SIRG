using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class RestaurantTableServices : BaseServices<RestaurantTables, RestaurantTablesDto>, IRestaurantTablesServices
    {
        private readonly IRetaurantTableRepository _repositoryTable;
        private readonly IMapper _mapper;
        public RestaurantTableServices(IRetaurantTableRepository repository, IMapper mapper) : base(repository, mapper) 
        {
            _repositoryTable = repository;
            _mapper = mapper;
            
        }

        // Override SaveDtoAsync to enforce maximum capacity per table (8 personas)
        public async Task<RestaurantTablesDto> SaveDtoAsync(RestaurantTablesDto dtoSave)
        {
            if (dtoSave.Capacity > 8)
                throw new Exception("La capacidad máxima por mesa es 8 personas.");

            return await base.SaveDtoAsync(dtoSave);
        }

        public async Task<RestaurantTablesDto?> UpdateDtoByAsync(RestaurantTablesDto dtoUpdate, int id)
        {
            if (dtoUpdate.Capacity > 8)
                throw new Exception("La capacidad máxima por mesa es 8 personas.");

            return await base.UpdateDtoByAsync(dtoUpdate, id);
        }

        public async Task<List<RestaurantTablesDto>> GetAllTablesWithReservations()
        {
            try
            {
                return await _repositoryTable.GetAllQuerry()
                                             .Include(t => t.Reservations)
                                             .ProjectTo<RestaurantTablesDto>(_mapper.ConfigurationProvider)
                                             .ToListAsync();
            }
            catch (Exception)
            {
                return new List<RestaurantTablesDto>();
            }
        }

        public async Task<RestaurantTablesDto?> GetTableWithReservationsById(int id)
        {
            try
            {

                var querry = _repositoryTable.GetAllQuerry();

                var listWnities = await querry.Include(r => r.Reservations)
                    .FirstOrDefaultAsync(r => r.TableID == id);

                if (listWnities == null)
                {
                    return null;
                }

                return _mapper.Map<RestaurantTablesDto>(listWnities);
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
