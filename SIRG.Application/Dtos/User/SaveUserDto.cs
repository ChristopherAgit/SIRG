// Ignore Spelling: SIRG dto dtos

using System.ComponentModel.DataAnnotations;

namespace SIRG.Application.Dtos.User
{
    public class SaveUserDto
    {
        public string? Id { get; set; }

        [Required(ErrorMessage = "El nombre es requerido")]
        [DataType(DataType.Text)]
        public required string Name { get; set; }

        [Required(ErrorMessage = "El apellido es requerido")]
        [DataType(DataType.Text)]
        public required string LastName { get; set; }

        [Required(ErrorMessage = "La cédula es requerida")]
        [DataType(DataType.Text)]
        public required string Document { get; set; }

        [Required(ErrorMessage = "El email es requerido")]
        [DataType(DataType.EmailAddress)]
        public required string Email { get; set; }

        [Required(ErrorMessage = "El nombre de usuario es requerido")]
        [DataType(DataType.Text)]
        public required string UserName { get; set; }

        [Required(ErrorMessage = "El rol es requerido")]
        [DataType(DataType.Text)]
        public required string Role { get; set; }

        [Required(ErrorMessage = "La contraseña es requerida")]
        [DataType(DataType.Password)]
        public required string Password { get; set; }

        [Compare(nameof(Password), ErrorMessage = "las Contraseñas no coinciden")]
        [Required(ErrorMessage = "Confirma la contraseña")]
        [DataType(DataType.Password)]
        public required string ConfirmPassword { get; set; }

        public bool Status { get; set; }
    }
}
