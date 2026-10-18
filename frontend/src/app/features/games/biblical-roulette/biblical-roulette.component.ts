import { Component, Input, OnDestroy, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStore } from '../../../store/game.store';
import { InputService } from '../../../core/services/input.service';
import { SessionService } from '../../../core/services/session.service';
import { ModalService } from '../../../core/services/modal.service';
import { Session } from '../../../core/models/session.model';
import { PhraseBoardComponent } from './phrase-board/phrase-board.component';
import { RouletteWheelComponent } from './roulette-wheel/roulette-wheel.component';
import { VowelStoreModalComponent } from './vowel-store-modal/vowel-store-modal.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

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
  solvedPhrase?: string;
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
    VowelStoreModalComponent,
    ModalComponent,
    ButtonComponent
  ],
  template: `
    <div class="space-y-3 w-full">
      <!-- Round Info & Turn Status Section (No background, outer border, or padding) -->
      <div class="w-full flex flex-wrap items-center justify-between gap-2 select-none">
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span class="px-2.5 py-1 rounded-lg bg-neo-black text-white text-xs font-black">
            ROUND {{ rouletteState()?.currentRoundIndex || 1 }}/{{ rouletteState()?.totalRounds || session?.rounds || 3 }}
          </span>
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-black text-neo-muted uppercase">Turn:</span>
            <span class="text-sm sm:text-base font-black text-neo-black underline decoration-2 decoration-neo-pink">
              {{ displayedTurnPlayerName() }}
            </span>
            <span *ngIf="isMyTurn()" class="text-[10px] bg-neo-pink text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wide">
              {{ session?.mode === 'SharedScreen' ? 'Active' : "Your Turn" }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-black">
          <span class="bg-white text-neo-black px-2.5 py-1 rounded-lg border-2 border-neo-black uppercase tracking-tight">
            Status: {{ formatTurnStep(rouletteState()?.turnStep) }}
          </span>
          <span class="bg-neo-black text-white px-2.5 py-1 rounded-lg border-2 border-neo-black">
            Turn: {{ displayedTurnPlayerScore() }} pts
          </span>
        </div>
      </div>

      <!-- Row 1: Wheel (1/4 = lg:col-span-3) and Phrase Board (3/4 = lg:col-span-9) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full">
        <!-- 1/4 Wheel Column -->
        <div class="lg:col-span-3 w-full h-full flex flex-col">
          <app-roulette-wheel
            class="w-full h-full flex flex-col"
            [targetRotation]="rouletteState()?.lastSpinAngle || 0"
            [lastResult]="rouletteState()?.lastSpinResult || ''"
            [isSpinning]="isWheelSpinning()"
            (spinComplete)="onSpinAnimationFinished($event)">
          </app-roulette-wheel>
        </div>

        <!-- 3/4 Phrase Board Column -->
        <div class="lg:col-span-9 w-full h-full flex flex-col">
          <app-phrase-board
            class="w-full h-full flex flex-col"
            [maskedPhrase]="displayedMaskedPhrase()"
            [generalHint]="rouletteState()?.generalHint || 'Biblical Verse'"
            [specificHint]="rouletteState()?.specificHint || 'Special Clue'"
            [hintRevealed]="rouletteState()?.hintRevealed || false"
            [revealedConsonants]="displayedRevealedConsonants()"
            [revealedVowels]="rouletteState()?.revealedVowels || []">
          </app-phrase-board>
        </div>
      </div>

      <!-- Row 2: Controls (1/6 = lg:col-span-2), Consonants (3/6 = lg:col-span-6), Players (2/6 = lg:col-span-4) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch w-full min-h-[260px]">
        <!-- 1/6 Controls Column -->
        <div class="lg:col-span-2 w-full h-full">
          <div class="neo-card bg-white p-3 flex flex-col justify-between h-full space-y-2 select-none shadow-none">
            <div>
              <div class="flex items-center justify-between border-b-2 border-neo-black pb-1.5 mb-2">
                <h3 class="font-black text-xs uppercase text-neo-black flex items-center gap-1">
                  <span>🎮</span> Controls
                </h3>
                <span class="text-[10px] font-extrabold text-neo-pink">
                  {{ displayedTurnPlayerScore() }} pts
                </span>
              </div>

              <!-- Reusable Action Buttons (All h-11 via app-button) -->
              <div class="flex flex-col space-y-2">
                <app-button
                  variant="yellow"
                  [disabled]="!canSpin()"
                  (onClick)="spinRoulette()">
                  <span>🎰</span>
                  <span class="truncate">{{ currentStagedConsonant() ? 'Spin (' + currentStagedConsonant() + ')' : 'Spin Roulette' }}</span>
                </app-button>

                <div class="grid grid-cols-2 gap-1.5">
                  <app-button
                    variant="cyan"
                    [disabled]="!canBuyVowel()"
                    (onClick)="openVowelStore()">
                    <span>🔤</span> Vowel
                  </app-button>

                  <app-button
                    variant="secondary"
                    [disabled]="rouletteState()?.hintRevealed || currentTurnPlayerScore() < 500"
                    (onClick)="buySpecificHint()">
                    <span>💡</span> Hint
                  </app-button>
                </div>

                <app-button
                  variant="pink"
                  [disabled]="isWheelSpinning()"
                  (onClick)="openSolveModal()">
                  <span>🎯</span> Solve Verse
                </app-button>
              </div>
            </div>

            <div class="text-[10px] font-bold text-neo-muted text-center border-t border-neo-black/20 pt-1">
              <span>Actions update turn dynamically</span>
            </div>
          </div>
        </div>

        <!-- 3/6 Consonants Column: exactly 3 rows of 7 consonants -->
        <div class="lg:col-span-6 w-full h-full">
          <div class="neo-card bg-white p-3 sm:p-4 flex flex-col justify-between h-full space-y-2 select-none shadow-none">
            <div class="flex items-center justify-between border-b-2 border-neo-black pb-1.5 flex-wrap gap-1">
              <h4 class="text-xs font-black uppercase text-neo-black tracking-wider flex items-center gap-1.5">
                <span>🔤</span> Consonants
              </h4>
              <span class="text-xs font-black text-neo-pink" *ngIf="currentStagedConsonant()">
                Selected: '{{ currentStagedConsonant() }}' ➡️ Tap Spin on left!
              </span>
              <span class="text-xs font-bold text-neo-muted" *ngIf="!currentStagedConsonant()">
                Pick a consonant to stage your spin
              </span>
            </div>

            <!-- 8 columns layout for consonants -->
            <div class="grid grid-cols-8 gap-1.5 sm:gap-2 flex-1 items-center py-1">
              <button
                *ngFor="let c of consonants"
                [disabled]="!canPickConsonant(c)"
                (click)="selectConsonant(c)"
                class="h-11 sm:h-12 rounded-xl border-3 border-neo-black font-black text-sm sm:text-base flex items-center justify-center transition active:scale-95 shadow-none"
                [ngClass]="{
                  'bg-neo-pink text-white': currentStagedConsonant() === c,
                  'bg-white hover:bg-neo-yellow text-neo-black cursor-pointer': canPickConsonant(c) && currentStagedConsonant() !== c,
                  'bg-neo-gray text-neo-muted opacity-35 cursor-not-allowed': !canPickConsonant(c)
                }">
                {{ c }}
              </button>
            </div>

            <div class="flex items-center justify-between text-[11px] font-bold text-neo-muted border-t border-neo-black/20 pt-1">
              <span>8 columns · 21 letters</span>
              <span>Vowels available in Vowel Store</span>
            </div>
          </div>
        </div>

        <!-- 2/6 Players Column: smaller child component without icon and bigger score -->
        <div class="lg:col-span-4 w-full h-full">
          <div class="neo-card bg-white p-3 sm:p-4 flex flex-col justify-between h-full space-y-2 select-none shadow-none">
            <div class="flex items-center justify-between border-b-2 border-neo-black pb-1.5">
              <h3 (click)="openGameLogModal()" class="text-xs font-black uppercase tracking-wider text-neo-black flex items-center gap-1.5 cursor-pointer">
                <span>🏆</span> Players & Scores
              </h3>
              <span class="text-[11px] font-bold text-neo-muted">
                Rounds Solved
              </span>
            </div>

            <!-- Players Child Items: smaller without icon, bigger score -->
            <div class="grid grid-cols-2 gap-2 flex-1 content-start py-1">
              <div
                *ngFor="let p of session?.players"
                class="p-2 sm:p-2.5 rounded-xl border-2 sm:border-3 border-neo-black flex flex-col justify-between transition-all"
                [ngClass]="{
                  'bg-neo-yellow/25 border-neo-black ring-2 ring-neo-yellow': isCurrentTurnPlayer(p),
                  'bg-neo-bg': !isCurrentTurnPlayer(p)
                }">
                
                <div class="flex items-center justify-between gap-1">
                  <span class="font-black text-xs sm:text-sm text-neo-black truncate">{{ p.name }}</span>
                  <span *ngIf="isCurrentTurnPlayer(p)" class="px-1.5 py-0.2 rounded bg-neo-pink text-white font-black text-[9px] uppercase tracking-tight shrink-0">
                    TURN
                  </span>
                </div>

                <div class="mt-1.5 flex items-baseline justify-between gap-1">
                  <span class="text-base sm:text-lg font-black text-neo-pink leading-none">
                    {{ getDisplayedPlayerScore(p.id) || getDisplayedPlayerScore(p.clientId) }}<span class="text-[10px] text-neo-black ml-0.5 font-bold">pts</span>
                  </span>
                  <span class="text-[10px] font-bold text-neo-muted">
                    Won: {{ getPlayerRoundsWon(p.id) || getPlayerRoundsWon(p.clientId) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="text-[11px] font-bold text-neo-muted text-center border-t border-neo-black/20 pt-1">
              <span>Standings update dynamically</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Vowel Store Modal (Base Modal Integration) -->
      <app-vowel-store-modal
        [isOpen]="isVowelModalOpen"
        [vowelCost]="rouletteState()?.currentVowelCost || 100"
        [playerPoints]="currentTurnPlayerScore()"
        [revealedVowels]="rouletteState()?.revealedVowels || []"
        (vowelSelected)="onVowelSelected($event)"
        (close)="closeVowelModal()">
      </app-vowel-store-modal>

      <!-- Solve Phrase Modal (Base Modal Integration) -->
      <app-modal
        modalId="solveVerse"
        [isOpen]="isSolveModalOpen"
        title="Solve the Verse"
        subtitle="Type your complete phrase guess below"
        icon="🎯"
        (close)="closeSolveModal()">
        
        <div class="space-y-4">
          <input
            type="text"
            [(ngModel)]="solvePhraseGuess"
            placeholder="Type complete verse..."
            class="w-full p-3 border-3 border-neo-black rounded-xl font-black text-base uppercase focus:outline-none focus:ring-2 focus:ring-neo-yellow" />

          <div class="flex gap-2 pt-1.5 border-t border-neo-black/10">
            <div class="flex-1">
              <app-button
                variant="pink"
                [disabled]="!solvePhraseGuess.trim()"
                (onClick)="submitSolveGuess()">
                Submit Guess
              </app-button>
            </div>
            <div class="w-28">
              <app-button
                variant="secondary"
                (onClick)="closeSolveModal()">
                Cancel
              </app-button>
            </div>
          </div>
        </div>
      </app-modal>

      <!-- Spin Result Summary Modal (Base Modal Integration) -->
      <app-modal
        modalId="spinResult"
        [isOpen]="isSpinResultModalOpen"
        [title]="getSpinModalTitle()"
        [subtitle]="getSpinModalSubtitle()"
        icon="🎡"
        [showCloseButton]="false"
        (close)="closeSpinResultModal()">
        
        <div class="space-y-3">
          <!-- 1. Amount Found on Wheel -->
          <div class="p-3.5 rounded-xl border-3 border-neo-black bg-neo-bg flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">🎡</span>
              <div>
                <span class="text-[11px] font-black uppercase tracking-wider text-neo-muted block">Amount Landed</span>
                <span class="text-sm font-black text-neo-black">
                  {{ spinResultModalData.isBankrupt ? 'BANKRUPT (Lose All Points)' : (spinResultModalData.isMissTurn ? 'MISS TURN (Pass Turn)' : (spinResultModalData.prizeAmount + ' pts per letter')) }}
                </span>
              </div>
            </div>
            <span 
              class="px-2.5 py-1 rounded-lg border-2 border-neo-black font-black text-xs"
              [ngClass]="{
                'bg-neo-pink text-white': spinResultModalData.isBankrupt,
                'bg-purple-600 text-white': spinResultModalData.isMissTurn,
                'bg-neo-cyan text-neo-black': !spinResultModalData.isBankrupt && !spinResultModalData.isMissTurn
              }">
              {{ spinResultModalData.resultLabel }}
            </span>
          </div>

          <!-- 2. Count of Letters Found in Phrase -->
          <div class="p-3.5 rounded-xl border-3 border-neo-black bg-neo-bg flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">🔤</span>
              <div>
                <span class="text-[11px] font-black uppercase tracking-wider text-neo-muted block">Letters Found</span>
                <span class="text-sm font-black text-neo-black">
                  <span *ngIf="spinResultModalData.lettersCount > 0">
                    {{ spinResultModalData.lettersCount }} × letter '{{ spinResultModalData.letter }}'
                  </span>
                  <span *ngIf="spinResultModalData.lettersCount === 0 && spinResultModalData.letter">
                    0 × letter '{{ spinResultModalData.letter }}'
                  </span>
                  <span *ngIf="!spinResultModalData.letter">
                    No letter selected
                  </span>
                </span>
              </div>
            </div>
            <span 
              class="w-8 h-8 rounded-lg border-2 border-neo-black font-black text-sm flex items-center justify-center"
              [ngClass]="{
                'bg-neo-yellow text-neo-black': spinResultModalData.lettersCount > 0,
                'bg-neo-gray text-neo-muted': spinResultModalData.lettersCount === 0
              }">
              {{ spinResultModalData.lettersCount }}
            </span>
          </div>

          <!-- 3. Final Score Obtained on Turn Spin -->
          <div class="p-3.5 rounded-xl border-3 border-neo-black bg-neo-bg flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">⭐</span>
              <div>
                <span class="text-[11px] font-black uppercase tracking-wider text-neo-muted block">Final Score Obtained</span>
                <span class="text-base font-black text-neo-black">
                  <span *ngIf="spinResultModalData.finalTurnScore > 0" class="text-emerald-700">
                    +{{ spinResultModalData.finalTurnScore }} pts
                  </span>
                  <span *ngIf="spinResultModalData.finalTurnScore === 0" class="text-neo-muted">
                    0 pts
                  </span>
                </span>
              </div>
            </div>
            <span *ngIf="spinResultModalData.lettersCount > 0 && spinResultModalData.prizeAmount > 0" class="text-xs font-bold text-neo-muted">
              {{ spinResultModalData.lettersCount }} × {{ spinResultModalData.prizeAmount }}
            </span>
          </div>

          <!-- Continue Button Reusing ButtonComponent (Reduced spacing) -->
          <div class="pt-1.5 border-t border-neo-black/10">
            <app-button
              variant="yellow"
              (onClick)="closeSpinResultModal()">
              <span>Continue</span>
              <span>➡️</span>
            </app-button>
          </div>
        </div>
      </app-modal>

      <!-- Winner Celebration Modal (Base Modal Integration) -->
      <app-modal
        modalId="winnerCelebration"
        [isOpen]="isWinnerModalOpen"
        [title]="winnerModalData.isOverallWinner ? 'Champion Celebrated!' : 'Phrase Solved!'"
        [subtitle]="winnerModalData.isOverallWinner ? 'Match concluded with final standings' : 'Congratulations to the winner!'"
        icon="🏆"
        maxWidth="lg"
        (close)="closeWinnerModal()">

        <div class="space-y-4">
          <!-- Winner Fanfare Banner -->
          <div class="p-4 bg-neo-yellow rounded-xl border-3 border-neo-black text-center space-y-1">
            <div class="text-3xl animate-bounce">👑</div>
            <span class="text-xs font-black uppercase text-neo-black/70 block tracking-wider">
              {{ winnerModalData.isOverallWinner ? 'Overall Tournament Winner' : 'Round Winner' }}
            </span>
            <h3 class="text-2xl sm:text-3xl font-black text-neo-black">
              {{ winnerModalData.winnerName }}
            </h3>
            <p class="text-xs font-extrabold text-neo-black/80">
              {{ winnerModalData.isOverallWinner ? 'Achieved highest scripture completions and points!' : 'Solved the scripture and collected the round points!' }}
            </p>
          </div>

          <!-- Solved Verse Display -->
          <div *ngIf="winnerModalData.solvedPhrase" class="p-3 bg-neo-bg rounded-xl border-2 border-neo-black text-center">
            <span class="text-[10px] font-black uppercase text-neo-muted block mb-0.5">Completed Scripture</span>
            <span class="text-sm sm:text-base font-black text-neo-black uppercase tracking-wide">
              "{{ winnerModalData.solvedPhrase }}"
            </span>
          </div>

          <!-- Team / Player Results Standings List (Amount Collected by Each Team) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <h4 class="text-xs font-black uppercase tracking-wider text-neo-muted flex items-center gap-1.5">
                <span>📊</span> Team Results & Points Collected
              </h4>
              <span class="text-[11px] font-bold text-neo-muted">
                {{ winnerModalData.playerResults.length }} teams
              </span>
            </div>

            <div class="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
              <div 
                *ngFor="let result of winnerModalData.playerResults; let idx = index"
                class="p-2.5 rounded-xl border-2 sm:border-3 border-neo-black flex items-center justify-between gap-3"
                [ngClass]="{
                  'bg-neo-yellow/30 border-neo-black': result.isWinner,
                  'bg-white': !result.isWinner
                }">
                
                <div class="flex items-center gap-2.5 min-w-0">
                  <span 
                    class="w-7 h-7 rounded-lg border-2 border-neo-black font-black text-xs flex items-center justify-center shrink-0"
                    [ngClass]="{
                      'bg-neo-yellow text-neo-black': idx === 0,
                      'bg-neo-cyan text-neo-black': idx === 1,
                      'bg-neo-bg text-neo-muted': idx > 1
                    }">
                    #{{ idx + 1 }}
                  </span>
                  <div class="min-w-0">
                    <span class="font-black text-sm text-neo-black truncate block">
                      {{ result.name }}
                      <span *ngIf="result.isWinner" class="text-[10px] bg-neo-pink text-white px-1.5 py-0.5 rounded font-black ml-1 uppercase">Winner</span>
                    </span>
                    <span class="text-[10px] font-bold text-neo-muted">
                      Solved: {{ result.roundsWon }} {{ result.roundsWon === 1 ? 'round' : 'rounds' }}
                    </span>
                  </div>
                </div>

                <div class="text-right shrink-0">
                  <span class="text-base sm:text-lg font-black text-neo-black block leading-none">
                    {{ result.score }} pts
                  </span>
                  <span class="text-[9px] font-bold text-neo-muted uppercase">Collected</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Continue / Dismiss Button Reusing ButtonComponent (Reduced spacing) -->
          <div class="pt-1.5 border-t border-neo-black/10">
            <app-button 
              variant="yellow"
              (onClick)="closeWinnerModal()">
              <span>Continue</span>
              <span>➡️</span>
            </app-button>
          </div>
        </div>
      </app-modal>

      <!-- Game Log Modal (Base Modal Integration) -->
      <app-modal
        modalId="gameLog"
        [isOpen]="isGameLogModalOpen"
        title="Game Log"
        subtitle="Match actions and event timeline"
        icon="📜"
        (close)="closeGameLogModal()">
        
        <div class="space-y-2.5">
          <div *ngIf="gameLogs.length === 0" class="p-4 bg-neo-bg rounded-xl border-2 border-neo-black text-center text-xs font-bold text-neo-muted">
            No match events recorded yet.
          </div>

          <div *ngIf="gameLogs.length > 0" class="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
            <div 
              *ngFor="let log of gameLogs"
              class="p-2 sm:p-2.5 rounded-xl border-2 border-neo-black bg-neo-bg flex items-center justify-between gap-2.5 text-xs">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-base shrink-0">{{ log.icon }}</span>
                <span class="font-black text-neo-black truncate">{{ log.message }}</span>
              </div>
              <span class="text-[10px] font-bold text-neo-muted shrink-0">{{ log.time }}</span>
            </div>
          </div>

          <div class="pt-1.5 border-t border-neo-black/10">
            <app-button
              variant="yellow"
              (onClick)="closeGameLogModal()">
              Close Log
            </app-button>
          </div>
        </div>
      </app-modal>
    </div>
  `
})
export class BiblicalRouletteComponent implements OnDestroy {
  @Input() session: Session | undefined;

  private gameStore = inject(GameStore);
  private inputService = inject(InputService);
  private sessionService = inject(SessionService);
  private modalService = inject(ModalService);

  isVowelModalOpen = false;
  isSolveModalOpen = false;
  isSpinResultModalOpen = false;
  isWinnerModalOpen = false;
  isGameLogModalOpen = false;

  gameLogs: Array<{ message: string; icon: string; time: string }> = [];
  currentSolvedPhrase: string = '';
  private lastSubmittedSolveGuess: string = '';

  winnerModalData = {
    winnerId: '',
    winnerName: '',
    isOverallWinner: false,
    solvedPhrase: '',
    playerResults: [] as Array<{ name: string; score: number; roundsWon: number; isWinner: boolean }>
  };
  private celebratedKeys = new Set<string>();

  spinResultModalData = {
    resultLabel: '',
    prizeAmount: 0,
    letter: '',
    lettersCount: 0,
    finalTurnScore: 0,
    isBankrupt: false,
    isMissTurn: false
  };
  private lastStagedConsonantForModal: string = '';
  solvePhraseGuess = '';
  isWheelSpinning = signal<boolean>(false);
  spinningConsonant = signal<string>('');
  lastActionMessage = '';
  localStagedConsonant = signal<string>('');
  private spinSafetyTimer: any = null;
  private lastHandledSpinAngle: number = 0;

  // Frozen signals to ensure letters and points are revealed ONLY after the roulette finishes spinning
  private frozenMaskedPhrase = signal<string>('');
  private frozenRevealedConsonants = signal<string[]>([]);
  private frozenTurnPlayerName = signal<string>('');
  private frozenTurnPlayerScore = signal<number | null>(null);
  private frozenPlayerScores = signal<{ [id: string]: number }>({});

  consonants: string[] = [
    'B', 'C', 'D', 'F', 'G', 'H', 'J',
    'K', 'L', 'M', 'N', 'P', 'Q', 'R',
    'S', 'T', 'V', 'W', 'X', 'Y', 'Z'
  ];

  rouletteState = computed(() => {
    const raw = this.gameStore.effectiveState().payload;
    if (!raw) return undefined;
    return raw as BiblicalRouletteState;
  });

  // Masked phrase displayed on the board: stays hidden during the spin, reveals found letters when spin finishes
  displayedMaskedPhrase = computed(() => {
    if (this.isWheelSpinning()) {
      if (this.frozenMaskedPhrase()) {
        return this.frozenMaskedPhrase();
      }
      const spinning = this.spinningConsonant();
      const serverPhrase = this.rouletteState()?.maskedPhrase || this.defaultMaskedPhrase();
      if (spinning) {
        return serverPhrase.split('').map(ch => ch.toUpperCase() === spinning.toUpperCase() ? '_' : ch).join('');
      }
    }
    return this.rouletteState()?.maskedPhrase || this.defaultMaskedPhrase();
  });

  // Revealed consonants list: does not show newly guessed consonant until wheel finishes spinning
  displayedRevealedConsonants = computed(() => {
    if (this.isWheelSpinning()) {
      if (this.frozenRevealedConsonants().length > 0) {
        return this.frozenRevealedConsonants();
      }
      const spinning = this.spinningConsonant();
      const serverRevealed = this.rouletteState()?.revealedConsonants || [];
      if (spinning) {
        return serverRevealed.filter(c => c.toUpperCase() !== spinning.toUpperCase());
      }
    }
    return this.rouletteState()?.revealedConsonants || [];
  });

  displayedTurnPlayerName = computed(() => {
    if (this.isWheelSpinning() && this.frozenTurnPlayerName()) {
      return this.frozenTurnPlayerName();
    }
    return this.currentTurnPlayerName();
  });

  displayedTurnPlayerScore = computed(() => {
    if (this.isWheelSpinning() && this.frozenTurnPlayerScore() !== null) {
      return this.frozenTurnPlayerScore()!;
    }
    return this.currentTurnPlayerScore();
  });

  getDisplayedPlayerScore(id: string): number {
    if (this.isWheelSpinning()) {
      const frozen = this.frozenPlayerScores();
      if (frozen && frozen[id] !== undefined) {
        return frozen[id];
      }
    }
    return this.getPlayerScore(id);
  }

  currentStagedConsonant = computed(() => {
    const revealed = this.displayedRevealedConsonants();
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

    // Check by state.currentTurnPlayerId first
    if (state?.currentTurnPlayerId && players[state.currentTurnPlayerId]) {
      return players[state.currentTurnPlayerId].score;
    }

    // Check by active player's ID in session matching currentTurnPlayerName
    const activeName = this.currentTurnPlayerName();
    if (activeName && this.session?.players) {
      const activePlayer = this.session.players.find(
        pl => pl.name?.trim().toLowerCase() === activeName.trim().toLowerCase()
      );
      if (activePlayer) {
        if (players[activePlayer.id]) {
          return players[activePlayer.id].score;
        }
        if (players[activePlayer.clientId]) {
          return players[activePlayer.clientId].score;
        }
      }
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
      // Find by unique player id
      const pById = this.session.players.find(pl => pl.id.toLowerCase() === turnId.toLowerCase());
      if (pById) return pById.name;

      // Only check clientId if players have distinct clientIds (i.e. not shared screen)
      const distinctClients = new Set(this.session.players.map(pl => pl.clientId));
      if (distinctClients.size > 1) {
        const pByClient = this.session.players.find(pl => pl.clientId.toLowerCase() === turnId.toLowerCase());
        if (pByClient) return pByClient.name;
      }
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
    return this.displayedTurnPlayerScore() >= cost;
  });

  isCurrentTurnPlayer(p: any): boolean {
    if (!p) return false;

    // While wheel is actively spinning, freeze visual highlight on the spinning player
    if (this.isWheelSpinning() && this.frozenTurnPlayerName()) {
      return p.name?.trim().toLowerCase() === this.frozenTurnPlayerName().trim().toLowerCase();
    }

    const state = this.rouletteState();
    if (!state) return p === this.session?.players[0];

    // 1. Check against active player name
    const activeName = state.currentTurnPlayerName || this.currentTurnPlayerName();
    if (activeName && p.name) {
      if (p.name.trim().toLowerCase() === activeName.trim().toLowerCase()) {
        return true;
      }
    }

    // 2. Check against turn player ID
    const turnId = state.currentTurnPlayerId;
    if (turnId && p.id) {
      if (p.id.toLowerCase() === turnId.toLowerCase()) {
        return true;
      }
    }

    // 3. Fallback to clientId only if players have distinct client IDs (multi-device)
    const distinctClients = new Set(this.session?.players?.map(pl => pl.clientId) || []);
    if (turnId && p.clientId && distinctClients.size > 1) {
      return p.clientId.toLowerCase() === turnId.toLowerCase();
    }

    return false;
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
    const revealed = this.displayedRevealedConsonants();
    return !revealed.includes(letter);
  }

  selectConsonant(letter: string): void {
    if (!this.session) return;
    this.localStagedConsonant.set(letter);
    this.lastStagedConsonantForModal = letter;
    this.lastActionMessage = `Selected consonant '${letter}'. Now tap Spin Roulette!`;
    this.addGameLog(`${this.displayedTurnPlayerName()} staged letter '${letter}'`, '🔤');
    this.inputService.dispatchIntent('SELECT_CONSONANT', { letter }, this.session.id);
  }

  addGameLog(message: string, icon: string = '⚡'): void {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.gameLogs.unshift({ message, icon, time });
    if (this.gameLogs.length > 50) {
      this.gameLogs.pop();
    }
  }

  openGameLogModal(): void {
    this.isGameLogModalOpen = true;
    this.modalService.open('gameLog');
  }

  closeGameLogModal(): void {
    this.isGameLogModalOpen = false;
    this.modalService.close();
  }

  constructor() {
    // Automatically synchronize wheel spin animation when remote player spins
    effect(() => {
      const state = this.rouletteState();
      const currentAngle = state?.lastSpinAngle || 0;
      if (currentAngle !== 0 && currentAngle !== this.lastHandledSpinAngle) {
        this.lastHandledSpinAngle = currentAngle;
        if (!this.isWheelSpinning()) {
          const serverRevealed = state?.revealedConsonants || [];
          const currentRevealed = this.displayedRevealedConsonants();
          const newConsonant = serverRevealed.find(c => !currentRevealed.includes(c)) || '';
          if (newConsonant) {
            this.spinningConsonant.set(newConsonant);
            this.lastStagedConsonantForModal = newConsonant;
          } else if (state?.stagedConsonant) {
            this.lastStagedConsonantForModal = state.stagedConsonant;
          }
          this.frozenTurnPlayerName.set(state?.currentTurnPlayerName || '');
          this.isWheelSpinning.set(true);

          if (this.spinSafetyTimer) clearTimeout(this.spinSafetyTimer);
          this.spinSafetyTimer = setTimeout(() => {
            if (this.isWheelSpinning()) {
              this.onSpinAnimationFinished(this.rouletteState()?.lastSpinResult || '');
            }
          }, 5000);
        }
      }
    });

    // Automatically trigger Winner Celebration Modal when guessing phrase correctly or winning
    effect(() => {
      const state = this.rouletteState();
      if (!state) return;

      // Dynamically save the solved phrase from API payload or fully revealed masked phrase
      if (state.solvedPhrase && state.solvedPhrase.trim() && !state.solvedPhrase.includes('_')) {
        this.currentSolvedPhrase = state.solvedPhrase.trim().toUpperCase();
      } else if (state.maskedPhrase && !state.maskedPhrase.includes('_')) {
        this.currentSolvedPhrase = state.maskedPhrase.trim().toUpperCase();
      }

      // Reset celebration tracking and saved phrase when a fresh game starts at Round 1 with no winners yet
      if (state.currentRoundIndex === 1 && !state.roundWinnerId && !state.overallWinnerId) {
        if (this.celebratedKeys.size > 0) {
          this.celebratedKeys.clear();
        }
        this.currentSolvedPhrase = '';
        this.lastSubmittedSolveGuess = '';
      }

      // 1. Overall Match Winner (triggers once when overall match finishes)
      if (state.overallWinnerId && (state.turnStep === 'GameFinished' || this.gameStore.status() === 'Finished')) {
        const revealed = this.getRevealedPhrase(state);
        const overallKey = `overall_${revealed}_${state.overallWinnerId}`;
        if (!this.celebratedKeys.has(overallKey)) {
          this.celebratedKeys.add(overallKey);
          this.triggerWinnerCelebration(state.overallWinnerId, true);
        }
        return;
      }

      // 2. Round Winner (triggers when round is won either by direct solve or revealing letters)
      if (state.roundWinnerId) {
        const revealed = this.getRevealedPhrase(state);
        const roundKey = `win_${revealed}_${state.roundWinnerId}`;
        if (!this.celebratedKeys.has(roundKey)) {
          this.celebratedKeys.add(roundKey);
          this.triggerWinnerCelebration(state.roundWinnerId, false);
        }
      }
    });
  }

  getRevealedPhrase(state?: BiblicalRouletteState): string {
    // 1. Saved variable if already populated
    if (this.currentSolvedPhrase && !this.currentSolvedPhrase.includes('_')) {
      return this.currentSolvedPhrase;
    }

    // 2. Direct API solvedPhrase property from backend state
    if (state?.solvedPhrase && state.solvedPhrase.trim() && !state.solvedPhrase.includes('_')) {
      this.currentSolvedPhrase = state.solvedPhrase.trim().toUpperCase();
      return this.currentSolvedPhrase;
    }

    // 3. User's last submitted solve guess from Solve Verse modal
    if (this.lastSubmittedSolveGuess && !this.lastSubmittedSolveGuess.includes('_')) {
      this.currentSolvedPhrase = this.lastSubmittedSolveGuess.toUpperCase();
      return this.currentSolvedPhrase;
    }

    // 4. If masked phrase from API is completely revealed (no underscores)
    if (state?.maskedPhrase && !state.maskedPhrase.includes('_')) {
      this.currentSolvedPhrase = state.maskedPhrase.trim().toUpperCase();
      return this.currentSolvedPhrase;
    }

    return state?.maskedPhrase || '';
  }

  triggerWinnerCelebration(winnerId: string, isOverall: boolean): void {
    const winnerName = this.getPlayerName(winnerId);
    const sessionPlayers = this.session?.players || [];

    // Build sorted team/player standings with points collected
    const results = sessionPlayers.map(p => {
      const id = p.id || p.clientId;
      const score = this.getPlayerScore(id) || this.getPlayerScore(p.clientId) || 0;
      const roundsWon = this.getPlayerRoundsWon(id) || this.getPlayerRoundsWon(p.clientId) || 0;
      const isWinner = Boolean(id.toLowerCase() === winnerId.toLowerCase() ||
        (p.clientId && p.clientId.toLowerCase() === winnerId.toLowerCase()));
      return {
        name: p.name,
        score,
        roundsWon,
        isWinner
      };
    }).sort((a, b) => b.score - a.score);

    const state = this.rouletteState();
    const solvedPhraseText = this.getRevealedPhrase(state);

    this.winnerModalData = {
      winnerId,
      winnerName,
      isOverallWinner: isOverall,
      solvedPhrase: solvedPhraseText,
      playerResults: results
    };

    this.addGameLog(`${winnerName} solved: "${solvedPhraseText}"`, '🏆');
    this.isWinnerModalOpen = true;
    this.modalService.open('winnerCelebration', this.winnerModalData);
  }

  closeWinnerModal(): void {
    this.isWinnerModalOpen = false;
    this.modalService.close();
  }

  spinRoulette(): void {
    if (this.isWheelSpinning()) return;
    const letter = this.currentStagedConsonant();
    if (!letter) {
      this.lastActionMessage = '👉 Please select a consonant from the keyboard below first!';
      return;
    }
    this.lastStagedConsonantForModal = letter;

    if (!this.session) return;

    // Freeze display state so found letters and points are revealed ONLY after roulette finishes spinning
    this.spinningConsonant.set(letter);
    this.frozenMaskedPhrase.set(this.displayedMaskedPhrase());
    this.frozenRevealedConsonants.set([...this.displayedRevealedConsonants()]);
    this.frozenTurnPlayerName.set(this.currentTurnPlayerName());
    this.frozenTurnPlayerScore.set(this.currentTurnPlayerScore());

    const currentScores: { [id: string]: number } = {};
    const players = this.gameStore.effectiveState().players;
    if (players) {
      for (const key of Object.keys(players)) {
        currentScores[key] = players[key].score;
      }
    }
    this.frozenPlayerScores.set(currentScores);

    this.isWheelSpinning.set(true);
    this.localStagedConsonant.set('');
    this.lastActionMessage = '';
    this.addGameLog(`${this.displayedTurnPlayerName()} spun the roulette for '${letter}'`, '🎡');

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

    const state = this.rouletteState();
    const letter = this.lastStagedConsonantForModal || this.spinningConsonant() || state?.stagedConsonant || '';
    const prizeValue = state?.lastSpinValue || (Number.parseInt(result, 10) || 0);
    const count = state?.lastRevealedCount || 0;
    const finalScore = state?.lastPointsEarned || 0;
    const isBankrupt = result === 'BANKRUPT' || state?.lastSpinResult === 'BANKRUPT';
    const isMissTurn = result === 'MISS TURN' || state?.lastSpinResult === 'MISS TURN';

    this.spinResultModalData = {
      resultLabel: isBankrupt ? 'BANKRUPT' : (isMissTurn ? 'MISS TURN' : (result || `${prizeValue} PTS`)),
      prizeAmount: prizeValue,
      letter,
      lettersCount: count,
      finalTurnScore: finalScore,
      isBankrupt,
      isMissTurn
    };
    this.isSpinResultModalOpen = true;
    this.modalService.open('spinResult', this.spinResultModalData);

    // Unfreeze: Now reveal newly found letters on phrase board, update scores, and advance turn
    this.isWheelSpinning.set(false);
    this.spinningConsonant.set('');
    this.frozenMaskedPhrase.set('');
    this.frozenRevealedConsonants.set([]);
    this.frozenTurnPlayerName.set('');
    this.frozenTurnPlayerScore.set(null);
    this.frozenPlayerScores.set({});
    this.localStagedConsonant.set('');

    if (isBankrupt) {
      this.lastActionMessage = '💥 BANKRUPT! Lost all turn points. Turn passed to next player.';
      this.addGameLog(`${this.displayedTurnPlayerName()} landed on BANKRUPT and lost turn points!`, '💥');
    } else if (isMissTurn) {
      this.lastActionMessage = '⏭️ MISS TURN! Turn passed to next player.';
      this.addGameLog(`${this.displayedTurnPlayerName()} landed on MISS TURN!`, '⏭️');
    } else if (state) {
      if (count > 0) {
        this.lastActionMessage = `🎉 Landed on ${prizeValue} pts! Found ${count} letter(s) (+${finalScore} pts)!`;
        this.addGameLog(`${this.displayedTurnPlayerName()} found ${count} × '${letter}' (+${finalScore} pts)!`, '⭐');
      } else {
        this.lastActionMessage = `❌ No '${letter}' found in the verse. Turn passed to next player.`;
        this.addGameLog(`No '${letter}' found in verse. Turn passed to next player.`, '❌');
      }
    }
  }

  closeSpinResultModal(): void {
    this.isSpinResultModalOpen = false;
    this.modalService.close();
  }

  getSpinModalTitle(): string {
    if (this.spinResultModalData.isBankrupt) return 'Bankrupt!';
    if (this.spinResultModalData.isMissTurn) return 'Turn Missed!';
    if (this.spinResultModalData.lettersCount > 0) return 'Letters Found!';
    return 'Turn Over';
  }

  getSpinModalSubtitle(): string {
    if (this.spinResultModalData.isBankrupt) return 'Landed on bankrupt wedge';
    if (this.spinResultModalData.isMissTurn) return 'Pass turn to next player';
    if (this.spinResultModalData.lettersCount > 0) {
      return `Found ${this.spinResultModalData.lettersCount} occurrences of '${this.spinResultModalData.letter}'`;
    }
    return `No '${this.spinResultModalData.letter}' in the phrase`;
  }

  ngOnDestroy(): void {
    if (this.spinSafetyTimer) {
      clearTimeout(this.spinSafetyTimer);
    }
    this.closeWinnerModal();
    this.closeGameLogModal();
    this.closeSpinResultModal();
    this.closeSolveModal();
    this.closeVowelModal();
    this.celebratedKeys.clear();
    this.currentSolvedPhrase = '';
    this.lastSubmittedSolveGuess = '';
  }

  openVowelStore(): void {
    this.isVowelModalOpen = true;
    this.modalService.open('vowelStore');
  }

  closeVowelModal(): void {
    this.isVowelModalOpen = false;
    this.modalService.close();
  }

  onVowelSelected(vowel: string): void {
    if (!this.session) return;
    this.localStagedConsonant.set('');
    this.addGameLog(`${this.displayedTurnPlayerName()} bought vowel '${vowel}'`, '🔤');
    this.inputService.dispatchIntent('PURCHASE_VOWEL', { letter: vowel }, this.session.id);
    this.isVowelModalOpen = false;
    this.modalService.close();
  }

  buySpecificHint(): void {
    if (!this.session) return;
    this.addGameLog(`${this.displayedTurnPlayerName()} bought hint clue (-500 pts)`, '💡');
    this.inputService.dispatchIntent('PURCHASE_HINT', null, this.session.id);
  }

  openSolveModal(): void {
    this.isSolveModalOpen = true;
    this.modalService.open('solveVerse');
  }

  closeSolveModal(): void {
    this.isSolveModalOpen = false;
    this.modalService.close();
  }

  submitSolveGuess(): void {
    if (!this.session || !this.solvePhraseGuess.trim()) return;
    const guess = this.solvePhraseGuess.trim().toUpperCase();
    this.lastSubmittedSolveGuess = guess;
    this.currentSolvedPhrase = guess;
    this.addGameLog(`${this.displayedTurnPlayerName()} guessed verse: "${guess}"`, '🎯');
    this.inputService.dispatchIntent('SOLVE_PHRASE', { phrase: guess }, this.session.id);
    this.solvePhraseGuess = '';
    this.closeSolveModal();
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
