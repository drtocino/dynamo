import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCard } from '../../models/card-qa.models';

@Component({
  selector: 'app-card-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      (click)="onClick()"
      [class.opacity-80]="card.state === 'disabled'"
      [class.bg-neutral-100]="card.state === 'disabled'"
      [class.border-neutral-400]="card.state === 'disabled'"
      [class.cursor-not-allowed]="card.state === 'disabled' || isQuotaExceeded"
      [class.shadow-none]="card.state === 'disabled'"
      [class.opacity-50]="isQuotaExceeded && card.state !== 'disabled'"
      [class.hover:-translate-y-1]="card.state !== 'disabled' && !isQuotaExceeded"
      [class.hover:shadow-neo-lg]="card.state !== 'disabled' && !isQuotaExceeded"
      [class.cursor-pointer]="card.state !== 'disabled' && !isQuotaExceeded"
      [class.bg-rose-500]="card.state !== 'disabled' && card.color === 'red'"
      [class.text-white]="card.state !== 'disabled' && (card.color === 'red' || card.color === 'blue')"
      [class.bg-blue-500]="card.state !== 'disabled' && card.color === 'blue'"
      [class.bg-neo-yellow]="card.state !== 'disabled' && card.color === 'yellow'"
      [class.text-neo-black]="card.state !== 'disabled' && card.color === 'yellow'"
      [class.aspect-square]="!card.isBottomPeek"
      [class.h-16]="card.isBottomPeek"
      [class.sm:h-20]="card.isBottomPeek"
      [class.aspect-auto]="card.isBottomPeek"
      [class.border-dashed]="card.isBottomPeek && card.state !== 'disabled'"
      class="neo-card flex flex-col items-center justify-between p-1.5 sm:p-2 select-none transition-all duration-200 relative overflow-hidden group">
      
      <!-- Card Decorative Pattern -->
      <div *ngIf="card.state !== 'disabled'" class="absolute -right-2 -bottom-2 w-10 h-10 bg-black/10 rounded-full blur-sm pointer-events-none"></div>

      <!-- Card Number Header Pill -->
      <div class="w-full flex items-center justify-between gap-1">
        <span 
          [class.bg-black]="card.state !== 'disabled'"
          [class.text-white]="card.state !== 'disabled'"
          [class.bg-neutral-300]="card.state === 'disabled'"
          [class.text-neutral-700]="card.state === 'disabled'"
          class="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded shrink-0">
          #{{ card.number }}
        </span>
        <span *ngIf="card.question.type === 'wildcard'" class="text-xs">
          🌟
        </span>
      </div>

      <!-- Main Display Number -->
      <div class="flex items-center justify-center gap-1 my-auto">
        <span 
          [class.text-2xl]="card.isBottomPeek"
          [class.sm:text-3xl]="card.isBottomPeek"
          [class.text-3xl]="!card.isBottomPeek"
          [class.sm:text-4xl]="!card.isBottomPeek"
          [class.md:text-5xl]="!card.isBottomPeek"
          [class.text-neutral-400]="card.state === 'disabled'"
          class="font-black tracking-tighter">
          {{ card.number }}
        </span>
      </div>

      <!-- Bottom Status Indicator -->
      <!-- Case A: Card is Disabled -> Show who picked it -->
      <div *ngIf="card.state === 'disabled'" class="w-full px-0.5 text-center mt-auto mb-0.5">
        <div 
          class="inline-flex items-center justify-center gap-1 max-w-[98%] px-1.5 py-0.5 rounded-md bg-neo-black text-white text-[9px] sm:text-[10px] font-black border border-white/20 shadow-xs truncate select-none"
          [title]="card.pickedBy ? ('Elegida por ' + card.pickedBy) : 'Respondida'">
          <span class="text-[9px] shrink-0">👤</span>
          <span class="truncate">{{ card.pickedBy || '✓' }}</span>
        </div>
      </div>

      <!-- Case B: Quota exceeded for active player on this section -->
      <span 
        *ngIf="isQuotaExceeded && card.state !== 'disabled'" 
        class="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/70 text-white shrink-0 mt-auto mb-0.5 flex items-center gap-0.5">
        <span>🔒</span> Lleno
      </span>

      <!-- Case C: Submerged / Bottom Peek Hint Tag -->
      <span 
        *ngIf="card.isBottomPeek && card.state !== 'disabled' && !isQuotaExceeded" 
        class="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/20 text-white mt-auto mb-0.5">
        Extra
      </span>

    </div>
  `
})
export class CardItemComponent {
  @Input({ required: true }) card!: BoardCard;
  @Input() isQuotaExceeded = false;
  @Output() cardClick = new EventEmitter<number>();

  onClick(): void {
    if (this.card.state !== 'disabled') {
      this.cardClick.emit(this.card.index);
    }
  }
}
