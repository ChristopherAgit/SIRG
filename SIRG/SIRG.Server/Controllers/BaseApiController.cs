// Ignore Spelling: SIRG

using Microsoft.AspNetCore.Mvc;
using SIRG.Application.Interfaces;
using SIRG.Application.Wrappers;

namespace SIRG.Server.Controllers
{
    [ApiController]
    [Route("api/v{version:apiVersion}/[controller]")]
    public class BaseApiController<TEntity, TDto> : ControllerBase where TEntity : class where TDto : class
    {
        private readonly IBaseServices<TEntity, TDto>? _service;

        protected BaseApiController(IBaseServices<TEntity, TDto> service)
        {
            service = _service!;
        }

        [HttpGet("GetAll")]
        public virtual async Task<IActionResult> GetAllAsync()
        {
            var result = await _service!.GetAllListDto();
            if (result is null) return NotFound(new ApiResponse<TDto>("No se encontraron las entidades"));

            return Ok(new ApiResponse<List<TDto>>(result));
        }

        [HttpGet("GetById")]
        public virtual async Task<IActionResult> GetByIdAsync(int id)
        {
            var result = await _service!.GetDtoById(id);
            if (result is null) return NotFound(new ApiResponse<TDto>("Entidad no encontrada"));
            return Ok(new ApiResponse<TDto>(result));
        }

        [HttpPost("Save")]
        public virtual async Task<IActionResult> SaveAsync(TDto entity)
        {
            var result = await _service!.SaveDtoAsync(entity);
            if (result is null) return BadRequest(new ApiResponse<TDto>("Ocurrió un error al guardar la entidad"));
            return Created("Save", new ApiResponse<TDto>(result));
        }

        [HttpPost("Update")]
        public virtual async Task<IActionResult> UpdateAsync(TDto entity, int id)
        {
            var result = await _service!.UpdateDtoByAsync(entity, id);
            if (result is null) return BadRequest(new ApiResponse<TDto>("Ocurrió un error al actualizar la entidad"));
            return NoContent();
        }

        [HttpPost("Remove")]
        public async Task<IActionResult> RemoveAsync([FromBody] int id)
        {
            bool result = await _service!.DeleteDtoAync(id);
            if (!result) return BadRequest(new ApiResponse<bool>("Ocurrió un error al intentar remover la entidad"));
            return NoContent();
        }
    }
}
