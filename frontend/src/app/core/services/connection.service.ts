import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { PlayerIntent, StateDelta, StateSnapshot } from '../models/game-state.model';

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {
  private hubConnection: signalR.HubConnection | null = null;
  private currentSessionId: string | null = null;
  private currentClientId: string | null = null;

  private stateDeltaSubject = new Subject<StateDelta>();
  private stateSnapshotSubject = new Subject<StateSnapshot>();
  private connectionStatusSubject = new BehaviorSubject<ConnectionStatus>('disconnected');
  private systemMessageSubject = new Subject<{ messageType: string; payload: any }>();

  public stateDelta$: Observable<StateDelta> = this.stateDeltaSubject.asObservable();
  public stateSnapshot$: Observable<StateSnapshot> = this.stateSnapshotSubject.asObservable();
  public connectionStatus$: Observable<ConnectionStatus> = this.connectionStatusSubject.asObservable();
  public systemMessage$: Observable<{ messageType: string; payload: any }> = this.systemMessageSubject.asObservable();

  private hubUrl = 'http://localhost:5000/hub/game';

  public async connect(sessionId: string, clientId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      if (this.currentSessionId === sessionId) {
        return;
      }
      await this.disconnect();
    }

    this.currentSessionId = sessionId;
    this.currentClientId = clientId;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff with jitter up to 10 seconds
          const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 10000);
          return delay;
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.registerEventHandlers();

    try {
      this.connectionStatusSubject.next('reconnecting');
      await this.hubConnection.start();
      this.connectionStatusSubject.next('connected');

      // Join the game session group on the server
      await this.hubConnection.invoke('JoinGameSession', sessionId, clientId);
    } catch (err) {
      console.error('SignalR connection error:', err);
      this.connectionStatusSubject.next('disconnected');
      // Retry in 2s if initial connect fails
      setTimeout(() => {
        if (this.currentSessionId === sessionId && this.connectionStatusSubject.value === 'disconnected') {
          this.connect(sessionId, clientId);
        }
      }, 2000);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.hubConnection) {
      if (this.currentSessionId && this.currentClientId && this.hubConnection.state === signalR.HubConnectionState.Connected) {
        try {
          await this.hubConnection.invoke('LeaveGameSession', this.currentSessionId, this.currentClientId);
        } catch {
          // Ignore error during teardown
        }
      }

      await this.hubConnection.stop();
      this.hubConnection = null;
      this.currentSessionId = null;
      this.currentClientId = null;
      this.connectionStatusSubject.next('disconnected');
    }
  }

  public async sendIntent(intent: PlayerIntent): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('SubmitIntent', intent);
    }
  }

  public async requestSnapshot(sessionId: string): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.invoke('RequestSnapshot', sessionId);
    }
  }

  private registerEventHandlers(): WiNull {
    if (!this.hubConnection) return;

    this.hubConnection.on('ReceiveStateDelta', (delta: StateDelta) => {
      this.stateDeltaSubject.next(delta);
    });

    this.hubConnection.on('ReceiveStateSnapshot', (snapshot: StateSnapshot) => {
      this.stateSnapshotSubject.next(snapshot);
    });

    this.hubConnection.on('ReceiveSystemMessage', (messageType: string, payload: any) => {
      this.systemMessageSubject.next({ messageType, payload });
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionStatusSubject.next('reconnecting');
    });

    this.hubConnection.onreconnected(async () => {
      this.connectionStatusSubject.next('connected');
      // Automatically request full state snapshot to catch up after reconnecting
      if (this.currentSessionId && this.currentClientId) {
        try {
          await this.hubConnection?.invoke('JoinGameSession', this.currentSessionId, this.currentClientId);
          await this.requestSnapshot(this.currentSessionId);
        } catch (err) {
          console.error('Failed to resync state after reconnect:', err);
        }
      }
    });

    this.hubConnection.onclose(() => {
      this.connectionStatusSubject.next('disconnected');
    });
  }
}
type WiNull = void;
