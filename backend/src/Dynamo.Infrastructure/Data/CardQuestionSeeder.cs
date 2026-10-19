using System.Text.Json;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using Microsoft.EntityFrameworkCore;

namespace Dynamo.Infrastructure.Data;

public static class CardQuestionSeeder
{
    public static void SeedCardQuestions(this ModelBuilder modelBuilder)
    {
        var baseDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        var questions = new List<object>
        {
            // Spanish Seeds: Strictly from Examen de Hechos y Epistolas
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                Text = "En la carta de 1 Corintios se muestra el énfasis del pronto regreso de Jesús, de tal manera que algunos ya no querían trabajar.",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Falso",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                Text = "El propósito de la carta a los Gálatas es: corregir el informe de su autoridad apostólica y corregir la doctrina de los dones espirituales.",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Falso",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                Text = "Pablo escribió cartas a los Romanos y a los Colosenses, iglesias que él no conocía personalmente, ni había fundado.",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                Text = "\"Estoy pronto a ser sacrificado. El tiempo de mi partida está cercano.\", se encuentra en la carta de 2 Timoteo.",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000005"),
                Text = "Las cartas de Colosenses y Filemón fueron llevadas por Tiquico.",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000006"),
                Text = "Pablo para desarrollar Romanos 4, utiliza de base el texto del AT de:",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "a. Gen 12:1", "b. Ex 20:8-11", "c. Gen 15:6" }),
                Answer = "c. Gen 15:6",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000007"),
                Text = "En esta carta no se habla de ninguna crisis acuciante (urgente). No se habla de ninguna situación local:",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "a. Filipenses", "b. Efesios", "c. Colosenses" }),
                Answer = "b. Efesios",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000008"),
                Text = "En esta carta paulina se describe una herejía que tiene estos elementos: misticismo helenista, legalismo judío y ascetismo riguroso",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "a. Filipenses", "b. Gálatas", "c. Colosenses" }),
                Answer = "c. Colosenses",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000009"),
                Text = "El texto que dice: \"La mujer aprenda en silencio con toda sujeción. No permito a la mujer enseñar, ni ejercer dominio…ella se salvará engendrando hijos si permanece en fe, amor y santificación con modestia\" se encuentra en la carta a:",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "a. 2 Corintios", "b. 1 Timoteo", "c. 2 Timoteo" }),
                Answer = "b. 1 Timoteo",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000010"),
                Text = "En esta carta, \"la humildad\" del cristiano se basa en la humillación de Cristo siendo obediente hasta la muerte.",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "a. Filipenses", "b. Colosenses", "c. Romanos" }),
                Answer = "a. Filipenses",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000011"),
                Text = "Pablo, ¿qué cartas escribe en su segundo viaje?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "1 y 2 Tesalonicenses" }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000012"),
                Text = "Pablo, ¿qué cartas escribe en la prisión de Roma?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "Efesios, Colosenses, Filipenses y Filemón" }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000013"),
                Text = "¿Cuáles son las 4 cartas que Pablo pudo escribir a los Corintios?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "1. Carta previa (1 Cor 5:9)", "2. 1 Corintios", "3. 2 Corintios 10-13 (2 Cor 2:3,4; 7:8)", "4. 2 Corintios 1-9" }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000014"),
                Text = "¿Quiénes eran denominados grandes apóstoles en la iglesia de Corinto?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "Probablemente maestros judeo-cristianos", "Critican la forma de hablar y el ministerio de Pablo", "Irónicamente se les llama superapóstoles" }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000015"),
                Text = "¿Qué significa \"todos los que somos perfectos\" en Fil 3:15?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "Perfectos viene de teleleomai – significa madurez", "La meta final es la resurrección y la transformación", "La madurez se vive por la justicia de Cristo, no por la propia", "El cristiano maduro que reconoce que aún no llegó, sigue corriendo hacia la meta y confía en la justicia de Cristo." }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000016"),
                Text = "¿Cuáles son las cartas denominadas \"cristológicas\"?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "Filipenses, Colosenses y Efesios (Hebreos)" }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000017"),
                Text = "¿Cuáles son los 3 propósitos de la carta a los Romanos?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "Propósito misionero: Evangelización del imperio – gentiles y España", "Propósito apologético: Pablo presenta defensa de sí mismo y del evangelio", "Propósito pastoral: Había divisiones potenciales - Unidad judío-gentil" }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000018"),
                Text = "Explique ¿Qué es la diatriba?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "Es una herramienta de enseñanza interactiva en la escuela filosófica antigua. Era un estilo de discurso que se utilizaba para instruir, alentar, confrontar y persuadir al oyente, mediante preguntas y respuestas imaginarias." }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000019"),
                Text = "¿Cuáles son las imágenes o símbolos de la iglesia en la carta a los Efesios?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = JsonSerializer.Serialize(new[] { "La iglesia es el cuerpo de Cristo (1:22,23; 2:16; 3:6; 4:1-16, 25; 5:23, 29,30)", "Es un edificio/templo santo (2:19-22)", "Es la novia o desposada de Cristo (5:25-27)", "Es un ejército triunfante (6:10-20)" }),
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000020"),
                Text = "Repita un trabalenguas",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000021"),
                Text = "Cuente un buen chiste",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000022"),
                Text = "Canten como grupo un canto que no sea en español",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000023"),
                Text = "Repita un versículo de memoria del Nuevo Testamento con su texto",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
        };

        modelBuilder.Entity<CardQuestion>().HasData(questions);
    }
}
