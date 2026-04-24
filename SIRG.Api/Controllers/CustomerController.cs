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
    [Route("api/v{version:apiVersion}/customers")]
    [SwaggerTag("Endoints para manejar los clientes")]
    [Authorize(Roles = "Administrador")]
    public class CustomersController : BaseController<Customers, CustomersDto>
    {
        private readonly ICustomersServices _customersServices;
        public CustomersController(ICustomersServices service) : base(service)
        {
            _customersServices = service;
        }
    }
}
