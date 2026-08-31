using Microsoft.EntityFrameworkCore;
using TajaFarm.Api.Models;

namespace TajaFarm.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder m)
    {
        m.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(180).IsRequired();
            e.Property(x => x.PasswordHash).IsRequired();
            e.Property(x => x.Role).HasMaxLength(30);
            e.Property(x => x.ProfileImage).HasMaxLength(2000000);
            e.Property(x => x.Location).HasMaxLength(250);
            e.Property(x => x.WhatsAppNumber).HasMaxLength(30);
            e.Property(x => x.PasswordResetCode).HasMaxLength(100);
        });
        m.Entity<Product>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Price).HasPrecision(12, 2);
            e.Property(x => x.CostPrice).HasPrecision(12, 2);
            e.Property(x => x.ImageUrl).HasMaxLength(2000000);
            e.Property(x => x.Description).HasMaxLength(4000);
            e.HasOne<User>().WithMany().HasForeignKey(x => x.FarmerId).OnDelete(DeleteBehavior.Restrict);
        });
        m.Entity<Category>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Name).IsUnique();
        });
        m.Entity<CartItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        });
        m.Entity<Wishlist>(e =>
        {
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.UserId, x.ProductId }).IsUnique();
        });
        m.Entity<Message>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Text).HasMaxLength(4000);
        });
        m.Entity<Order>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Total).HasPrecision(12, 2);
            e.HasMany(x => x.Items).WithOne(x => x.Order).HasForeignKey(x => x.OrderId).OnDelete(DeleteBehavior.Cascade);
        });
        m.Entity<OrderItem>(e => { e.HasKey(x => x.Id); e.Property(x => x.Price).HasPrecision(12, 2); e.Property(x => x.CostPrice).HasPrecision(12, 2); });
        m.Entity<Review>(e => { e.HasKey(x => x.Id); e.Property(x => x.Comment).HasMaxLength(2000); });
        m.Entity<Notification>(e => { e.HasKey(x => x.Id); e.Property(x => x.Title).HasMaxLength(200); e.Property(x => x.Message).HasMaxLength(2000); e.Property(x => x.Type).HasMaxLength(50); e.HasIndex(x => new { x.UserId, x.IsRead }); });
    }
}
