using Microsoft.AspNetCore.Mvc;using Microsoft.EntityFrameworkCore;using TajaFarm.Api.Data;
namespace TajaFarm.Api.Controllers;[ApiController][Route("api/farmer")]
public class FarmerController:BaseController{
 [HttpGet("sales-summary")]public async Task<IActionResult> Sales([FromServices]AppDbContext db){var r=RequireRole("farmer",out var t);if(r is not null)return r;var items=await db.OrderItems.Where(x=>x.FarmerId==t!.Id).ToListAsync();var revenue=items.Sum(x=>x.Price*x.Qty);var cost=items.Sum(x=>x.CostPrice*x.Qty);return Ok(new{totalUnitsSold=items.Sum(x=>x.Qty),totalRevenue=revenue,totalCost=cost,totalProfit=revenue-cost});}
}
