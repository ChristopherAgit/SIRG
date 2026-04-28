using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SIRG.Identity.Entities;

namespace SIRG.Identity.Seeds
{
    public class DefaultWaiterUser
    {
        public async static Task SeedAsync(UserManager<AppUser> userManager)
        {
            AppUser user = new()
            {
                FirstName = "Mesero",
                LastName = "Principal",
                Cedula = "000002",
                Email = "waiter@gmail.com",
                Status = true,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                CreatedAt = DateTime.UtcNow,
                UserName = "mesero"
            };

            if (await userManager.Users.AllAsync(u => u.Id != user.Id))
            {
                var existingUser = await userManager.FindByEmailAsync(user.Email);
                if (existingUser == null)
                {
                    var result = await userManager.CreateAsync(user, "Pas$word123!");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(user, "Mesero");
                    }
                }
            }
        }
    }
}
