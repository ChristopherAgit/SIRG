using AutoMapper;
using SIRG.Application.Dtos.Categories;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using SIRG.Domain.Interfaces;

namespace SIRG.Application.Services
{
    public class CategoriesServices : BaseServices<Categories, CategoriesDto>, ICategoriesServices
    {
        private readonly ICategoriesRepository _repository;
        private readonly IMapper _mapper;
        public CategoriesServices(ICategoriesRepository repository, IMapper mapper) : base(repository, mapper)
        {
            _repository = repository;
            _mapper = mapper;

        }

        public async Task<CreateCategoriesViewModel> CreateCategories(CreateCategoriesViewModel dto)
        {
            try
            {
                var entity = _mapper.Map<Categories>(dto);
                var createdEntity = await _repository.SaveEntityAsync(entity);

                return _mapper.Map<CreateCategoriesViewModel>(createdEntity);
            }
            catch (Exception ex)
            {

                throw ex;
            }
            
        }
    }
}
