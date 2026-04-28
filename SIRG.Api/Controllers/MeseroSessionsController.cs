using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Asp.Versioning;
using Microsoft.AspNetCore.Http;
using Swashbuckle.AspNetCore.Annotations;
using SIRG.Persistences.Context;
using SIRG.Domain.Entities;
using System.Linq;
using System.Threading.Tasks;

namespace SIRG.Api.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/mesero/sessions")]
    [SwaggerTag("Endpoints for mesero sessions (in-memory demo)")]
    [Authorize(Roles = "Mesero,Administrador")]
    public class MeseroSessionsController : ControllerBase
    {
        private readonly SIRGContext _context;

        public MeseroSessionsController(SIRGContext context)
        {
            _context = context;
        }

        public record SessionDto(string serviceId, string tableId, int tableNumber, string openedAt, string status);

        [HttpGet("open")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> ListOpen()
        {
            var list = await Task.Run(() => _context.MeseroSessions.Where(s => s.Status == "open").ToList());
            return Ok(list.Select(s => new SessionDto(s.ServiceId, s.TableId ?? string.Empty, s.TableNumber, s.OpenedAt.ToString("o"), s.Status)));
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        public async Task<IActionResult> Create([FromBody] SessionDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.serviceId)) return BadRequest();
            var entity = new MeseroSessions
            {
                ServiceId = dto.serviceId,
                TableId = string.IsNullOrWhiteSpace(dto.tableId) ? null : dto.tableId,
                TableNumber = dto.tableNumber,
                OpenedAt = DateTime.Parse(dto.openedAt),
                Status = dto.status,
            };
            _context.MeseroSessions.Add(entity);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = entity.ServiceId }, dto);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Get(string id)
        {
            var s = await _context.MeseroSessions.FindAsync(id);
            if (s == null) return NotFound();
            return Ok(new SessionDto(s.ServiceId, s.TableId ?? string.Empty, s.TableNumber, s.OpenedAt.ToString("o"), s.Status));
        }

        [HttpPost("{id}/close")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> Close(string id)
        {
            var s = await _context.MeseroSessions.FindAsync(id);
            if (s == null) return NotFound();
            s.Status = "closed";
            await _context.SaveChangesAsync();
            return Ok(new SessionDto(s.ServiceId, s.TableId ?? string.Empty, s.TableNumber, s.OpenedAt.ToString("o"), s.Status));
        }
    }
}
