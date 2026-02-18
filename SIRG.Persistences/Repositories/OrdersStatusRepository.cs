using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class OrdersStatusRepository : BaseRepository<OrderStatus>, IOrderStatusRepository
    {
        private readonly SIRGContext _context;
        public OrdersStatusRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
