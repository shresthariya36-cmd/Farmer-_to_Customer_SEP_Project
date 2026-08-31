using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TajaFarm.Api.Auth;
using TajaFarm.Api.Data;
using TajaFarm.Api.Models;
namespace TajaFarm.Api.Controllers;
[ApiController][Route("api/users")]
public class UsersController:BaseController
{
 [HttpPut("me")]
 public async Task<IActionResult> Update(UpdateProfileRequest req,[FromServices]AppDbContext db){var r=RequireUser(out var t);if(r is not null)return r;var u=await db.Users.FindAsync(t!.Id);if(u is null)return Unauthorized();var email=req.Email.Trim().ToLower();if(await db.Users.AnyAsync(x=>x.Email==email&&x.Id!=u.Id))return Conflict(new{error="Email already exists"});u.Name=req.Name.Trim();u.Email=email;u.Location=req.Location; if(req.ProfileImage!=null)u.ProfileImage=req.ProfileImage; if(u.Role=="farmer")u.WhatsAppNumber=new string((req.WhatsAppNumber??"").Where(char.IsDigit).ToArray());await db.SaveChangesAsync();return Ok(new{token=TokenService.Sign(u),user=UserDto(u)});}
}
