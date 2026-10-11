import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-phrase-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="neo-card bg-white p-6 space-y-5 border-3 border-neo-black shadow-neo">
      <!-- Hints Section -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-neo-bg rounded-xl border-2 border-neo-black">
        <div class="flex items-center gap-2">
          <span class="text-xl">📜</span>
          <div>
            <span class="text-xs font-black uppercase text-neo-muted">General Hint</span>
            <p class="font-extrabold text-sm text-neo-black">{{ generalHint || 'Biblical Verse' }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xl">💡</span>
          <div *ngIf="hintRevealed; else hintLocked">
            <span class="text-xs font-black uppercase text-neo-pink">Specific Hint Unlocked</span>
            <p class="font-extrabold text-sm text-neo-black">{{ specificHint }}</p>
          </div>
          <ng-template #hintLocked>
            <div class="text-right">
              <span class="text-xs font-black uppercase text-neo-muted">Specific Hint</span>
              <p class="text-xs font-bold text-neo-muted italic">🔒 Locked (Buy for 500 pts)</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- Phrase Tiles Display Grid -->
      <div class="flex flex-wrap justify-center gap-y-4 gap-x-2 py-4 select-none min-h-[120px] items-center">
        <ng-container *ngFor="let word of words">
          <div class="flex gap-1.5 mx-2">
            <div 
              *ngFor="let char of word" 
              class="w-10 h-12 sm:w-12 sm:h-14 rounded-lg flex items-center justify-center font-black text-xl sm:text-2xl border-3 border-neo-black transition-all duration-200 transform"
              [ngClass]="{
                'bg-neo-yellow text-neo-black shadow-neo-sm scale-105': char !== '_',
                'bg-neo-bg text-transparent border-dashed': char === '_'
              }">
              <span>{{ char === '_' ? '•' : char }}</span>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- Letter Statistics Badges -->
      <div class="flex flex-wrap items-center justify-center gap-4 pt-3 border-t-2 border-neo-black text-xs font-bold">
        <div class="flex items-center gap-1.5">
          <span class="font-black uppercase text-neo-muted">Revealed Consonants:</span>
          <span *ngIf="revealedConsonants.length === 0" class="text-neo-muted italic">None yet</span>
          <span 
            *ngFor="let c of revealedConsonants" 
            class="px-2 py-0.5 bg-neo-cyan text-neo-black rounded font-black border border-neo-black">
            {{ c }}
          </span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="font-black uppercase text-neo-muted">Purchased Vowels:</span>
          <span *ngIf="revealedVowels.length === 0" class="text-neo-muted italic">None yet</span>
          <span 
            *ngFor="let v of revealedVowels" 
            class="px-2 py-0.5 bg-neo-pink text-white rounded font-black border border-neo-black">
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
