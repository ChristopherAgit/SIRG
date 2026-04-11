using Swashbuckle.AspNetCore.Annotations;

namespace SIRG.Application.Dtos.User
{
    public class CreateUserDto
    {
        /// <example>Juan</example>
        [SwaggerParameter(Description = "The user's first name")]
        public required string Name { get; set; }

        /// <example>Pérez</example>
        [SwaggerParameter(Description = "The user's last name")]
        public required string LastName { get; set; }

        /// <example>juan.perez@example.com</example>
        [SwaggerParameter(Description = "The user's email address")]
        public required string Email { get; set; }

        /// <example>juanp</example>
        [SwaggerParameter(Description = "The username for login")]
        public required string UserName { get; set; }

        [SwaggerParameter(Description = "The Cedula for login")]
        public required string Cedula { get; set; }

        /// <example>P@ssw0rd!</example>
        [SwaggerParameter(Description = "The password for login")]
        public required string Password { get; set; }

        /// <example>Admin</example>
        [SwaggerParameter(Description = "The role assigned to the user (e.g., Admin, User)")]
        public string? Role { get; set; } = "Cliente";
    }
}
