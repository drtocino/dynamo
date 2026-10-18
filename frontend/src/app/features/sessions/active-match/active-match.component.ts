import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
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
import { BiblicalRouletteComponent } from '../../games/biblical-roulette';
import { TranslatePipe, TranslationService } from '../../../core/i18n';

@Component({
  selector: 'app-active-match',
  standalone: true,
  imports: [CommonModule, TurnTrackerComponent, BiblicalRouletteComponent, TranslatePipe],
  template: `
    <div *ngIf="session" class="w-full flex flex-col">
      <!-- Active Match Top Bar -->
      <header class="w-full bg-white border-b-3 border-neo-black px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 shadow-none select-none shrink-0 sticky top-0 z-40">
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span class="px-2 py-0.5 rounded bg-neo-black text-white font-black text-xs uppercase tracking-wider">
            {{ 'activeMatch.live' | translate }}
          </span>
          <h1 class="text-sm sm:text-base font-black text-neo-black flex items-center gap-1.5 leading-none">
            <span>⚡</span> {{ getGameNameKey(session.gameSlug) | translate }}
          </h1>
          <span class="text-xs font-bold text-neo-muted">
            {{ 'activeMatch.room' | translate }} <b class="text-neo-black font-mono uppercase">{{ session.roomCode }}</b>
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button 
            (click)="returnToLobby()"
            class="neo-btn-secondary text-xs py-1 px-2.5 font-black">
            {{ 'activeMatch.btnLobby' | translate }}
          </button>
          <button 
            (click)="exitToHub()"
            class="neo-btn-secondary text-xs py-1 px-2.5 font-black text-red-600 hover:text-red-700">
            {{ 'activeMatch.btnExit' | translate }}
          </button>
        </div>
      </header>

      <!-- Match Content Container -->
      <div class="w-full px-2 sm:px-4 pt-2.5 pb-4 space-y-3">
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
          <div class="inline-block p-4 bg-neo-bg rounded-2xl border-3 border-neo-black">
            <span class="text-5xl block mb-2">{{ getMockGameIcon() }}</span>
            <h2 class="text-2xl font-black text-neo-black">{{ getMockGamePromptTitle() }}</h2>
            <p class="font-bold text-sm text-neo-muted max-w-md mx-auto mt-2">
              {{ getMockGamePromptDescription() }}
            </p>
          </div>

          <!-- Real-Time Interactive Actions -->
          <div class="flex flex-wrap justify-center gap-4 py-4">
            <button 
              (click)="handleBuzz()"
              class="neo-btn-primary bg-neo-yellow text-neo-black text-sm py-3 px-6 hover:translate-y-0.5 transition-transform flex items-center gap-2">
              {{ 'activeMatch.buzzIn' | translate }}
            </button>
            <button 
              (click)="handleAnswer()"
              class="neo-btn-primary bg-neo-pink text-white text-sm py-3 px-6 hover:translate-y-0.5 transition-transform flex items-center gap-2">
              {{ 'activeMatch.submitAnswer' | translate }}
            </button>
          </div>

          <!-- Simulated Interactive Scoreboard -->
          <div class="pt-6 border-t-3 border-neo-black">
            <h3 class="text-sm font-black uppercase tracking-wider text-neo-muted mb-3 flex items-center justify-center gap-2">
              <span>🏆</span> {{ 'activeMatch.scoresTitle' | translate }}
              <span *ngIf="gameStore.unacknowledgedIntents().length" class="text-xs bg-neo-yellow px-2 py-0.5 rounded font-bold border border-neo-black">
                {{ 'activeMatch.pendingSync' | translate:{ count: gameStore.unacknowledgedIntents().length } }}
              </span>
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div 
                *ngFor="let p of session.players; let idx = index"
                class="p-3 rounded-xl border-2 border-neo-black bg-white flex flex-col items-center">
                <span class="font-black text-xs text-neo-black truncate">{{ p.name }}</span>
                <span class="text-lg font-black text-neo-pink mt-1">{{ getPlayerScore(p.clientId) }} pts</span>
              </div>
            </div>
          </div>
        </div>
      </ng-template>
      </div>
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
  private translationService = inject(TranslationService);

  session: Session | undefined;
  currentRound: number = 1;
  private subs: Subscription[] = [];

  constructor() {
    effect(() => {
      const payload = this.gameStore.effectiveState().payload as any;
      if (payload?.currentTurnPlayerId && this.session) {
        if (this.session.activePlayerId !== payload.currentTurnPlayerId) {
          this.session.activePlayerId = payload.currentTurnPlayerId;
        }
      }
    });
  }

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

  getGameNameKey(slug: string | undefined): string {
    if (!slug) return 'hub.games.biblicalRoulette.name';
    const camel = slug.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
    return `hub.games.${camel}.name`;
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
            this.gameStore.resetState();
            this.router.navigate(['/lobby', this.session.id]);
          } else if (stateStr === 'Ended') {
            this.gameStore.resetState();
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
              this.gameStore.resetState();
              this.router.navigate(['/lobby', refreshed.id]);
            } else if (refreshed.state === 'Ended') {
              this.gameStore.resetState();
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
    this.gameStore.resetState();
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
    this.gameStore.resetState();
    this.sessionService.changeState(this.session.id, 'Lobby').subscribe(() => {
      this.router.navigate(['/lobby', this.session!.id]);
    });
  }

  exitToHub(): void {
    this.gameStore.resetState();
    this.router.navigate(['/']);
  }

  getMockGameIcon(): string {
    if (this.session?.gameSlug === 'trivia-pro') return '📖';
    if (this.session?.gameSlug === 'charades-flash') return '🎭';
    return '⚔️';
  }

  getMockGamePromptTitle(): string {
    if (this.session?.gameSlug === 'trivia-pro') {
      return this.translationService.t('activeMatch.mockTriviaTitle');
    }
    if (this.session?.gameSlug === 'charades-flash') {
      return this.translationService.t('activeMatch.mockCharadesTitle');
    }
    return this.translationService.t('activeMatch.mockDefaultTitle');
  }

  getMockGamePromptDescription(): string {
    return this.translationService.t('activeMatch.mockPromptDescription');
  }
}
