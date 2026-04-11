using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Domain.Entities;

namespace SIRG.Application.Interfaces.Contracts
{
    public interface IRestaurantTablesServices : IBaseServices<RestaurantTables, RestaurantTablesDto>
    {
        Task<RestaurantTablesDto> GetTableWithReservationsById(int id);
        Task<List<RestaurantTablesDto>> GetAllTablesWithReservations();
    }
}
