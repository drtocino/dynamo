import { inject } from '@angular/core';
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { GameState, PlayerIntent, StateDelta, StateSnapshot } from '../core/models/game-state.model';
import { ConnectionService } from '../core/services/connection.service';

export interface GameStoreState {
  authoritativeState: GameState;
  unacknowledgedIntents: PlayerIntent[];
  clientId: string;
}

const initialGameState: GameState = {
  sequenceNumber: 0,
  sessionId: '',
  status: 'Lobby',
  serverTimeMs: 0,
  players: {},
  payload: null
};

export const GameStore = signalStore(
  { providedIn: 'root' },
  withState<GameStoreState>(() => ({
    authoritativeState: initialGameState,
    unacknowledgedIntents: [],
    clientId: localStorage.getItem('dynamo_client_id') || ''
  })),
  withComputed(({ authoritativeState, unacknowledgedIntents, clientId }) => {
    const effectiveState = computed(() => {
      const auth = authoritativeState();
      const intents = unacknowledgedIntents();
      const myId = clientId();

      // Deep clone / spread auth state
      const effective: GameState = {
        ...auth,
        players: { ...auth.players }
      };

      if (myId && effective.players[myId]) {
        effective.players[myId] = { ...effective.players[myId] };
      }

      // Optimistically replay pending intents that haven't been acknowledged
      for (const intent of intents) {
        if (intent.clientId === myId && effective.players[myId]) {
          const player = effective.players[myId];
          switch (intent.actionType?.toUpperCase()) {
            case 'START_GAME':
              effective.status = 'InProgress';
              break;
            case 'BUZZ_IN':
              player.score += 10;
              break;
            case 'ANSWER_SELECTED':
              player.score += 20;
              break;
            default:
              break;
          }
        }
      }

      return effective;
    });

    const playersList = computed(() => Object.values(effectiveState().players));
    const myPlayer = computed(() => {
      const id = clientId();
      return id ? effectiveState().players[id] || null : null;
    });
    const status = computed(() => effectiveState().status);

    return {
      effectiveState,
      playersList,
      myPlayer,
      status
    };
  }),
  withMethods((store, connectionService = inject(ConnectionService)) => ({
    setClientId(id: string) {
      patchState(store, { clientId: id });
    },

    applySnapshot(snapshot: StateSnapshot) {
      const myId = store.clientId();
      const authPlayer = snapshot.fullState.players[myId] 
        || (snapshot.fullState.players ? Object.values(snapshot.fullState.players).find(p => p.clientId === myId) : undefined);
      const lastAck = authPlayer ? authPlayer.lastAcknowledgedInputSequence : 0;

      // Reconciler: Prune acknowledged intents
      const remainingIntents = store.unacknowledgedIntents().filter(
        intent => intent.inputSequence > lastAck
      );

      patchState(store, {
        authoritativeState: snapshot.fullState,
        unacknowledgedIntents: remainingIntents
      });
    },

    applyDelta(delta: StateDelta) {
      const currentAuth = store.authoritativeState();
      const patch = delta.patch || {};

      const updatedPlayers = patch.players
        ? { ...currentAuth.players, ...patch.players }
        : currentAuth.players;

      const newAuth: GameState = {
        ...currentAuth,
        sequenceNumber: delta.sequenceNumber,
        serverTimeMs: patch.ServerTimeMs ?? patch.serverTimeMs ?? currentAuth.serverTimeMs,
        status: patch.Status ?? patch.status ?? currentAuth.status,
        players: updatedPlayers,
        payload: patch.Payload ?? patch.payload ?? currentAuth.payload
      };

      const myId = store.clientId();
      const authPlayer = newAuth.players[myId] 
        || (newAuth.players ? Object.values(newAuth.players).find(p => p.clientId === myId) : undefined);
      const lastAck = authPlayer ? authPlayer.lastAcknowledgedInputSequence : 0;

      // Reconciler: discard intents that server has already simulated
      const remainingIntents = store.unacknowledgedIntents().filter(
        intent => intent.inputSequence > lastAck
      );

      patchState(store, {
        authoritativeState: newAuth,
        unacknowledgedIntents: remainingIntents
      });
    },

    enqueuePrediction(intent: PlayerIntent) {
      patchState(store, {
        unacknowledgedIntents: [...store.unacknowledgedIntents(), intent]
      });
    },

    initSync(sessionId: string, clientId: string) {
      patchState(store, { clientId });
      connectionService.connect(sessionId, clientId);

      connectionService.stateDelta$.subscribe(delta => {
        this.applyDelta(delta);
      });

      connectionService.stateSnapshot$.subscribe(snapshot => {
        this.applySnapshot(snapshot);
      });
    }
  }))
);
