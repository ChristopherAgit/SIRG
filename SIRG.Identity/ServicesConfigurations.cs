// Ignore Spelling: SIRG IOC

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using SIRG.Application.Interfaces;
using SIRG.Application.Wrappers;
using SIRG.Domain.Setting;
using SIRG.Identity.Context;
using SIRG.Identity.Entities;
using SIRG.Identity.Seeds;
using SIRG.Identity.Services;
using System.Text;

namespace SIRG.Identity
{
    public static class ServicesConfigurations
    {
        public static void AddIdentityLayerIocForWebApi(this IServiceCollection services, IConfiguration config)
        {
            GeneralConfiguration(services, config);

            #region Configurations
            services.Configure<JwtSettings>(config.GetSection("JwtSettings"));
            #endregion

            #region Identity Configurations
            services.Configure<IdentityOptions>(opt =>
            {
                //Password
                opt.Password.RequiredLength = 8;
                opt.Password.RequireDigit = true;
                opt.Password.RequireNonAlphanumeric = true;
                opt.Password.RequireLowercase = true;
                opt.Password.RequireUppercase = true;
                //Otras opciones para el password
                //opt.Password.RequiredUniqueChars = 0;

                //User
                opt.User.RequireUniqueEmail = true;
                //Otras opciones para el user
                //opt.User.AllowedUserNameCharacters = "";

                //Lockout (Opciones de si se bloquea el usuario con varios intentos fallidos)
                //opt.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
                //opt.Lockout.MaxFailedAccessAttempts = 5;
                //Otras opciones para el lockout
                //opt.Lockout.AllowedForNewUsers = true;

                //SignIn
                opt.SignIn.RequireConfirmedEmail = true;
                //Otras opciones
                //opt.SignIn.RequireConfirmedPhoneNumber = true;
                // opt.SignIn.RequireConfirmedAccount = true;

                //Stores (Investigar que son y cual es su uso)
                // opt.Stores.ProtectPersonalData = true;
                // opt.Stores.SchemaVersion = ;
                // opt.Stores.MaxLengthForKeys = 5;

                //ClaimsIdentity (Investigar que son y cual es su uso)
                // opt.ClaimsIdentity.RoleClaimType = "";
                // opt.ClaimsIdentity.UserNameClaimType = "";
                // opt.ClaimsIdentity.UserIdClaimType = "";
                // opt.ClaimsIdentity.EmailClaimType = "";
                // opt.ClaimsIdentity.SecurityStampClaimType = "";

                //Tokens (Investigar que son y para que sirven)
                // opt.Tokens.AuthenticatorIssuer = "";
                // opt.Tokens.AuthenticatorTokenProvider = "";
                // opt.Tokens.ChangeEmailTokenProvider = "";
                // opt.Tokens.ChangePhoneNumberTokenProvider = "";
                // opt.Tokens.EmailConfirmationTokenProvider = "";
                // opt.Tokens.PasswordResetTokenProvider = "";
                // opt.Tokens.ProviderMap = ;
            });

            // Aquí agregamos todo lo que vamos a usar de identity junto al proveedor de tokens que usaremos
            services.AddIdentityCore<AppUser>()
                         .AddRoles<IdentityRole<Guid>>()
                         .AddSignInManager()
                         .AddEntityFrameworkStores<IdentityContext>()
                         .AddTokenProvider<DataProtectorTokenProvider<AppUser>>(TokenOptions.DefaultProvider);

            //Aquí configuramos el tiempo de vida del token (hay mas opciones, investigar)
            services.Configure<DataProtectionTokenProviderOptions>(opt => opt.TokenLifespan = TimeSpan.FromHours(12));

            //Configuración de la autenticación
            services.AddAuthentication(opt =>
            {
                opt.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                opt.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
            }).AddJwtBearer(opt =>
            {
                opt.RequireHttpsMetadata = false;
                opt.SaveToken = false;
                opt.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(2),
                    ValidIssuer = config["JwtSettings:Issuer"],
                    ValidAudience = config["JwtSettings:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["JwtSettings:SecretKey"] ?? ""))
                };

                opt.Events = new JwtBearerEvents
                {
                    OnAuthenticationFailed = af =>
                    {
                        af.NoResult();
                        af.Response.StatusCode = 500;
                        af.Response.ContentType = "text/plain";
                        return af.Response.WriteAsync(af.Exception.Message.ToString());
                    },
                    OnChallenge = c =>
                    {
                        c.HandleResponse();
                        c.Response.StatusCode = 401;
                        c.Response.ContentType = "application/json";
                        var result = JsonConvert.SerializeObject(new ApiResponse<string>("You are not Authorized"));
                        return c.Response.WriteAsync(result);
                    },
                    OnForbidden = c =>
                    {
                        c.Response.StatusCode = 403;
                        c.Response.ContentType = "application/json";
                        var result = JsonConvert.SerializeObject(new ApiResponse<string>("You are not Authorized to access this resource"));
                        return c.Response.WriteAsync(result);
                    }
                };
            }).AddCookie(IdentityConstants.ApplicationScheme, opt =>
            {
                //Configuración de la cookie(tiene mas opciones, investigar)
                opt.ExpireTimeSpan = TimeSpan.FromMinutes(180);
            });
            #endregion

            #region Services
            services.AddScoped<IAccountService, AccountService>();
            #endregion
        }

        public static async Task RunIdentitySeedAsync(this IServiceProvider service)
        {
            using var scope = service.CreateScope();
            var provider = scope.ServiceProvider;

            var userManager = provider.GetRequiredService<UserManager<AppUser>>();
            var roleManager = provider.GetRequiredService<RoleManager<IdentityRole>>();

            await DefaultRoles.SeedAsync(roleManager);
            await DefaultClientUser.SeedAsync(userManager);
        }

        #region Private methods
        /// <summary>
        /// En este método van las configuraciones generales como el contexto o demás cosas fuera de identity
        /// </summary>
        /// <param name="services"></param>
        /// <param name="config"></param>
        private static void GeneralConfiguration(IServiceCollection services, IConfiguration config)
        {
            if (config.GetValue<bool>("UseInMemoryDatabase"))
            {
                services.AddDbContext<IdentityContext>(opt =>
                                    opt.UseInMemoryDatabase("SIRGIdentityDb"));
            }
            else
            {
                var connectionString = config.GetConnectionString("ConnectionDb");
                services.AddDbContext<IdentityContext>((servicePovider, opt) =>
                {
                    //Esta opción nos da mas información sobre los errores que ocurren en entity framework
                    opt.EnableSensitiveDataLogging();
                    opt.UseSqlServer(connectionString,
              c => c.MigrationsAssembly(typeof(IdentityContext).Assembly.FullName));
                },
                //Lo ponemos scoped porque realmente con transient se puede llegar a tener problemas de rendimiento si cualquier cosa con scope se llega a saturar o algo se cambia a transient
                contextLifetime: ServiceLifetime.Scoped,
                optionsLifetime: ServiceLifetime.Scoped
                );
            }
        }
        #endregion
    }
}
