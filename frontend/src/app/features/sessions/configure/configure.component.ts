import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameService } from '../../../core/services/game.service';
import { SessionService } from '../../../core/services/session.service';
import { Game, MultiplayerMode } from '../../../core/models/game.model';
import { TranslatePipe, TranslationService } from '../../../core/i18n';

@Component({
  selector: 'app-configure',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Back Navigation Header -->
      <div class="flex items-center justify-between">
        <a routerLink="/" class="font-bold text-sm text-neo-black hover:underline flex items-center gap-1">
          {{ 'configure.back' | translate }}
        </a>
        <span class="neo-badge bg-neo-yellow text-neo-black">
          {{ 'configure.step1' | translate }}
        </span>
      </div>

      <!-- Game Summary Card -->
      <div *ngIf="game" class="neo-card bg-white flex items-center justify-between gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 bg-neo-yellow border-3 border-neo-black rounded-xl flex items-center justify-center text-3xl">
            {{ getGameIcon(game.slug) }}
          </div>
          <div>
            <h2 class="text-2xl font-black text-neo-black">{{ getGameNameKey(game.slug) | translate }}</h2>
            <p class="text-xs font-semibold text-neo-muted">{{ getGameDescKey(game.slug) | translate }}</p>
          </div>
        </div>
        <span 
          [class.bg-neo-cyan]="mode === 'RoomBased'"
          [class.bg-neo-pink]="mode === 'SharedScreen'"
          [class.text-white]="mode === 'SharedScreen'"
          [class.text-neo-black]="mode === 'RoomBased'"
          class="neo-badge">
          {{ (mode === 'RoomBased' ? 'hub.badgeRoomBased' : 'hub.badgeSharedScreen') | translate }}
        </span>
      </div>

      <!-- Quick Demo Test Game Banner for Biblical Roulette -->
      <div *ngIf="game?.slug === 'biblical-roulette'" class="p-4 bg-neo-yellow/30 border-3 border-neo-black rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-neo-sm">
        <div>
          <span class="text-xs font-black uppercase text-neo-black flex items-center gap-1.5">
            <span>⚡</span> {{ 'configure.demoBannerTitle' | translate }}
          </span>
          <p class="text-xs font-semibold text-neo-muted mt-0.5">
            {{ 'configure.demoBannerDesc' | translate }}
          </p>
        </div>
        <button
          type="button"
          (click)="startGenesisDemoGame()"
          class="w-full sm:w-auto shrink-0 py-2.5 px-4 rounded-xl border-3 border-neo-black bg-neo-yellow hover:bg-yellow-300 text-neo-black font-black text-xs transition active:scale-95 shadow-neo-sm cursor-pointer flex items-center justify-center gap-1.5">
          <span>⚡</span>
          <span>{{ 'configure.btnGenesisDemo' | translate }}</span>
        </button>
      </div>

      <!-- Settings Configuration Form -->
      <div class="neo-card bg-white space-y-6">
        <h3 class="text-xl font-black text-neo-black border-b-3 border-neo-black pb-3">
          {{ 'configure.title' | translate }}
        </h3>

        <!-- Match Name / Host Name Field -->
        <div *ngIf="game?.slug === 'card-qa'">
          <label class="block font-black text-sm text-neo-black mb-1">
            {{ 'configure.matchNameLabel' | translate }}
          </label>
          <input 
            type="text" 
            [(ngModel)]="matchName" 
            [placeholder]="'configure.matchNamePlaceholder' | translate"
            class="neo-input" />
        </div>

        <div *ngIf="game?.slug !== 'card-qa'">
          <label class="block font-black text-sm text-neo-black mb-1">
            {{ 'configure.hostNameLabel' | translate }}
          </label>
          <input 
            type="text" 
            [(ngModel)]="hostName" 
            [placeholder]="'configure.hostNamePlaceholder' | translate"
            class="neo-input" />
        </div>

        <!-- Mode Toggle if both supported -->
        <div *ngIf="game && game.supportedModes.length > 1">
          <label class="block font-black text-sm text-neo-black mb-2">
            {{ 'configure.multiplayerMode' | translate }}
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button 
              type="button"
              (click)="mode = 'RoomBased'"
              [class.bg-neo-cyan]="mode === 'RoomBased'"
              [class.bg-white]="mode !== 'RoomBased'"
              class="neo-btn text-sm py-2">
              {{ 'configure.modeRoomBasedBtn' | translate }}
            </button>
            <button 
              type="button"
              (click)="mode = 'SharedScreen'"
              [class.bg-neo-pink]="mode === 'SharedScreen'"
              [class.text-white]="mode === 'SharedScreen'"
              [class.bg-white]="mode !== 'SharedScreen'"
              class="neo-btn text-sm py-2">
              {{ 'configure.modeSharedScreenBtn' | translate }}
            </button>
          </div>
        </div>

        <!-- Maximum Players (hidden for card-qa) -->
        <div *ngIf="game?.slug !== 'card-qa'">
          <div class="flex justify-between items-center mb-1">
            <label class="font-black text-sm text-neo-black">{{ 'configure.maxPlayers' | translate }}</label>
            <span class="font-black text-sm px-2 py-0.5 rounded bg-neo-gray border-2 border-neo-black">
              {{ 'configure.playersCount' | translate:{ count: maxPlayers } }}
            </span>
          </div>
          <input 
            type="range" 
            min="2" 
            max="20" 
            [(ngModel)]="maxPlayers"
            class="w-full accent-neo-black cursor-pointer" />
        </div>

        <!-- Rounds (hidden for card-qa) -->
        <div *ngIf="game?.slug !== 'card-qa'">
          <div class="flex justify-between items-center mb-1">
            <label class="font-black text-sm text-neo-black">{{ 'configure.rounds' | translate }}</label>
            <span class="font-black text-sm px-2 py-0.5 rounded bg-neo-gray border-2 border-neo-black">
              {{ 'configure.roundsCount' | translate:{ count: rounds } }}
            </span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            [(ngModel)]="rounds"
            class="w-full accent-neo-black cursor-pointer" />
        </div>

        <!-- Time Limit (hidden for card-qa) -->
        <div *ngIf="game?.slug !== 'card-qa'">
          <div class="flex justify-between items-center mb-1">
            <label class="font-black text-sm text-neo-black">{{ 'configure.turnTimeLimit' | translate }}</label>
            <span class="font-black text-sm px-2 py-0.5 rounded bg-neo-gray border-2 border-neo-black">
              {{ 'configure.turnTimeLimitSeconds' | translate:{ seconds: timeLimitSeconds } }}
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
            {{ 'common.cancel' | translate }}
          </a>
          <button 
            type="button"
            (click)="createMatch()" 
            [disabled]="isSubmitDisabled"
            class="neo-btn-primary flex-1 py-3 text-center">
            <span *ngIf="!isSubmitting">{{ (mode === 'SharedScreen' ? 'configure.btnSetupLocal' : 'configure.btnLaunchLobby') | translate }}</span>
            <span *ngIf="isSubmitting">{{ 'configure.btnCreating' | translate }}</span>
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
  private translationService = inject(TranslationService);

  game: Game | undefined;
  mode: MultiplayerMode = 'RoomBased';
  hostName: string = '';
  matchName: string = '';
  maxPlayers: number = 8;
  rounds: number = 3;
  timeLimitSeconds: number = 60;
  isSubmitting = false;

  get isSubmitDisabled(): boolean {
    if (this.isSubmitting) return true;
    if (this.game?.slug === 'card-qa') {
      return !this.matchName.trim();
    }
    return !this.hostName.trim();
  }

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
      if (this.game?.slug === 'card-qa') {
        const stored = localStorage.getItem('cardQa_matchName');
        this.matchName = stored || 'Examen de Hechos y Epístolas';
      }
    });
  }

  getGameNameKey(slug: string): string {
    const camel = slug.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
    return `hub.games.${camel}.name`;
  }

  getGameDescKey(slug: string): string {
    const camel = slug.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
    return `hub.games.${camel}.description`;
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
    if (!this.game) return;

    let effectiveHostName = this.hostName.trim();
    let effectiveMatchName = '';

    if (this.game.slug === 'card-qa') {
      effectiveMatchName = this.matchName.trim() || 'Examen de Hechos y Epístolas';
      effectiveHostName = effectiveMatchName;
      this.hostName = effectiveHostName;
      localStorage.setItem('cardQa_matchName', effectiveMatchName);
    } else {
      if (!effectiveHostName) return;
    }

    if (this.mode === 'SharedScreen') {
      this.router.navigate(['/shared-screen-setup', this.game.slug], {
        state: {
          hostName: effectiveHostName,
          matchName: effectiveMatchName,
          maxPlayers: this.maxPlayers,
          rounds: this.rounds,
          timeLimitSeconds: this.timeLimitSeconds,
          mode: this.mode
        }
      });
      return;
    }

    this.isSubmitting = true;
    const clientId = this.sessionService.getClientId();

    this.sessionService.createSession({
      gameId: this.game.id,
      mode: this.mode,
      hostClientId: clientId,
      maxPlayers: this.maxPlayers,
      rounds: this.rounds,
      timeLimitSeconds: this.timeLimitSeconds,
      gameSettingsJson: effectiveMatchName ? JSON.stringify({ matchName: effectiveMatchName }) : undefined
    }).subscribe({
      next: (session) => {
        // Also register host as player
        this.sessionService.joinSession(session.id, effectiveHostName).subscribe({
          next: () => {
            this.router.navigate(['/lobby', session.id]);
          },
          error: () => {
            this.router.navigate(['/lobby', session.id]);
          }
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Failed to create match session:', err);
      }
    });
  }

  startGenesisDemoGame(): void {
    if (!this.game) return;
    this.isSubmitting = true;
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
      gameId: this.game.id,
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
        this.isSubmitting = false;
        console.error('Error creating demo session:', err);
      }
    });
  }
}
