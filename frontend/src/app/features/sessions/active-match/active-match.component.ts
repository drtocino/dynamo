import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService } from '../../../core/services/session.service';
import { RealtimeService } from '../../../core/services/realtime.service';
import { Session } from '../../../core/models/session.model';
import { Player } from '../../../core/models/player.model';
import { TurnTrackerComponent } from './turn-tracker.component';

@Component({
  selector: 'app-active-match',
  standalone: true,
  imports: [CommonModule, TurnTrackerComponent],
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

      <!-- Turn Tracker & Round Information -->
      <app-turn-tracker 
        [players]="session.players"
        [activePlayer]="activePlayer"
        [timeLimitSeconds]="session.timeLimitSeconds"
        [currentRound]="currentRound"
        [totalRounds]="session.rounds"
        (advanceTurn)="handleAdvanceTurn()">
      </app-turn-tracker>

      <!-- Generic Game Sandbox Display Container -->
      <div class="neo-card bg-white p-8 text-center space-y-6">
        <div class="inline-block p-4 bg-neo-bg rounded-2xl border-3 border-neo-black shadow-neo">
          <span class="text-5xl block mb-2">{{ getMockGameIcon() }}</span>
          <h2 class="text-2xl font-black text-neo-black">{{ getMockGamePromptTitle() }}</h2>
          <p class="font-bold text-sm text-neo-muted max-w-md mx-auto mt-2">
            {{ getMockGamePromptDescription() }}
          </p>
        </div>

        <!-- Simulated Interactive Scoreboard -->
        <div class="pt-6 border-t-3 border-neo-black">
          <h3 class="text-sm font-black uppercase tracking-wider text-neo-muted mb-3">
            Live Participants & Scores
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div 
              *ngFor="let p of session.players; let idx = index"
              [class.border-neo-yellow]="p.id === activePlayer?.id"
              class="p-3 bg-neo-bg rounded-xl border-3 border-neo-black flex flex-col items-center">
              <span class="font-black text-sm text-neo-black truncate">{{ p.name }}</span>
              <span class="text-xs font-bold text-neo-muted mt-1">Score: {{ (idx + 1) * 100 }} pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ActiveMatchComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private realtime = inject(RealtimeService);

  session: Session | undefined;
  currentRound: number = 1;
  private subs: Subscription[] = [];

  get activePlayer(): Player | undefined {
    if (!this.session || !this.session.players.length) return undefined;
    return this.session.players.find(p => p.id === this.session!.activePlayerId) || this.session.players[0];
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
      this.realtime.listenToSession(data.id);

      this.subs.push(
        this.realtime.turnAdvanced$.subscribe(activePlayerId => {
          if (this.session) {
            this.session.activePlayerId = activePlayerId;
          }
        }),
        this.realtime.stateChanged$.subscribe(state => {
          if (state === 'Lobby' && this.session) {
            this.router.navigate(['/lobby', this.session.id]);
          } else if (state === 'Ended') {
            this.router.navigate(['/']);
          }
        })
      );

      // Periodic 2-second sync poll to ensure active match stays synchronized across devices
      const pollInterval = setInterval(() => {
        if (!this.session?.id) return;
        this.sessionService.getSessionById(this.session.id).subscribe(refreshed => {
          if (refreshed) {
            this.session = refreshed;
            if (refreshed.state === 'Lobby') {
              this.router.navigate(['/lobby', refreshed.id]);
            } else if (refreshed.state === 'Ended') {
              this.router.navigate(['/']);
            }
          }
        });
      }, 2000);
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
