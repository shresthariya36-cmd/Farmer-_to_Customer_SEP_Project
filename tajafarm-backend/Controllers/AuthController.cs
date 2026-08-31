using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TajaFarm.Api.Auth;
using TajaFarm.Api.Data;
using TajaFarm.Api.Models;
namespace TajaFarm.Api.Controllers;
[ApiController]
[Route("api/auth")]
public class AuthController:BaseController
{
 [HttpPost("register")]
 public async Task<IActionResult> Register(RegisterRequest req,[FromServices]AppDbContext db){
  if(string.IsNullOrWhiteSpace(req.Name)||string.IsNullOrWhiteSpace(req.Email)||string.IsNullOrWhiteSpace(req.Password))return BadRequest(new{error="Name, email and password are required"});
  if(req.Password.Length<6)return BadRequest(new{error="Password must be at least 6 characters"});
  var email=req.Email.Trim().ToLowerInvariant();
  if(await db.Users.AnyAsync(x=>x.Email==email))return Conflict(new{error="An account with this email already exists"});
  var role=req.Role.ToLowerInvariant(); if(role is not("customer" or "farmer"))role="customer";
  var approved=role!="farmer";
  var u=new User{Name=req.Name.Trim(),Email=email,PasswordHash=PasswordService.Hash(req.Password),Role=role,Location=req.Location,WhatsAppNumber=role=="farmer"?CleanWhatsApp(req.WhatsAppNumber):null,IsApproved=approved};
  db.Users.Add(u); await db.SaveChangesAsync();
  if(!approved)return StatusCode(202,new{pending=true,message="Farmer registration submitted. Wait for admin approval before logging in.",user=UserDto(u)});
  return StatusCode(201,new{token=TokenService.Sign(u),user=UserDto(u)});
 }
 [HttpPost("login")]
 public async Task<IActionResult> Login(LoginRequest req,[FromServices]AppDbContext db){
  var email=req.Email?.Trim().ToLowerInvariant()??"";
  var u=await db.Users.FirstOrDefaultAsync(x=>x.Email==email);
  if(u is null||string.IsNullOrWhiteSpace(req.Password)||!PasswordService.Verify(req.Password,u.PasswordHash))return Unauthorized(new{error="Invalid email or password"});
  if(u.Role=="farmer"&&!u.IsApproved)return StatusCode(403,new{error="Your farmer account is waiting for admin approval."});
  return Ok(new{token=TokenService.Sign(u),user=UserDto(u)});
 }
 [HttpGet("me")]
 public async Task<IActionResult> Me([FromServices]AppDbContext db){var r=RequireUser(out var token);if(r is not null)return r;var u=await db.Users.FindAsync(token!.Id);return u is null?Unauthorized():Ok(new{user=UserDto(u)});}

 [HttpPost("forgot-password")]
 public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest req,[FromServices]AppDbContext db,IWebHostEnvironment env){
  var email=req.Email?.Trim().ToLowerInvariant()??"";
  var u=await db.Users.FirstOrDefaultAsync(x=>x.Email==email);
  // Do not reveal whether an email exists in production.
  if(u is null)return Ok(new{message="If the email exists, a reset code has been created."});
  var code=RandomNumberGenerator.GetInt32(100000,1000000).ToString();
  u.PasswordResetCode=PasswordService.Hash(code);
  u.PasswordResetExpiresAt=DateTime.UtcNow.AddMinutes(15);
  await db.SaveChangesAsync();
  Console.WriteLine($"PASSWORD RESET CODE for {u.Email}: {code}");
  return Ok(new{message="Reset code created. Check the backend terminal for the code while running locally.",devCode=env.IsDevelopment()?code:null});
 }

 [HttpPost("reset-password")]
 public async Task<IActionResult> ResetPassword(ResetPasswordRequest req,[FromServices]AppDbContext db){
  if(string.IsNullOrWhiteSpace(req.NewPassword)||req.NewPassword.Length<6)return BadRequest(new{error="New password must be at least 6 characters"});
  var email=req.Email?.Trim().ToLowerInvariant()??"";
  var u=await db.Users.FirstOrDefaultAsync(x=>x.Email==email);
  if(u is null||string.IsNullOrWhiteSpace(u.PasswordResetCode)||u.PasswordResetExpiresAt is null||u.PasswordResetExpiresAt<DateTime.UtcNow||!PasswordService.Verify(req.Code,u.PasswordResetCode))return BadRequest(new{error="Invalid or expired reset code"});
  u.PasswordHash=PasswordService.Hash(req.NewPassword);u.PasswordResetCode=null;u.PasswordResetExpiresAt=null;await db.SaveChangesAsync();
  return Ok(new{message="Password changed successfully. You can now log in."});
 }

 private static string? CleanWhatsApp(string? value){if(string.IsNullOrWhiteSpace(value))return null;var s=new string(value.Where(char.IsDigit).ToArray());return s.Length>=8?s:null;}
}
