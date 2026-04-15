using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SIRG.Api.Extensions;
using SIRG.IOC.Dependencies;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
builder.Services.AddControllers(opt =>
{
    opt.Filters.Add(new ProducesAttribute("application/json"));
}).ConfigureApiBehaviorOptions(opt =>
{
    opt.SuppressInferBindingSourcesForParameters = true;
    opt.SuppressMapClientErrors = true;
}).AddJsonOptions(opt =>
{
    opt.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    opt.JsonSerializerOptions.MaxDepth = 64;
    opt.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});



// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddPersistenceDependencies(builder.Configuration);
builder.Services.AddApplicationDependencies(builder.Configuration);
builder.Services.AddIdentityLayerIocForWebApi(builder.Configuration);
builder.Services.AddIdentityIocForWebApp(builder.Configuration);
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddHealthChecks();
builder.Services.AddAppiVersioningExtension();
builder.Services.AddSwaggerExtension();
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();
// Configure CORS to allow frontend access
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            var frontendUrl = builder.Configuration.GetValue<string>("FrontendUrl");
            if (!string.IsNullOrEmpty(frontendUrl))
            {
                policy.WithOrigins(frontendUrl).AllowAnyHeader().AllowAnyMethod();
            }
            else
            {
                policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
            }
        }
    });
});


var app = builder.Build();
await app.Services.RunSeedAsync();

// Apply EF Core migrations at startup (Code-First). This will run migrations against the configured
// database. Be cautious enabling this in production without reviewing migrations.
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetService<SIRG.Persistences.Context.SIRGContext>();
        if (db != null)
        {
            db.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        // If migration fails, log and continue startup; administrators should inspect logs.
        var logger = scope.ServiceProvider.GetService<Microsoft.Extensions.Logging.ILoggerFactory>()?.CreateLogger("Startup");
        logger?.LogError(ex, "Automatic database migration failed.");
    }
}

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
    options.RoutePrefix = "swagger";
});

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Serve frontend static files from wwwroot (SPA)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback to index.html for SPA routes
app.MapFallbackToFile("index.html");

app.Run();
