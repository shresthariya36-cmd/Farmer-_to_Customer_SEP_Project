using Microsoft.AspNetCore.Mvc;using Microsoft.EntityFrameworkCore;using TajaFarm.Api.Data;using TajaFarm.Api.Models;
namespace TajaFarm.Api.Controllers;[ApiController][Route("api/notifications")]
public class NotificationsController:BaseController{
 [HttpGet]public async Task<IActionResult> Get([FromServices]AppDbContext db){var r=RequireUser(out var t);if(r is not null)return r;return Ok(await db.Notifications.Where(x=>x.UserId==t!.Id).OrderByDescending(x=>x.CreatedAt).Take(50).ToListAsync());}
 [HttpPut("{id:int}/read")]public async Task<IActionResult> Read(int id,[FromServices]AppDbContext db){var r=RequireUser(out var t);if(r is not null)return r;var n=await db.Notifications.FirstOrDefaultAsync(x=>x.Id==id&&x.UserId==t!.Id);if(n is null)return NotFound();n.IsRead=true;await db.SaveChangesAsync();return Ok(n);}
 [HttpPut("read-all")]public async Task<IActionResult> ReadAll([FromServices]AppDbContext db){var r=RequireUser(out var t);if(r is not null)return r;var ns=await db.Notifications.Where(x=>x.UserId==t!.Id&&!x.IsRead).ToListAsync();ns.ForEach(x=>x.IsRead=true);await db.SaveChangesAsync();return Ok(new{count=ns.Count});}
}
