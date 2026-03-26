using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class IventoryMovementsRepository : BaseRepository<InventoryMovements>, IInventoryMovementsRepository
    {
        private readonly SIRGContext _context;
        public IventoryMovementsRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
