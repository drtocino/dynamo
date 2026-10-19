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
      [class.opacity-35]="card.state === 'disabled'"
      [class.cursor-not-allowed]="card.state === 'disabled'"
      [class.bg-gray-200]="card.state === 'disabled'"
      [class.text-gray-400]="card.state === 'disabled'"
      [class.shadow-none]="card.state === 'disabled'"
      [class.hover:-translate-y-1]="card.state !== 'disabled'"
      [class.hover:shadow-neo-lg]="card.state !== 'disabled'"
      [class.cursor-pointer]="card.state !== 'disabled'"
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
      class="neo-card flex flex-col items-center justify-center p-2 select-none transition-all duration-200 relative overflow-hidden group">
      
      <!-- Card Decorative Pattern -->
      <div *ngIf="card.state !== 'disabled'" class="absolute -right-2 -bottom-2 w-10 h-10 bg-black/10 rounded-full blur-sm pointer-events-none"></div>

      <!-- Card Number Header Pill -->
      <div class="absolute top-1.5 left-1.5 flex items-center gap-1">
        <span class="text-[9px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-black text-white shrink-0">
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
          class="font-black tracking-tighter">
          {{ card.number }}
        </span>
      </div>

      <!-- Submerged / Bottom Peek Hint Tag -->
      <span 
        *ngIf="card.isBottomPeek && card.state !== 'disabled'" 
        class="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-black/20 text-white">
        Extra
      </span>

      <!-- Disabled Status Label -->
      <span 
        *ngIf="card.state === 'disabled'" 
        class="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500 bg-gray-300 px-2 py-0.5 rounded border border-gray-400">
        ✓
      </span>
    </div>
  `
})
export class CardItemComponent {
  @Input({ required: true }) card!: BoardCard;
  @Output() cardClick = new EventEmitter<number>();

  onClick(): void {
    if (this.card.state !== 'disabled') {
      this.cardClick.emit(this.card.index);
    }
  }
}
