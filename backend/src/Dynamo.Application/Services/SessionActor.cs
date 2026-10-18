using System.Text.Json;
using System.Threading.Channels;
using Dynamo.Core.Models;

namespace Dynamo.Application.Services;

public class SessionActor : IAsyncDisposable
{
    private readonly string _sessionId;
    private readonly IGameStateBroadcaster _broadcaster;
    private readonly Channel<PlayerIntent> _intentChannel;
    private readonly CancellationTokenSource _cts = new();
    private Task? _tickLoopTask;

    protected readonly object _stateLock = new();
    protected readonly GameState _state;

    public string SessionId => _sessionId;
    public GameState CurrentState
    {
        get
        {
            lock (_stateLock)
            {
                return CloneState(_state);
            }
        }
    }

    public SessionActor(string sessionId, IGameStateBroadcaster broadcaster)
    {
        _sessionId = sessionId;
        _broadcaster = broadcaster;
        _intentChannel = Channel.CreateUnbounded<PlayerIntent>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });

        _state = new GameState
        {
            SessionId = sessionId,
            SequenceNumber = 0,
            Status = "Lobby",
            ServerTimeMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            Players = new Dictionary<string, PlayerState>()
        };
    }

    public void Start()
    {
        if (_tickLoopTask == null)
        {
            _tickLoopTask = Task.Run(() => RunTickLoopAsync(_cts.Token));
        }
    }

    public bool EnqueueIntent(PlayerIntent intent)
    {
        return _intentChannel.Writer.TryWrite(intent);
    }

    public void RegisterPlayer(string clientId)
    {
        lock (_stateLock)
        {
            if (!_state.Players.ContainsKey(clientId))
            {
                _state.Players[clientId] = new PlayerState
                {
                    ClientId = clientId,
                    Score = 0,
                    IsConnected = true,
                    LastAcknowledgedInputSequence = 0
                };
            }
            else
            {
                _state.Players[clientId].IsConnected = true;
            }
        }
    }

    public void UnregisterPlayer(string clientId)
    {
        lock (_stateLock)
        {
            if (_state.Players.TryGetValue(clientId, out var player))
            {
                player.IsConnected = false;
            }
        }
    }

    public StateSnapshot GetSnapshot()
    {
        lock (_stateLock)
        {
            return new StateSnapshot
            {
                SequenceNumber = _state.SequenceNumber,
                FullState = CloneState(_state)
            };
        }
    }

    private async Task RunTickLoopAsync(CancellationToken cancellationToken)
    {
        // 10Hz tick loop = 100ms
        using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(100));

        try
        {
            while (!cancellationToken.IsCancellationRequested && await timer.WaitForNextTickAsync(cancellationToken))
            {
                List<PlayerIntent> batch = new();

                while (_intentChannel.Reader.TryRead(out var intent))
                {
                    batch.Add(intent);
                }

                lock (_stateLock)
                {
                    if (batch.Count > 0)
                    {
                        foreach (var intent in batch)
                        {
                            ApplyIntent(intent);
                        }
                    }

                    _state.SequenceNumber++;
                    _state.ServerTimeMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

                    // StateDelta emits every tick to keep smooth 10Hz sync
                    var delta = new StateDelta
                    {
                        SequenceNumber = _state.SequenceNumber,
                        Patch = new
                        {
                            SessionId = _state.SessionId,
                            ServerTimeMs = _state.ServerTimeMs,
                            Status = _state.Status,
                            Players = _state.Players,
                            Payload = _state.Payload
                        }
                    };

                    _ = _broadcaster.BroadcastDeltaAsync(_sessionId, delta);
                }
            }
        }
        catch (OperationCanceledException)
        {
            // Expected on actor shutdown
        }
    }

    protected virtual void ApplyIntent(PlayerIntent intent)
    {
        if (!_state.Players.TryGetValue(intent.ClientId, out var player))
        {
            player = new PlayerState
            {
                ClientId = intent.ClientId,
                Score = 0,
                IsConnected = true,
                LastAcknowledgedInputSequence = intent.InputSequence
            };
            _state.Players[intent.ClientId] = player;
        }

        player.LastAcknowledgedInputSequence = Math.Max(player.LastAcknowledgedInputSequence, intent.InputSequence);

        // Process game actions
        switch (intent.ActionType?.ToUpperInvariant())
        {
            case "START_GAME":
                _state.Status = "InProgress";
                break;
            case "BUZZ_IN":
                // If not already buzzed in payload, set buzz winner
                player.Score += 10;
                break;
            case "ANSWER_SELECTED":
                player.Score += 20;
                break;
            case "FINISH_GAME":
                _state.Status = "Finished";
                break;
            default:
                // Custom payload intent
                if (intent.Payload != null)
                {
                    _state.Payload = intent.Payload;
                }
                break;
        }
    }

    private static GameState CloneState(GameState source)
    {
        var json = JsonSerializer.Serialize(source);
        return JsonSerializer.Deserialize<GameState>(json) ?? new GameState();
    }

    public async ValueTask DisposeAsync()
    {
        _cts.Cancel();
        _intentChannel.Writer.TryComplete();

        if (_tickLoopTask != null)
        {
            try
            {
                await _tickLoopTask;
            }
            catch (OperationCanceledException) { }
        }

        _cts.Dispose();
    }
}
