using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SIRG.Application.Dtos.Login;
using SIRG.Application.Dtos.User;
using SIRG.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace SIRG.Api.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/account")]
    [SwaggerTag("Endpoints para la autenticacion, registro y recuperacion de cuentas de usuarios")]
    public class AccountController : ControllerBase
    {
        private readonly IAccountServiceForWebApi _accountServiceForWebApi;

        public AccountController(IAccountServiceForWebApi accountServiceForWebApi)
        {
            _accountServiceForWebApi = accountServiceForWebApi;
        }

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(LoginDto))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Authenticate user",
            Description = "Validates user credentials and returns an authentication token with user information"
         )]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();

                return Ok(await _accountServiceForWebApi.AuthenticateAsync(dto));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Register a new user",
            Description = "Creates a new user account"
        )]
        public async Task<IActionResult> Register([FromForm] CreateUserDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();

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

                return StatusCode(StatusCodes.Status201Created);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("confirm-account")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Confirm user account",
            Description = "Validates and confirms a user's account using a token"
        )]
        public async Task<IActionResult> Confirm([FromBody] ConfirmRequestDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();

                var result = await _accountServiceForWebApi.ConfirmAccountAsync(dto.UserId, dto.Token);

                if (result == null )
                    return BadRequest(result);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("get-reset-token")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Generate password reset token",
            Description = "Generates a secure token for password recovery and sends it via email"
        )]
        public async Task<IActionResult> GetResetToken([FromBody] ForgotPasswordApiRequestDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();

                var result = await _accountServiceForWebApi.ForgotPasswordAsync(
                    new ForgotPasswordRequestDto { UserName = dto.UserName }, true);

                if (result == null || result.HasError)
                    return BadRequest(result?.Errors);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("change-password")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        [SwaggerOperation(
            Summary = "Reset user password",
            Description = "Resets the user's password using the provided reset token"
        )]
        public async Task<IActionResult> ChangePassword([FromBody] ResetPasswordRequestDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest();

                var result = await _accountServiceForWebApi.ResetPasswordAsync(dto);

                if (result == null || result.HasError)
                    return BadRequest(result?.Errors);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ex.Message);
            }
        }
    }
}
