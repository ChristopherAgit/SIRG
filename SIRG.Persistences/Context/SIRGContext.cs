using Microsoft.EntityFrameworkCore;

namespace SIRG.Persistences.Context
{
    public class SIRGContext : DbContext
    {
        public SIRGContext(DbContextOptions<SIRGContext> options) : base(options) 
        {
        
        }
        
         

    }
}
