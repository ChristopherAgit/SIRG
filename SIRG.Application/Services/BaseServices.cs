using AutoMapper;
using SIRG.Application.Interfaces;
using SIRG.Domain.Interfaces;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace SIRG.Application.Services
{
    public class BaseServices<TEntity, TDtos> : IBaseServices<TEntity, TDtos> where TEntity : class where TDtos : class
    {
        private readonly IBaseRepository<TEntity> _repository;
        private readonly IMapper _mapper;
        public BaseServices(IBaseRepository<TEntity> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
            
        }

        public async Task<bool> DeleteDtoAync(int dtoDelete)
        {
            try
            {
                await _repository.RemoveAsync(dtoDelete);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<List<TDtos>> GetAllListDto()
        {
            try
            {
                var listEntity = await _repository.GetAllEntitiesAsync();

                var listDto = _mapper.Map<List<TDtos>>(listEntity);
                return listDto;
            }
            catch (Exception)
            {
                return new List<TDtos>();
            }
        }

        public async Task<TDtos?> GetDtoById(int id)
        {
            try {
              var entitty = await _repository.GetEntityByIdAsync(id);
                if (entitty == null)
                {
                    return null;
                }
                TDtos? dto = _mapper.Map<TDtos>(entitty);
                return dto;
            }
            catch {
                return null;
            }
        }

        public async Task<List<TDtos>> GetWithInclude(List<string> properties)
        {
            try
            {
                var querry = _repository.GetAllQuerryWithInclude(properties);
                    

                var result = await querry.ProjectTo<TDtos>(_mapper.ConfigurationProvider).ToListAsync();
                return result;
            }
            catch
            {
                return new List<TDtos>();
            }

        }

        public async Task<TDtos> SaveDtoAsync(TDtos dtoSave)
        {
            try
            {
                TEntity entity = _mapper.Map<TEntity>(dtoSave);
                TEntity? reeturnEntity = await _repository.SaveEntityAsync(entity);
                if (reeturnEntity == null)
                {
                    throw new InvalidOperationException($"Unable to save entity of type {typeof(TEntity).Name}.");
                }

                return _mapper.Map<TDtos>(reeturnEntity);

            }
            catch (Exception ex)
            {
                throw new Exception(
                    $"Error mapeando {typeof(TDtos).Name} -> {typeof(TEntity).Name}: {ex.Message}", ex);
            }
        }

        public async Task<TDtos?> UpdateDtoByAsync(TDtos dtoUpdate, int id)
        {
            try
            {
                TEntity entity = _mapper.Map<TEntity>(dtoUpdate);
                TEntity? reeturnEntity = await _repository.UpdateEntityAsync(id, entity);
                if (reeturnEntity == null)
                {
                    return null;
                }

                return _mapper.Map<TDtos>(reeturnEntity);

            }
            catch
            {

                return null;
            }
        }
    }
}
