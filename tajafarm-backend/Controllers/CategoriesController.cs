using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TajaFarm.Api.Data;

namespace TajaFarm.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController : ControllerBase
{
    private static readonly string[] DefaultCategories =
    {
        "Vegetables",
        "Fruits",
        "Dairy",
        "Grains",
        "Pulses",
        "Organic",
        "Leafy Greens"
    };

    [HttpGet]
    public async Task<IActionResult> Get([FromServices] AppDbContext db)
    {
        var categories = await db.Categories
            .OrderBy(x => x.Name)
            .Select(x => x.Name)
            .ToListAsync();

        // If an old database has no categories, still return a usable list.
        if (categories.Count == 0)
            categories = DefaultCategories.ToList();

        return Ok(categories);
    }
}
