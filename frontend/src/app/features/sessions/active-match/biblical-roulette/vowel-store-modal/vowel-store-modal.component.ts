import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vowel-store-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neo-black/60 backdrop-blur-sm animate-fade-in">
      <div class="relative w-full max-w-md bg-white rounded-2xl border-4 border-neo-black shadow-neo p-6 space-y-6">
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b-3 border-neo-black pb-4">
          <div class="flex items-center gap-2">
            <span class="text-3xl">🔤</span>
            <div>
              <h2 class="text-2xl font-black text-neo-black">Vowel Store</h2>
              <p class="text-xs font-bold text-neo-muted">Buy a vowel for your current turn</p>
            </div>
          </div>
          <button 
            (click)="close.emit()"
            class="w-8 h-8 rounded-full border-2 border-neo-black bg-neo-pink text-white font-black hover:bg-red-600 transition flex items-center justify-center text-sm shadow-neo-sm">
            ✕
          </button>
        </div>

        <!-- Pricing & Balance Banner -->
        <div class="flex items-center justify-between p-3 bg-neo-bg rounded-xl border-2 border-neo-black">
          <div>
            <span class="text-xs font-black uppercase text-neo-muted block">Current Price</span>
            <span class="text-lg font-black text-neo-pink">{{ vowelCost }} pts</span>
          </div>
          <div class="text-right">
            <span class="text-xs font-black uppercase text-neo-muted block">Your Points</span>
            <span class="text-lg font-black text-neo-black">{{ playerPoints }} pts</span>
          </div>
        </div>

        <!-- Vowel Selection Tiles -->
        <div class="grid grid-cols-5 gap-3">
          <button
            *ngFor="let vowel of vowels"
            [disabled]="isPurchased(vowel) || playerPoints < vowelCost"
            (click)="selectVowel(vowel)"
            class="h-16 rounded-xl border-3 border-neo-black font-black text-2xl flex flex-col items-center justify-center transition transform active:translate-y-1 shadow-neo-sm"
            [ngClass]="{
              'bg-neo-yellow hover:bg-yellow-300 text-neo-black hover:-translate-y-0.5 cursor-pointer': !isPurchased(vowel) && playerPoints >= vowelCost,
              'bg-neo-gray text-neo-muted opacity-40 cursor-not-allowed': isPurchased(vowel) || playerPoints < vowelCost
            }">
            <span>{{ vowel }}</span>
            <span class="text-[10px] font-bold" *ngIf="isPurchased(vowel)">SOLD</span>
          </button>
        </div>

        <!-- Notice -->
        <p class="text-xs font-bold text-center text-neo-muted">
          ⚠️ Price scales with each purchase: 100 → 250 → 500 → 1,000 pts. Limit 1 vowel per turn.
        </p>

        <!-- Cancel Button -->
        <button 
          (click)="close.emit()"
          class="w-full neo-btn-secondary py-2.5 text-sm font-black">
          Cancel & Return to Game
        </button>
      </div>
    </div>
  `
})
export class VowelStoreModalComponent {
  @Input() isOpen: boolean = false;
  @Input() vowelCost: number = 100;
  @Input() playerPoints: number = 0;
  @Input() revealedVowels: string[] = [];

  @Output() vowelSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  vowels: string[] = ['A', 'E', 'I', 'O', 'U'];

  isPurchased(vowel: string): boolean {
    return this.revealedVowels.includes(vowel);
  }

  selectVowel(vowel: string): void {
    if (!this.isPurchased(vowel) && this.playerPoints >= this.vowelCost) {
      this.vowelSelected.emit(vowel);
    }
  }
}
