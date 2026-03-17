using SIRG.Server.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddSwaggerExtension();
builder.Services.AddApiVersioningExtension();
builder.Services.AddOpenApi();

builder.Services.AddCors();

var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwaggerExtension(); // ya no pasamos 'app' como argumento
    app.MapOpenApi();
}

app.UseCors(policy =>
{
    policy.WithOrigins("https://localhost:61767") // Origen del frontend
          .AllowAnyHeader()
          .AllowAnyMethod()
          .AllowCredentials(); // Permitir cookies
});

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

await app.RunAsync();
