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
    [Route("api/v{version:apiVersion}/sales")]
    [SwaggerTag("Endoints para manejar las ventas")]
    [Authorize(Roles = "Administrador")]
    public class SalesController : BaseController<Sales, SalesDto>
    {
        private readonly ISalesServices _Service;
        public SalesController(ISalesServices service) : base(service)
        {
            _Service = service;
        }
    }
}
