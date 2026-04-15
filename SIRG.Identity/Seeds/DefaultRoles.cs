using Microsoft.AspNetCore.Identity;

namespace SIRG.Identity.Seeds
{
    public static class DefaultRoles
    {
        public async static Task SeedAsync(RoleManager<IdentityRole> roleManager)
        {
            await roleManager.CreateAsync(new IdentityRole("Administrador"));
            await roleManager.CreateAsync(new IdentityRole("Cliente"));
            await roleManager.CreateAsync(new IdentityRole("Mesero"));

        }
    }
}
