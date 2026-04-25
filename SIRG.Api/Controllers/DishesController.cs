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
    [Authorize(Roles = "Administrador,Mesero")]
    public class DishesController : BaseController<Dishes, DishesDto>
    {
        private readonly IDisherServices _Service;
        public DishesController(IDisherServices service) : base(service)
        {
            _Service = service;
        }

        // Operaciones de escritura: solo Administrador.
        // Los métodos GET heredan la autorización a nivel de clase (Administrador + Mesero).
        [HttpPost]
        [Authorize(Roles = "Administrador")]
        public override Task<IActionResult> Create([FromBody] DishesDto dto) => base.Create(dto);

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrador")]
        public override Task<IActionResult> Update(int id, [FromBody] DishesDto dto) => base.Update(id, dto);

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrador")]
        public override Task<IActionResult> Delete(int id) => base.Delete(id);
    }
}
