// Ignore Spelling: SIRG dto

using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using SIRG.Application.Interfaces;
using SIRG.Domain.Interfaces;

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

        public virtual async Task<bool> DeleteDtoAync(int dtoDelete)
        {
            try
            {
                await _repository.RemoveAsync(dtoDelete);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public virtual async Task<List<TDtos>> GetAllListDto()
        {
            try
            {
                var listEntity = await _repository.GetAllEntitiesAsync();

                var listDto = _mapper.Map<List<TDtos>>(listEntity);
                return listDto;
            }
            catch (Exception)
            {
                return [];
            }
        }

        public virtual async Task<TDtos?> GetDtoById(int id)
        {
            try
            {
                var entitty = await _repository.GetEntityByIdAsync(id);
                if (entitty == null)
                {
                    return null;
                }
                TDtos? dto = _mapper.Map<TDtos>(entitty);
                return dto;
            }
            catch
            {
                return null;
            }
        }

        public virtual async Task<List<TDtos>> GetWithInclude(List<string> properties)
        {
            try
            {
                var querry = _repository.GetAllQuerryWithInclude(properties);

                var result = await querry.ProjectTo<TDtos>(_mapper.ConfigurationProvider).ToListAsync();
                return result;
            }
            catch
            {
                return [];
            }
        }

        public virtual async Task<TDtos> SaveDtoAsync(TDtos dtoSave)
        {
            try
            {
                TEntity entity = _mapper.Map<TEntity>(dtoSave);
                TEntity? reeturnEntity = await _repository.SaveEntityAsync(entity);
                if (reeturnEntity == null)
                {
                    return null!;
                }

                return _mapper.Map<TDtos>(reeturnEntity);
            }
            catch (Exception ex)
            {
                {
                    throw new Exception($"Error mapeando {typeof(TDtos).Name} -> {typeof(TEntity).Name}: {ex.Message}", ex);
                }
            }
        }

        public virtual async Task<TDtos?> UpdateDtoByAsync(TDtos dtoUpdate, int id)
        {
            try
            {
                TEntity entity = _mapper.Map<TEntity>(dtoUpdate);
                TEntity? returnEntity = await _repository.UpdateEntityAsync(id, entity);
                if (returnEntity == null)
                {
                    return null;
                }

                return _mapper.Map<TDtos>(returnEntity);
            }
            catch
            {
                return null;
            }
        }
    }
}
