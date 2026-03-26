using SIRG.API.Controllers;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;

namespace SIRG.Api.Controllers
{
    public class CategoriesController : BaseController<Categories, CategoriesDto>
    {
        private readonly ICategoriesServices _categoryService;
        public CategoriesController(ICategoriesServices service) : base(service) 
        {
            _categoryService = service;
        }
    }
}
