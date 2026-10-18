import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameService } from '../../../core/services/game.service';
import { SessionService } from '../../../core/services/session.service';
import { Game, MultiplayerMode } from '../../../core/models/game.model';

@Component({
  selector: 'app-configure',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Back Navigation Header -->
      <div class="flex items-center justify-between">
        <a routerLink="/" class="font-bold text-sm text-neo-black hover:underline flex items-center gap-1">
          ← Back to Games Hub
        </a>
        <span class="neo-badge bg-neo-yellow text-neo-black">
          Step 1: Match Setup
        </span>
      </div>

      <!-- Game Summary Card -->
      <div *ngIf="game" class="neo-card bg-white flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-neo-yellow border-3 border-neo-black rounded-xl flex items-center justify-center text-3xl">
            {{ getGameIcon(game.slug) }}
          </div>
          <div>
            <h2 class="text-2xl font-black text-neo-black">{{ game.name }}</h2>
            <p class="text-xs font-semibold text-neo-muted">{{ game.description }}</p>
          </div>
        </div>
        <span 
          [class.bg-neo-cyan]="mode === 'RoomBased'"
          [class.bg-neo-pink]="mode === 'SharedScreen'"
          [class.text-white]="mode === 'SharedScreen'"
          [class.text-neo-black]="mode === 'RoomBased'"
          class="neo-badge">
          {{ mode === 'RoomBased' ? 'Room-Based' : 'Shared Screen' }}
        </span>
      </div>

      <!-- Settings Configuration Form -->
      <div class="neo-card bg-white space-y-6">
        <h3 class="text-xl font-black text-neo-black border-b-3 border-neo-black pb-3">
          Configure Match Settings
        </h3>

        <!-- Host Name Field -->
        <div>
          <label class="block font-black text-sm text-neo-black mb-1">
            Host Display Name *
          </label>
          <input 
            type="text" 
            [(ngModel)]="hostName" 
            placeholder="e.g. Pastor David, Sarah, Youth Leader"
            class="neo-input" />
        </div>

        <!-- Mode Toggle if both supported -->
        <div *ngIf="game && game.supportedModes.length > 1">
          <label class="block font-black text-sm text-neo-black mb-2">
            Multiplayer Mode
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button 
              type="button"
              (click)="mode = 'RoomBased'"
              [class.bg-neo-cyan]="mode === 'RoomBased'"
              [class.bg-white]="mode !== 'RoomBased'"
              class="neo-btn text-sm py-2">
              📱 Room-Based (Separate Phones)
            </button>
            <button 
              type="button"
              (click)="mode = 'SharedScreen'"
              [class.bg-neo-pink]="mode === 'SharedScreen'"
              [class.text-white]="mode === 'SharedScreen'"
              [class.bg-white]="mode !== 'SharedScreen'"
              class="neo-btn text-sm py-2">
              📺 Shared Screen (TV / Projector)
            </button>
          </div>
        </div>

        <!-- Maximum Players -->
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="font-black text-sm text-neo-black">Max Players</label>
            <span class="font-black text-sm px-2 py-0.5 rounded bg-neo-gray border-2 border-neo-black">
              {{ maxPlayers }} Players
            </span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="20" 
            [(ngModel)]="maxPlayers"
            class="w-full accent-neo-black cursor-pointer" />
        </div>

        <!-- Rounds -->
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="font-black text-sm text-neo-black">Rounds</label>
            <span class="font-black text-sm px-2 py-0.5 rounded bg-neo-gray border-2 border-neo-black">
              {{ rounds }} Rounds
            </span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            [(ngModel)]="rounds"
            class="w-full accent-neo-black cursor-pointer" />
        </div>

        <!-- Time Limit -->
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="font-black text-sm text-neo-black">Turn Time Limit</label>
            <span class="font-black text-sm px-2 py-0.5 rounded bg-neo-gray border-2 border-neo-black">
              {{ timeLimitSeconds }}s
            </span>
          </div>
          <input 
            type="range" 
            min="15" 
            max="120" 
            step="15"
            [(ngModel)]="timeLimitSeconds"
            class="w-full accent-neo-black cursor-pointer" />
        </div>

        <!-- Submit Action -->
        <div class="pt-4 border-t-3 border-neo-black flex gap-3">
          <a routerLink="/" class="neo-btn-secondary flex-1 py-3 text-center">
            Cancel
          </a>
          <button 
            type="button"
            (click)="createMatch()" 
            [disabled]="!hostName.trim() || isSubmitting"
            class="neo-btn-primary flex-1 py-3 text-center">
            <span *ngIf="!isSubmitting">⚡ {{ mode === 'SharedScreen' ? 'Setup Local Players →' : 'Launch Match Lobby →' }}</span>
            <span *ngIf="isSubmitting">Creating Match...</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfigureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private gameService = inject(GameService);
  private sessionService = inject(SessionService);

  game: Game | undefined;
  mode: MultiplayerMode = 'RoomBased';
  hostName: string = '';
  maxPlayers: number = 8;
  rounds: number = 3;
  timeLimitSeconds: number = 60;
  isSubmitting = false;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || 'trivia-pro';
    const queryMode = this.route.snapshot.queryParamMap.get('mode') as MultiplayerMode;
    if (queryMode) {
      this.mode = queryMode;
    }

    this.gameService.getGames().subscribe(games => {
      this.game = games.find(g => g.slug === slug) || games[0];
      if (this.game && !this.game.supportedModes.includes(this.mode)) {
        this.mode = this.game.supportedModes[0];
      }
    });
  }

  getGameIcon(slug: string): string {
    switch (slug) {
      case 'trivia-pro': return '📖';
      case 'charades-flash': return '🎭';
      case 'scripture-duel': return '⚔️';
      case 'biblical-roulette': return '🎡';
      default: return '🎲';
    }
  }

  createMatch(): void {
    if (!this.game || !this.hostName.trim()) return;

    if (this.mode === 'SharedScreen') {
      // Direct to shared screen roster setup
      this.router.navigate(['/shared-screen-setup', this.game.slug], {
        state: {
          gameId: this.game.id,
          hostName: this.hostName.trim(),
          maxPlayers: this.maxPlayers,
          rounds: this.rounds,
          timeLimitSeconds: this.timeLimitSeconds
        }
      });
      return;
    }

    this.isSubmitting = true;
    const clientId = this.sessionService.getClientId();

    this.sessionService.createSession({
      gameId: this.game.id,
      mode: 'RoomBased',
      hostClientId: clientId,
      maxPlayers: this.maxPlayers,
      rounds: this.rounds,
      timeLimitSeconds: this.timeLimitSeconds
    }).subscribe({
      next: (session) => {
        // Also register host as player
        this.sessionService.joinSession(session.id, this.hostName.trim()).subscribe(() => {
          this.router.navigate(['/lobby', session.id]);
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to create session:', err);
      }
    });
  }
}
