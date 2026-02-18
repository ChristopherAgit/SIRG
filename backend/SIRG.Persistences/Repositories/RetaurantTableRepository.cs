using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class RetaurantTableRepository : BaseRepository<RestaurantTables>, IRetaurantTableRepository
    {
        private readonly SIRGContext _context;
        public RetaurantTableRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
