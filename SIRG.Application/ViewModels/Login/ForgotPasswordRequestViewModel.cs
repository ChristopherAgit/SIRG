using System.ComponentModel.DataAnnotations;

namespace SIRG.Application.ViewModels.Login
{
    public class ForgotPasswordRequestViewModel
    {
        [Required(ErrorMessage = "Ingresa tu nombre de ususario")]
        [DataType(DataType.Text)]
        public required string UserName { get; set; }
    }
}
