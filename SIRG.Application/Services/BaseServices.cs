using SIRG.Application.Interfaces;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class BaseServices<TEntity, TDtos> : IBaseServices<TEntity, TDtos> where TEntity : class where TDtos : class
    {
        private readonly IBaseRepository<TEntity> _repository;
        public BaseServices(IBaseRepository<TEntity> repository)
        {
            _repository = repository;
            
        }

        public Task<bool> DeleteDtoAync(int dtoDelete)
        {
            throw new NotImplementedException();
        }

        public async Task<List<TDtos>> GetAllListDto()
        {
            try
            {
                var listEntity = await _repository.GetAllEntitiesAsync();

                var listDto = new List<TDtos>();
                return listDto;
            }
            catch (Exception)
            {
                return [];
            }
        }

        public Task<TDtos?> GetDtoById(int id)
        {
            throw new NotImplementedException();
        }

        public Task<List<TDtos>> GetWithInclude(List<string> properties)
        {
            throw new NotImplementedException();
        }

        public Task<TDtos> SaveDtoAsync(TDtos dtoSave)
        {
            throw new NotImplementedException();
        }

        public Task<TDtos?> UpdateDtoByAsync(TDtos dtoUpdate, int id)
        {
            throw new NotImplementedException();
        }
    }
}
