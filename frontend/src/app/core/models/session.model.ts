import { MultiplayerMode } from './game.model';
import { Player } from './player.model';

export type SessionState = 'Configuring' | 'Lobby' | 'Active' | 'Ended';

export interface Client {
  id: string;
  clientId: string;
  sessionId: string;
  connectedAt: string;
}

export interface Session {
  id: string;
  roomCode: string;
  gameId: string;
  gameSlug: string;
  gameName: string;
  hostClientId: string;
  mode: MultiplayerMode;
  state: SessionState;
  maxPlayers: number;
  rounds: number;
  timeLimitSeconds: number;
  gameSettingsJson?: string;
  language?: string;
  createdAt: string;
  expiresAt: string;
  activePlayerId?: string;
  players: Player[];
}

export interface CreateSessionRequest {
  gameId: string;
  mode: MultiplayerMode;
  hostClientId: string;
  maxPlayers: number;
  rounds: number;
  timeLimitSeconds: number;
  gameSettingsJson?: string;
  language?: string;
}

export interface CreateSharedScreenSessionRequest extends CreateSessionRequest {
  playerNames: string[];
}
