namespace SIRG.Domain.Interfaces
{
    public interface IBaseRepository<T> where T :class
    {
        Task<T?> GetEntityByIdAsync(int Id);
        Task<T> SaveEntityAsync(T entity);
        Task<T?> UpdateEntityAsync(int id, T entity);
        Task<List<T>> GetAllEntitiesAsync();
        IQueryable<T> GetAllQuerry();
        Task<List<T>> GetAllListWithInclude(List<string> properties);
        IQueryable<T> GetAllQuerryWithInclude(List<string> properties);
    }
}
