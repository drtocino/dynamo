export type GameStatus = 'Lobby' | 'Starting' | 'InProgress' | 'Finished';

export interface PlayerState {
  clientId: string;
  score: number;
  isConnected: boolean;
  lastAcknowledgedInputSequence: number;
}

export interface GameState {
  sequenceNumber: number;
  sessionId: string;
  status: GameStatus;
  serverTimeMs: number;
  players: Record<string, PlayerState>;
  payload: any;
}

export interface PlayerIntent {
  inputSequence: number;
  clientId: string;
  sessionId: string;
  timestamp: number;
  actionType: string;
  payload: any;
}

export interface StateSnapshot {
  sequenceNumber: number;
  fullState: GameState;
}

export interface StateDelta {
  sequenceNumber: number;
  patch: any;
}
