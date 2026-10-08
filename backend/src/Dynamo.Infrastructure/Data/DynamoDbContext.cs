using System.Text.Json;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dynamo.Infrastructure.Data;

public class DynamoDbContext : DbContext
{
    public DynamoDbContext(DbContextOptions<DynamoDbContext> options) : base(options)
    {
    }

    public DbSet<Game> Games => Set<Game>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Player> Players => Set<Player>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Game>(b =>
        {
            b.HasKey(g => g.Id);
            b.Property(g => g.Slug).IsRequired().HasMaxLength(100);
            b.Property(g => g.Name).IsRequired().HasMaxLength(200);
            b.Property(g => g.SupportedModes)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<MultiplayerMode>>(v, (JsonSerializerOptions?)null) ?? new List<MultiplayerMode>()
                );
        });

        modelBuilder.Entity<Session>(b =>
        {
            b.HasKey(s => s.Id);
            b.Property(s => s.RoomCode).IsRequired().HasMaxLength(10);
            b.HasIndex(s => s.RoomCode);

            b.HasMany(s => s.Clients)
                .WithOne()
                .HasForeignKey(c => c.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(s => s.Players)
                .WithOne()
                .HasForeignKey(p => p.SessionId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Navigation(s => s.Clients).AutoInclude();
            b.Navigation(s => s.Players).AutoInclude();
        });

        modelBuilder.Entity<Client>(b =>
        {
            b.HasKey(c => c.Id);
        });

        modelBuilder.Entity<Player>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Name).IsRequired().HasMaxLength(50);
        });

        // Seed initial mock games
        var game1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var game2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var game3Id = Guid.Parse("33333333-3333-3333-3333-333333333333");

        modelBuilder.Entity<Game>().HasData(
            new
            {
                Id = game1Id,
                Slug = "trivia-pro",
                Name = "Bible Trivia Showdown",
                Description = "Fast-paced Christian knowledge trivia challenge for youth groups with timed rounds.",
                ThumbnailUrl = "/assets/games/trivia.png",
                SupportedModes = new List<MultiplayerMode> { MultiplayerMode.RoomBased, MultiplayerMode.SharedScreen },
                SettingsSchemaJson = "{\"maxPlayers\": 12, \"defaultRounds\": 5, \"defaultTime\": 30}",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = game2Id,
                Slug = "charades-flash",
                Name = "Faith Charades Party",
                Description = "Act out stories, parables, and heroes of faith on one shared screen with live turn cycling.",
                ThumbnailUrl = "/assets/games/charades.png",
                SupportedModes = new List<MultiplayerMode> { MultiplayerMode.SharedScreen },
                SettingsSchemaJson = "{\"maxPlayers\": 20, \"defaultRounds\": 3, \"defaultTime\": 60}",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = game3Id,
                Slug = "scripture-duel",
                Name = "Scripture Memory Duel",
                Description = "Fill in the missing verses and test biblical memory in real-time head-to-head lobbies.",
                ThumbnailUrl = "/assets/games/scripture.png",
                SupportedModes = new List<MultiplayerMode> { MultiplayerMode.RoomBased },
                SettingsSchemaJson = "{\"maxPlayers\": 8, \"defaultRounds\": 4, \"defaultTime\": 45}",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            }
        );
    }
}
