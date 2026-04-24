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
    [Route("api/v{version:apiVersion}/tables")]
    [SwaggerTag("Endoints para manejar las mesas")]
    [Authorize(Roles = "Administrador,Mesero")]
    public class TablesController : BaseController<RestaurantTables, RestaurantTablesDto>
    {
        private readonly IRestaurantTablesServices _Service;
        public TablesController(IRestaurantTablesServices service) : base(service)
        {
            _Service = service;
        }
    }
}
