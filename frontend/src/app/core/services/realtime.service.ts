import { Injectable, inject } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Player } from '../models/player.model';
import { SessionState } from '../models/session.model';
import { SupabaseService } from './supabase.service';

export interface PlayerLeftEvent {
  playerId: string;
  newHostClientId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private supabaseService = inject(SupabaseService);

  private playerJoinedSubject = new Subject<Player>();
  private playerLeftSubject = new Subject<PlayerLeftEvent>();
  private stateChangedSubject = new Subject<SessionState>();
  private turnAdvancedSubject = new Subject<string>();

  playerJoined$: Observable<Player> = this.playerJoinedSubject.asObservable();
  playerLeft$: Observable<PlayerLeftEvent> = this.playerLeftSubject.asObservable();
  stateChanged$: Observable<SessionState> = this.stateChangedSubject.asObservable();
  turnAdvanced$: Observable<string> = this.turnAdvancedSubject.asObservable();

  listenToSession(sessionId: string): void {
    const channel = this.supabaseService.getChannel(`session:${sessionId}`);
    if (channel) {
      channel
        .on('broadcast', { event: 'PlayerJoined' }, payload => {
          this.playerJoinedSubject.next(payload['payload'] as Player);
        })
        .on('broadcast', { event: 'PlayerLeft' }, payload => {
          this.playerLeftSubject.next(payload['payload'] as PlayerLeftEvent);
        })
        .on('broadcast', { event: 'SessionStateChanged' }, payload => {
          this.stateChangedSubject.next(payload['payload']?.state as SessionState);
        })
        .on('broadcast', { event: 'TurnAdvanced' }, payload => {
          this.turnAdvancedSubject.next(payload['payload']?.activePlayerId as string);
        })
        .subscribe();
    }
  }

  // Local notification triggers for optimistic UI / local testing
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
