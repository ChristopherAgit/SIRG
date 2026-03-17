using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SIRG.Application.Dtos.Login;
using SIRG.Application.Dtos.User;
using SIRG.Application.Interfaces;
using SIRG.Application.ViewModels.Login;
using SIRG.Application.ViewModels.Users;
using SIRG.Identity.Entities;

namespace SIRG.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAccountServiceForWebApp _accountServiceForWebApp;
        private readonly IMapper _mapper;
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public AuthController(
            IAccountServiceForWebApp accountServiceForWebApp,
            IMapper mapper,
            UserManager<AppUser> userManager,
            SignInManager<AppUser> signInManager)
        {
            _accountServiceForWebApp = accountServiceForWebApp;
            _mapper = mapper;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        // GET: api/auth/current-user
        [HttpGet("current-user")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
                return Ok(new { isAuthenticated = false });

            var userDto = await _accountServiceForWebApp.GetUserByUserName(user.UserName);
            return Ok(new
            {
                isAuthenticated = true,
                userName = user.UserName,
                email = user.Email,
                roles = userDto?.Role
            });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginViewModel vm)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _signInManager.PasswordSignInAsync(vm.UserName, vm.Password, false, lockoutOnFailure: false);
            if (result.Succeeded)
            {
                var user = await _userManager.FindByNameAsync(vm.UserName);
                var userDto = await _accountServiceForWebApp.GetUserByUserName(user.UserName);
                return Ok(new
                {
                    userName = user.UserName,
                    email = user.Email,
                    roles = userDto?.Role
                });
            }

            return Unauthorized(new { errors = new[] { "Credenciales inválidas" } });
        }

        // POST: api/auth/logout
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            return Ok();
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserViewModel vm)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var dto = _mapper.Map<SaveUserDto>(vm);
            dto.Role = "Cashier";
            var origin = Request.Headers["Origin"].ToString();

            var returnUser = await _accountServiceForWebApp.RegisterUser(dto, origin);

            if (returnUser.HasError)
            {
                return BadRequest(new { errors = returnUser.Errors });
            }

            if (!string.IsNullOrWhiteSpace(returnUser.Id))
            {
                dto.Id = returnUser.Id;
                await _accountServiceForWebApp.EditUser(dto, origin, true);
            }

            return Ok(new { message = "Usuario registrado. Revisa tu email para confirmar." });
        }

        // GET: api/auth/confirm-email
        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
        {
            var response = await _accountServiceForWebApp.ConfirmAccountAsync(userId, token);
            return Ok(new { message = response });
        }

        // POST: api/auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestViewModel vm)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var origin = Request.Headers["Origin"].ToString();
            var dto = new ForgotPasswordRequestDto { UserName = vm.UserName, Origin = origin };

            var returnUser = await _accountServiceForWebApp.ForgotPasswordAsync(dto);

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
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var dto = new ResetPasswordRequestDto
            {
                Id = vm.Id,
                Password = vm.Password,
                Token = vm.Token
            };

            var returnUser = await _accountServiceForWebApp.ResetPasswordAsync(dto);

            if (returnUser.HasError)
            {
                return BadRequest(new { errors = returnUser.Errors });
            }

            return Ok(new { message = "Contraseña restablecida correctamente." });
        }
    }
}