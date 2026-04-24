using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using SIRG.Api.Controllers;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace SIRG.Api.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/dishes")]
    [SwaggerTag("Endoints para manejar los platos")]
    [Authorize(Roles = "Administrador")]
    public class DishesController : BaseController<Dishes, DishesDto>
    {
        private readonly IDisherServices _Service;
        public DishesController(IDisherServices service) : base(service)
        {
            _Service = service;
        }

        /// <summary>Devuelve todos los platos con su categoría. Público (para el menú y el formulario de órdenes).</summary>
        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public override async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _Service.GetWithInclude(new List<string> { "Category" });
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
