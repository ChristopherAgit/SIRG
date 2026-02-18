using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class SaleRepository : BaseRepository<Sales>, ISalesRepository
    {
        private readonly SIRGContext _context;
        public SaleRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
