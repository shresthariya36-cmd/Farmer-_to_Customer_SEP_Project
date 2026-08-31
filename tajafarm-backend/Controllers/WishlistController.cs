using Microsoft.AspNetCore.Mvc;using Microsoft.EntityFrameworkCore;using TajaFarm.Api.Data;using TajaFarm.Api.Models;
namespace TajaFarm.Api.Controllers;[ApiController][Route("api/wishlist")]
public class WishlistController:BaseController{
 [HttpGet]public async Task<IActionResult> Get([FromServices]AppDbContext db){var r=RequireUser(out var t);if(r is not null)return r;var ids=await db.Wishlists.Where(x=>x.UserId==t!.Id).Select(x=>x.ProductId).ToListAsync();return Ok(await db.Products.Where(x=>ids.Contains(x.Id)).Select(x=>new{x.Id,x.Name,x.Price,x.ImageUrl,x.Stock,x.Rating}).ToListAsync());}
 [HttpPost("toggle")]public async Task<IActionResult> Toggle(WishlistToggleRequest req,[FromServices]AppDbContext db){var r=RequireUser(out var t);if(r is not null)return r;var x=await db.Wishlists.FirstOrDefaultAsync(x=>x.UserId==t!.Id&&x.ProductId==req.ProductId);if(x is null){db.Wishlists.Add(new Wishlist{UserId=t.Id,ProductId=req.ProductId});await db.SaveChangesAsync();return Ok(new{favorite=true});}db.Wishlists.Remove(x);await db.SaveChangesAsync();return Ok(new{favorite=false});}
}
