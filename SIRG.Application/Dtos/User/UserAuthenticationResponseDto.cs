// Ignore Spelling: Dto dtos SIRG

using SIRG.Application.Dtos.Login;

namespace SIRG.Application.Dtos.User
{
    public record UserAuthenticationResponseDto
    {
        public string? Token { get; set; }
        public DateTime? Expiration { get; set; }
        public bool HasError { get; set; }
        public required List<string> Errors { get; set; }
        public LoginResponseDto? User { get; set; }
    }
}
