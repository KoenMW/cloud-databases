using Azure.Core;
using CSharpApi.src.data;
using CSharpApi.src.interfaces;
using CSharpApi.src.model;
using CSharpApi.src.repository;
using CSharpApi.src.service;
using Microsoft.AspNetCore.Mvc;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddLogging();
builder.Logging.AddConsole();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddProblemDetails();

string getUniqueFileName(string fileName)
{
    string ext = Path.GetExtension(fileName);
    string name = Path.GetFileNameWithoutExtension(fileName);
    return $"{name}_{DateTime.UtcNow:yyyyMMddHHmmssfff}{ext}";
}


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
        version = "0.0.2",
        timestamp = DateTime.UtcNow
    });
})
.WithName("GetHealth");


EntityContext<House> ctx = new();
ctx.Database.EnsureCreated();
IHouseRepository houseRepository = new HouseRepository(ctx);
IHouseService houseService = new HouseService(houseRepository);
IBlobService blobService = new BlobService();

app.MapPost("/houses", async (
    HttpRequest request,
    [FromForm] House house,
    [FromForm] IFormFile image
    ) =>
{
    try
    {
        app.Logger.LogInformation("Creating a new house listing");
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Invalid form data." });
        }
        if (image == null)
        {
            return Results.BadRequest(new { error = "Image file is required." });
        }
        if (house == null)
        {
            return Results.BadRequest(new { error = "House data is required." });
        }

        house.ImageUrl = await blobService.UploadFileAsync(image.OpenReadStream(), getUniqueFileName(image.FileName), image.ContentType);
        houseService.CreateHouse(house);

        return Results.Created($"/houses/{house.Id}", house);
    }
    catch (Exception ex)
    {
        app.Logger.LogError("Error creating house listing");
        app.Logger.LogError("Exception: {exception}", ex.ToString());
        return Results.BadRequest(new { error = ex.Message });

    }
}).WithName("CreateHouse")
.DisableAntiforgery();



app.MapGet("/houses/{id}", (string id) =>
{
    try
    {
        app.Logger.LogInformation("Retrieving house with id: {id}", id);
        House? house = houseService.RetrieveHouseById(int.Parse(id));
        return house != null ? Results.Ok(house) : Results.NotFound(new { error = "House not found" });
    }
    catch (Exception ex)
    {
        app.Logger.LogError("Error retrieving house with id: {id}", id);
        app.Logger.LogError("Exception: {exception}", ex.ToString());
        return Results.NotFound(new { error = ex.Message });
    }
}).WithName("RetrieveHouseById");

app.MapGet("/houses", () =>
{
    try
    {
        app.Logger.LogInformation("Retrieving all houses");
        List<House> houses = houseService.RetrieveAllHouses();
        return Results.Ok(houses);
    }
    catch (Exception ex)
    {
        app.Logger.LogError("Error retrieving all houses");
        app.Logger.LogError("Exception: {exception}", ex.ToString());
        return Results.BadRequest(new { error = ex.Message });
    }
}).WithName("RetrieveAllHouses");

app.MapGet("/houses/search", (double minPrice, double maxPrice) =>
{
    try
    {
        app.Logger.LogInformation("Retrieving houses with price range: {minPrice} - {maxPrice}", minPrice, maxPrice);
        List<House> houses = houseService.RetrieveHousesByPriceRange(minPrice, maxPrice);
        return Results.Ok(houses);
    }
    catch (Exception ex)
    {
        app.Logger.LogError("Error retrieving houses with price range: {minPrice} - {maxPrice}", minPrice, maxPrice);
        app.Logger.LogError("Exception: {exception}", ex.ToString());
        return Results.BadRequest(new { error = ex.Message });
    }
}).WithName("RetrieveHousesByPriceRange");

app.MapPut("/houses/{id}", async (
    HttpRequest request,
    string id,
    [FromForm] House house,
    [FromForm] IFormFile image
) =>
{
    try
    {
        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "Invalid form data." });
        }
        if (house == null)
        {
            return Results.BadRequest(new { error = "House data is required." });
        }
        if (string.IsNullOrEmpty(id))
        {
            return Results.BadRequest(new { error = "House id is required." });
        }
        if (image != null && image.Length == 0)
        {
            return Results.BadRequest(new { error = "Image file is empty." });
        }

        app.Logger.LogInformation("Modifying house with id: {id}", id);
        house.Id = int.Parse(id);
        if (image != null)
        {
            house.ImageUrl = await blobService.UploadFileAsync(image.OpenReadStream(), getUniqueFileName(image.FileName), image.ContentType);
        }
        houseService.ModifyHouse(house);
        return Results.Created($"/houses/{house.Id}", house);
    }
    catch (Exception ex)
    {
        app.Logger.LogError("Error modifying house with id: {id}", id);
        app.Logger.LogError("Exception: {exception}", ex.ToString());
        return Results.BadRequest(new { error = ex.Message });
    }
}).WithName("ModifyHouse").DisableAntiforgery();

app.MapDelete("/houses/{id}", (string id) =>
{
    try
    {
        app.Logger.LogInformation("Removing house with id: {id}", id);
        houseService.RemoveHouse(int.Parse(id));
        return Results.NoContent();
    }
    catch (Exception ex)
    {
        app.Logger.LogError("Error removing house with id: {id}", id);
        app.Logger.LogError("Exception: {exception}", ex.ToString());
        return Results.BadRequest(new { error = ex.Message });
    }
}).WithName("RemoveHouse");

app.Run();
