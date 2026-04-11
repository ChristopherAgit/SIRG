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
    [Route("api/v{version:apiVersion}/reservations")]
    [SwaggerTag("Endoints para manejar las reservaciones")]
    public class ReservationController : BaseController<Reservations, ReservationsDto>
    {
        private readonly IReservationsServices _Service;
        public ReservationController(IReservationsServices service) : base(service)
        {
            _Service = service;
        }
    }
}
