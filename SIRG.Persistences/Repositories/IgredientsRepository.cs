using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class IgredientsRepository : BaseRepository<Ingredients>, IIgredientsRepository
    {
        private readonly SIRGContext _context;
        public IgredientsRepository(SIRGContext context) : base(context)
        {
            _context = context;
        }
    }
}
