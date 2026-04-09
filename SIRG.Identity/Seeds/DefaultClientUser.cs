using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SIRG.Identity.Entities;

namespace SIRG.Identity.Seeds
{
    public class DefaultClientUser
    {
        public async static Task SeedAsync(UserManager<AppUser> userManager)
        {
            AppUser user = new()
            {
                FirstName = "Wilfredo Valentin",
                LastName = "Feliz Caba",
                Cedula = "402-0873439-8",
                Email = "Client@gmail.com",
                EmailConfirmed = true,
                Status = true,
                PhoneNumberConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                UserName = "cliente"
            };

            if (await userManager.Users.AllAsync(u => u.Id != user.Id))
            {
                var existingUser = await userManager.FindByEmailAsync(user.Email);
                if (existingUser == null)
                {
                    var result = await userManager.CreateAsync(user, "Pas$word123!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, "Cliente");
                    }
                }
            }
        }
    }
}
