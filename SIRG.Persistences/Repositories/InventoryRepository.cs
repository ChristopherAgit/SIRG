using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class InventoryRepository :BaseRepository<Inventory>, IInventoryRepository
    {
        private readonly SIRGContext _context;
        public InventoryRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
