import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Player } from '../../../core/models/player.model';
import { TranslatePipe } from '../../../core/i18n';

@Component({
  selector: 'app-turn-tracker',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="neo-card bg-white space-y-4">
      <div class="flex items-center justify-between border-b-3 border-neo-black pb-3">
        <div class="flex items-center gap-2">
          <span class="text-2xl">⏳</span>
          <span class="font-black text-lg text-neo-black">{{ 'activeMatch.turnOrderTimer' | translate }}</span>
        </div>
        <div class="flex items-center gap-2 font-black text-sm">
          <span class="px-2 py-0.5 rounded bg-neo-yellow border-2 border-neo-black">
            {{ 'activeMatch.roundIndicator' | translate:{ current: currentRound, total: totalRounds } }}
          </span>
          <span 
            [class.text-red-600]="secondsLeft <= 10"
            class="px-3 py-0.5 rounded bg-neo-black text-white text-base">
            ⏱️ {{ secondsLeft }}s
          </span>
        </div>
      </div>

      <!-- Current Turn Highlight -->
      <div class="p-4 bg-neo-yellow rounded-xl border-3 border-neo-black flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white border-2 border-neo-black flex items-center justify-center text-2xl font-black">
            🎯
          </div>
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-neo-black/80 block">
              {{ 'activeMatch.currentTurn' | translate }}
            </span>
            <span class="text-2xl font-black text-neo-black">
              {{ activePlayer?.name || ('activeMatch.waitingForPlayer' | translate) }}
            </span>
          </div>
        </div>

        <button 
          (click)="onAdvanceTurn()"
          class="neo-btn-primary bg-white hover:bg-neo-gray text-neo-black text-sm py-2 px-4">
          {{ 'activeMatch.nextTurn' | translate }}
        </button>
      </div>

      <!-- Turn Order Queue -->
      <div class="space-y-1">
        <span class="text-xs font-black text-neo-muted uppercase tracking-wider block">
          {{ 'activeMatch.upcomingQueue' | translate }}
        </span>
        <div class="flex flex-wrap gap-2 pt-1">
          <div 
            *ngFor="let p of players" 
            [class.border-neo-black]="p.id === activePlayer?.id"
            [class.bg-neo-black]="p.id === activePlayer?.id"
            [class.text-white]="p.id === activePlayer?.id"
            [class.bg-neo-gray]="p.id !== activePlayer?.id"
            [class.text-neo-black]="p.id !== activePlayer?.id"
            class="px-3 py-1 rounded-md border-2 border-neo-black font-bold text-xs flex items-center gap-1.5 transition-all">
            <span *ngIf="p.id === activePlayer?.id">▶</span>
            <span>{{ p.name }}</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TurnTrackerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() players: Player[] = [];
  @Input() activePlayer: Player | undefined;
  @Input() timeLimitSeconds: number = 60;
  @Input() currentRound: number = 1;
  @Input() totalRounds: number = 3;
  @Input() canControlTurn: boolean = true;

  @Output() advanceTurn = new EventEmitter<void>();

  secondsLeft: number = 60;
  private timerInterval: any;
  private currentActivePlayerId: string | undefined;

  ngOnInit(): void {
    this.currentActivePlayerId = this.activePlayer?.id;
    this.resetTimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activePlayer']) {
      const newId = this.activePlayer?.id;
      if (newId && newId !== this.currentActivePlayerId) {
        this.currentActivePlayerId = newId;
        this.resetTimer();
      }
    }
    if (changes['timeLimitSeconds'] && !changes['activePlayer']) {
      this.resetTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  resetTimer(): void {
    this.secondsLeft = this.timeLimitSeconds > 0 ? this.timeLimitSeconds : 60;
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (this.secondsLeft > 0) {
        this.secondsLeft--;
      } else {
        // Auto advance turn on timer expiry
        if (this.canControlTurn) {
          this.onAdvanceTurn();
        } else {
          this.stopTimer();
        }
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  onAdvanceTurn(): void {
    this.advanceTurn.emit();
    this.resetTimer();
  }
}
