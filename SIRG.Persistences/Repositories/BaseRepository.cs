using Microsoft.EntityFrameworkCore;
using SIRG.Domain.Interfaces;
using System.ComponentModel.Design;

namespace SIRG.Persistences.Repositories
{
    public class BaseRepository<TEntity> : IBaseRepository<TEntity> where TEntity : class
    {
        private readonly DbContext _context;

        protected DbSet<TEntity> Entity { get; }
        public BaseRepository(DbContext context)
        {
           _context = context;
           Entity = context.Set<TEntity>();
        }

        public virtual async Task<TEntity?> GetEntityByIdAsync(int Id)
        {
            return await Entity.FindAsync(Id);
        }

        public virtual async Task<TEntity> SaveEntityAsync(TEntity entity)
        {
            await Entity.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<TEntity?> UpdateEntityAsync(int id, TEntity entity)
        {
            var entry = await Entity.FindAsync(id);

            if (entry != null)
            { 
                _context.Entry(entry).CurrentValues.SetValues(entity);
                 await _context.SaveChangesAsync();
                 return entry;
            
            }
            return null;
        }

        public async Task<List<TEntity>> GetAllEntitiesAsync()
        {
           return await Entity.ToListAsync();
        }

        public IQueryable<TEntity> GetAllQuerry()
        {
            return Entity.AsQueryable();
        }

        public virtual async Task<List<TEntity>> GetAllListWithInclude(List<string> properties)
        {
            var querry = Entity.AsQueryable();

            foreach (var property in properties)
            {
                querry.Include(property);

            }

            return await querry.ToListAsync();
        }

        public virtual IQueryable<TEntity> GetAllQuerryWithInclude(List<string> properties)
        {
            var querry = Entity.AsQueryable();

            foreach (var property in properties)
            {
                querry.Include(property);
            }

            return querry;
        }

     
    }
}
