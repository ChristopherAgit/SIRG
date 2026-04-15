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
        [Authorize(Roles = "Administrador,Mesero")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDetails(int id)
        {
            var result = await _Service.GetReservationWithDetailsById(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("available-tables")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetAvailableTables(
            [FromQuery] DateOnly date,
            [FromQuery] TimeOnly time,
            [FromQuery] int numberOfPeople)
        {
            try
            {
                if (numberOfPeople <= 0)
                    return BadRequest("El número de personas debe ser mayor a 0.");

                var availableTables = await _Service.GetAvailableTablesAsync(date, time, numberOfPeople);
                return Ok(availableTables);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
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
        [Authorize(Roles = "Administrador,Mesero")]
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
        [Authorize(Roles = "Administrador,Mesero,Recepcionista")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> CancelReservation(int id)
        {
            var result = await _Service.CancelReservationAsync(id);
            if (!result) return NotFound();
            
            // Enviar email de cancelación al cliente
            try
            {
                var reservation = await _Service.GetEntityByIdAsync(id);
                if (reservation != null)
                {
                    var reservationEntity = new Reservations
                    {
                        ReservationID = reservation.ReservationID,
                        TableID = reservation.TableID,
                        StatusID = reservation.StatusID,
                        ReservationDate = reservation.ReservationDate,
                        ReservationTime = reservation.ReservationTime,
                        NumberOfPeople = reservation.NumberOfPeople,
                        CreatedAt = reservation.CreatedAt,
                        Customers = new Customers { FirstName = reservation.CustomersDto?.FullName, Email = reservation.CustomersDto?.Email },
                        RestaurantTables = new RestaurantTables { TableNumber = reservation.RestaurantTablesDto?.TableNumber ?? 0 }
                    };
                    await _Service.SendCancellationEmailAsync(reservationEntity, "Cancelada por el restaurante");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error al enviar email: {ex.Message}");
            }
            
            return Ok();
        }

        [HttpPost("{id}/status/{statusId}")]
        [Authorize(Roles = "Administrador,Mesero,Recepcionista")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> UpdateStatus(int id, int statusId)
        {
            var result = await _Service.UpdateReservationStatusAsync(id, statusId);
            if (!result) return NotFound();
            
            // Si el estatus es Cancelada (3), enviar email
            if (statusId == 3)
            {
                try
                {
                    var reservation = await _Service.GetEntityByIdAsync(id);
                    if (reservation != null)
                    {
                        var reservationEntity = new Reservations
                        {
                            ReservationID = reservation.ReservationID,
                            TableID = reservation.TableID,
                            StatusID = reservation.StatusID,
                            ReservationDate = reservation.ReservationDate,
                            ReservationTime = reservation.ReservationTime,
                            NumberOfPeople = reservation.NumberOfPeople,
                            CreatedAt = reservation.CreatedAt,
                            Customers = new Customers { FirstName = reservation.CustomersDto?.FullName, Email = reservation.CustomersDto?.Email },
                            RestaurantTables = new RestaurantTables { TableNumber = reservation.RestaurantTablesDto?.TableNumber ?? 0 }
                        };
                        await _Service.SendCancellationEmailAsync(reservationEntity, "Cancelada por el restaurante");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al enviar email: {ex.Message}");
                }
            }
            
            return Ok();
        }

        [HttpPost("confirm/{token}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ConfirmReservation(string token)
        {
            try
            {
                var result = await _Service.ConfirmReservationByTokenAsync(token);
                if (result == null)
                    return NotFound(new { message = "Token inválido o expirado" });
                
                return Ok(new { message = "Reserva confirmada exitosamente", reservation = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("cancel/{token}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CancelReservationByToken(string token)
        {
            try
            {
                var result = await _Service.CancelReservationByTokenAsync(token);
                if (result == null)
                    return NotFound(new { message = "Token inválido o expirado" });
                
                return Ok(new { message = "Reserva cancelada exitosamente", reservation = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
