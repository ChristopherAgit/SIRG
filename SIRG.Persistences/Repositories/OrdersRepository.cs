using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class OrdersRepository : BaseRepository<Orders>, IOrdersRepository
    {
        private readonly SIRGContext _context;
        public OrdersRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
