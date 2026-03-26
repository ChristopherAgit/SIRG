using Microsoft.AspNetCore.Identity;
using SIRG.Application.Dtos.Login;
using SIRG.Application.Interfaces;
using SIRG.Identity.Entities;

namespace SIRG.Identity.Services
{
    public class AccountServiceForWebApp : BaseAccountService, IAccountServiceForWebApp
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly SignInManager<AppUser> _signInManager;

        public AccountServiceForWebApp(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager, IEmailService emailService) : base(userManager, emailService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<LoginResponseDto> AuthenticateAsync(LoginDto loginDto)
        {
            LoginResponseDto response = new()
            {
                Id = "",
                Name = "",
                LastName = "",
                Cedula = "",

                Email = "",
                UserName = "",
                HasError = false,
                Errors = []
            };

            var user = await _userManager.FindByNameAsync(loginDto.UserName);

            if (user == null)
            {
                response.HasError = true;
                response.Errors.Add($"No existe una cuenta registrada con este nombre de usuario: {loginDto.UserName}");
                return response;
            }

            if (!user.EmailConfirmed || !user.Status)
            {
                response.HasError = true;
                response.Errors.Add($"Esta cuenta {loginDto.UserName} no está activa. Por favor verifica tu correo electrónico o espera aprobación del administrador.");
                return response;
            }

            var result = await _signInManager.PasswordSignInAsync(user.UserName ?? "", loginDto.Password, false, true);

            if (!result.Succeeded)
            {
                response.HasError = true;
                if (result.IsLockedOut)
                {
                    response.Errors.Add($"Tu cuenta {loginDto.UserName} ha sido bloqueada debido a múltiples intentos fallidos." +
                        $" Por favor intenta nuevamente en 10 minutos. Si no recuerdas tu contraseña, puedes realizar el proceso " +
                        $"de recuperación de contraseña.");
                }
                else
                {
                    response.Errors.Add($"Las credenciales son inválidas para este usuario: {user.UserName}");
                }
                return response;
            }

            var rolesList = await _userManager.GetRolesAsync(user);

            response.Id = user.Id;
            response.Name = user.FirstName;
            response.LastName = user.LastName;
            response.Cedula = user.Cedula ?? "";
            response.Email = user.Email ?? "";
            response.UserName = user.UserName ?? "";
            response.IsVerified = user.EmailConfirmed;
            response.Roles = rolesList.ToList();

            return response;
        }
        public async Task SignOutAsync()
        {
            await _signInManager.SignOutAsync();
        }
        
        
        
    }
}