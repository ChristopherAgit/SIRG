using Microsoft.Extensions.DependencyInjection;
using SIRG.Application.Interfaces;
using SIRG.Application.Services;
using SIRG.Identity.Services;
using SIRG.Shared.Services;

namespace SIRG.IOC.Dependencies
{
    public static class ApplicationDependency
    {
        public static void AddApplicationDependencies(this IServiceCollection services)
        {
            services.AddAutoMapper(typeof(ApplicationDependency).Assembly);

            #region Services
            services.AddTransient(typeof(IBaseServices<,>), typeof(BaseServices<,>));

            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IEmailService, EmailService>();

            #endregion
        }
    }
}
