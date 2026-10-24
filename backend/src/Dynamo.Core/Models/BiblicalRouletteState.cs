using System.Text.Json.Serialization;

namespace Dynamo.Core.Models;

public class BiblicalRouletteState
{
    [JsonPropertyName("currentRoundIndex")]
    public int CurrentRoundIndex { get; set; } = 1;

    [JsonPropertyName("totalRounds")]
    public int TotalRounds { get; set; } = 3;

    [JsonPropertyName("currentPhraseId")]
    public Guid CurrentPhraseId { get; set; }

    [JsonPropertyName("maskedPhrase")]
    public string MaskedPhrase { get; set; } = string.Empty;

    [JsonPropertyName("generalHint")]
    public string GeneralHint { get; set; } = string.Empty;

    [JsonPropertyName("specificHint")]
    public string SpecificHint { get; set; } = string.Empty;

    [JsonPropertyName("hintRevealed")]
    public bool HintRevealed { get; set; }

    [JsonPropertyName("revealedConsonants")]
    public List<char> RevealedConsonants { get; set; } = new();

    [JsonPropertyName("revealedVowels")]
    public List<char> RevealedVowels { get; set; } = new();

    [JsonPropertyName("currentTurnPlayerId")]
    public string CurrentTurnPlayerId { get; set; } = string.Empty;

    [JsonPropertyName("currentTurnPlayerName")]
    public string CurrentTurnPlayerName { get; set; } = string.Empty;

    [JsonPropertyName("playerNames")]
    public Dictionary<string, string> PlayerNames { get; set; } = new();

    [JsonPropertyName("turnSequence")]
    public List<string> TurnSequence { get; set; } = new();

    [JsonPropertyName("currentVowelCost")]
    public int CurrentVowelCost { get; set; } = 100;

    [JsonPropertyName("lastSpinResult")]
    public string LastSpinResult { get; set; } = string.Empty;

    [JsonPropertyName("lastSpinValue")]
    public int LastSpinValue { get; set; }

    [JsonPropertyName("lastSpinAngle")]
    public double LastSpinAngle { get; set; }

    [JsonPropertyName("stagedConsonant")]
    public char? StagedConsonant { get; set; }

    [JsonPropertyName("lastRevealedCount")]
    public int LastRevealedCount { get; set; }

    [JsonPropertyName("lastPointsEarned")]
    public int LastPointsEarned { get; set; }

    [JsonPropertyName("turnStep")]
    public string TurnStep { get; set; } = "SelectConsonantOrBuy"; // "SelectConsonantOrBuy", "AwaitingSpin", "Spinning", "RoundEnded", "GameFinished"

    [JsonPropertyName("turnDeadlineUtc")]
    public DateTime? TurnDeadlineUtc { get; set; }

    [JsonPropertyName("isTurnTimerPaused")]
    public bool IsTurnTimerPaused { get; set; }

    [JsonPropertyName("isFirstSpinOfTurn")]
    public bool IsFirstSpinOfTurn { get; set; } = true;

    [JsonPropertyName("roundWinnerId")]
    public string? RoundWinnerId { get; set; }

    [JsonPropertyName("overallWinnerId")]
    public string? OverallWinnerId { get; set; }

    [JsonPropertyName("solvedPhrase")]
    public string SolvedPhrase { get; set; } = string.Empty;

    [JsonPropertyName("roundsWon")]
    public Dictionary<string, int> RoundsWon { get; set; } = new();

    [JsonPropertyName("lastIncorrectGuess")]
    public string? LastIncorrectGuess { get; set; }

    [JsonPropertyName("lastIncorrectGuessPlayerName")]
    public string? LastIncorrectGuessPlayerName { get; set; }

    [JsonPropertyName("lastIncorrectGuessId")]
    public string? LastIncorrectGuessId { get; set; }

    [JsonPropertyName("lastTurnTimeoutPlayerName")]
    public string? LastTurnTimeoutPlayerName { get; set; }

    [JsonPropertyName("lastTurnTimeoutNextPlayerName")]
    public string? LastTurnTimeoutNextPlayerName { get; set; }

    [JsonPropertyName("lastTurnTimeoutId")]
    public string? LastTurnTimeoutId { get; set; }
}
