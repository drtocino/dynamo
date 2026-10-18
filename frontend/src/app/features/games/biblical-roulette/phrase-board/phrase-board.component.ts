import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/i18n';

@Component({
  selector: 'app-phrase-board',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="neo-card bg-white p-0 border-3 border-neo-black rounded-2xl overflow-hidden flex flex-col justify-between h-full select-none shadow-none">
      <!-- Integrated Hints Header -->
      <div class="w-full bg-neo-yellow border-b-3 border-neo-black px-4 py-2 min-h-[42px] flex items-center justify-between gap-2.5">
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs font-black uppercase text-neo-black/70">{{ 'game.biblicalRoulette.category' | translate }}</span>
            <span class="font-black text-sm text-neo-black uppercase tracking-tight">{{ generalHint || ('game.biblicalRoulette.defaultCategory' | translate) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div *ngIf="hintRevealed; else hintLocked" class="flex items-center gap-1.5">
            <span class="text-xs font-black uppercase text-neo-pink">{{ 'game.biblicalRoulette.hintLabel' | translate }}</span>
            <span class="font-extrabold text-sm text-neo-black">{{ specificHint }}</span>
          </div>
          <ng-template #hintLocked>
            <div class="flex items-center gap-1 text-xs font-bold text-neo-black/70">
              <span class="uppercase font-black">{{ 'game.biblicalRoulette.specificClue' | translate }}</span>
              <span class="italic font-bold">{{ 'game.biblicalRoulette.hintLocked' | translate }}</span>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Phrase Tiles Display Grid -->
      <div class="flex-1 p-2.5 sm:p-3.5 flex flex-wrap justify-center gap-y-2.5 gap-x-1.5 min-h-[140px] items-center">
        <ng-container *ngFor="let word of words">
          <div class="flex gap-1 sm:gap-1.5 mx-1">
            <div 
              *ngFor="let char of word" 
              class="w-9 h-11 sm:w-11 sm:h-13 rounded-lg flex items-center justify-center font-black text-lg sm:text-xl border-3 border-neo-black transition-all duration-200 transform"
              [ngClass]="{
                'bg-neo-yellow text-neo-black scale-105 shadow-none': char !== '_',
                'bg-neo-bg text-transparent border-dashed': char === '_'
              }">
              <span>{{ char === '_' ? '•' : char }}</span>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- Letter Statistics Badges -->
      <div class="flex flex-wrap items-center justify-center gap-3 py-2 px-4 border-t-3 border-neo-black bg-neo-bg text-xs font-bold min-h-[42px]">
        <div class="flex items-center gap-1.5">
          <span class="font-black uppercase text-neo-muted">{{ 'game.biblicalRoulette.revealedConsonants' | translate }}</span>
          <span *ngIf="revealedConsonants.length === 0" class="text-neo-muted italic">{{ 'game.biblicalRoulette.noneYet' | translate }}</span>
          <span 
            *ngFor="let c of revealedConsonants" 
            class="px-1.5 py-0.5 bg-neo-cyan text-neo-black rounded font-black border border-neo-black">
            {{ c }}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="font-black uppercase text-neo-muted">{{ 'game.biblicalRoulette.purchasedVowels' | translate }}</span>
          <span *ngIf="revealedVowels.length === 0" class="text-neo-muted italic">{{ 'game.biblicalRoulette.noneYet' | translate }}</span>
          <span 
            *ngFor="let v of revealedVowels" 
            class="px-1.5 py-0.5 bg-neo-pink text-white rounded font-black border border-neo-black">
            {{ v }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class PhraseBoardComponent {
  @Input() maskedPhrase: string = '';
  @Input() generalHint: string = '';
  @Input() specificHint: string = '';
  @Input() hintRevealed: boolean = false;
  @Input() revealedConsonants: string[] = [];
  @Input() revealedVowels: string[] = [];

  get words(): string[][] {
    if (!this.maskedPhrase) return [];
    return this.maskedPhrase.split(' ').map(word => word.split(''));
  }
}
