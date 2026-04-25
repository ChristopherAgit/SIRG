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
    [Route("api/v{version:apiVersion}/orders")]
    [SwaggerTag("Endoints para manejar las ordenes")]
    [Authorize(Roles = "Administrador,Mesero")]
    public class OrdersController : BaseController<Orders, OrdersDto>
    {
        private readonly IOrdersServices _Service;
        public OrdersController(IOrdersServices service) : base(service)
        {
            _Service = service;
        }

        /// <summary>
        /// Crea un pedido desde el flujo del mesero: acepta reservationId + líneas de plato.
        /// WaiterID y UserID se manejan con valor 0 porque el esquema actual no tiene FK
        /// hacia la tabla de identidad (que usa GUID).
        /// </summary>
        [HttpPost("from-reservation")]
        [Authorize(Roles = "Administrador,Mesero")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateFromReservation([FromBody] MeseroOrderRequestDto dto)
        {
            try
            {
                if (dto.Items == null || dto.Items.Count == 0)
                    return BadRequest("El pedido debe tener al menos un plato.");

                var orderDto = new OrdersDto
                {
                    OrderID = 0,
                    ReservationID = dto.ReservationId,
                    WaiterID = 0,
                    StatusID = 1,
                    UserID = 0,
                    OrderDate = DateTime.UtcNow,
                    OrderDetailsDto = dto.Items.Select(i => new OrdersDetailsDto
                    {
                        OrderDetailsID = 0,
                        OrderID = 0,
                        DishID = i.DishId,
                        Quantity = i.Quantity,
                        UnitPrice = i.UnitPrice
                    }).ToList()
                };

                var created = await _Service.SaveDtoAsync(orderDto);
                return StatusCode(StatusCodes.Status201Created, created);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
