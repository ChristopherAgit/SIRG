using Asp.Versioning;
using Asp.Versioning.ApiExplorer;
using Microsoft.OpenApi.Models;

namespace SIRG.Server.Extensions
{
    public static class AppExtension
    {
        public static void UseSwaggerExtension(this IApplicationBuilder app)
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                // Obtener el proveedor de descripciones de versiones desde el contenedor de servicios
                using var scope = app.ApplicationServices.CreateScope();
                var provider = scope.ServiceProvider.GetRequiredService<IApiVersionDescriptionProvider>();

                foreach (var description in provider.ApiVersionDescriptions)
                {
                    var url = $"/swagger/{description.GroupName}/swagger.json";
                    var name = $"SIRG API - {description.GroupName.ToUpperInvariant()}";
                    options.SwaggerEndpoint(url, name);
                }
            });
        }
        public static IServiceCollection AddSwaggerExtension(this IServiceCollection services)
        {
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Mi API",
                    Version = "v1",
                    Description = "API del proyecto SIRG"
                });

                // Si usas autenticación JWT, puedes agregar configuración de seguridad aquí
                // c.AddSecurityDefinition("Bearer", ...);
            });

            return services;
        }

        public static IServiceCollection AddApiVersioningExtension(this IServiceCollection services)
        {
            services.AddApiVersioning(config =>
            {
                config.DefaultApiVersion = new ApiVersion(1, 0);
                config.AssumeDefaultVersionWhenUnspecified = true;
                config.ReportApiVersions = true;
                config.ApiVersionReader = new UrlSegmentApiVersionReader();
            })
            .AddApiExplorer(options =>
            {
                // Agregar formato de versión en la ruta: 'v{version}'
                options.GroupNameFormat = "'v'VVV";
                options.SubstituteApiVersionInUrl = true;
            });

            return services;
        }
    }
}