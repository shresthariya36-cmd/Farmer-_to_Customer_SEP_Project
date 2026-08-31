namespace TajaFarm.Api.Models;

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string Role = "customer",
    string? Location = null,
    string? WhatsAppNumber = null
    );
public record LoginRequest(
    string Email,
    string Password
    );
public record ForgotPasswordRequest(
    string Email)
    ;
public record ResetPasswordRequest(
    string Email,
    string Code,
    string NewPassword
    );
public record ProductRequest(
    string Name,
    string Category,
    decimal Price,
    decimal CostPrice,
    string Unit = "kg",
    string Description = "",
    int Stock = 0,
    DateTime? ExpiryDate = null,
    string ImageUrl = ""
    );
public record CartAddRequest(
    int ProductId,
    int Qty = 1);
public record MessageRequest(
    int ProductId,
    string Text);
public record MessageReplyRequest(
    int ToUserId,
    int ProductId,
    string Text);
public record CheckoutRequest(
    string PaymentMethod = "cod"
    );
public record BuyNowRequest(
    int ProductId,
    int Qty = 1,
    string PaymentMethod = "cod"
    );
public record WishlistToggleRequest(
    int ProductId
    );
public record UpdateProfileRequest(
    string Name,
    string Email,
    string? Location,
    string? ProfileImage = null,
    string? WhatsAppNumber = null
    );
public record AdminOrderStatusRequest(
    string Stage
    );
public record ReviewRequest(
    int ProductId,
    int ProductRating,
    int FarmerRating,
    string Comment
    );
public record ApprovalRequest(
    bool Approved
    );
