import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService } from '../../../core/services/session.service';
import { RealtimeService } from '../../../core/services/realtime.service';
import { Session } from '../../../core/models/session.model';
import { Player } from '../../../core/models/player.model';
import { TurnTrackerComponent } from './turn-tracker.component';
import { GameStore } from '../../../store/game.store';
import { InputService } from '../../../core/services/input.service';
import { BiblicalRouletteComponent } from './biblical-roulette/biblical-roulette.component';

@Component({
  selector: 'app-active-match',
  standalone: true,
  imports: [CommonModule, TurnTrackerComponent, BiblicalRouletteComponent],
  template: `
    <div *ngIf="session" class="max-w-4xl mx-auto space-y-6">
      <!-- Active Match Header Banner -->
      <div class="neo-card bg-neo-cyan text-neo-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="neo-badge bg-neo-black text-white">LIVE MATCH</span>
            <span class="text-xs font-black uppercase tracking-wider">Room: {{ session.roomCode }}</span>
          </div>
          <h1 class="text-3xl font-black">{{ session.gameName }}</h1>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <button 
            (click)="returnToLobby()"
            class="neo-btn-primary bg-white hover:bg-neo-gray text-neo-black text-xs py-2 px-4">
            🔄 Return to Lobby
          </button>
          <button 
            (click)="exitToHub()"
            class="neo-btn-secondary text-xs py-2 px-3">
            ✕ Exit Match
          </button>
        </div>
      </div>

      <!-- Biblical Roulette Mode Container -->
      <app-biblical-roulette 
        *ngIf="session.gameSlug === 'biblical-roulette' || session.mode === 'BiblicalRoulette'; else genericGameView"
        [session]="session">
      </app-biblical-roulette>

      <!-- Generic Game Sandbox Display Container -->
      <ng-template #genericGameView>
        <!-- Turn Tracker & Round Information -->
        <app-turn-tracker 
          [players]="session.players"
          [activePlayer]="activePlayer"
          [timeLimitSeconds]="session.timeLimitSeconds"
          [currentRound]="currentRound"
          [totalRounds]="session.rounds"
          [canControlTurn]="isHost || isActivePlayer"
          (advanceTurn)="handleAdvanceTurn()">
        </app-turn-tracker>

        <div class="neo-card bg-white p-8 text-center space-y-6">
          <div class="inline-block p-4 bg-neo-bg rounded-2xl border-3 border-neo-black shadow-neo">
            <span class="text-5xl block mb-2">{{ getMockGameIcon() }}</span>
            <h2 class="text-2xl font-black text-neo-black">{{ getMockGamePromptTitle() }}</h2>
            <p class="font-bold text-sm text-neo-muted max-w-md mx-auto mt-2">
              {{ getMockGamePromptDescription() }}
            </p>
          </div>

          <!-- Real-Time Interactive Actions (Client-Side Prediction Demo) -->
          <div class="flex flex-wrap justify-center gap-4 py-4">
            <button 
              (click)="handleBuzz()"
              class="neo-btn-primary bg-neo-yellow text-neo-black text-sm py-3 px-6 shadow-neo-sm hover:translate-y-0.5 transition-transform flex items-center gap-2">
              <span>⚡</span> Buzz In (+10 pts)
            </button>
            <button 
              (click)="handleAnswer()"
              class="neo-btn-primary bg-neo-pink text-white text-sm py-3 px-6 shadow-neo-sm hover:translate-y-0.5 transition-transform flex items-center gap-2">
              <span>🎯</span> Submit Answer (+20 pts)
            </button>
          </div>

          <!-- Simulated Interactive Scoreboard -->
          <div class="pt-6 border-t-3 border-neo-black">
            <h3 class="text-sm font-black uppercase tracking-wider text-neo-muted mb-3 flex items-center justify-center gap-2">
              <span>🏆</span> Authoritative Multiplayer Scores
              <span *ngIf="gameStore.unacknowledgedIntents().length" class="text-xs bg-neo-yellow px-2 py-0.5 rounded font-bold border border-neo-black">
                {{ gameStore.unacknowledgedIntents().length }} pending sync
              </span>
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div 
                *ngFor="let p of session.players; let idx = index"
                [class.border-neo-yellow]="p.id === activePlayer?.id"
                class="p-3 bg-neo-bg rounded-xl border-3 border-neo-black flex flex-col items-center">
                <span class="font-black text-sm text-neo-black truncate">{{ p.name }}</span>
                <span class="text-xs font-bold text-neo-muted mt-1">
                  Score: {{ getPlayerScore(p.clientId || p.id) }} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </div>
  `
})
export class ActiveMatchComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private realtime = inject(RealtimeService);
  public gameStore = inject(GameStore);
  private inputService = inject(InputService);

  session: Session | undefined;
  currentRound: number = 1;
  private subs: Subscription[] = [];

  get isHost(): boolean {
    if (!this.session) return false;
    return this.session.hostClientId === this.sessionService.getClientId();
  }

  get isActivePlayer(): boolean {
    if (!this.session || !this.activePlayer) return false;
    return this.activePlayer.clientId === this.sessionService.getClientId();
  }

  get activePlayer(): Player | undefined {
    if (!this.session || !this.session.players.length) return undefined;
    return this.session.players.find(p => p.id === this.session!.activePlayerId) || this.session.players[0];
  }

  getPlayerScore(clientId: string): number {
    const players = this.gameStore.effectiveState().players;
    if (players && players[clientId]) {
      return players[clientId].score;
    }
    return 0;
  }

  handleBuzz(): void {
    if (!this.session) return;
    this.inputService.dispatchIntent('BUZZ_IN', null, this.session.id);
  }

  handleAnswer(): void {
    if (!this.session) return;
    this.inputService.dispatchIntent('ANSWER_SELECTED', null, this.session.id);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.sessionService.getSessionById(id).subscribe(data => {
      if (!data) {
        this.router.navigate(['/']);
        return;
      }
      this.session = data;
      const clientId = this.sessionService.getClientId();
      this.realtime.listenToSession(data.id);
      this.gameStore.initSync(data.id, clientId);

      this.subs.push(
        this.realtime.turnAdvanced$.subscribe(activePlayerId => {
          if (this.session) {
            this.session.activePlayerId = activePlayerId;
          }
        }),
        this.realtime.stateChanged$.subscribe(state => {
          const stateStr = typeof state === 'string' ? state : (state as any)?.state;
          if (stateStr === 'Lobby' && this.session) {
            this.router.navigate(['/lobby', this.session.id]);
          } else if (stateStr === 'Ended') {
            this.router.navigate(['/']);
          }
        })
      );

      // Background synchronization for session consistency
      const pollInterval = setInterval(() => {
        if (!this.session?.id) return;
        this.sessionService.getSessionById(this.session.id).subscribe(refreshed => {
          if (refreshed && this.session) {
            this.session.players = refreshed.players;
            this.session.state = refreshed.state;
            if (refreshed.state === 'Lobby') {
              this.router.navigate(['/lobby', refreshed.id]);
            } else if (refreshed.state === 'Ended') {
              this.router.navigate(['/']);
            }
          }
        });
      }, 3000);
      this.subs.push({ unsubscribe: () => clearInterval(pollInterval) } as Subscription);
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  handleAdvanceTurn(): void {
    if (!this.session) return;
    this.sessionService.advanceTurn(this.session.id).subscribe(updated => {
      if (updated) {
        this.session = updated;
      }
    });
  }

  returnToLobby(): void {
    if (!this.session) return;
    // FR-021: return to lobby for a rematch
    this.sessionService.changeState(this.session.id, 'Lobby').subscribe(() => {
      this.router.navigate(['/lobby', this.session!.id]);
    });
  }

  exitToHub(): void {
    this.router.navigate(['/']);
  }

  getMockGameIcon(): string {
    if (this.session?.gameSlug === 'trivia-pro') return '📖';
    if (this.session?.gameSlug === 'charades-flash') return '🎭';
    return '⚔️';
  }

  getMockGamePromptTitle(): string {
    if (this.session?.gameSlug === 'trivia-pro') {
      return 'Round 1: Which disciple walked on water with Jesus?';
    }
    if (this.session?.gameSlug === 'charades-flash') {
      return 'Act Out Without Speaking: Noah Building the Ark!';
    }
    return 'Complete the Scripture: "The Lord is my shepherd; I shall not..."';
  }

  getMockGamePromptDescription(): string {
    return 'Active turn participant performs the action. Scores and turns update automatically for all connected devices.';
  }
}
