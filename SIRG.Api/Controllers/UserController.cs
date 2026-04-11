using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIRG.API.Controllers;
using SIRG.Application.Dtos.User;
using SIRG.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace SIRG.Api.Controllers
{
    [ApiController]
    [Authorize(Roles = "Administrador")]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/users")]
    [SwaggerTag("Endoints para manejar las cuentas de los usuarios")]
    public class UserController : ControllerBase
    {
        private readonly IAccountServiceForWebApi _accountServiceForWebApi;

        public UserController(IAccountServiceForWebApi accountServiceForWebApi)
        {
            _accountServiceForWebApi = accountServiceForWebApi;
        }
        
        [HttpGet]
        [SwaggerOperation(Summary = "Get all users", Description = "Retrieves paginated users (excluding Client role)")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PaginatedResult<UserDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? role = null)
        {
            try
            {
                var users = await _accountServiceForWebApi.GetAllUser();

                users = users.Where(u => u.Status && u.Role != "Cliente").ToList();

                if (!string.IsNullOrWhiteSpace(role))
                    users = users.Where(u => u.Role == role).ToList();

                users = users.OrderByDescending(u => u.CreatedAt).ToList();

                var total = users.Count();
                var data = users.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                var result = new PaginatedResult<UserDto>(page, pageSize, total, data);

                return Ok(result);
            }
            catch (Exception ex)
            {

                return StatusCode(500, ex.Message);
            }
            
        }

        [HttpGet("client")]
        [SwaggerOperation(Summary = "Get all client users", Description = "Retrieves paginated Client users")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PaginatedResult<UserDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllClient([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var commerce = await _accountServiceForWebApi.GetAllUser();

            commerce = commerce.Where(u => u.Status && u.Role == "Cliente")
                         .OrderByDescending(u => u.CreatedAt).ToList();

            var total = commerce.Count();
            var data = commerce.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var result = new PaginatedResult<UserDto>(page, pageSize, total, data);

            return Ok(result);
        }

        [HttpGet("{id}")]
        [SwaggerOperation(Summary = "Get user by ID", Description = "Retrieves a user by their unique identifier")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserDto))]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCommerce(string id)
        {
            try
            {
                var user = await _accountServiceForWebApi.GetUserById(id);
                if (user == null) return NoContent();

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost]
        [SwaggerOperation(Summary = "Create a new user", Description = "Registers a new user")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(RegisterResponseDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromForm] CreateUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest();

                var save = new SaveUserDto
                {
                    Id = "",
                    Email = dto.Email,
                    LastName = dto.LastName,
                    Name = dto.Name,
                    Password = dto.Password,
                    Cedula = dto.Cedula,
                    Role = dto.Role,
                    UserName = dto.UserName,
                };

                var result = await _accountServiceForWebApi.RegisterUser(save, null, true);
                if (result == null || result.HasError)
                    return BadRequest(result?.Errors);

                save.Id = result.Id;


                var resultEdit = await _accountServiceForWebApi.EditUser(save, null, true, true);
                if (resultEdit == null || resultEdit.HasError)
                    return BadRequest(resultEdit?.Errors);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        [HttpPut("{id}")]
        [SwaggerOperation(Summary = "Update an existing user", Description = "Updates the information")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest();

                var user = await _accountServiceForWebApi.GetUserById(id);
                if (user == null)
                    return BadRequest("There is no account registered with this user");

                var save = new SaveUserDto
                {
                    Id = id,
                    Email = dto.Email,
                    LastName = dto.LastName,
                    Name = dto.Name,
                    Password = dto.Password,
                    Cedula = dto.Cedula,
                    Role = user.Role,
                    UserName = dto.UserName,
                };

                var result = await _accountServiceForWebApi.EditUser(save, null, false, true);
                if (result == null || result.HasError)
                    return BadRequest(result?.Errors);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{id}/status")]
        [SwaggerOperation(Summary = "Change user status (active/inactive)", Description = "Activates or deactivates a user")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ChangeStatus(string id)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest();

                var user = await _accountServiceForWebApi.GetUserById(id);
                if (user == null) return NotFound();

                var result = await _accountServiceForWebApi.CambiarEstadoAsync(id);
                if (result == null || result.HasError)
                    return StatusCode(500, "Change failed");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
