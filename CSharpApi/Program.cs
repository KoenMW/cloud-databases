WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

WebApplication app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();


app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        status = "Healthy",
        version = "0.0.1",
        timestamp = DateTime.UtcNow
    });
})
.WithName("GetHealth");

app.Run();
