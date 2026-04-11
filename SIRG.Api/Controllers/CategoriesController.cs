using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using SIRG.API.Controllers;
using SIRG.Application.Dtos.Categories;
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

        [HttpPost("CreateCategory")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Create a new category",
            Description = "Creates a new category"
        )]
        public async Task<IActionResult> Create([FromBody] CreateCategoriesViewModel vm)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();

                var result = await _Service.CreateCategories(vm);

                if (result == null)
                    return BadRequest(result);

                return Ok(vm);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}