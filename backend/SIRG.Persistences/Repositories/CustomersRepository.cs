using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class CustomersRepository : BaseRepository<Customers>, ICustomersRepository
    {
        private readonly SIRGContext _context;
        public CustomersRepository(SIRGContext context) : base(context) 
        {
            _context = context;
        }
    }
}
