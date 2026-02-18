namespace SIRG.Application.Dtos.Login
{
    public class ForgotPasswordRequestDto
    {
        public required string UserName { get; set; }
        public string? Origin { get; set; }
    }
}
