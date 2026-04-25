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

        // Mesero también puede leer el menú para armar pedidos; el resto de operaciones
        // (crear, editar, eliminar) siguen restringidas a Administrador.
        [HttpGet]
        [Authorize(Roles = "Administrador,Mesero")]
        public override Task<IActionResult> GetAll() => base.GetAll();
    }
}
