import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { Player } from '../models/player.model';
import { SessionState } from '../models/session.model';
import { getSessionHubUrl } from '../config/api.config';

export interface PlayerLeftEvent {
  playerId: string;
  newHostClientId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private hubConnection: signalR.HubConnection | null = null;
  private currentSessionId: string | null = null;

  private playerJoinedSubject = new Subject<Player>();
  private playerLeftSubject = new Subject<PlayerLeftEvent>();
  private stateChangedSubject = new Subject<SessionState>();
  private turnAdvancedSubject = new Subject<string>();

  playerJoined$: Observable<Player> = this.playerJoinedSubject.asObservable();
  playerLeft$: Observable<PlayerLeftEvent> = this.playerLeftSubject.asObservable();
  stateChanged$: Observable<SessionState> = this.stateChangedSubject.asObservable();
  turnAdvanced$: Observable<string> = this.turnAdvancedSubject.asObservable();

  private get hubUrl(): string {
    return getSessionHubUrl();
  }

  async listenToSession(sessionId: string): Promise<void> {
    if (this.currentSessionId === sessionId && this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    this.currentSessionId = sessionId;

    if (!this.hubConnection) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.hubConnection.on('PlayerJoined', (player: any) => {
        this.playerJoinedSubject.next(player as Player);
      });

      this.hubConnection.on('PlayerLeft', (payload: any) => {
        this.playerLeftSubject.next(payload as PlayerLeftEvent);
      });

      this.hubConnection.on('SessionStateChanged', (payload: any) => {
        const state = (typeof payload === 'string' ? payload : payload?.state) as SessionState;
        this.stateChangedSubject.next(state);
      });

      this.hubConnection.on('TurnAdvanced', (payload: any) => {
        const activeId = typeof payload === 'string' ? payload : (payload?.activePlayerId as string);
        this.turnAdvancedSubject.next(activeId);
      });

      this.hubConnection.onreconnected(async () => {
        if (this.currentSessionId) {
          try {
            await this.hubConnection?.invoke('JoinSessionRoom', this.currentSessionId);
          } catch (err) {
            console.error('Failed to rejoin session room after reconnect', err);
          }
        }
      });
    }

    try {
      if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
        await this.hubConnection.start();
      }
      await this.hubConnection.invoke('JoinSessionRoom', sessionId);
    } catch (err) {
      console.error('Error connecting to SessionHub:', err);
    }
  }

  emitPlayerJoined(player: Player): void {
    this.playerJoinedSubject.next(player);
  }

  emitPlayerLeft(event: PlayerLeftEvent): void {
    this.playerLeftSubject.next(event);
  }

  emitStateChanged(state: SessionState): void {
    this.stateChangedSubject.next(state);
  }

  emitTurnAdvanced(activePlayerId: string): void {
    this.turnAdvancedSubject.next(activePlayerId);
  }
}
