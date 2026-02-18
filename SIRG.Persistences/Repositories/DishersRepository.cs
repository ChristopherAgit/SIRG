using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class DishersRepository : BaseRepository<Dishes>, IDishersRepository
    {
        private readonly SIRGContext _context;

        public DishersRepository(SIRGContext context) : base(context) 
        {
            _context = context;
        }
    }
}
