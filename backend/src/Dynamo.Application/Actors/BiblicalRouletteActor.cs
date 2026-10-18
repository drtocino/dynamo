using System.Security.Cryptography;
using System.Text.Json;
using Dynamo.Application.Services;
using Dynamo.Core.Entities;
using Dynamo.Core.Enums;
using Dynamo.Core.Models;

namespace Dynamo.Application.Actors;

public class BiblicalRouletteActor : SessionActor
{
    private static readonly char[] Vowels = { 'A', 'E', 'I', 'O', 'U' };
    private static readonly int[] VowelPriceTiers = { 100, 250, 500, 1000 };
    
    // Exactly 20 roulette wedges:
    // 1 Bankrupt, 2 Miss Turn, 17 Price options
    public static readonly (string Label, int Value)[] WheelWedges = new[]
    {
        ("300", 300),
        ("500", 500),
        ("200", 200),
        ("MISS TURN", 0),
        ("700", 700),
        ("400", 400),
        ("600", 600),
        ("150", 150),
        ("BANKRUPT", 0),
        ("800", 800),
        ("250", 250),
        ("1000", 1000),
        ("350", 350),
        ("450", 450),
        ("MISS TURN", 0),
        ("550", 550),
        ("650", 650),
        ("750", 750),
        ("100", 100),
        ("900", 900)
    };

    private readonly List<Phrase> _phraseCatalog;
    private Phrase _currentPhrase = new();
    private readonly BiblicalRouletteState _rouletteState;
    private int _cumulativeSpins = 0;
    private bool _isSharedScreen = true;
    private string _hostClientId = string.Empty;
    private readonly Dictionary<string, string> _playerNames = new();
    private readonly Dictionary<string, string> _playerClientIds = new();
    private readonly HashSet<Guid> _usedPhraseIds = new();
    private Session? _session;
    private string _language = "es";

    public BiblicalRouletteState RouletteState => _rouletteState;

    public BiblicalRouletteActor(
        string sessionId, 
        IGameStateBroadcaster broadcaster,
        List<Phrase>? phrases = null,
        string language = "es") 
        : base(sessionId, broadcaster)
    {
        _language = string.IsNullOrWhiteSpace(language) ? "es" : language;
        _rouletteState = new BiblicalRouletteState
        {
            TotalRounds = 3,
            CurrentRoundIndex = 1,
            CurrentVowelCost = 100,
            TurnStep = "SelectConsonantOrBuy"
        };

        _phraseCatalog = phrases != null && phrases.Count > 0 
            ? new List<Phrase>(phrases) 
            : new List<Phrase>();

        _state.Payload = _rouletteState;
    }

    public void SetPlayerScore(string clientId, int score)
    {
        lock (_stateLock)
        {
            if (_state.Players.TryGetValue(clientId, out var player))
            {
                player.Score = score;
            }
        }
    }

    public void SetPhrases(List<Phrase> phrases)
    {
        lock (_stateLock)
        {
            if (phrases != null && phrases.Count > 0)
            {
                _phraseCatalog.Clear();
                _phraseCatalog.AddRange(phrases);
                _usedPhraseIds.Clear();
                if (_rouletteState.TurnStep == "SelectConsonantOrBuy" && _rouletteState.RevealedConsonants.Count == 0 && _rouletteState.RevealedVowels.Count == 0)
                {
                    StartRound(_rouletteState.CurrentRoundIndex);
                }
            }
        }
    }

    public void InitializeMatch(Session? session = null, List<Phrase>? phrases = null)
    {
        lock (_stateLock)
        {
            _state.Status = "InProgress";
            _usedPhraseIds.Clear();
            if (session != null)
            {
                _session = session;
                if (!string.IsNullOrWhiteSpace(session.Language))
                {
                    _language = session.Language;
                }
            }
            else if (_session != null)
            {
                session = _session;
            }

            if (phrases != null && phrases.Count > 0)
            {
                _phraseCatalog.Clear();
                _phraseCatalog.AddRange(phrases);
            }

            if (session != null)
            {
                _isSharedScreen = session.Mode == MultiplayerMode.SharedScreen;
                _hostClientId = session.HostClientId.ToString();

                foreach (var p in session.Players)
                {
                    var pid = p.Id.ToString();
                    _playerNames[pid] = p.Name;
                    _playerClientIds[pid] = p.ClientId.ToString();
                    if (!_state.Players.ContainsKey(pid))
                    {
                        _state.Players[pid] = new PlayerState
                        {
                            ClientId = pid,
                            Score = 0,
                            IsConnected = true
                        };
                    }
                }
            }

            _rouletteState.RoundsWon.Clear();
            _rouletteState.PlayerNames = new Dictionary<string, string>(_playerNames);
            foreach (var player in _state.Players.Values)
            {
                player.Score = 0;
                _rouletteState.RoundsWon[player.ClientId] = 0;
            }
            StartRound(1);
        }
    }

    private void StartRound(int roundIndex)
    {
        _rouletteState.CurrentRoundIndex = roundIndex;
        if (roundIndex == 1)
        {
            _rouletteState.RoundWinnerId = null;
            _rouletteState.OverallWinnerId = null;
            _rouletteState.SolvedPhrase = string.Empty;
            _usedPhraseIds.Clear();
        }
        _rouletteState.RevealedConsonants.Clear();
        _rouletteState.RevealedVowels.Clear();
        _rouletteState.HintRevealed = false;
        _rouletteState.CurrentVowelCost = 100;
        _rouletteState.TurnStep = "SelectConsonantOrBuy";
        _rouletteState.StagedConsonant = null;
        _rouletteState.LastRevealedCount = 0;
        _rouletteState.LastPointsEarned = 0;

        // Pick phrase randomly for this round without repeating phrases in the match
        var availablePhrases = _phraseCatalog.Where(p => !_usedPhraseIds.Contains(p.Id)).ToList();
        if (availablePhrases.Count == 0)
        {
            _usedPhraseIds.Clear();
            availablePhrases = _phraseCatalog.ToList();
        }

        if (availablePhrases.Count == 0)
        {
            _currentPhrase = new Phrase
            {
                Id = Guid.NewGuid(),
                Text = "DYNAMO",
                GeneralHint = "Biblia",
                SpecificHint = "Versículo bíblico",
                Language = _language
            };
        }
        else
        {
            int phraseIndex = availablePhrases.Count > 1 
                ? RandomNumberGenerator.GetInt32(availablePhrases.Count) 
                : 0;

            _currentPhrase = availablePhrases[phraseIndex];
            _usedPhraseIds.Add(_currentPhrase.Id);
        }

        _rouletteState.CurrentPhraseId = _currentPhrase.Id;
        _rouletteState.GeneralHint = _currentPhrase.GeneralHint;
        _rouletteState.SpecificHint = _currentPhrase.SpecificHint;
        UpdateMaskedPhrase();

        // Turns sequence determined by luck at round start
        var candidatePlayers = _playerNames.Keys.ToList();
        if (candidatePlayers.Count == 0)
        {
            candidatePlayers = _state.Players.Keys.ToList();
        }
        if (candidatePlayers.Count == 0)
        {
            candidatePlayers.Add("Player 1");
            _state.Players["Player 1"] = new PlayerState { ClientId = "Player 1", Score = 0 };
            _playerNames["Player 1"] = "Player 1";
        }

        // Shuffle player turn sequence randomly
        var shuffled = candidatePlayers.OrderBy(_ => RandomNumberGenerator.GetInt32(int.MaxValue)).ToList();
        _rouletteState.TurnSequence = shuffled;
        _rouletteState.CurrentTurnPlayerId = shuffled.First();
        _rouletteState.CurrentTurnPlayerName = _playerNames.TryGetValue(_rouletteState.CurrentTurnPlayerId, out var pName)
            ? pName
            : _rouletteState.CurrentTurnPlayerId;
        _rouletteState.PlayerNames = new Dictionary<string, string>(_playerNames);

        if (_session != null && Guid.TryParse(_rouletteState.CurrentTurnPlayerId, out var activeGuid))
        {
            _session.ActivePlayerId = activeGuid;
        }
    }

    protected override void ApplyIntent(PlayerIntent intent)
    {
        base.ApplyIntent(intent);

        var action = intent.ActionType?.ToUpperInvariant();
        switch (action)
        {
            case "START_GAME":
                InitializeMatch();
                _state.Status = "InProgress";
                break;

            case "SELECT_CONSONANT":
            case "GUESS_CONSONANT":
                HandleSelectConsonant(intent.ClientId, intent.Payload);
                break;

            case "SPIN_ROULETTE":
                HandleSpinRoulette(intent.ClientId, intent.Payload);
                break;

            case "PURCHASE_VOWEL":
                HandlePurchaseVowel(intent.ClientId, intent.Payload);
                break;

            case "PURCHASE_HINT":
                HandlePurchaseHint(intent.ClientId);
                break;

            case "SOLVE_PHRASE":
                HandleSolvePhrase(intent.ClientId, intent.Payload);
                break;

            case "ADVANCE_TURN":
                AdvanceToNextTurn();
                break;

            case "SET_PHRASES":
                HandleSetPhrases(intent.Payload);
                break;

            case "SET_LANGUAGE":
                HandleSetLanguage(intent.Payload);
                break;
        }

        _state.Payload = _rouletteState;
    }

    private bool IsTurnAuthorized(string clientId)
    {
        // Biblical Roulette is an authoritative shared-screen turn game; all connected players can advance turns
        return true;
    }

    private PlayerState GetCurrentTurnPlayerState()
    {
        var turnPlayerId = _rouletteState.CurrentTurnPlayerId;
        if (!string.IsNullOrEmpty(turnPlayerId) && _state.Players.TryGetValue(turnPlayerId, out var player))
        {
            return player;
        }
        if (_state.Players.Count > 0)
        {
            return _state.Players.Values.First();
        }
        var p = new PlayerState { ClientId = turnPlayerId, Score = 0 };
        _state.Players[turnPlayerId] = p;
        return p;
    }

    private void HandleSelectConsonant(string clientId, object? payload)
    {
        if (!IsTurnAuthorized(clientId)) return;
        if (_rouletteState.TurnStep != "SelectConsonantOrBuy" && _rouletteState.TurnStep != "AwaitingSpin") return;

        char? guessedChar = ExtractChar(payload);
        if (!guessedChar.HasValue) return;

        char letter = char.ToUpperInvariant(guessedChar.Value);

        // Must be consonant
        if (Vowels.Contains(letter) || !char.IsLetter(letter))
        {
            return;
        }

        // Cannot pick already revealed consonant
        if (_rouletteState.RevealedConsonants.Contains(letter))
        {
            return;
        }

        _rouletteState.RoundWinnerId = null;
        _rouletteState.SolvedPhrase = string.Empty;
        _rouletteState.StagedConsonant = letter;
        _rouletteState.TurnStep = "AwaitingSpin";
    }

    private void HandleSpinRoulette(string clientId, object? payload = null)
    {
        if (!IsTurnAuthorized(clientId)) return;
        if (_rouletteState.TurnStep != "AwaitingSpin" && _rouletteState.TurnStep != "SelectConsonantOrBuy") return;

        _rouletteState.RoundWinnerId = null;
        _rouletteState.SolvedPhrase = string.Empty;

        // If payload contains consonant letter, stage it
        if (!_rouletteState.StagedConsonant.HasValue && payload != null)
        {
            char? guessedChar = ExtractChar(payload);
            if (guessedChar.HasValue)
            {
                char letter = char.ToUpperInvariant(guessedChar.Value);
                if (!Vowels.Contains(letter) && !_rouletteState.RevealedConsonants.Contains(letter))
                {
                    _rouletteState.StagedConsonant = letter;
                }
            }
        }

        // If no consonant was staged yet (fallback if player immediately spun), default to first unrevealed consonant
        if (!_rouletteState.StagedConsonant.HasValue)
        {
            var consonants = "BCDFGHJKLMNPQRSTVWXYZ";
            var available = consonants.FirstOrDefault(c => !_rouletteState.RevealedConsonants.Contains(c));
            if (available != default)
            {
                _rouletteState.StagedConsonant = available;
            }
        }

        int wedgeIndex = RandomNumberGenerator.GetInt32(WheelWedges.Length);
        var wedge = WheelWedges[wedgeIndex];

        _cumulativeSpins++;
        // EXACT mathematical pointer landing:
        // Wedge i center is at: (wedgeIndex * 18.0) + 9.0 degrees clockwise from 12 o'clock.
        // Rotating the wheel clockwise by: (loops * 360) - ((wedgeIndex * 18.0) + 9.0)
        // lands wedge i PRECISELY under the pointer arrow at 12 o'clock!
        double targetAngle = (_cumulativeSpins * 360.0 * 5) - ((wedgeIndex * 18.0) + 9.0);

        _rouletteState.LastSpinResult = wedge.Label;
        _rouletteState.LastSpinValue = wedge.Value;
        _rouletteState.LastSpinAngle = targetAngle;

        char? staged = _rouletteState.StagedConsonant;

        if (wedge.Label == "BANKRUPT")
        {
            var turnPlayer = GetCurrentTurnPlayerState();
            turnPlayer.Score = 0;
            _rouletteState.LastPointsEarned = 0;
            _rouletteState.LastRevealedCount = 0;
            _rouletteState.StagedConsonant = null;
            AdvanceToNextTurn();
        }
        else if (wedge.Label == "MISS TURN")
        {
            _rouletteState.LastPointsEarned = 0;
            _rouletteState.LastRevealedCount = 0;
            _rouletteState.StagedConsonant = null;
            AdvanceToNextTurn();
        }
        else if (staged.HasValue)
        {
            char letter = staged.Value;
            _rouletteState.RevealedConsonants.Add(letter);
            string textUpper = _currentPhrase.Text.ToUpperInvariant();
            int count = textUpper.Count(c => c == letter);

            _rouletteState.LastRevealedCount = count;
            _rouletteState.StagedConsonant = null;

            if (count > 0)
            {
                var turnPlayer = GetCurrentTurnPlayerState();
                int earned = count * wedge.Value;
                turnPlayer.Score += earned;
                _rouletteState.LastPointsEarned = earned;
                UpdateMaskedPhrase();

                if (IsPhraseFullyRevealed())
                {
                    AwardRoundWin(turnPlayer.ClientId);
                }
                else
                {
                    // Player retains turn to pick another consonant or buy vowel!
                    _rouletteState.TurnStep = "SelectConsonantOrBuy";
                }
            }
            else
            {
                // Consonant not in phrase: turn passes
                _rouletteState.LastPointsEarned = 0;
                AdvanceToNextTurn();
            }
        }
    }

    private void HandlePurchaseVowel(string clientId, object? payload)
    {
        if (!IsTurnAuthorized(clientId)) return;
        if (_rouletteState.TurnStep != "SelectConsonantOrBuy" && _rouletteState.TurnStep != "AwaitingSpin") return;

        _rouletteState.RoundWinnerId = null;
        _rouletteState.SolvedPhrase = string.Empty;

        char? guessedChar = ExtractChar(payload);
        if (!guessedChar.HasValue) return;

        char vowel = char.ToUpperInvariant(guessedChar.Value);
        if (!Vowels.Contains(vowel)) return;

        var turnPlayer = GetCurrentTurnPlayerState();
        if (turnPlayer.Score < _rouletteState.CurrentVowelCost) return;

        string textUpper = _currentPhrase.Text.ToUpperInvariant();
        int count = textUpper.Count(c => c == vowel);
        bool found = count > 0;

        // Multiply vowel purchase price by the count of letters found in the phrase
        int totalCost = _rouletteState.CurrentVowelCost * count;
        turnPlayer.Score = Math.Max(0, turnPlayer.Score - totalCost);
        _rouletteState.LastRevealedCount = count;
        _rouletteState.LastPointsEarned = totalCost;

        // Advance vowel tier: 100 -> 250 -> 500 -> 1000
        int currentTierIndex = Array.IndexOf(VowelPriceTiers, _rouletteState.CurrentVowelCost);
        if (currentTierIndex >= 0 && currentTierIndex < VowelPriceTiers.Length - 1)
        {
            _rouletteState.CurrentVowelCost = VowelPriceTiers[currentTierIndex + 1];
        }

        if (!_rouletteState.RevealedVowels.Contains(vowel))
        {
            _rouletteState.RevealedVowels.Add(vowel);
        }

        _rouletteState.StagedConsonant = null;
        UpdateMaskedPhrase();

        if (IsPhraseFullyRevealed())
        {
            AwardRoundWin(turnPlayer.ClientId);
        }
        else if (found)
        {
            _rouletteState.TurnStep = "SelectConsonantOrBuy";
        }
        else
        {
            AdvanceToNextTurn();
        }
    }

    private void HandlePurchaseHint(string clientId)
    {
        if (!IsTurnAuthorized(clientId)) return;
        if (_rouletteState.HintRevealed) return;

        _rouletteState.RoundWinnerId = null;
        _rouletteState.SolvedPhrase = string.Empty;

        var turnPlayer = GetCurrentTurnPlayerState();
        if (turnPlayer.Score < 500) return;

        turnPlayer.Score -= 500;
        _rouletteState.HintRevealed = true;
    }

    private void HandleSolvePhrase(string clientId, object? payload)
    {
        if (!IsTurnAuthorized(clientId)) return;

        string guess = ExtractString(payload).Trim();
        string cleanActual = CleanPhrase(_currentPhrase.Text);
        string cleanGuess = CleanPhrase(guess);

        var turnPlayer = GetCurrentTurnPlayerState();

        if (string.Equals(cleanActual, cleanGuess, StringComparison.OrdinalIgnoreCase))
        {
            RevealAllLetters();
            var winnerId = !string.IsNullOrEmpty(turnPlayer.ClientId) ? turnPlayer.ClientId : clientId;
            AwardRoundWin(winnerId);
        }
        else
        {
            AdvanceToNextTurn();
        }
    }

    private void AwardRoundWin(string playerId)
    {
        _rouletteState.SolvedPhrase = _currentPhrase.Text;
        RevealAllLetters();
        _rouletteState.RoundWinnerId = playerId;
        if (!_rouletteState.RoundsWon.ContainsKey(playerId))
        {
            _rouletteState.RoundsWon[playerId] = 0;
        }
        _rouletteState.RoundsWon[playerId]++;

        if (_rouletteState.CurrentRoundIndex >= _rouletteState.TotalRounds)
        {
            // End of entire game
            _state.Status = "Finished";
            _rouletteState.TurnStep = "GameFinished";

            // Determine overall winner with most phrases solved
            var topWinner = _rouletteState.RoundsWon
                .OrderByDescending(kv => kv.Value)
                .ThenByDescending(kv => _state.Players.TryGetValue(kv.Key, out var p) ? p.Score : 0)
                .FirstOrDefault();

            _rouletteState.OverallWinnerId = topWinner.Key;
        }
        else
        {
            _rouletteState.TurnStep = "RoundEnded";
            // Start next round
            StartRound(_rouletteState.CurrentRoundIndex + 1);
        }
    }

    private void AdvanceToNextTurn()
    {
        _rouletteState.TurnStep = "SelectConsonantOrBuy";
        _rouletteState.StagedConsonant = null;
        var sequence = _rouletteState.TurnSequence;
        if (sequence.Count == 0) return;

        int currentIndex = sequence.IndexOf(_rouletteState.CurrentTurnPlayerId);
        int nextIndex = currentIndex >= 0 ? (currentIndex + 1) % sequence.Count : 0;
        _rouletteState.CurrentTurnPlayerId = sequence[nextIndex];
        _rouletteState.CurrentTurnPlayerName = _playerNames.TryGetValue(_rouletteState.CurrentTurnPlayerId, out var name)
            ? name
            : _rouletteState.CurrentTurnPlayerId;

        if (_session != null && Guid.TryParse(_rouletteState.CurrentTurnPlayerId, out var activeGuid))
        {
            _session.ActivePlayerId = activeGuid;
        }
    }

    private void UpdateMaskedPhrase()
    {
        var text = _currentPhrase.Text.ToUpperInvariant();
        var chars = text.Select(c =>
        {
            if (!char.IsLetter(c)) return c;
            if (_rouletteState.RevealedConsonants.Contains(c) || _rouletteState.RevealedVowels.Contains(c))
            {
                return c;
            }
            return '_';
        });

        _rouletteState.MaskedPhrase = new string(chars.ToArray());
    }

    private void RevealAllLetters()
    {
        var text = _currentPhrase.Text.ToUpperInvariant();
        foreach (char c in text.Where(char.IsLetter))
        {
            if (Vowels.Contains(c))
            {
                if (!_rouletteState.RevealedVowels.Contains(c)) _rouletteState.RevealedVowels.Add(c);
            }
            else
            {
                if (!_rouletteState.RevealedConsonants.Contains(c)) _rouletteState.RevealedConsonants.Add(c);
            }
        }
        UpdateMaskedPhrase();
    }

    private bool IsPhraseFullyRevealed()
    {
        var text = _currentPhrase.Text.ToUpperInvariant();
        return text.Where(char.IsLetter).All(c =>
            _rouletteState.RevealedConsonants.Contains(c) || _rouletteState.RevealedVowels.Contains(c));
    }

    private static string CleanPhrase(string phrase)
    {
        return new string(phrase.Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());
    }

    private static char? ExtractChar(object? payload)
    {
        if (payload == null) return null;
        if (payload is JsonElement elem)
        {
            if (elem.ValueKind == JsonValueKind.String)
            {
                var s = elem.GetString();
                return string.IsNullOrEmpty(s) ? null : s[0];
            }
            if (elem.ValueKind == JsonValueKind.Object && elem.TryGetProperty("letter", out var lProp))
            {
                var s = lProp.GetString();
                return string.IsNullOrEmpty(s) ? null : s[0];
            }
        }
        if (payload is string str && str.Length > 0) return str[0];
        if (payload is char c) return c;
        return null;
    }

    private static string ExtractString(object? payload)
    {
        if (payload == null) return string.Empty;
        if (payload is JsonElement elem)
        {
            if (elem.ValueKind == JsonValueKind.String) return elem.GetString() ?? string.Empty;
            if (elem.ValueKind == JsonValueKind.Object && elem.TryGetProperty("phrase", out var pProp))
            {
                return pProp.GetString() ?? string.Empty;
            }
        }
        return payload.ToString() ?? string.Empty;
    }

    private void HandleSetPhrases(object? payload)
    {
        if (payload == null) return;
        try
        {
            List<Phrase>? list = null;
            if (payload is JsonElement elem)
            {
                var targetElem = elem;
                if (elem.ValueKind == JsonValueKind.Object && elem.TryGetProperty("phrases", out var pArray))
                {
                    targetElem = pArray;
                }

                if (targetElem.ValueKind == JsonValueKind.Array)
                {
                    try
                    {
                        list = JsonSerializer.Deserialize<List<Phrase>>(targetElem.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    }
                    catch
                    {
                        var strList = JsonSerializer.Deserialize<List<string>>(targetElem.GetRawText());
                        if (strList != null)
                        {
                            list = strList.Select(s => new Phrase { Text = s, GeneralHint = "Biblia", SpecificHint = s, Category = "General", Language = _language }).ToList();
                        }
                    }
                }
            }

            if (list != null && list.Count > 0)
            {
                SetPhrases(list);
            }
        }
        catch
        {
            // Ignore invalid payload format
        }
    }

    private void HandleSetLanguage(object? payload)
    {
        if (payload == null) return;
        string? lang = null;
        if (payload is JsonElement elem)
        {
            if (elem.ValueKind == JsonValueKind.String) lang = elem.GetString();
            else if (elem.ValueKind == JsonValueKind.Object && elem.TryGetProperty("language", out var lProp)) lang = lProp.GetString();
        }
        else
        {
            lang = payload.ToString();
        }

        if (!string.IsNullOrWhiteSpace(lang))
        {
            _language = lang;
        }
    }
}
