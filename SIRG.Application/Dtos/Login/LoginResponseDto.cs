// Ignore Spelling: Dtos Dto SIRG

namespace SIRG.Application.Dtos.Login
{
    public record LoginResponseDto
    {
        public required string Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string Document { get; set; }
        public required string Email { get; set; }
        public required string UserName { get; set; }
        public List<string>? Roles { get; set; }
        public bool IsVerified { get; set; }
    }
}
