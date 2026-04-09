using Microsoft.AspNetCore.Mvc;
using SIRG.Application.Interfaces;

namespace SIRG.API.Controllers
{
    /// <summary>
    /// Controlador base que implementa operaciones CRUD genéricas para una entidad y su DTO.
    /// </summary>
    /// <typeparam name="TEntity">Tipo de la entidad de dominio.</typeparam>
    /// <typeparam name="TDtos">Tipo del DTO utilizado en la API.</typeparam>
    [ApiController]
    [Route("api/[controller]")]
    public abstract class BaseController<TEntity, TDtos> : ControllerBase
        where TEntity : class
        where TDtos : class
    {
        private readonly IBaseServices<TEntity, TDtos> _service;

        /// <summary>
        /// Constructor que recibe el servicio base.
        /// </summary>
        /// <param name="service">Servicio que implementa las operaciones CRUD.</param>
        protected BaseController(IBaseServices<TEntity, TDtos> service)
        {
            _service = service;
        }

        /// <summary>
        /// Obtiene todos los registros como lista de DTOs.
        /// </summary>
        /// <returns>Lista de DTOs (vacía si no hay registros).</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllListDto();
                return Ok(result);
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }

        }

        /// <summary>
        /// Obtiene un registro por su identificador.
        /// </summary>
        /// <param name="id">Identificador del registro.</param>
        /// <returns>DTO del registro si existe; de lo contrario, 404 Not Found.</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var dto = await _service.GetDtoById(id);
                if (dto == null)
                    return NotFound();

                return Ok(dto);
            }
            catch (Exception ex)
            {

                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        /// <summary>
        /// Crea un nuevo registro.
        /// </summary>
        /// <param name="dto">DTO con los datos del nuevo registro.</param>
        /// <returns>DTO del registro creado con su identificador, y la ubicación del recurso.</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> Create([FromBody] TDtos dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var createdDto = await _service.SaveDtoAsync(dto);
                if (createdDto == null)
                    return StatusCode(500, "Error al crear el registro.");

                // Se asume que el DTO tiene una propiedad "Id" o similar para obtener el identificador.
                // Si no es así, se puede ajustar o devolver CreatedAtAction con null.
                var idProperty = createdDto.GetType().GetProperty("Id");
                var idValue = idProperty?.GetValue(createdDto) as int?;

                if (idValue.HasValue)
                    return CreatedAtAction(nameof(GetById), new { id = idValue.Value }, createdDto);
                else
                    return CreatedAtAction(nameof(GetAll), createdDto);
            }
            catch (System.Exception ex)
            {
                // Se puede registrar el error con un logger
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Actualiza un registro existente.
        /// </summary>
        /// <param name="id">Identificador del registro a actualizar.</param>
        /// <param name="dto">DTO con los datos actualizados.</param>
        /// <returns>DTO actualizado si el registro existe; de lo contrario, 404 Not Found.</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> Update(int id, [FromBody] TDtos dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var updatedDto = await _service.UpdateDtoByAsync(dto, id);
                if (updatedDto == null)
                    return NotFound();

                return Ok(updatedDto);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        /// <summary>
        /// Elimina un registro por su identificador.
        /// </summary>
        /// <param name="id">Identificador del registro a eliminar.</param>
        /// <returns>204 No Content si se elimina correctamente; 404 Not Found si no existe.</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public virtual async Task<IActionResult> Delete(int id)
        {
            var success = await _service.DeleteDtoAync(id);
            if (!success)
                return NotFound();

            return NoContent();
        }

    }
    public record PaginatedResult<T>(int Page, int PageSize, int Total, IReadOnlyCollection<T> Data);
}