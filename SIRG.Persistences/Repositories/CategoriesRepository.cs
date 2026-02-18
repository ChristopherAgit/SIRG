using Microsoft.EntityFrameworkCore;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class CategoriesRepository : BaseRepository<Categories>, ICategoriesRepository
    {
        private readonly SIRGContext _context;
        public CategoriesRepository(SIRGContext context) : base(context)
        {
            _context = context;
            
        }
    }
}
