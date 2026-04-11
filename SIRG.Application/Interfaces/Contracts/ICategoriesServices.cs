using SIRG.Application.Dtos.Categories;
using SIRG.Domain.Entities;

namespace SIRG.Application.Interfaces.Contracts
{
    public interface ICategoriesServices : IBaseServices<Categories, CategoriesDto>
    {
        Task<CreateCategoriesViewModel> CreateCategories(CreateCategoriesViewModel dto);
    }
}
