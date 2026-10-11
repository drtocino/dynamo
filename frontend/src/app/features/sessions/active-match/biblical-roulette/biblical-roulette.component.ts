import { Component, Input, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStore } from '../../../../store/game.store';
import { InputService } from '../../../../core/services/input.service';
import { SessionService } from '../../../../core/services/session.service';
import { Session } from '../../../../core/models/session.model';
import { PhraseBoardComponent } from './phrase-board/phrase-board.component';
import { RouletteWheelComponent } from './roulette-wheel/roulette-wheel.component';
import { VowelStoreModalComponent } from './vowel-store-modal/vowel-store-modal.component';

export interface BiblicalRouletteState {
  currentRoundIndex: number;
  totalRounds: number;
  currentPhraseId: string;
  maskedPhrase: string;
  generalHint: string;
  specificHint: string;
  hintRevealed: boolean;
  revealedConsonants: string[];
  revealedVowels: string[];
  currentTurnPlayerId: string;
  currentTurnPlayerName?: string;
  playerNames?: { [id: string]: string };
  turnSequence: string[];
  currentVowelCost: number;
  lastSpinResult: string;
  lastSpinValue: number;
  lastSpinAngle: number;
  stagedConsonant?: string;
  lastRevealedCount: number;
  lastPointsEarned: number;
  turnStep: string; // 'SelectConsonantOrBuy' | 'AwaitingSpin' | 'RoundEnded' | 'GameFinished'
  roundWinnerId?: string;
  overallWinnerId?: string;
  roundsWon?: { [clientId: string]: number };
}

@Component({
  selector: 'app-biblical-roulette',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    PhraseBoardComponent, 
    RouletteWheelComponent, 
    VowelStoreModalComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Round Info & Turn Status Banner -->
      <div class="neo-card bg-neo-yellow text-neo-black p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span class="neo-badge bg-neo-black text-white text-xs">ROUND {{ rouletteState()?.currentRoundIndex || 1 }} OF {{ rouletteState()?.totalRounds || session?.rounds || 3 }}</span>
          <h2 class="text-xl sm:text-2xl font-black mt-1">
            Current Turn: 
            <span class="underline decoration-wavy decoration-neo-pink">
              {{ currentTurnPlayerName() }}
            </span>
            <span *ngIf="isMyTurn()" class="text-xs bg-neo-pink text-white px-2.5 py-0.5 rounded-full ml-2 uppercase font-black tracking-wide">
              {{ session?.mode === 'SharedScreen' ? 'Active Turn' : "It's Your Turn!" }}
            </span>
          </h2>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-black uppercase text-neo-black bg-white px-3 py-1.5 rounded-lg border-2 border-neo-black shadow-neo-sm">
            Status: {{ formatTurnStep(rouletteState()?.turnStep) }}
          </span>
        </div>
      </div>

      <!-- Phrase Board Display -->
      <app-phrase-board
        [maskedPhrase]="rouletteState()?.maskedPhrase || defaultMaskedPhrase()"
        [generalHint]="rouletteState()?.generalHint || 'Biblical Verse'"
        [specificHint]="rouletteState()?.specificHint || 'Special Clue'"
        [hintRevealed]="rouletteState()?.hintRevealed || false"
        [revealedConsonants]="rouletteState()?.revealedConsonants || []"
        [revealedVowels]="rouletteState()?.revealedVowels || []">
      </app-phrase-board>

      <!-- Center Gameplay Arena: Roulette Wheel + Action Controls -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <!-- Roulette Wheel -->
        <div class="lg:col-span-6 flex justify-center sticky top-4">
          <app-roulette-wheel
            [targetRotation]="rouletteState()?.lastSpinAngle || 0"
            [lastResult]="rouletteState()?.lastSpinResult || ''"
            [isSpinning]="isWheelSpinning()"
            (spinComplete)="onSpinAnimationFinished($event)">
          </app-roulette-wheel>
        </div>

        <!-- Player Actions Controls -->
        <div class="lg:col-span-6 space-y-4">
          <div class="neo-card bg-white p-6 space-y-4">
            <h3 class="font-black text-lg text-neo-black flex items-center justify-between">
              <span class="flex items-center gap-2"><span>🎮</span> Turn Actions</span>
              <span class="text-xs font-extrabold text-neo-muted">Turn Points: {{ currentTurnPlayerScore() }} pts</span>
            </h3>

            <!-- Turn Step Instructions Callout (Stable height) -->
            <div class="p-3.5 rounded-xl border-3 border-neo-black font-extrabold text-xs min-h-[64px] flex items-center"
              [ngClass]="{
                'bg-neo-bg text-neo-black': !currentStagedConsonant(),
                'bg-neo-cyan text-neo-black animate-pulse': !!currentStagedConsonant() && !isWheelSpinning(),
                'bg-neo-yellow text-neo-black': isWheelSpinning()
              }">
              <div *ngIf="isWheelSpinning()" class="flex items-center gap-2">
                <span class="text-lg animate-spin">🎡</span>
                <span>Roulette is spinning! Watch the pointer land on your multiplier...</span>
              </div>
              <div *ngIf="!isWheelSpinning() && !currentStagedConsonant()">
                👉 <b>Step 1:</b> Select a consonant from the keyboard below, or buy a vowel!
              </div>
              <div *ngIf="!isWheelSpinning() && !!currentStagedConsonant()">
                🎯 <b>Step 2:</b> Consonant <b>'{{ currentStagedConsonant() }}'</b> chosen! Now tap <b>Spin Roulette</b> to reveal letters!
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- Spin Roulette Button (Blocked until letter is picked!) -->
              <button
                (click)="spinRoulette()"
                [disabled]="!canSpin()"
                class="neo-btn-primary text-sm py-3.5 px-4 flex items-center justify-center gap-2 font-black shadow-neo-sm transition-all"
                [ngClass]="{
                  'bg-neo-yellow hover:bg-yellow-300 text-neo-black ring-4 ring-neo-black cursor-pointer': canSpin(),
                  'bg-neo-gray text-neo-muted opacity-40 cursor-not-allowed': !canSpin()
                }">
                <span>🎰</span> 
                <span>{{ currentStagedConsonant() ? 'Spin Roulette for (' + currentStagedConsonant() + ')' : 'Spin Roulette (Pick Letter First)' }}</span>
              </button>

              <!-- Buy Vowel Button -->
              <button
                (click)="openVowelStore()"
                [disabled]="!canBuyVowel()"
                class="neo-btn-primary bg-neo-cyan text-neo-black text-sm py-3.5 px-4 flex items-center justify-center gap-2 font-black shadow-neo-sm disabled:opacity-40 disabled:cursor-not-allowed">
                <span>🔤</span> Buy Vowel ({{ rouletteState()?.currentVowelCost || 100 }} pts)
              </button>

              <!-- Buy Specific Hint Button -->
              <button
                (click)="buySpecificHint()"
                [disabled]="rouletteState()?.hintRevealed || currentTurnPlayerScore() < 500"
                class="neo-btn-secondary text-xs py-3 px-4 flex items-center justify-center gap-1 font-black shadow-neo-sm disabled:opacity-40 disabled:cursor-not-allowed">
                <span>💡</span> Buy Hint (500 pts)
              </button>

              <!-- Solve Full Phrase Button -->
              <button
                (click)="isSolveModalOpen = true"
                [disabled]="isWheelSpinning()"
                class="neo-btn-primary bg-neo-pink text-white text-xs py-3 px-4 flex items-center justify-center gap-1 font-black shadow-neo-sm disabled:opacity-40 disabled:cursor-not-allowed">
                <span>🎯</span> Solve Phrase
              </button>
            </div>

            <!-- Last Action Feedback Alert (Fixed-height reserved container avoids pushing keyboard) -->
            <div class="min-h-[44px] flex items-center">
              <div *ngIf="lastActionMessage" class="w-full p-2.5 bg-neo-yellow/30 border-2 border-neo-black rounded-xl text-xs font-black text-neo-black animate-fade-in flex items-center gap-2">
                <span>🔔</span>
                <span class="truncate">{{ lastActionMessage }}</span>
              </div>
            </div>
          </div>

          <!-- Consonant Keyboard (Step 1: Player picks a consonant first!) -->
          <div class="neo-card bg-white p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-black uppercase text-neo-black tracking-wider flex items-center gap-1.5">
                <span>1️⃣</span> Consonant Selection
              </h4>
              <span class="text-[11px] font-bold text-neo-pink" *ngIf="currentStagedConsonant()">
                Selected: '{{ currentStagedConsonant() }}' (Tap spin above)
              </span>
              <span class="text-[11px] font-bold text-neo-muted" *ngIf="!currentStagedConsonant()">
                Click any letter to stage your guess
              </span>
            </div>

            <div class="flex flex-wrap gap-1.5 justify-center">
              <button
                *ngFor="let c of consonants"
                [disabled]="!canPickConsonant(c)"
                (click)="selectConsonant(c)"
                class="w-8 h-9 sm:w-9 sm:h-10 rounded-lg border-2 border-neo-black font-black text-sm flex items-center justify-center transition active:translate-y-0.5 shadow-neo-sm"
                [ngClass]="{
                  'bg-neo-pink text-white ring-2 ring-neo-black translate-y-0.5 shadow-none': currentStagedConsonant() === c,
                  'bg-white hover:bg-neo-yellow text-neo-black cursor-pointer': canPickConsonant(c) && currentStagedConsonant() !== c,
                  'bg-neo-gray text-neo-muted opacity-40 cursor-not-allowed': !canPickConsonant(c)
                }">
                {{ c }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Player Roster & Statistics -->
      <div class="neo-card bg-white p-6 space-y-4">
        <h3 class="text-sm font-black uppercase tracking-wider text-neo-muted flex items-center gap-2">
          <span>🏆</span> Player Standings & Rounds Solved
        </h3>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            *ngFor="let p of session?.players"
            [class.border-neo-yellow]="isCurrentTurnPlayer(p)"
            [class.bg-neo-bg]="isCurrentTurnPlayer(p)"
            class="p-3 rounded-xl border-3 border-neo-black flex flex-col items-center text-center shadow-neo-sm">
            <span class="text-2xl mb-1">
              {{ isCurrentTurnPlayer(p) ? '⭐' : '👤' }}
            </span>
            <span class="font-black text-sm text-neo-black truncate max-w-full">{{ p.name }}</span>
            <span class="text-xs font-black text-neo-pink mt-1">
              {{ getPlayerScore(p.id) || getPlayerScore(p.clientId) }} pts
            </span>
            <span class="text-[10px] font-bold text-neo-muted mt-0.5">
              Solved: {{ getPlayerRoundsWon(p.id) || getPlayerRoundsWon(p.clientId) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Vowel Store Modal -->
      <app-vowel-store-modal
        [isOpen]="isVowelModalOpen"
        [vowelCost]="rouletteState()?.currentVowelCost || 100"
        [playerPoints]="currentTurnPlayerScore()"
        [revealedVowels]="rouletteState()?.revealedVowels || []"
        (vowelSelected)="onVowelSelected($event)"
        (close)="isVowelModalOpen = false">
      </app-vowel-store-modal>

      <!-- Solve Phrase Modal -->
      <div *ngIf="isSolveModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-black/60 backdrop-blur-sm">
        <div class="relative w-full max-w-md bg-white rounded-2xl border-4 border-neo-black shadow-neo p-6 space-y-4">
          <h2 class="text-2xl font-black text-neo-black">Solve the Verse</h2>
          <p class="text-xs font-bold text-neo-muted">Type your complete phrase guess below:</p>

          <input
            type="text"
            [(ngModel)]="solvePhraseGuess"
            placeholder="Type complete verse..."
            class="w-full p-3 border-3 border-neo-black rounded-xl font-black text-base uppercase focus:outline-none focus:ring-2 focus:ring-neo-yellow" />

          <div class="flex gap-2 pt-2">
            <button
              (click)="submitSolveGuess()"
              [disabled]="!solvePhraseGuess.trim()"
              class="flex-1 neo-btn-primary bg-neo-pink text-white py-3 text-sm font-black disabled:opacity-40">
              Submit Guess
            </button>
            <button
              (click)="isSolveModalOpen = false"
              class="neo-btn-secondary px-4 py-3 text-sm font-black">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BiblicalRouletteComponent implements OnDestroy {
  @Input() session: Session | undefined;

  private gameStore = inject(GameStore);
  private inputService = inject(InputService);
  private sessionService = inject(SessionService);

  isVowelModalOpen = false;
  isSolveModalOpen = false;
  solvePhraseGuess = '';
  isWheelSpinning = signal<boolean>(false);
  lastActionMessage = '';
  localStagedConsonant = signal<string>('');
  private spinSafetyTimer: any = null;

  consonants: string[] = [
    'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M',
    'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
  ];

  rouletteState = computed(() => {
    const raw = this.gameStore.effectiveState().payload;
    if (!raw) return undefined;
    return raw as BiblicalRouletteState;
  });

  currentStagedConsonant = computed(() => {
    const revealed = this.rouletteState()?.revealedConsonants || [];
    const local = this.localStagedConsonant();
    if (local) {
      if (revealed.includes(local)) {
        return '';
      }
      return local;
    }
    const serverStaged = this.rouletteState()?.stagedConsonant;
    if (serverStaged && !revealed.includes(serverStaged)) {
      return serverStaged;
    }
    return '';
  });

  myClientId = computed(() => {
    return this.sessionService.getClientId();
  });

  isMyTurn = computed(() => {
    // Biblical Roulette is an authoritative shared-screen turn game; active turns are always playable on screen
    return true;
  });

  currentTurnPlayerScore = computed(() => {
    const state = this.rouletteState();
    const players = this.gameStore.effectiveState().players;
    if (!players) return 0;
    if (state?.currentTurnPlayerId && players[state.currentTurnPlayerId]) {
      return players[state.currentTurnPlayerId].score;
    }
    const myId = this.myClientId();
    if (players[myId]) {
      return players[myId].score;
    }
    return 0;
  });

  currentTurnPlayerName = computed(() => {
    const state = this.rouletteState();
    if (state?.currentTurnPlayerName) {
      return state.currentTurnPlayerName;
    }
    const turnId = state?.currentTurnPlayerId;
    if (turnId && this.session?.players) {
      const p = this.session.players.find(pl => 
        pl.id.toLowerCase() === turnId.toLowerCase() || 
        pl.clientId.toLowerCase() === turnId.toLowerCase()
      );
      if (p) return p.name;
    }
    return this.session?.players[0]?.name || 'Player 1';
  });

  defaultMaskedPhrase = computed(() => {
    return '___ ___ __ _____ ___ _____';
  });

  canSpin = computed(() => {
    return !this.isWheelSpinning() && !!this.currentStagedConsonant();
  });

  canBuyVowel = computed(() => {
    if (this.isWheelSpinning()) return false;
    const cost = this.rouletteState()?.currentVowelCost || 100;
    return this.currentTurnPlayerScore() >= cost;
  });

  isCurrentTurnPlayer(p: any): boolean {
    const turnId = this.rouletteState()?.currentTurnPlayerId;
    if (!turnId) return p === this.session?.players[0];
    return p.id.toLowerCase() === turnId.toLowerCase() || p.clientId.toLowerCase() === turnId.toLowerCase();
  }

  getPlayerName(id?: string): string {
    if (!id || !this.session) return 'Winner';
    const p = this.session.players.find(pl => 
      pl.id.toLowerCase() === id.toLowerCase() || 
      pl.clientId.toLowerCase() === id.toLowerCase()
    );
    return p ? p.name : id;
  }

  getPlayerScore(id: string): number {
    const players = this.gameStore.effectiveState().players;
    if (players && players[id]) {
      return players[id].score;
    }
    return 0;
  }

  getPlayerRoundsWon(id: string): number {
    const won = this.rouletteState()?.roundsWon;
    return (won && won[id]) || 0;
  }

  canPickConsonant(letter: string): boolean {
    if (this.isWheelSpinning()) return false;
    const revealed = this.rouletteState()?.revealedConsonants || [];
    return !revealed.includes(letter);
  }

  selectConsonant(letter: string): void {
    if (!this.session) return;
    this.localStagedConsonant.set(letter);
    this.lastActionMessage = `Selected consonant '${letter}'. Now tap Spin Roulette!`;
    this.inputService.dispatchIntent('SELECT_CONSONANT', { letter }, this.session.id);
  }

  spinRoulette(): void {
    if (this.isWheelSpinning()) return;
    const letter = this.currentStagedConsonant();
    if (!letter) {
      this.lastActionMessage = '👉 Please select a consonant from the keyboard below first!';
      return;
    }

    if (!this.session) return;
    this.isWheelSpinning.set(true);
    this.localStagedConsonant.set('');
    this.lastActionMessage = '';

    // Safety timeout: guaranteed reset of spinning state after 5 seconds
    if (this.spinSafetyTimer) clearTimeout(this.spinSafetyTimer);
    this.spinSafetyTimer = setTimeout(() => {
      if (this.isWheelSpinning()) {
        this.onSpinAnimationFinished(this.rouletteState()?.lastSpinResult || '');
      }
    }, 5000);

    this.inputService.dispatchIntent('SPIN_ROULETTE', { letter }, this.session.id);
  }

  onSpinAnimationFinished(result: string): void {
    if (this.spinSafetyTimer) {
      clearTimeout(this.spinSafetyTimer);
      this.spinSafetyTimer = null;
    }
    this.isWheelSpinning.set(false);
    this.localStagedConsonant.set('');

    const state = this.rouletteState();
    if (result === 'BANKRUPT') {
      this.lastActionMessage = '💥 BANKRUPT! Lost all turn points. Turn passed to next player.';
    } else if (result === 'MISS TURN') {
      this.lastActionMessage = '⏭️ MISS TURN! Turn passed to next player.';
    } else if (state) {
      if (state.lastRevealedCount > 0) {
        this.lastActionMessage = `🎉 Landed on ${state.lastSpinValue} pts! Found ${state.lastRevealedCount} letter(s) (+${state.lastPointsEarned} pts)!`;
      } else {
        this.lastActionMessage = `❌ No occurrences found in the verse. Turn passed to next player.`;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.spinSafetyTimer) {
      clearTimeout(this.spinSafetyTimer);
    }
  }

  openVowelStore(): void {
    this.isVowelModalOpen = true;
  }

  onVowelSelected(vowel: string): void {
    if (!this.session) return;
    this.localStagedConsonant.set('');
    this.inputService.dispatchIntent('PURCHASE_VOWEL', { letter: vowel }, this.session.id);
    this.isVowelModalOpen = false;
  }

  buySpecificHint(): void {
    if (!this.session) return;
    this.inputService.dispatchIntent('PURCHASE_HINT', null, this.session.id);
  }

  submitSolveGuess(): void {
    if (!this.session || !this.solvePhraseGuess.trim()) return;
    this.inputService.dispatchIntent('SOLVE_PHRASE', { phrase: this.solvePhraseGuess.trim() }, this.session.id);
    this.solvePhraseGuess = '';
    this.isSolveModalOpen = false;
  }

  formatTurnStep(step?: string): string {
    switch (step) {
      case 'SelectConsonantOrBuy': return '1. Pick Consonant or Buy Vowel';
      case 'AwaitingSpin': return '2. Spin the Wheel!';
      case 'RoundEnded': return 'Round Concluded';
      case 'GameFinished': return 'Game Finished';
      default: return '1. Pick Consonant or Buy Vowel';
    }
  }
}
