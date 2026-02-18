using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class OrdersDetailsRepository : BaseRepository<OrderDetails>, IOrderDetailsRepository
    {
        private readonly SIRGContext _context;
        public OrdersDetailsRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
