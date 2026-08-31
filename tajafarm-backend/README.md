# Taja Farm Backend

Database access follows Controller/Service/Data patterns. MySQL data is saved by EF Core when application code calls SaveChanges() or SaveChangesAsync(). No custom SetupDatabase or UpdateDatabase SQL files are included.

Configure `DefaultConnection` in appsettings.json, then create/apply EF migrations when your schema changes.
