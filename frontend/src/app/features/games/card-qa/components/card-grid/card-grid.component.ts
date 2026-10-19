import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCard } from '../../models/card-qa.models';
import { CardItemComponent } from '../card-item/card-item.component';
import { TranslatePipe } from '../../../../../core/i18n';

@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [CommonModule, CardItemComponent, TranslatePipe],
  template: `
    <div class="w-full max-w-6xl mx-auto space-y-2.5 px-1 sm:px-2">
      
      <!-- 5-Column Category Header Strip -->
      <div class="grid grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4 select-none">
        
        <!-- Cols 1 & 2: True/False & Option Selection (Red) -->
        <div class="col-span-2 p-2 sm:p-2.5 rounded-xl border-3 border-neo-black bg-rose-500 text-white font-black text-xs sm:text-sm text-center shadow-neo-sm uppercase tracking-wider flex items-center justify-center gap-1.5">
          <span class="text-sm">🔴</span>
          <span class="truncate">V/F & Opciones</span>
        </div>

        <!-- Cols 3 & 4: Open Questions (Blue) -->
        <div class="col-span-2 p-2 sm:p-2.5 rounded-xl border-3 border-neo-black bg-blue-500 text-white font-black text-xs sm:text-sm text-center shadow-neo-sm uppercase tracking-wider flex items-center justify-center gap-1.5">
          <span class="text-sm">🔵</span>
          <span class="truncate">Preguntas Abiertas</span>
        </div>

        <!-- Col 5: Wildcards (Yellow) -->
        <div class="col-span-1 p-2 sm:p-2.5 rounded-xl border-3 border-neo-black bg-neo-yellow text-neo-black font-black text-xs sm:text-sm text-center shadow-neo-sm uppercase tracking-wider flex items-center justify-center gap-1">
          <span class="text-sm">🌟</span>
          <span class="truncate hidden sm:inline">Comodines</span>
          <span class="truncate sm:hidden">★</span>
        </div>

      </div>

      <!-- Main Board Cards Grid (5 Columns) -->
      <div class="grid grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4">
        <app-card-item
          *ngFor="let card of cards; trackBy: trackByIndex"
          [card]="card"
          (cardClick)="selectCard.emit($event)">
        </app-card-item>
      </div>

    </div>
  `
})
export class CardGridComponent {
  @Input({ required: true }) cards: BoardCard[] = [];
  @Output() selectCard = new EventEmitter<number>();

  trackByIndex(index: number, card: BoardCard): number {
    return card.number;
  }
}
