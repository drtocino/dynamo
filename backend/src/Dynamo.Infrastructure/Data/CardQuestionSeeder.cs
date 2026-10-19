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
            // Spanish Seeds
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000001"),
                Text = "¿En qué ciudad nació Jesús según los evangelios?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Nazaret", "B) Belén", "C) Jerusalén", "D) Jericó" }),
                Answer = "B) Belén (Mateo 2:1)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000002"),
                Text = "¿El arca de Noé tenía tres pisos o compartimentos?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero (Génesis 6:16)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000003"),
                Text = "¿Quién fue el profeta que fue tragado por un gran pez?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Jonás (Jonás 1:17)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000004"),
                Text = "¿Cuántos días y noches llovió durante el diluvio universal?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) 7 días", "B) 40 días", "C) 120 días", "D) 1 año" }),
                Answer = "B) 40 días y 40 noches (Génesis 7:12)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000005"),
                Text = "¿Moisés guio al pueblo de Israel a través del Mar Rojo?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero (Éxodo 14:21-22)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000006"),
                Text = "¿Cuál fue el primer milagro público que realizó Jesús?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Convertir el agua en vino en las bodas de Caná (Juan 2:1-11)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000007"),
                Text = "¿Cuántos discípulos formaban el círculo íntimo original de Jesús?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) 10", "B) 12", "C) 7", "D) 70" }),
                Answer = "B) 12 discípulos (Mateo 10:1-4)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000008"),
                Text = "¿El apóstol Pablo era originario de la ciudad de Tarso?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero (Hechos 22:3)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000009"),
                Text = "¿Quién derrotó al gigante Goliat usando solo una honda y una piedra?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "David (1 Samuel 17:49)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000010"),
                Text = "¿Qué instrumento tocaba David para calmar al rey Saúl?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Trompeta", "B) Arpa", "C) Flauta", "D) Pandereta" }),
                Answer = "B) Arpa (1 Samuel 16:23)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000011"),
                Text = "¿Jesús resucitó al tercer día según las Escrituras?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero (1 Corintios 15:4)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000012"),
                Text = "¿Cuál es el libro más largo de la Biblia por número de capítulos?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Salmos (150 capítulos)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000013"),
                Text = "¿Quién fue arrojado al foso de los leones por orar a Dios?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Daniel", "B) José", "C) Elías", "D) Nehemías" }),
                Answer = "A) Daniel (Daniel 6:16)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000014"),
                Text = "¿Sansón perdió su gran fuerza cuando le cortaron el cabello?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero (Jueces 16:19)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000015"),
                Text = "¿Qué río cruzó Josué y el pueblo para entrar en la Tierra Prometida?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "El río Jordán (Josué 3:14-17)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000016"),
                Text = "¿Quién interpretó los sueños del Faraón en Egipto sobre 7 vacas gordas y flacas?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Moisés", "B) Abraham", "C) José", "D) Jacob" }),
                Answer = "C) José (Génesis 41:25-30)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000017"),
                Text = "¿El fruto del Espíritu Santo incluye amor, gozo y paz?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero (Gálatas 5:22-23)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000018"),
                Text = "¿Cómo se llamaba la madre terrenal de Jesús?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "María (Lucas 1:26-31)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000019"),
                Text = "¿En qué monte recibió Moisés las tablas de la ley?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Sinaí", "B) Carmelo", "C) Sion", "D) Olivos" }),
                Answer = "A) Monte Sinaí (Éxodo 19:20)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000020"),
                Text = "¿Juan el Bautista bautizó a Jesús en el río Jordán?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero (Mateo 3:13)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000021"),
                Text = "¿Quién escribió la mayoría de los Salmos?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "El rey David",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000022"),
                Text = "¿Cuántos panes y peces usó Jesús para alimentar a los 5,000?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) 5 panes y 2 peces", "B) 7 panes y 3 peces", "C) 2 panes y 5 peces", "D) 12 panes" }),
                Answer = "A) 5 panes y 2 peces (Mateo 14:17-21)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000023"),
                Text = "¿Zaqueo se subió a un árbol sicómoro para ver a Jesús?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "Verdadero (Lucas 19:4)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000024"),
                Text = "¿Quién fue el primer hombre creado según el libro de Génesis?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Adán (Génesis 2:7)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000025"),
                Text = "¿En qué idioma se escribió principalmente el Nuevo Testamento?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Griego koiné",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000026"),
                Text = "¿Cómo se llamaba el jardín donde Dios puso a Adán y Eva?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "El jardín del Edén (Génesis 2:8)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000027"),
                Text = "¿Quién fue el sucesor de Moisés como líder del pueblo de Israel?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Josué (Josué 1:1-2)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000028"),
                Text = "¿Cuántos libros componen el Nuevo Testamento?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "27 libros",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000029"),
                Text = "¿Qué reina judía arriesgó su vida para salvar a su pueblo del complot de Amán?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "La reina Ester (Ester 4:16)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000030"),
                Text = "¿Quién escribió el libro de Apocalipsis en la isla de Patmos?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "El apóstol Juan (Apocalipsis 1:9)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            // Spanish Wildcards (Puntos de Regalo)
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000101"),
                Text = "🌟 ¡PUNTOS DE REGALO! Has descubierto una tarjeta comodín. ¡Te llevas 3 puntos gratis directos a tu marcador!",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Comodín (+3 puntos de regalo)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000102"),
                Text = "🌟 ¡BENDICIÓN EXTRA! ¡Felicidades! Esta tarjeta es un regalo especial y te otorga 3 puntos directos.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Comodín (+3 puntos de regalo)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000103"),
                Text = "🌟 ¡PASE LIBRE DE GRACIA! ¡Puntos gratis! Suma 3 puntos automáticos para ti sin necesidad de responder.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Comodín (+3 puntos de regalo)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000104"),
                Text = "🌟 ¡COMODÍN DORADO! Has desbloqueado una bonificación directa de 3 puntos para tu cuenta.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Comodín (+3 puntos de regalo)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000105"),
                Text = "🌟 ¡TARJETA AFORTUNADA! La suerte está de tu lado: ¡3 puntos de obsequio añadidos inmediatamente!",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Comodín (+3 puntos de regalo)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000106"),
                Text = "🌟 ¡REGALO DE LA CASA! ¡Qué gran sorpresa! Esta casilla te obsequia 3 puntos de bonificación.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Comodín (+3 puntos de regalo)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000107"),
                Text = "🌟 ¡SUPER COMODÍN! Has seleccionado la tarjeta premio. Recibes 3 puntos directos en este turno.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Comodín (+3 puntos de regalo)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("10000000-0000-0000-0000-000000000108"),
                Text = "🌟 ¡GRACIA PLENA! Un regalo para tu marcador: 3 puntos sumados al instante a tu registro.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Comodín (+3 puntos de regalo)",
                Language = "es",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },

            // English Seeds
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000001"),
                Text = "In which city was Jesus born according to the Gospels?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Nazareth", "B) Bethlehem", "C) Jerusalem", "D) Jericho" }),
                Answer = "B) Bethlehem (Matthew 2:1)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000002"),
                Text = "Did Noah's ark have three decks or compartments?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "True (Genesis 6:16)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000003"),
                Text = "Who was the prophet swallowed by a great fish?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Jonah (Jonah 1:17)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000004"),
                Text = "How many days and nights did it rain during the great flood?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) 7 days", "B) 40 days", "C) 120 days", "D) 1 year" }),
                Answer = "B) 40 days and 40 nights (Genesis 7:12)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000005"),
                Text = "Moses led the people of Israel through the Red Sea on dry ground?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "True (Exodus 14:21-22)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000006"),
                Text = "What was the first public miracle performed by Jesus?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Turning water into wine at the wedding in Cana (John 2:1-11)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000007"),
                Text = "How many disciples made up the original inner circle of Jesus?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) 10", "B) 12", "C) 7", "D) 70" }),
                Answer = "B) 12 disciples (Matthew 10:1-4)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000008"),
                Text = "Was the apostle Paul originally from the city of Tarsus?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "True (Acts 22:3)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000009"),
                Text = "Who defeated the giant Goliath with only a sling and a stone?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "David (1 Samuel 17:49)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000010"),
                Text = "What instrument did David play to soothe King Saul?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Trumpet", "B) Harp", "C) Flute", "D) Tambourine" }),
                Answer = "B) Harp (1 Samuel 16:23)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000011"),
                Text = "Jesus rose again on the third day according to the Scriptures?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "True (1 Corinthians 15:4)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000012"),
                Text = "Which is the longest book of the Bible by number of chapters?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Psalms (150 chapters)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000013"),
                Text = "Who was thrown into the lions' den for praying to God?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Daniel", "B) Joseph", "C) Elijah", "D) Nehemiah" }),
                Answer = "A) Daniel (Daniel 6:16)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000014"),
                Text = "Samson lost his great physical strength when his hair was cut?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "True (Judges 16:19)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000015"),
                Text = "What body of water did Joshua and the people cross to enter the Promised Land?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "The Jordan River (Joshua 3:14-17)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000016"),
                Text = "Who interpreted Pharaoh's dreams about seven fat and seven lean cows in Egypt?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Moses", "B) Abraham", "C) Joseph", "D) Jacob" }),
                Answer = "C) Joseph (Genesis 41:25-30)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000017"),
                Text = "The fruit of the Holy Spirit includes love, joy, and peace?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "True (Galatians 5:22-23)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000018"),
                Text = "What was the name of Jesus' earthly mother?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Mary (Luke 1:26-31)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000019"),
                Text = "On which mountain did Moses receive the tablets of the Law?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) Sinai", "B) Carmel", "C) Zion", "D) Olives" }),
                Answer = "A) Mount Sinai (Exodus 19:20)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000020"),
                Text = "Did John the Baptist baptize Jesus in the Jordan River?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "True (Matthew 3:13)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000021"),
                Text = "Who wrote the majority of the Psalms in the Bible?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "King David",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000022"),
                Text = "How many loaves and fish did Jesus use to feed the 5,000?",
                Type = CardQuestionType.OptionSelection,
                OptionsJson = JsonSerializer.Serialize(new[] { "A) 5 loaves & 2 fish", "B) 7 loaves & 3 fish", "C) 2 loaves & 5 fish", "D) 12 loaves" }),
                Answer = "A) 5 loaves and 2 fish (Matthew 14:17-21)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000023"),
                Text = "Zacchaeus climbed a sycamore tree to see Jesus passing by?",
                Type = CardQuestionType.TrueFalse,
                OptionsJson = (string?)null,
                Answer = "True (Luke 19:4)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000024"),
                Text = "Who was the first man created according to the Book of Genesis?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Adam (Genesis 2:7)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000025"),
                Text = "In what language was the New Testament originally written?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Koine Greek",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000026"),
                Text = "What was the name of the garden where God placed Adam and Eve?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "The Garden of Eden (Genesis 2:8)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000027"),
                Text = "Who succeeded Moses as the leader of the people of Israel?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Joshua (Joshua 1:1-2)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000028"),
                Text = "How many books compose the New Testament?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "27 books",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000029"),
                Text = "Which Jewish queen risked her life to save her people from Haman's plot?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "Queen Esther (Esther 4:16)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000030"),
                Text = "Who wrote the Book of Revelation on the island of Patmos?",
                Type = CardQuestionType.OpenQuestion,
                OptionsJson = (string?)null,
                Answer = "The Apostle John (Revelation 1:9)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            // English Wildcards (Gift Points)
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000101"),
                Text = "🌟 GIFT POINTS! You drew a wildcard card! You earn 3 free points added directly to your score!",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Wildcard (+3 gift points)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000102"),
                Text = "🌟 EXTRA BLESSING! Congratulations! This card is a special gift granting you 3 direct points.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Wildcard (+3 gift points)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000103"),
                Text = "🌟 FREE PASS OF GRACE! Free points! Add 3 automatic points with no questions asked.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Wildcard (+3 gift points)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000104"),
                Text = "🌟 GOLDEN WILDCARD! You unlocked a direct 3-point bonus for your tally.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Wildcard (+3 gift points)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000105"),
                Text = "🌟 LUCKY CARD! Fortune smiles on you: 3 bonus points added immediately to your score!",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Wildcard (+3 gift points)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000106"),
                Text = "🌟 HOUSE GIFT! What a great surprise! This slot gifts you a 3-point bonus.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Wildcard (+3 gift points)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000107"),
                Text = "🌟 SUPER WILDCARD! You found the prize card. Receive 3 direct points this turn.",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Wildcard (+3 gift points)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            },
            new
            {
                Id = Guid.Parse("20000000-0000-0000-0000-000000000108"),
                Text = "🌟 FULL GRACE! A gift for your scoreboard: 3 points granted instantly!",
                Type = CardQuestionType.Wildcard,
                OptionsJson = (string?)null,
                Answer = "🌟 Wildcard (+3 gift points)",
                Language = "en",
                CreatedAt = baseDate,
                UpdatedAt = (DateTime?)null
            }
        };

        modelBuilder.Entity<CardQuestion>().HasData(questions);
    }
}
