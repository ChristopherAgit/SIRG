using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SIRG.Identity.Entities;

namespace SIRG.Identity.Seeds
{
    public class DefaultReceptionistUser
    {
        public async static Task SeedAsync(UserManager<AppUser> userManager)
        {
            AppUser user = new()
            {
                FirstName = "Recepcionista",
                LastName = "Constantinopla",
                Cedula = "000003",
                Email = "recepcionista@constantinopla.com",
                Status = true,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                UserName = "recepcionista"
            };

            if (await userManager.Users.AllAsync(u => u.Id != user.Id))
            {
                var existingUser = await userManager.FindByEmailAsync(user.Email);
                if (existingUser == null)
                {
                    var result = await userManager.CreateAsync(user, "Pas$word123!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, "Recepcionista");
                    }
                }
            }
        }
    }
}
