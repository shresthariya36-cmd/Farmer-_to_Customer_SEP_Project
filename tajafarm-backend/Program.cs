using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using TajaFarm.Api.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddHttpClient();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("DefaultConnection is missing");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await SeedData.InitializeAsync(db);
}

app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    try
    {
        Console.WriteLine($"Request: {context.Request.Path}");
        await next();
        Console.WriteLine($"Response: {context.Response.StatusCode}");
    }
    catch (Exception e)
    {
        Console.WriteLine(e);
        context.Response.StatusCode = 500;
        if (!context.Response.HasStarted)
            await context.Response.WriteAsJsonAsync(new { message = "Something went wrong", details = e.Message });
    }
});

app.Use(async (context, next) =>
{
    Console.WriteLine("Middleware 2: Checking authentication");
    await next();
});

app.UseCors("AllowFrontend");
app.UseStaticFiles();

var mediaPath = Path.Combine(Directory.GetCurrentDirectory(), "media");
Directory.CreateDirectory(mediaPath);
Directory.CreateDirectory(Path.Combine(mediaPath, "users"));
Directory.CreateDirectory(Path.Combine(mediaPath, "products"));

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(mediaPath),
    RequestPath = "/media"
});

app.MapControllers();
app.Run();
