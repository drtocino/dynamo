import { Injectable, inject } from '@angular/core';
import { GameStore } from '../../store/game.store';
import { ConnectionService } from './connection.service';
import { PlayerIntent } from '../models/game-state.model';

@Injectable({
  providedIn: 'root'
})
export class InputService {
  private gameStore = inject(GameStore);
  private connectionService = inject(ConnectionService);

  private clientSequence = 0;

  public async dispatchIntent(actionType: string, payload: any = null, targetSessionId?: string): Promise<PlayerIntent> {
    this.clientSequence++;

    const sessionId = targetSessionId || this.gameStore.authoritativeState().sessionId;
    const clientId = this.gameStore.clientId();

    const intent: PlayerIntent = {
      inputSequence: this.clientSequence,
      clientId,
      sessionId,
      timestamp: Date.now(),
      actionType,
      payload
    };

    // 1. Optimistic Client-Side Prediction
    this.gameStore.enqueuePrediction(intent);

    // 2. Dispatch across network to Authoritative Server
    await this.connectionService.sendIntent(intent);

    return intent;
  }

  public resetSequence(): void {
    this.clientSequence = 0;
  }
}
