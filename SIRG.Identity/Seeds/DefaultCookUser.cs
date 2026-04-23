using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SIRG.Identity.Entities;

namespace SIRG.Identity.Seeds
{
    public class DefaultCookUser
    {
        public async static Task SeedAsync(UserManager<AppUser> userManager)
        {
            AppUser user = new()
            {
                FirstName = "Cocinero",
                LastName = "Principal",
                Cedula = "000004",
                Email = "cook@constantinopla.com",
                Status = true,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                UserName = "cocinero"
            };

            if (await userManager.Users.AllAsync(u => u.Id != user.Id))
            {
                var existingUser = await userManager.FindByEmailAsync(user.Email);
                if (existingUser == null)
                {
                    var result = await userManager.CreateAsync(user, "Pas$word123!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, "Cocinero");
                    }
                }
            }
        }
    }
}
