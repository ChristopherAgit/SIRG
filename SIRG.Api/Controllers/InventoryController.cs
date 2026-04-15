using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using SIRG.API.Controllers;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Authorization;

namespace SIRG.Api.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/inventory")]
    [SwaggerTag("Endoints para manejar el inventario")]
    [Authorize(Roles = "Administrador")]
    public class InventoryController : BaseController<Inventory, InventoryDto>
    {
        private readonly IInventoryServices _Service;
        public InventoryController(IInventoryServices service) : base(service)
        {
            _Service = service;
        }
    }
}
