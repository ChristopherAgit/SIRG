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
    [Route("api/v{version:apiVersion}/ingredients")]
    [SwaggerTag("Endoints para manejar los ingredientes")]
    public class IngredientsController : BaseController<Ingredients, IngredientsDto>
    {
        private readonly IIgredientsServices _Service;
        public IngredientsController(IIgredientsServices service) : base(service)
        {
            _Service = service;
        }
    }
}
