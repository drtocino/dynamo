import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TranslatePipe } from '../../../../core/i18n';

@Component({
  selector: 'app-vowel-store-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, TranslatePipe],
  template: `
    <app-modal 
      modalId="vowelStore"
      [isOpen]="isOpen"
      [title]="'game.biblicalRoulette.vowelStoreTitle' | translate"
      [subtitle]="'game.biblicalRoulette.vowelStoreSubtitle' | translate"
      icon="🔤"
      (close)="handleClose()">
      
      <!-- Pricing & Balance Banner -->
      <div class="flex items-center justify-between p-3 bg-neo-bg rounded-xl border-2 border-neo-black">
        <div>
          <span class="text-xs font-black uppercase text-neo-muted block">{{ 'game.biblicalRoulette.basePrice' | translate }}</span>
          <span class="text-lg font-black text-neo-pink">{{ 'game.biblicalRoulette.costPerLetter' | translate:{ cost: vowelCost } }}</span>
        </div>
        <div class="text-right">
          <span class="text-xs font-black uppercase text-neo-muted block">{{ 'game.biblicalRoulette.yourPoints' | translate }}</span>
          <span class="text-lg font-black text-neo-black">{{ playerPoints }} {{ 'common.points' | translate }}</span>
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
            <span class="text-[9px] font-bold" *ngIf="isPurchased(vowel)">{{ 'game.biblicalRoulette.sold' | translate }}</span>
            <span class="text-[9px] font-bold text-white uppercase" *ngIf="selectedVowel === vowel">{{ 'game.biblicalRoulette.ready' | translate }}</span>
          </button>
        </div>

        <div class="text-[11px] font-bold text-center text-neo-muted">
          <span *ngIf="selectedVowel" class="text-neo-black font-black">
            {{ 'game.biblicalRoulette.vowelSelected' | translate:{ vowel: selectedVowel } }}
          </span>
          <span *ngIf="!selectedVowel">
            {{ 'game.biblicalRoulette.tapVowel' | translate }}
          </span>
        </div>
      </div>

      <!-- Pricing Notice -->
      <p class="text-[11px] font-bold text-center text-neo-muted">
        {{ 'game.biblicalRoulette.vowelNotice' | translate:{ cost: vowelCost } }}
      </p>

      <!-- Confirmation and Cancel Actions -->
      <div class="space-y-1.5 flex flex-col pt-1.5 border-t border-neo-black/10">
        <app-button 
          variant="yellow"
          [disabled]="!selectedVowel || isPurchased(selectedVowel) || playerPoints < vowelCost"
          (onClick)="confirmPurchase()">
          <span>{{ 'game.biblicalRoulette.confirmPurchase' | translate:{ letter: (selectedVowel ? "('" + selectedVowel + "')" : ''), cost: vowelCost } }}</span>
        </app-button>

        <app-button 
          variant="secondary"
          (onClick)="handleClose()">
          {{ 'game.biblicalRoulette.cancelReturn' | translate }}
        </app-button>
      </div>
    </app-modal>
  `
})
export class VowelStoreModalComponent implements OnChanges {
  @Input() isOpen: boolean = false;
  @Input() vowelCost: number = 150;
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
