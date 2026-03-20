// Ignore Spelling: SIRG

using SIRG.Application.Dtos.Login;
using SIRG.Application.Dtos.User;

namespace SIRG.Application.Interfaces
{
    public interface IAccountService
    {
        Task<string> ConfirmAccountAsync(string userId, string token);
        Task<UserResponseDto> DeleteAsync(string id);
        Task<EditResponseDto> EditUser(SaveUserDto saveDto, string? origin, bool? isCreated = false);
        Task<UserResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request);
        Task<List<UserDto>> GetAllUser(bool? isActive = true);
        Task<UserDto?> GetUserByEmail(string email);
        Task<UserDto?> GetUserById(string Id);
        Task<UserDto?> GetUserByUserName(string userName);
        Task<RegisterResponseDto> RegisterUser(SaveUserDto saveDto, string? origin);
        Task<UserResponseDto> ResetPasswordAsync(ResetPasswordRequestDto request);

        Task<UserAuthenticationResponseDto> AuthenticateAsync(LoginDto loginDto);
        Task SignOutAsync();
    }
}
