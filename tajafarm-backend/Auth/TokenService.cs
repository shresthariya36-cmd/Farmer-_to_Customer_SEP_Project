using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using TajaFarm.Api.Models;

namespace TajaFarm.Api.Auth;

public static class TokenService
{
    private static string Secret => Environment.GetEnvironmentVariable("JWT_SECRET") ?? "taja-farm-dev-secret-change-me-please";
    public record TokenPayload(int Id, string Email, string Role, string Name, long Exp);

    public static string Sign(User user)
    {
        var payload = new TokenPayload(user.Id, user.Email, user.Role, user.Name, DateTimeOffset.UtcNow.AddDays(7).ToUnixTimeSeconds());
        var header = Encode(JsonSerializer.SerializeToUtf8Bytes(new { alg = "HS256", typ = "JWT" }));
        var body = Encode(JsonSerializer.SerializeToUtf8Bytes(payload));
        var signature = Encode(SignBytes($"{header}.{body}"));
        return $"{header}.{body}.{signature}";
    }

    public static TokenPayload? Verify(string token)
    {
        try
        {
            var parts = token.Split('.');
            if (parts.Length != 3) return null;
            var expected = Encode(SignBytes($"{parts[0]}.{parts[1]}"));
            if (!CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(parts[2]))) return null;
            var payload = JsonSerializer.Deserialize<TokenPayload>(Decode(parts[1]));
            return payload is not null && payload.Exp >= DateTimeOffset.UtcNow.ToUnixTimeSeconds() ? payload : null;
        }
        catch { return null; }
    }

    private static byte[] SignBytes(string data)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(Secret));
        return hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
    }
    private static string Encode(byte[] data) => Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    private static byte[] Decode(string value)
    {
        var s = value.Replace('-', '+').Replace('_', '/');
        if (s.Length % 4 == 2) s += "=="; else if (s.Length % 4 == 3) s += "=";
        return Convert.FromBase64String(s);
    }
}
