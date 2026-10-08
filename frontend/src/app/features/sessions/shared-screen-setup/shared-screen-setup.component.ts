import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { GameService } from '../../../core/services/game.service';
import { Game } from '../../../core/models/game.model';

@Component({
  selector: 'app-shared-screen-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <a routerLink="/" class="font-bold text-sm text-neo-black hover:underline flex items-center gap-1">
          ← Back to Games Hub
        </a>
        <span class="neo-badge bg-neo-pink text-white">
          Shared Screen Setup
        </span>
      </div>

      <!-- Header Card -->
      <div class="neo-card bg-white">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">📺</span>
          <div>
            <h1 class="text-2xl font-black text-neo-black">
              Register Local Players
            </h1>
            <p class="text-xs font-semibold text-neo-muted">
              Add everyone playing on this device. Turns will cycle automatically.
            </p>
          </div>
        </div>

        <!-- Add Player Form Input -->
        <div class="flex gap-2 mt-4">
          <input 
            type="text" 
            [(ngModel)]="newPlayerName" 
            (keyup.enter)="addPlayer()"
            maxlength="25"
            placeholder="Type player name and hit enter..."
            class="neo-input flex-1" />
          <button 
            type="button" 
            (click)="addPlayer()" 
            [disabled]="!newPlayerName.trim()"
            class="neo-btn-primary px-6">
            + Add
          </button>
        </div>
      </div>

      <!-- Players List / Order Card -->
      <div class="neo-card bg-white space-y-4">
        <div class="flex items-center justify-between border-b-3 border-neo-black pb-3">
          <h2 class="text-lg font-black text-neo-black">
            Turn Order Roster ({{ players.length }} Players)
          </h2>
          <span class="text-xs font-bold text-neo-muted">
            Minimum 2 players recommended
          </span>
        </div>

        <div *ngIf="players.length === 0" class="p-8 text-center border-2 border-dashed border-neo-black/20 rounded-xl">
          <p class="font-bold text-sm text-neo-muted">No players added yet. Type a name above to add participants!</p>
        </div>

        <div class="space-y-2">
          <div 
            *ngFor="let p of players; let i = index" 
            class="p-3 bg-neo-bg border-2 border-neo-black rounded-lg flex items-center justify-between shadow-neo-sm">
            <div class="flex items-center gap-3">
              <span class="w-7 h-7 rounded-full bg-neo-yellow border-2 border-neo-black font-black text-xs flex items-center justify-center">
                {{ i + 1 }}
              </span>
              <span class="font-black text-base text-neo-black">{{ p }}</span>
            </div>
            <button 
              (click)="removePlayer(i)"
              class="text-xs font-bold text-red-600 hover:text-red-800 p-1">
              ✕ Remove
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <a routerLink="/" class="neo-btn-secondary flex-1 py-3 text-center">
          Cancel
        </a>
        <button 
          (click)="launchMatch()" 
          [disabled]="players.length < 1 || isLaunching"
          class="neo-btn-primary flex-1 py-3 text-center">
          <span *ngIf="!isLaunching">🚀 Start Match with {{ players.length }} Players</span>
          <span *ngIf="isLaunching">Starting...</span>
        </button>
      </div>
    </div>
  `
})
export class SharedScreenSetupComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private gameService = inject(GameService);

  game: Game | undefined;
  newPlayerName = '';
  players: string[] = ['Youth Team 1', 'Youth Team 2'];
  isLaunching = false;

  private configState: any = null;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || 'charades-flash';
    this.configState = history.state || {};

    this.gameService.getGames().subscribe(games => {
      this.game = games.find(g => g.slug === slug) || games[0];
    });
  }

  addPlayer(): void {
    const name = this.newPlayerName.trim();
    if (name && !this.players.includes(name)) {
      this.players.push(name);
      this.newPlayerName = '';
    }
  }

  removePlayer(index: number): void {
    this.players.splice(index, 1);
  }

  launchMatch(): void {
    if (!this.game || this.players.length === 0) return;
    this.isLaunching = true;

    const clientId = this.sessionService.getClientId();

    this.sessionService.createSharedScreenSession({
      gameId: this.game.id,
      mode: 'SharedScreen',
      hostClientId: clientId,
      maxPlayers: this.configState.maxPlayers || 8,
      rounds: this.configState.rounds || 3,
      timeLimitSeconds: this.configState.timeLimitSeconds || 60,
      playerNames: this.players
    }).subscribe({
      next: (session) => {
        // Automatically start the match
        this.sessionService.changeState(session.id, 'Active').subscribe(() => {
          this.router.navigate(['/active-match', session.id]);
        });
      },
      error: (err) => {
        this.isLaunching = false;
        console.error('Failed to create shared screen match:', err);
      }
    });
  }
}
