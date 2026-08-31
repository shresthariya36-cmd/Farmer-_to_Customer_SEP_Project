using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TajaFarm.Api.Data;
using TajaFarm.Api.Models;

namespace TajaFarm.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController : BaseController
{
    [HttpGet]
    public async Task<IActionResult> Get(
    [FromQuery] string? search,
    [FromQuery] string? category,
    [FromQuery] string? location,
    [FromServices] AppDbContext db)
    {
        var q = db.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            q = q.Where(p =>
                p.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();

            q = q.Where(p =>
                p.Name.ToLower().Contains(s) ||
                p.Category.ToLower().Contains(s) ||
                p.Description.ToLower().Contains(s));
        }

        var list = await q
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        var farmerIds = list
            .Select(x => x.FarmerId)
            .Distinct()
            .ToList();

        var farmers = await db.Users
            .Where(x => farmerIds.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id);

        if (!string.IsNullOrWhiteSpace(location))
        {
            var l = location.ToLower();

            list = list.Where(p =>
                farmers.TryGetValue(p.FarmerId, out var f) &&
                (f.Location ?? "").ToLower().Contains(l)
            ).ToList();
        }

        return Ok(
            list.Select(p =>
                ProductDto(
                    p,
                    farmers.GetValueOrDefault(p.FarmerId)
                )
            )
        );
    }


    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetOne(
        int id,
        [FromServices] AppDbContext db)
    {
        var p = await db.Products.FindAsync(id);

        if (p is null)
        {
            return NotFound(new
            {
                error = "Product not found"
            });
        }

        var f = await db.Users.FindAsync(p.FarmerId);

        return Ok(ProductDto(p, f));
    }


    [HttpGet("mine")]
    public async Task<IActionResult> Mine(
    [FromServices] AppDbContext db)
    {
        var r = RequireRole("farmer", out var t);

        if (r is not null)
        {
            return r;
        }

        if (t is null)
        {
            return Unauthorized();
        }

        var ps = await db.Products
            .Where(x => x.FarmerId == t.Id)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        var farmer = await db.Users.FindAsync(t.Id);

        return Ok(
            ps.Select(p => ProductDto(p, farmer))
        );
    }


    [HttpPost]
    public async Task<IActionResult> Create(
        ProductRequest req,
        [FromServices] AppDbContext db)
    {
        var r = RequireRole("farmer", out var t);

        if (r is not null)
        {
            return r;
        }

        if (req.Price < 0 ||
            req.CostPrice < 0 ||
            req.Stock < 0)
        {
            return BadRequest(new
            {
                error = "Price, cost and stock cannot be negative"
            });
        }

        var p = new Product
        {
            Name = req.Name.Trim(),
            Category = req.Category.Trim(),
            Price = req.Price,
            CostPrice = req.CostPrice,
            Unit = "kg",
            Description = req.Description,
            Stock = req.Stock,
            ExpiryDate = req.ExpiryDate,
            ImageUrl = req.ImageUrl ?? "",
            FarmerId = t!.Id
        };

        db.Products.Add(p);

        await db.SaveChangesAsync();

        var customers = await db.Users
            .Where(x => x.Role == "customer")
            .Select(x => x.Id)
            .ToListAsync();

        db.Notifications.AddRange(
            customers.Select(id => new Notification
            {
                UserId = id,
                Title = "नयाँ खाना उपलब्ध छ",
                Message =
                    $"नयाँ उत्पादन '{p.Name}' ताजा Farm मा थपिएको छ।",
                Type = "new_food",
                RelatedId = p.Id
            })
        );

        await db.SaveChangesAsync();

        return StatusCode(
            201,
            ProductDto(p)
        );
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
        int id,
        ProductRequest req,
        [FromServices] AppDbContext db)
    {
        var r = RequireRole("farmer", out var t);

        if (r is not null)
        {
            return r;
        }

        var p = await db.Products.FindAsync(id);

        if (p is null)
        {
            return NotFound();
        }

        if (p.FarmerId != t!.Id)
        {
            return StatusCode(403);
        }

        p.Name = req.Name.Trim();
        p.Category = req.Category.Trim();
        p.Price = req.Price;
        p.CostPrice = req.CostPrice;
        p.Description = req.Description;
        p.Stock = req.Stock;
        p.ExpiryDate = req.ExpiryDate;
        p.ImageUrl = req.ImageUrl ?? "";

        await db.SaveChangesAsync();

        var farmer = await db.Users.FindAsync(p.FarmerId);

        return Ok(ProductDto(p, farmer));
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(
        int id,
        [FromServices] AppDbContext db)
    {
        var r = RequireRole("farmer", out var t);

        if (r is not null)
        {
            return r;
        }

        var p = await db.Products.FindAsync(id);

        if (p is null)
        {
            return NotFound();
        }

        if (p.FarmerId != t!.Id)
        {
            return StatusCode(403);
        }

        db.Products.Remove(p);

        await db.SaveChangesAsync();

        return NoContent();
    }

}
