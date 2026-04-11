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
    [Route("api/v{version:apiVersion}/orders")]
    [SwaggerTag("Endoints para manejar las ordenes")]
    public class OrdersController : BaseController<Orders, OrdersDto>
    {
        private readonly IOrdersServices _Service;
        public OrdersController(IOrdersServices service) : base(service)
        {
            _Service = service;
        }
    }
}
