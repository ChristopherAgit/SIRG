using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class SalesDetailsRepository : BaseRepository<SaleDetails>, ISalesDetailsRepository
    {
        private readonly SIRGContext _context;
        public SalesDetailsRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
