import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-vowel-store-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal 
      modalId="vowelStore"
      [isOpen]="isOpen"
      title="Vowel Store"
      subtitle="Select and confirm a vowel for your current turn"
      icon="🔤"
      (close)="handleClose()">
      
      <!-- Pricing & Balance Banner -->
      <div class="flex items-center justify-between p-3 bg-neo-bg rounded-xl border-2 border-neo-black">
        <div>
          <span class="text-xs font-black uppercase text-neo-muted block">Base Price</span>
          <span class="text-lg font-black text-neo-pink">{{ vowelCost }} pts / letter</span>
        </div>
        <div class="text-right">
          <span class="text-xs font-black uppercase text-neo-muted block">Your Points</span>
          <span class="text-lg font-black text-neo-black">{{ playerPoints }} pts</span>
        </div>
      </div>

      <!-- Vowel Selection Tiles -->
      <div class="space-y-1.5">
        <div class="grid grid-cols-5 gap-2 sm:gap-2.5">
          <button
            *ngFor="let vowel of vowels"
            [disabled]="isPurchased(vowel) || playerPoints < vowelCost"
            (click)="selectVowel(vowel)"
            class="h-14 sm:h-16 rounded-xl border-3 border-neo-black font-black text-xl sm:text-2xl flex flex-col items-center justify-center transition active:scale-95 shadow-none"
            [ngClass]="{
              'bg-neo-pink text-white ring-2 ring-neo-black cursor-pointer': selectedVowel === vowel,
              'bg-white hover:bg-neo-yellow text-neo-black cursor-pointer': selectedVowel !== vowel && !isPurchased(vowel) && playerPoints >= vowelCost,
              'bg-neo-gray text-neo-muted opacity-40 cursor-not-allowed': isPurchased(vowel) || playerPoints < vowelCost
            }">
            <span>{{ vowel }}</span>
            <span class="text-[9px] font-bold" *ngIf="isPurchased(vowel)">SOLD</span>
            <span class="text-[9px] font-bold text-white uppercase" *ngIf="selectedVowel === vowel">READY</span>
          </button>
        </div>

        <div class="text-[11px] font-bold text-center text-neo-muted">
          <span *ngIf="selectedVowel" class="text-neo-black font-black">
            Selected '{{ selectedVowel }}' · Tap Confirm below to purchase
          </span>
          <span *ngIf="!selectedVowel">
            Tap a vowel to select it, then confirm purchase
          </span>
        </div>
      </div>

      <!-- Pricing Notice -->
      <p class="text-[11px] font-bold text-center text-neo-muted">
        ⚠️ Total cost is multiplied by the count of letters found in the phrase ({{ vowelCost }} pts per letter). Base price scales: 100 → 250 → 500 → 1,000 pts.
      </p>

      <!-- Confirmation and Cancel Actions (Reduced spacing) -->
      <div class="space-y-1.5 flex flex-col pt-1.5 border-t border-neo-black/10">
        <app-button 
          variant="yellow"
          [disabled]="!selectedVowel || isPurchased(selectedVowel) || playerPoints < vowelCost"
          (onClick)="confirmPurchase()">
          <span>Confirm Purchase {{ selectedVowel ? "('" + selectedVowel + "')" : '' }} ({{ vowelCost }} pts/letter)</span>
        </app-button>

        <app-button 
          variant="secondary"
          (onClick)="handleClose()">
          Cancel & Return to Game
        </app-button>
      </div>
    </app-modal>
  `
})
export class VowelStoreModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() vowelCost: number = 100;
  @Input() playerPoints: number = 0;
  @Input() revealedVowels: string[] = [];

  @Output() vowelSelected = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  vowels: string[] = ['A', 'E', 'I', 'O', 'U'];
  selectedVowel: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && !this.isOpen) {
      this.selectedVowel = null;
    }
  }

  isPurchased(vowel: string): boolean {
    return this.revealedVowels.includes(vowel);
  }

  selectVowel(vowel: string): void {
    if (this.isPurchased(vowel) || this.playerPoints < this.vowelCost) return;
    this.selectedVowel = this.selectedVowel === vowel ? null : vowel;
  }

  confirmPurchase(): void {
    if (this.selectedVowel && !this.isPurchased(this.selectedVowel) && this.playerPoints >= this.vowelCost) {
      this.vowelSelected.emit(this.selectedVowel);
      this.selectedVowel = null;
    }
  }

  handleClose(): void {
    this.selectedVowel = null;
    this.close.emit();
  }
}
