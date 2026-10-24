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
    public DbSet<Phrase> Phrases => Set<Phrase>();
    public DbSet<CardQuestion> CardQuestions => Set<CardQuestion>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Phrase>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Text).IsRequired().HasMaxLength(500);
            b.Property(p => p.GeneralHint).IsRequired().HasMaxLength(250);
            b.Property(p => p.SpecificHint).IsRequired().HasMaxLength(250);
            b.Property(p => p.Language).IsRequired().HasMaxLength(10).HasDefaultValue("es");
        });

        modelBuilder.Entity<Game>(b =>
        {
            b.HasKey(g => g.Id);
            b.Property(g => g.Slug).IsRequired().HasMaxLength(100);
            b.Property(g => g.Name).IsRequired().HasMaxLength(200);
            b.Property(g => g.Language).IsRequired().HasMaxLength(10).HasDefaultValue("es");
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
            b.Property(s => s.Language).IsRequired().HasMaxLength(10).HasDefaultValue("es");
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
            b.HasIndex(c => new { c.SessionId, c.ClientId });
        });

        modelBuilder.Entity<Player>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Name).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<CardQuestion>(b =>
        {
            b.HasKey(q => q.Id);
            b.Property(q => q.Text).IsRequired().HasMaxLength(500);
            b.Property(q => q.Answer).IsRequired().HasMaxLength(500);
            b.Property(q => q.Language).IsRequired().HasMaxLength(10).HasDefaultValue("es");
            b.Property(q => q.OptionsJson).HasMaxLength(1000);
        });

        // Seed initial mock games
        var game1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var game2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var game3Id = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var game4Id = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var game5Id = Guid.Parse("55555555-5555-5555-5555-555555555555");

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
                Language = "es",
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
                Language = "es",
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
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = game4Id,
                Slug = "biblical-roulette",
                Name = "Biblical Roulette",
                Description = "Spin the wheel, reveal letters, and solve the hidden verse with live dynamic vowel pricing.",
                ThumbnailUrl = "/assets/games/roulette.png",
                SupportedModes = new List<MultiplayerMode> { MultiplayerMode.SharedScreen, MultiplayerMode.BiblicalRoulette },
                SettingsSchemaJson = "{\"maxPlayers\": 6, \"defaultRounds\": 3, \"defaultTime\": 45}",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = game5Id,
                Slug = "card-qa",
                Name = "Card Question & Answer",
                Description = "Turn face-down numbered cards, reveal biblical questions and answers, and evaluate knowledge in shared-screen turns.",
                ThumbnailUrl = "/assets/games/card-qa.png",
                SupportedModes = new List<MultiplayerMode> { MultiplayerMode.SharedScreen },
                SettingsSchemaJson = "{\"totalCardCount\": 20, \"questionsPerTurn\": 5, \"defaultLanguage\": \"es\"}",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            }
        );

        modelBuilder.Entity<Phrase>().HasData(
            // Spanish Phrases (Language = "es")
            new
            {
                Id = Guid.Parse("a1111111-1111-1111-1111-111111111111"),
                Text = "PORQUE DE TAL MANERA AMO DIOS AL MUNDO",
                GeneralHint = "Jesus",
                SpecificHint = "Juan 3:16 - El versículo de oro",
                Category = "Evangelios",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("b2222222-2222-2222-2222-222222222222"),
                Text = "JEHOVA ES MI PASTOR NADA ME FALTARA",
                GeneralHint = "Salmos de David",
                SpecificHint = "Salmo 23:1",
                Category = "Salmos",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("c3333333-3333-3333-3333-333333333333"),
                Text = "TODO LO PUEDO EN CRISTO QUE ME FORTALECE",
                GeneralHint = "Carta de aliento",
                SpecificHint = "Filipenses 4:13 - Escrito desde la prisión",
                Category = "Epístolas",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("d4444444-4444-4444-4444-444444444444"),
                Text = "EN EL PRINCIPIO CREO DIOS LOS CIELOS Y LA TIERRA",
                GeneralHint = "Creacion",
                SpecificHint = "Génesis 1:1 - La creación divina",
                Category = "Pentateuco",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("e5555555-5555-5555-5555-555555555555"),
                Text = "LAMPARA ES A MIS PIES TU PALABRA",
                GeneralHint = "Salmos",
                SpecificHint = "Salmo 119:105 - Lumbrera a mi camino",
                Category = "Salmos",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("e6666666-6666-6666-6666-666666666666"),
                Text = "YO SOY EL CAMINO Y LA VERDAD Y LA VIDA",
                GeneralHint = "Jesus",
                SpecificHint = "Juan 14:6 - Jesús revela quién es",
                Category = "Evangelios",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("f6666666-6666-6666-6666-666666666666"),
                Text = "EL AMOR ES PACIENTE ES BONDADOSO",
                GeneralHint = "Cartas de amor",
                SpecificHint = "1 Corintios 13:4 - El capítulo del amor",
                Category = "Epístolas",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("a7777777-7777-7777-7777-777777777777"),
                Text = "Y CONOCEREIS LA VERDAD Y LA VERDAD OS HARA LIBRES",
                GeneralHint = "Evangelio de Juan",
                SpecificHint = "Juan 8:32 - La libertad en Cristo",
                Category = "Evangelios",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("b8888888-8888-8888-8888-888838881888"),
                Text = "MIRA QUE TE MANDO QUE TE ESFUERCES Y SEAS VALIENTE",
                GeneralHint = "Consejo a Josue",
                SpecificHint = "Josué 1:9 - No temas ni desmayes",
                Category = "Históricos",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("c9999999-9999-9999-9999-999999999999"),
                Text = "Y AHORA PERMANECEN LA FE LA ESPERANZA Y EL AMOR",
                GeneralHint = "Cartas a los Corintios",
                SpecificHint = "1 Corintios 13:13 - Pero el mayor de ellos es el amor",
                Category = "Epístolas",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("daaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                Text = "CONFIA EN JEHOVA CON TODO TU CORAZON",
                GeneralHint = "Sabios Proverbios",
                SpecificHint = "Proverbios 3:5 - ... y no te apoyes en tu propia prudencia",
                Category = "Sabiduría",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("e8888888-8888-8888-8888-888888812888"),
                Text = "SI DIOS ES POR NOSOTROS QUIEN CONTRA NOSOTROS",
                GeneralHint = "Carta de aliento",
                SpecificHint = "Romanos 8:31 - La seguridad en Dios",
                Category = "Epístolas",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("e8888888-8888-8888-8888-888888888882"),
                Text = "LA CONFIANZA EN EL PODER DIVINO",
                GeneralHint = "8 Remedios Naturales",
                SpecificHint = "Dios",
                Category = "Ellen White",
                Language = "es",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            // English Phrases (Language = "en")
            new
            {
                Id = Guid.Parse("ea111111-1111-1111-1111-111111111111"),
                Text = "FOR GOD SO LOVED THE WORLD",
                GeneralHint = "Gospel of John",
                SpecificHint = "John 3:16 - The golden verse",
                Category = "Gospels",
                Language = "en",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("eb222222-2222-2222-2222-222222222222"),
                Text = "THE LORD IS MY SHEPHERD",
                GeneralHint = "Psalms of David",
                SpecificHint = "Psalm 23:1 - Written by King David",
                Category = "Psalms",
                Language = "en",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("ec333333-3333-3333-3333-333333333333"),
                Text = "I CAN DO ALL THINGS THROUGH CHRIST",
                GeneralHint = "Pauline Epistle",
                SpecificHint = "Philippians 4:13 - Written from prison",
                Category = "Epistles",
                Language = "en",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("ed444444-4444-4444-4444-444444444444"),
                Text = "IN THE BEGINNING GOD CREATED",
                GeneralHint = "Book of Genesis",
                SpecificHint = "Genesis 1:1 - Creation of heavens and earth",
                Category = "Pentateuch",
                Language = "en",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("ee555555-5555-5555-5555-555555555555"),
                Text = "THY WORD IS A LAMP UNTO MY FEET",
                GeneralHint = "Book of Psalms",
                SpecificHint = "Psalm 119:105 - A light unto my path",
                Category = "Psalms",
                Language = "en",
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                UpdatedAt = (DateTime?)null
            }
        );

        modelBuilder.SeedCardQuestions();
    }
}
