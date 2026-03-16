namespace SIRG.Server.Extensions
{
    public static class AppExtension
    {
        public static void UseSwaggerExtension(this IApplicationBuilder app, IEndpointRouteBuilder routeBuilder)
        {
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                var versionDescriptions = routeBuilder.DescribeApiVersions();
                if (versionDescriptions is not null && versionDescriptions.Any())
                {
                    foreach (var apiVersion in versionDescriptions)
                    {
                        var url = $"/swagger/{apiVersion.GroupName}/swagger.json";
                        var name = $"SIRG API - {apiVersion.GroupName.ToUpperInvariant()}";
                        options.SwaggerEndpoint(url, name);
                    }
                }
            });
        }
    }
}
