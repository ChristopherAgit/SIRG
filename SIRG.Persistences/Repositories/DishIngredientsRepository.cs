using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;
using SIRG.Persistences.Context;

namespace SIRG.Persistences.Repositories
{
    public class DishIngredientsRepository : BaseRepository<DishIngredients>, IDishIngredientsRepository
    {
        private readonly SIRGContext _context;
        public DishIngredientsRepository(SIRGContext context) : base(context) 
        {
            _context = context;
            
        }
    }
}
