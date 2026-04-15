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
    [Route("api/v{version:apiVersion}/reservations")]
    [SwaggerTag("Endoints para manejar las reservaciones")]
    [Authorize(Roles = "Administrador,Mesero")]
    public class ReservationController : BaseController<Reservations, ReservationsDto>
    {
        private readonly IReservationsServices _Service;
        public ReservationController(IReservationsServices service) : base(service)
        {
            _Service = service;
        }

        [HttpGet("all")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllFiltered([FromQuery] DateOnly? date = null, [FromQuery] TimeOnly? time = null, [FromQuery] int? statusId = null)
        {
            var result = await _Service.GetAllReservationsAsync(date, time, statusId);
            return Ok(result);
        }

        [HttpGet("{id}/details")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDetails(int id)
        {
            var result = await _Service.GetReservationWithDetailsById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost("create")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateReservation([FromBody] ReservationsDto dto)
        {
            try
            {
                var created = await _Service.SaveReservationAsync(dto);
                if (created == null) return BadRequest();
                return CreatedAtAction(nameof(GetDetails), new { id = created.ReservationID }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}/update")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateReservation(int id, [FromBody] ReservationsDto dto)
        {
            try
            {
                var updated = await _Service.UpdateReservationAsync(id, dto);
                if (updated == null) return NotFound();
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("{id}/cancel")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var result = await _Service.CancelReservationAsync(id);
            if (!result) return NotFound();
            return Ok();
        }

        [HttpPost("{id}/status/{statusId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateStatus(int id, int statusId)
        {
            var result = await _Service.UpdateReservationStatusAsync(id, statusId);
            if (!result) return NotFound();
            return Ok();
        }
    }
}
