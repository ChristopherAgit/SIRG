using SIRG.Application.Dtos.Login;
using SIRG.Application.Dtos.User;

namespace SIRG.Application.Interfaces
{
    public interface IAccountServiceForWebApi : IBaseAccountService
    {
        Task<LoginResponseForApiDto> AuthenticateAsync(LoginDto loginDto);
    }
}
