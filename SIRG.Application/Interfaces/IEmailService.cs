using SIRG.Application.Dtos.Emails;

namespace SIRG.Application.Interfaces
{
    public interface IEmailService
    {
        Task SendAsync(EmailRequestDto emailRequestDto);

    }
}
