namespace SIRG.Application.Interfaces
{
    public interface IBaseServices<TEntity, TDtos> where TEntity : class where TDtos : class
    {
        Task<List<TDtos>> GetAllListDto();

        Task<TDtos?> GetDtoById(int id);

        Task<TDtos?> UpdateDtoByAsync(TDtos dtoUpdate, int id);

        Task<TDtos> SaveDtoAsync(TDtos dtoSave);

        Task<List<TDtos>> GetWithInclude(List<string> properties);
        Task<bool> DeleteDtoAync(int dtoDelete);
    }
}
