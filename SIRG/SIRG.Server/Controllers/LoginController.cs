// Ignore Spelling: SIRG dto

using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SIRG.Application.Dtos.Login;
using SIRG.Application.Dtos.User;
using SIRG.Application.Interfaces;
using SIRG.Application.ViewModels.Login;
using SIRG.Application.Wrappers;
using SIRG.Identity.Entities;

namespace SIRG.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAccountService _accountService;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager; // Necesario para logout

        public AuthController(
            IAccountService accountService,
            IMapper mapper,
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager)
        {
            _accountService = accountService;
            _mapper = mapper;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        // GET: api/auth/current-user
        [Authorize]
        [HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUser()
        {
            //var user = await _userManager.GetUserAsync(User);
            string? username = User.Identity?.Name;
            if (username == null)
                return Unauthorized(new ApiResponse("No esta autorizado para ejecutar esta acción"));

            var userDto = await _accountService.GetUserByUserName(username);
            if (userDto is null) return NotFound(new ApiResponse("Usuario no encontrado"));
            //return Ok(new
            //{
            //    isAuthenticated = true,
            //    userName = user.UserName,
            //    email = user.Email,
            //    roles = userDto?.Role
            //});

            return Ok(new ApiResponse<UserDto>(userDto));
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto) // Usa un DTO específico
        {
            //Con [ApiController], la validación de modelo se hace automáticamente, pero puedes personalizar la respuesta si quieres
            //if (!ModelState.IsValid)
            //    return BadRequest(ModelState);

            var userDto = await _accountService.AuthenticateAsync(dto);

            if (userDto is null || userDto.HasError)
            {
                return BadRequest(new ApiResponse(userDto!.Errors));
            }

            // Aquí deberías generar un token JWT (ver paso 2)
            // Por ahora devolvemos los datos del usuario
            //return Ok(new
            //{
            //    userName = userDto.UserName,
            //    email = userDto.Email,
            //    roles = userDto.Roles,
            //    token = "JWT_TOKEN" // Más adelante
            //});

            return Ok(new ApiResponse<UserAuthenticationResponseDto>(userDto));
        }

        // POST: api/auth/logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _accountService.SignOutAsync();
            return NoContent();
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] SaveUserDto dto)
        {
            string origin = Request.Headers.Origin.ToString();
            var returnUser = await _accountService.RegisterUser(dto, origin);

            if (returnUser.HasError)
            {
                return BadRequest(new ApiResponse(returnUser.Errors));
            }

            return Ok(new ApiResponse<RegisterResponseDto>(returnUser));
        }

        // GET: api/auth/confirm-email
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
        {
            //Hay que enviar el token de confirmación como respuesta.
            var response = await _accountService.ConfirmAccountAsync(userId, token);
            return Ok(new { message = response });
        }

        // POST: api/auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestViewModel vm)
        {
            string origin = Request.Headers.Origin.ToString();
            var dto = new ForgotPasswordRequestDto { UserName = vm.UserName, Origin = origin };

            var returnUser = await _accountService.ForgotPasswordAsync(dto);

            if (returnUser.HasError)
            {
                return BadRequest(new { errors = returnUser.Errors });
            }

            return Ok(new { message = "Si el usuario existe, se envió un correo para restablecer la contraseña." });
        }

        // POST: api/auth/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestViewModel vm)
        {
            var dto = new ResetPasswordRequestDto
            {
                Id = vm.Id,
                Password = vm.Password,
                Token = vm.Token
            };

            var returnUser = await _accountService.ResetPasswordAsync(dto);

            if (returnUser.HasError)
            {
                return BadRequest(new { errors = returnUser.Errors });
            }

            return Ok(new { message = "Contraseña restablecida correctamente." });
        }
    }
}