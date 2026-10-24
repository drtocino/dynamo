import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { SessionService } from '../../core/services/session.service';
import { Game, MultiplayerMode } from '../../core/models/game.model';
import { TranslatePipe, TranslationService } from '../../core/i18n';
import { LanguageSelectorComponent } from './components/language-selector/language-selector.component';

@Component({
  selector: 'app-hub',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, LanguageSelectorComponent],
  template: `
    <div class="space-y-10">
      <!-- Hub Top Bar with Language Selector -->
      <div class="flex items-center justify-end -mb-4">
        <app-language-selector></app-language-selector>
      </div>

      <!-- Hero Banner -->
      <section class="neo-card bg-neo-yellow relative overflow-hidden">
        <div class="max-w-2xl relative z-10">
          <div class="inline-block bg-neo-black text-white text-xs font-black px-3 py-1 rounded border-2 border-neo-black uppercase tracking-wider mb-3">
            {{ 'hub.faithBadge' | translate }}
          </div>
          <h1 class="text-4xl sm:text-5xl font-black text-neo-black leading-tight tracking-tight mb-4">
            {{ 'hub.heroTitle' | translate }}
          </h1>
          <p class="font-bold text-lg text-neo-black/90 mb-6 leading-relaxed">
            {{ 'hub.heroSubtitle' | translate }}
          </p>
          <div class="flex flex-wrap gap-4">
            <a routerLink="/join" class="neo-btn-secondary text-base py-3 px-6 flex items-center gap-2">
              <span>🎟️</span> {{ 'hub.joinPrompt' | translate }}
            </a>
          </div>
        </div>

        <!-- Comic decorative sticker -->
        <div class="hidden md:flex absolute right-6 -bottom-4 transform rotate-12 bg-white border-4 border-neo-black rounded-2xl p-4 text-center font-black">
          <span class="text-3xl block">⚡</span>
          <span class="text-xs uppercase tracking-widest text-neo-black whitespace-pre-line">{{ 'hub.noAccounts' | translate }}</span>
        </div>
      </section>

      <!-- Game Directory Header & Filters -->
      <section>
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 class="text-3xl font-black tracking-tight text-neo-black flex items-center gap-3">
              <span>🎮</span> {{ 'hub.availableGames' | translate }}
            </h2>
            <p class="font-semibold text-neo-muted text-sm">{{ 'hub.selectGameDesc' | translate }}</p>
          </div>

          <!-- Mode Filter Buttons -->
          <div class="flex items-center gap-2 bg-white p-1.5 rounded-xl border-3 border-neo-black">
            <button 
              (click)="selectedMode = 'ALL'"
              [class.bg-neo-black]="selectedMode === 'ALL'"
              [class.text-white]="selectedMode === 'ALL'"
              [class.text-neo-black]="selectedMode !== 'ALL'"
              class="px-3 py-1.5 rounded-lg text-xs font-black transition-colors">
              {{ 'hub.filterAll' | translate }}
            </button>
            <button 
              (click)="selectedMode = 'RoomBased'"
              [class.bg-neo-cyan]="selectedMode === 'RoomBased'"
              [class.text-neo-black]="true"
              class="px-3 py-1.5 rounded-lg text-xs font-black transition-colors">
              {{ 'hub.filterRoomBased' | translate }}
            </button>
            <button 
              (click)="selectedMode = 'SharedScreen'"
              [class.bg-neo-pink]="selectedMode === 'SharedScreen'"
              [class.text-white]="selectedMode === 'SharedScreen'"
              [class.text-neo-black]="selectedMode !== 'SharedScreen'"
              class="px-3 py-1.5 rounded-lg text-xs font-black transition-colors">
              {{ 'hub.filterSharedScreen' | translate }}
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
                    {{ 'hub.badgeRoomBased' | translate }}
                  </span>
                  <span 
                    *ngIf="supportsMode(game, 'SharedScreen')"
                    class="neo-badge bg-neo-pink text-white">
                    {{ 'hub.badgeSharedScreen' | translate }}
                  </span>
                </div>
              </div>

              <h3 class="text-2xl font-black tracking-tight text-neo-black mb-2">
                {{ getGameNameKey(game.slug) | translate }}
              </h3>

              <p class="font-medium text-sm text-neo-black/80 mb-6 leading-relaxed">
                {{ getGameDescKey(game.slug) | translate }}
              </p>
            </div>

            <!-- Action buttons per mode -->
            <div class="pt-4 border-t-3 border-neo-black/10 flex flex-col gap-2">
              <button 
                *ngIf="supportsMode(game, 'RoomBased')"
                (click)="startConfigure(game, 'RoomBased')"
                class="neo-btn-primary w-full text-sm py-2.5">
                {{ 'hub.btnHostRoom' | translate }}
              </button>
              <button 
                *ngIf="supportsMode(game, 'SharedScreen')"
                (click)="startConfigure(game, 'SharedScreen')"
                class="neo-btn-secondary w-full text-sm py-2.5">
                {{ 'hub.btnPlayShared' | translate }}
              </button>

              <!-- Quick Demo Test Game Button for Biblical Roulette (1 Round, 3 Players, Genesis 1:1) -->
              <button
                *ngIf="game.slug === 'biblical-roulette'"
                type="button"
                (click)="startGenesisDemoGame(game)"
                class="w-full py-2 px-3 rounded-xl border-3 border-neo-black bg-neo-yellow hover:bg-yellow-300 text-neo-black font-black text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-neo-sm cursor-pointer mt-0.5">
                <span>⚡</span>
                <span>{{ 'hub.btnGenesisDemo' | translate }}</span>
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
  private sessionService = inject(SessionService);
  private translationService = inject(TranslationService);
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
      case 'card-qa': return '🃏';
      default: return '🎲';
    }
  }

  getGameNameKey(slug: string): string {
    const camel = this.toCamelCase(slug);
    return `hub.games.${camel}.name`;
  }

  getGameDescKey(slug: string): string {
    const camel = this.toCamelCase(slug);
    return `hub.games.${camel}.description`;
  }

  private toCamelCase(str: string): string {
    return str.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
  }

  startConfigure(game: Game, mode: MultiplayerMode): void {
    this.router.navigate(['/configure', game.slug], { queryParams: { mode } });
  }

  startGenesisDemoGame(game: Game): void {
    const clientId = this.sessionService.getClientId();
    const currentLang = this.translationService.currentLang() || 'es';
    const isEn = currentLang.toLowerCase().startsWith('en');

    const genesisPhrase = {
      id: 'a0000000-0000-0000-0000-000000000001',
      text: isEn
        ? 'IN THE BEGINNING GOD CREATED THE HEAVENS AND THE EARTH'
        : 'EN EL PRINCIPIO CREO DIOS LOS CIELOS Y LA TIERRA',
      generalHint: isEn ? 'Pentateuch - Old Testament' : 'Pentateuco - Antiguo Testamento',
      specificHint: isEn ? 'Genesis 1:1 - The creation of the heavens and the earth' : 'Génesis 1:1 - La creación de los cielos y la tierra',
      category: 'Pentateuco',
      language: isEn ? 'en' : 'es'
    };

    const players = isEn ? ['David', 'Sarah', 'Daniel'] : ['David', 'Sara', 'Daniel'];

    this.sessionService.createSharedScreenSession({
      gameId: game.id,
      mode: 'SharedScreen',
      hostClientId: clientId,
      maxPlayers: 3,
      rounds: 1,
      timeLimitSeconds: 60,
      language: isEn ? 'en' : 'es',
      playerNames: players,
      gameSettingsJson: JSON.stringify({
        matchName: isEn ? 'Genesis 1:1 Test Game' : 'Partida de Prueba Génesis 1:1',
        customPhrase: genesisPhrase
      })
    }).subscribe({
      next: (session) => {
        this.sessionService.changeState(session.id, 'Active').subscribe({
          next: () => {
            this.router.navigate(['/active-match', session.id]);
          },
          error: (err) => {
            console.error('Error transitioning test session to Active:', err);
            this.router.navigate(['/active-match', session.id]);
          }
        });
      },
      error: (err) => {
        console.error('Error creating demo session:', err);
      }
    });
  }
}
