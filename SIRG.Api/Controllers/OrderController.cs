using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIRG.Api.Controllers;
using SIRG.Application.Dtos.EntitiesDto;
using SIRG.Application.Interfaces.Contracts;
using SIRG.Domain.Entities;
using Swashbuckle.AspNetCore.Annotations;

namespace SIRG.Api.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/orders")]
    [SwaggerTag("Endpoints para manejar las órdenes")]
    [Authorize(Roles = "Administrador,Mesero,Cocinero")]
    public class OrdersController : BaseController<Orders, OrdersDto>
    {
        private readonly IOrdersServices _service;

        public OrdersController(IOrdersServices service) : base(service)
        {
            _service = service;
        }

        /// <summary>Crea una orden con sus detalles en un solo request.</summary>
        [HttpPost("create")]
        [Authorize(Roles = "Administrador,Mesero")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateWithDetails([FromBody] CreateOrderDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            try
            {
                var waiterIdClaim = User.FindFirst("sub")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                _ = int.TryParse(waiterIdClaim, out var waiterID);

                var result = await _service.CreateOrderWithDetailsAsync(dto, waiterID == 0 ? null : waiterID);
                if (result == null) return BadRequest("No se pudo crear la orden.");
                return CreatedAtAction(nameof(GetById), new { id = result.OrderID }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        /// <summary>Devuelve todas las órdenes con sus detalles y platos (para el cocinero).</summary>
        [HttpGet("details")]
        [Authorize(Roles = "Administrador,Mesero,Cocinero")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllWithDetails()
        {
            var result = await _service.GetAllWithDetailsAsync();
            return Ok(result);
        }

        /// <summary>Devuelve las órdenes asociadas a una reservación.</summary>
        [HttpGet("by-reservation/{reservationId:int}")]
        [Authorize(Roles = "Administrador,Mesero")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetByReservation(int reservationId)
        {
            var result = await _service.GetOrdersByReservationAsync(reservationId);
            return Ok(result);
        }

        /// <summary>
        /// Actualiza el estado de una orden.
        /// Ciclo: 1 Pendiente → 2 En preparación → 3 Listo para servir → 4 Entregado
        /// </summary>
        [HttpPut("{id:int}/status/{statusId:int}")]
        [Authorize(Roles = "Administrador,Mesero,Cocinero")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStatus(int id, int statusId)
        {
            if (statusId < 1 || statusId > 4)
                return BadRequest("Estado inválido. Use 1=Pendiente, 2=En preparación, 3=Listo para servir, 4=Entregado.");

            var success = await _service.UpdateOrderStatusAsync(id, statusId);
            if (!success) return NotFound();
            return NoContent();
        }

        /// <summary>Agrega un plato a una orden en estado Pendiente (statusID=1).</summary>
        [HttpPost("{id:int}/details")]
        [Authorize(Roles = "Administrador,Mesero")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddDetail(int id, [FromBody] CreateOrderDetailDto detail)
        {
            var result = await _service.AddDetailAsync(id, detail.DishID, detail.Quantity, detail.UnitPrice);
            if (result == null)
                return BadRequest("No se puede modificar una orden que no está en estado Pendiente, o la orden no existe.");
            return Ok(result);
        }

        /// <summary>Elimina un detalle de una orden en estado Pendiente (statusID=1).</summary>
        [HttpDelete("{id:int}/details/{detailId:int}")]
        [Authorize(Roles = "Administrador,Mesero")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RemoveDetail(int id, int detailId)
        {
            var success = await _service.RemoveDetailAsync(id, detailId);
            if (!success)
                return BadRequest("No se puede modificar una orden que no está en estado Pendiente, el detalle no existe, o la orden no existe.");
            return NoContent();
        }
    }
}
