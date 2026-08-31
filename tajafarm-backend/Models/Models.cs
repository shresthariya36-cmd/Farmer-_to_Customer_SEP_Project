namespace TajaFarm.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "customer";
    public string? Location { get; set; }
    public string ProfileImage { get; set; } = "";
    public string? WhatsAppNumber { get; set; }
    public string? PasswordResetCode { get; set; }
    public DateTime? PasswordResetExpiresAt { get; set; }
    public bool IsApproved { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Category { get; set; } = "";
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public string Unit { get; set; } = "kg";
    public double Rating { get; set; }
    public int FarmerId { get; set; }
    public string Description { get; set; } = "";
    public int Stock { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string ImageUrl { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}
public class CartItem
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
    public int Qty { get; set; }
}

public class Message
{
    public int Id { get; set; }
    public int FromUserId { get; set; }
    public string FromName { get; set; } = "";
    public int ToUserId { get; set; }
    public int? ProductId { get; set; }
    public string? ProductName { get; set; }
    public string Text { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = "";
    public List<OrderItem> Items { get; set; } = new();
    public decimal Total { get; set; }
    public string PaymentMethod { get; set; } = "cod";
    public string Status { get; set; } = "pending_farmer_confirmation";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool FarmerConfirmed { get; set; }
    public string ManualStage { get; set; } = "placed";
}

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    [System.Text.Json.Serialization.JsonIgnore] public Order? Order { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public int Qty { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public int FarmerId { get; set; }
}

public class Review
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public int FarmerId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = "";
    public int ProductRating { get; set; }
    public int FarmerRating { get; set; }
    public string Comment { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Wishlist
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ProductId { get; set; }
}

public class Notification
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = "";
    public string Message { get; set; } = "";
    public string Type { get; set; } = "general";
    public int? RelatedId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
