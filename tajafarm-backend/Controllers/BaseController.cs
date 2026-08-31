using Microsoft.AspNetCore.Mvc;
using TajaFarm.Api.Auth;
using TajaFarm.Api.Data;
using TajaFarm.Api.Models;

namespace TajaFarm.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected TokenService.TokenPayload? CurrentToken()
    {
        var h = Request.Headers.Authorization.ToString();
        return h.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) ? TokenService.Verify(h[7..].Trim()) : null;
    }
    protected IActionResult? RequireUser(out TokenService.TokenPayload? token)
    {
        token = CurrentToken(); return token is null ? Unauthorized(new { error = "Please login" }) : null;
    }
    protected IActionResult? RequireRole(string role, out TokenService.TokenPayload? token)
    {
        var result = RequireUser(out token); if(result is not null) return result;
        return token!.Role != role ? StatusCode(403, new { error = $"Requires {role} role" }) : null;
    }
    protected static object UserDto(User u) => new { u.Id,u.Name,u.Email,u.Role,u.Location,u.ProfileImage,u.WhatsAppNumber,u.IsApproved,u.CreatedAt };
    protected static object ProductDto(Product p, User? farmer=null) => new { p.Id,p.Name,p.Category,p.Price,p.CostPrice,p.Unit,p.Rating,p.FarmerId,p.Description,p.Stock,p.ExpiryDate,p.ImageUrl,p.CreatedAt,farmer=farmer==null?null:new { farmer.Id,farmer.Name,farmer.Location,farmer.ProfileImage,farmer.WhatsAppNumber } };
    protected static object OrderDto(Order o) => new { o.Id,o.CustomerId,o.CustomerName,o.Items,o.Total,o.PaymentMethod,o.Status,o.CreatedAt,o.FarmerConfirmed,stage=o.FarmerConfirmed ? o.ManualStage : "placed" };
}
