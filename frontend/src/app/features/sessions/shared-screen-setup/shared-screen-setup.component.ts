import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { GameService } from '../../../core/services/game.service';
import { Game } from '../../../core/models/game.model';
import { TranslatePipe, TranslationService } from '../../../core/i18n';

import { HttpClient } from '@angular/common/http';
import { CardQaService } from '../../games/card-qa/services/card-qa.service';

@Component({
  selector: 'app-shared-screen-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <a routerLink="/" class="font-bold text-sm text-neo-black hover:underline flex items-center gap-1">
          {{ 'sharedScreenSetup.back' | translate }}
        </a>
        <span class="neo-badge bg-neo-pink text-white">
          {{ 'sharedScreenSetup.badge' | translate }}
        </span>
      </div>

      <!-- Header Card -->
      <div class="neo-card bg-white">
        <div class="flex items-center gap-3 mb-2">
          <span class="text-3xl">📺</span>
          <div>
            <h1 class="text-2xl font-black text-neo-black">
              {{ 'sharedScreenSetup.title' | translate }}
            </h1>
            <p class="text-xs font-semibold text-neo-muted">
              {{ 'sharedScreenSetup.subtitle' | translate }}
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
            [placeholder]="'sharedScreenSetup.placeholder' | translate"
            class="neo-input flex-1" />
          <button 
            type="button" 
            (click)="addPlayer()" 
            [disabled]="!newPlayerName.trim()"
            class="neo-btn-primary px-6">
            {{ 'sharedScreenSetup.btnAdd' | translate }}
          </button>
        </div>
      </div>

      <!-- Players List / Order Card -->
      <div class="neo-card bg-white space-y-4">
        <div class="flex items-center justify-between border-b-3 border-neo-black pb-3">
          <h2 class="text-lg font-black text-neo-black">
            {{ 'sharedScreenSetup.rosterTitle' | translate:{ count: players.length } }}
          </h2>
          <span class="text-xs font-bold text-neo-muted">
            {{ 'sharedScreenSetup.minRecommended' | translate }}
          </span>
        </div>

        <div *ngIf="players.length === 0" class="p-8 text-center border-2 border-dashed border-neo-black/20 rounded-xl">
          <p class="font-bold text-sm text-neo-muted">{{ 'sharedScreenSetup.noPlayers' | translate }}</p>
        </div>

        <div class="space-y-2">
          <div 
            *ngFor="let p of players; let i = index" 
            class="p-3 bg-neo-bg border-2 border-neo-black rounded-xl transition-all"
            [ngClass]="{ 'ring-2 ring-neo-black bg-white': editingIndex === i }">
            
            <!-- Display Mode -->
            <div *ngIf="editingIndex !== i" class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="w-7 h-7 rounded-full bg-neo-yellow border-2 border-neo-black font-black text-xs flex items-center justify-center shrink-0">
                  {{ i + 1 }}
                </span>
                <span 
                  class="font-black text-base text-neo-black truncate cursor-pointer hover:underline decoration-2"
                  (click)="startEditing(i)">
                  {{ p }}
                </span>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button 
                  type="button"
                  (click)="startEditing(i)"
                  class="px-2.5 py-1 text-xs font-black rounded-lg border-2 border-neo-black bg-white hover:bg-neo-yellow text-neo-black transition active:scale-95 cursor-pointer flex items-center gap-1">
                  <span>✏️</span> {{ 'sharedScreenSetup.btnEdit' | translate }}
                </button>
                <button 
                  type="button"
                  (click)="removePlayer(i)"
                  class="px-2.5 py-1 text-xs font-black rounded-lg border-2 border-neo-black bg-white hover:bg-red-50 text-red-600 transition active:scale-95 cursor-pointer flex items-center gap-1">
                  <span>✕</span> {{ 'sharedScreenSetup.btnRemove' | translate }}
                </button>
              </div>
            </div>

            <!-- Inline Edit Mode -->
            <div *ngIf="editingIndex === i" class="space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-full bg-neo-cyan border-2 border-neo-black font-black text-xs flex items-center justify-center shrink-0">
                  {{ i + 1 }}
                </span>
                <input 
                  type="text" 
                  [(ngModel)]="editingName" 
                  (keyup.enter)="saveEdit(i)"
                  (keyup.escape)="cancelEdit()"
                  maxlength="25"
                  [placeholder]="'sharedScreenSetup.editPlaceholder' | translate"
                  class="neo-input flex-1 py-1 px-3 text-sm font-black border-2 border-neo-black"
                  autofocus />
                <button 
                  type="button"
                  (click)="saveEdit(i)" 
                  [disabled]="!editingName.trim()"
                  class="px-3 py-1.5 text-xs font-black rounded-lg border-2 border-neo-black bg-neo-cyan hover:bg-emerald-300 text-neo-black transition active:scale-95 cursor-pointer flex items-center gap-1">
                  <span>✓</span> {{ 'sharedScreenSetup.btnSave' | translate }}
                </button>
                <button 
                  type="button"
                  (click)="cancelEdit()" 
                  class="px-2.5 py-1.5 text-xs font-black rounded-lg border-2 border-neo-black bg-neo-gray hover:bg-gray-200 text-neo-muted transition active:scale-95 cursor-pointer">
                  {{ 'sharedScreenSetup.btnCancel' | translate }}
                </button>
              </div>
              <p *ngIf="editError" class="text-[11px] font-bold text-red-600 pl-9">
                ⚠️ {{ editError }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        <a routerLink="/" class="neo-btn-secondary flex-1 py-3 text-center">
          {{ 'common.cancel' | translate }}
        </a>
        <button 
          (click)="launchMatch()" 
          [disabled]="players.length < 1 || isLaunching"
          class="neo-btn-primary flex-1 py-3 text-center">
          <span *ngIf="!isLaunching">{{ 'sharedScreenSetup.startMatch' | translate:{ count: players.length } }}</span>
          <span *ngIf="isLaunching">{{ 'sharedScreenSetup.starting' | translate }}</span>
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
  private translationService = inject(TranslationService);
  private http = inject(HttpClient);
  private cardQaService = inject(CardQaService);

  game: Game | undefined;
  newPlayerName = '';
  players: string[] = [];
  isLaunching = false;

  editingIndex: number | null = null;
  editingName: string = '';
  editError: string = '';

  private configState: any = null;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') || 'charades-flash';
    this.configState = history.state || {};

    const queryParams = this.route.snapshot.queryParamMap;
    const autoStart = queryParams.get('autoStart') === '1' || queryParams.get('autoStart') === 'true';
    const playersParam = queryParams.get('players');
    const preset = queryParams.get('preset');
    const qParam = queryParams.get('q');

    if (playersParam) {
      const parsed = playersParam.split(',').map(p => p.trim()).filter(Boolean);
      if (parsed.length > 0) {
        this.players = parsed;
      }
    } else if (slug === 'card-qa') {
      this.players = ['Equipo 1', 'Equipo 2', 'Equipo 3', 'Equipo 4'];
    } else {
      this.players = [
        this.translationService.t('sharedScreenSetup.defaultPlayer1'),
        this.translationService.t('sharedScreenSetup.defaultPlayer2')
      ];
    }

    // Load custom questions / preset if present in share URL
    if (preset === 'examen-hechos-epistolas') {
      this.http.get<any>('/data/examen-hechos-epistolas.json').subscribe({
        next: (data) => {
          const list = Array.isArray(data) ? data : data?.questions;
          if (list?.length) {
            this.cardQaService.saveCustomQuestions(list);
          }
        },
        error: () => {}
      });
    } else if (qParam) {
      try {
        const decoded = decodeURIComponent(escape(atob(qParam)));
        const list = JSON.parse(decoded);
        if (Array.isArray(list) && list.length) {
          this.cardQaService.saveCustomQuestions(list);
        }
      } catch (err) {
        console.warn('Failed to parse questions from URL param:', err);
      }
    }

    this.gameService.getGames().subscribe(games => {
      this.game = games.find(g => g.slug === slug) || games[0];
      if (autoStart) {
        setTimeout(() => this.launchMatch(), 100);
      }
    });
  }

  addPlayer(): void {
    const name = this.newPlayerName.trim();
    if (name) {
      if (this.players.some(p => p.toLowerCase() === name.toLowerCase())) {
        return;
      }
      this.players.push(name);
      this.newPlayerName = '';
    }
  }

  removePlayer(index: number): void {
    if (this.editingIndex === index) {
      this.cancelEdit();
    }
    this.players.splice(index, 1);
  }

  startEditing(index: number): void {
    this.editingIndex = index;
    this.editingName = this.players[index];
    this.editError = '';
  }

  saveEdit(index: number): void {
    const trimmed = this.editingName.trim();
    if (!trimmed) {
      this.editError = this.translationService.t('sharedScreenSetup.errorEmpty');
      return;
    }
    const duplicate = this.players.some((p, i) => i !== index && p.toLowerCase() === trimmed.toLowerCase());
    if (duplicate) {
      this.editError = this.translationService.t('sharedScreenSetup.errorDuplicate');
      return;
    }
    this.players[index] = trimmed;
    this.editingIndex = null;
    this.editingName = '';
    this.editError = '';
  }

  cancelEdit(): void {
    this.editingIndex = null;
    this.editingName = '';
    this.editError = '';
  }

  launchMatch(): void {
    if (this.editingIndex !== null) {
      this.saveEdit(this.editingIndex);
    }
    if (!this.game || this.players.length === 0) return;
    this.isLaunching = true;

    const clientId = this.sessionService.getClientId();

    const matchName = this.configState?.matchName || localStorage.getItem('cardQa_matchName') || '';
    const gameSettingsJson = matchName ? JSON.stringify({ matchName }) : undefined;

    this.sessionService.createSharedScreenSession({
      gameId: this.game.id,
      mode: 'SharedScreen',
      hostClientId: clientId,
      maxPlayers: this.configState?.maxPlayers || 8,
      rounds: this.configState?.rounds || 3,
      timeLimitSeconds: this.configState?.timeLimitSeconds || 60,
      gameSettingsJson,
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
