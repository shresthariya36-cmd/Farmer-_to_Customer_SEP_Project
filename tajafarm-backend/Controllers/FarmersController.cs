using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TajaFarm.Api.Data;

namespace TajaFarm.Api.Controllers;

[ApiController]
[Route("api/farmers")]
public class FarmersController : BaseController
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(
    int id,
    [FromServices] AppDbContext db)
    {
        var f = await db.Users.FirstOrDefaultAsync(x =>
        x.Id == id &&
        x.Role == "farmer" &&
        x.IsApproved);

        if (f is null)
        {
            return NotFound(new
            {
                error = "Farmer not found"
            });
        }

        var ps = await db.Products
            .Where(x => x.FarmerId == id)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Ok(new
        {
            f.Id,
            f.Name,
            f.Location,
            f.ProfileImage,
            f.WhatsAppNumber,

            products = ps.Select(p => ProductDto(p, f))
        });
    }


    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? search,
        [FromQuery] string? location,
        [FromServices] AppDbContext db)
    {
        var q = db.Users.Where(x =>
            x.Role == "farmer" &&
            x.IsApproved);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();

            q = q.Where(x =>
                x.Name.ToLower().Contains(s) ||
                (x.Location ?? "").ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(location))
        {
            var l = location.ToLower();

            q = q.Where(x =>
                (x.Location ?? "").ToLower().Contains(l));
        }

        var farmers = await q
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Location,
                x.ProfileImage,
                x.WhatsAppNumber
            })
            .ToListAsync();

        return Ok(farmers);
    }

}
