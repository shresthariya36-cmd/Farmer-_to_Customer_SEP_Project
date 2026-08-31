using Microsoft.EntityFrameworkCore;
using TajaFarm.Api.Auth;
using TajaFarm.Api.Models;
namespace TajaFarm.Api.Data;
public static class SeedData
{
 public static async Task InitializeAsync(AppDbContext db)
 {
  await db.Database.EnsureCreatedAsync();

  // Add new columns to an existing database without requiring EF migrations.
  // Wrapped in try/catch: some MySQL versions don't support "ADD COLUMN IF NOT EXISTS",
  // and if the column already exists (e.g. created by an EF migration) this would otherwise throw.
  async Task TryAddColumnAsync(string sql)
  {
   try { await db.Database.ExecuteSqlRawAsync(sql); }
   catch (Exception) { /* column likely already exists or syntax unsupported; safe to ignore */ }
  }

  await TryAddColumnAsync("ALTER TABLE Users ADD COLUMN IF NOT EXISTS WhatsAppNumber VARCHAR(30) NULL");
  await TryAddColumnAsync("ALTER TABLE Users ADD COLUMN IF NOT EXISTS PasswordResetCode VARCHAR(100) NULL");
  await TryAddColumnAsync("ALTER TABLE Users ADD COLUMN IF NOT EXISTS PasswordResetExpiresAt DATETIME NULL");

  if(!await db.Categories.AnyAsync()) db.Categories.AddRange(
   new Category{Name="Vegetables"},new Category{Name="Fruits"},new Category{Name="Dairy"},
   new Category{Name="Grains"},new Category{Name="Pulses"},new Category{Name="Organic"},new Category{Name="Leafy Greens"});

  var farmer=await db.Users.FirstOrDefaultAsync(x=>x.Email=="farmer@tajafarm.com");
  if(farmer==null){ farmer=new User{Id=1,Name="Green Valley Farm",Email="farmer@tajafarm.com",PasswordHash=PasswordService.Hash("farmer123"),Role="farmer",Location="Kavrepalanchok, Nepal",IsApproved=true};db.Users.Add(farmer); }
  else { farmer.PasswordHash=PasswordService.Hash("farmer123"); farmer.Role="farmer"; farmer.IsApproved=true; }

  var customer=await db.Users.FirstOrDefaultAsync(x=>x.Email=="customer@tajafarm.com");
  if(customer==null){ customer=new User{Id=2,Name="Riya Sharma",Email="customer@tajafarm.com",PasswordHash=PasswordService.Hash("customer123"),Role="customer",Location="Kathmandu, Nepal",IsApproved=true};db.Users.Add(customer); }
  else { customer.PasswordHash=PasswordService.Hash("customer123"); customer.Role="customer"; customer.IsApproved=true; }

  var admin=await db.Users.FirstOrDefaultAsync(x=>x.Email=="admin@tajafarm.com");
  if(admin==null){ admin=new User{Id=3,Name="Site Admin",Email="admin@tajafarm.com",PasswordHash=PasswordService.Hash("admin123"),Role="admin",IsApproved=true};db.Users.Add(admin); }
  else { admin.PasswordHash=PasswordService.Hash("admin123"); admin.Role="admin"; admin.IsApproved=true; }

  if(!await db.Products.AnyAsync()) db.Products.AddRange(
   new Product{Id=1,Name="Organic Tomato",Category="Vegetables",Price=80,CostPrice=50,Unit="kg",Rating=4.8,FarmerId=1,Description="Fresh organic tomatoes",Stock=120,ExpiryDate=DateTime.UtcNow.AddDays(7)},
   new Product{Id=2,Name="Cucumber",Category="Vegetables",Price=60,CostPrice=35,Unit="kg",Rating=4.6,FarmerId=1,Description="Fresh cucumbers",Stock=90,ExpiryDate=DateTime.UtcNow.AddDays(6)},
   new Product{Id=3,Name="Potato",Category="Vegetables",Price=40,CostPrice=25,Unit="kg",Rating=4.7,FarmerId=1,Description="Local potatoes",Stock=200,ExpiryDate=DateTime.UtcNow.AddDays(30)});

  await db.SaveChangesAsync();
 }
}