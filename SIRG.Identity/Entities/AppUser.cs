// Ignore Spelling: SIRG

using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace SIRG.Identity.Entities
{
    public class AppUser : IdentityUser
    {
        [Required]
        [StringLength(100)]
        public required string FirstName { get; set; }

        [Required]
        [StringLength(100)]
        public required string LastName { get; set; }

        [Required]
        [StringLength(13)]
        public required string? Document { get; set; }

        public bool Status { get; set; } // true = Activo, false = Inactivo
    }
}

