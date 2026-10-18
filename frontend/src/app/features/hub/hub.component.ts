import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { Game, MultiplayerMode } from '../../core/models/game.model';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-10">
      <!-- Hero Banner -->
      <section class="neo-card bg-neo-yellow relative overflow-hidden">
        <div class="max-w-2xl relative z-10">
          <div class="inline-block bg-neo-black text-white text-xs font-black px-3 py-1 rounded border-2 border-neo-black uppercase tracking-wider mb-3">
            ✨ FAITH & FELLOWSHIP GAMING
          </div>
          <h1 class="text-4xl sm:text-5xl font-black text-neo-black leading-tight tracking-tight mb-4">
            LEVEL UP YOUR YOUTH GROUP!
          </h1>
          <p class="font-bold text-lg text-neo-black/90 mb-6 leading-relaxed">
            Create instant multiplayer matches or gather around one big screen. Safe, wholesome, and built for Christian fellowship.
          </p>
          <div class="flex flex-wrap gap-4">
            <a routerLink="/join" class="neo-btn-secondary text-base py-3 px-6 flex items-center gap-2">
              <span>🎟️</span> Have a Room Code? Join Now
            </a>
          </div>
        </div>

        <!-- Comic decorative sticker -->
        <div class="hidden md:flex absolute right-6 -bottom-4 transform rotate-12 bg-white border-4 border-neo-black rounded-2xl p-4 text-center font-black">
          <span class="text-3xl block">⚡</span>
          <span class="text-xs uppercase tracking-widest text-neo-black">NO ACCOUNTS<br/>INSTANT PLAY</span>
        </div>
      </section>

      <!-- Game Directory Header & Filters -->
      <section>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-black tracking-tight text-neo-black flex items-center gap-3">
              <span>🎮</span> Available Games
            </h2>
            <p class="font-semibold text-neo-muted text-sm">Select a game below to launch a new match</p>
          </div>

          <!-- Mode Filter Buttons -->
          <div class="flex items-center gap-2 bg-white p-1.5 rounded-xl border-3 border-neo-black">
            <button 
              (click)="selectedMode = 'ALL'"
              [class.bg-neo-black]="selectedMode === 'ALL'"
              [class.text-white]="selectedMode === 'ALL'"
              [class.text-neo-black]="selectedMode !== 'ALL'"
              class="px-3 py-1.5 rounded-lg text-xs font-black transition-colors">
              All Games
            </button>
            <button 
              (click)="selectedMode = 'RoomBased'"
              [class.bg-neo-cyan]="selectedMode === 'RoomBased'"
              [class.text-neo-black]="true"
              class="px-3 py-1.5 rounded-lg text-xs font-black transition-colors">
              Room-Based
            </button>
            <button 
              (click)="selectedMode = 'SharedScreen'"
              [class.bg-neo-pink]="selectedMode === 'SharedScreen'"
              [class.text-white]="selectedMode === 'SharedScreen'"
              [class.text-neo-black]="selectedMode !== 'SharedScreen'"
              class="px-3 py-1.5 rounded-lg text-xs font-black transition-colors">
              Shared Screen
            </button>
          </div>
        </div>

        <!-- Games Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            *ngFor="let game of filteredGames" 
            class="neo-card flex flex-col justify-between hover:bg-neo-bg transition-colors duration-200">
            <div>
              <!-- Game Card Header Badges -->
              <div class="flex items-center justify-between gap-2 mb-4">
                <span class="text-3xl">
                  {{ getGameIcon(game.slug) }}
                </span>
                <div class="flex flex-wrap gap-1">
                  <span 
                    *ngIf="supportsMode(game, 'RoomBased')"
                    class="neo-badge bg-neo-cyan text-neo-black">
                    Room-Based
                  </span>
                  <span 
                    *ngIf="supportsMode(game, 'SharedScreen')"
                    class="neo-badge bg-neo-pink text-white">
                    Shared Screen
                  </span>
                </div>
              </div>

              <h3 class="text-2xl font-black tracking-tight text-neo-black mb-2">
                {{ game.name }}
              </h3>

              <p class="font-medium text-sm text-neo-black/80 mb-6 leading-relaxed">
                {{ game.description }}
              </p>
            </div>

            <!-- Action buttons per mode -->
            <div class="pt-4 border-t-3 border-neo-black/10 flex flex-col gap-2">
              <button 
                *ngIf="supportsMode(game, 'RoomBased')"
                (click)="startConfigure(game, 'RoomBased')"
                class="neo-btn-primary w-full text-sm py-2.5">
                🌐 Host Room Match
              </button>
              <button 
                *ngIf="supportsMode(game, 'SharedScreen')"
                (click)="startConfigure(game, 'SharedScreen')"
                class="neo-btn-secondary w-full text-sm py-2.5">
                📺 Play Shared Screen
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HubComponent implements OnInit {
  private gameService = inject(GameService);
  private router = inject(Router);

  games: Game[] = [];
  selectedMode: 'ALL' | MultiplayerMode = 'ALL';

  ngOnInit(): void {
    this.gameService.getGames().subscribe(data => {
      this.games = data;
    });
  }

  get filteredGames(): Game[] {
    if (this.selectedMode === 'ALL') return this.games;
    return this.games.filter(g => g.supportedModes.includes(this.selectedMode as MultiplayerMode));
  }

  supportsMode(game: Game, mode: MultiplayerMode): boolean {
    return game.supportedModes.includes(mode);
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

  startConfigure(game: Game, mode: MultiplayerMode): void {
    this.router.navigate(['/configure', game.slug], { queryParams: { mode } });
  }
}
