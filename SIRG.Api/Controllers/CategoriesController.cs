using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using SIRG.API.Controllers;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using Swashbuckle.AspNetCore.Annotations;

namespace SIRG.Api.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/categories")]
    [SwaggerTag("Endoints para manejar las categorias")]
    public class CategoriesController : BaseController<Categories, CategoriesDto>
    {
        private readonly ICategoriesServices _Service;
        public CategoriesController(ICategoriesServices service) : base(service) 
        {
            _Service = service;
        }
    }
}
