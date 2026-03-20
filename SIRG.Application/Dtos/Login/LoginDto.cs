// Ignore Spelling: Dto SIRG Dtos

using System.ComponentModel.DataAnnotations;

namespace SIRG.Application.Dtos.Login
{
    public class LoginDto
    {
        [Required(ErrorMessage = "El nombre de usuario es requerido")]
        [DataType(DataType.Text)]
        public required string UserName { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        [DataType(DataType.Password)]
        public required string Password { get; set; }
    }
}
