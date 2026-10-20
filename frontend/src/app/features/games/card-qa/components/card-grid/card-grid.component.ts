import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCard } from '../../models/card-qa.models';
import { CardItemComponent } from '../card-item/card-item.component';
import { TranslatePipe } from '../../../../../core/i18n';
import { CardQaService } from '../../services/card-qa.service';

@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [CommonModule, CardItemComponent, TranslatePipe],
  template: `
    <div class="w-full max-w-6xl mx-auto space-y-2.5 px-1 sm:px-2 mt-2">
      
      <!-- 5-Column Category Header Strip with Quota Rules -->
      <div class="grid grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4 select-none">
        
        <!-- Cols 1 & 2: True/False & Option Selection (Red) -->
        <div class="col-span-2 p-2 sm:p-2.5 rounded-xl border-3 border-neo-black bg-rose-500 text-white font-black text-xs sm:text-sm text-center shadow-neo-sm uppercase tracking-wider flex items-center justify-center gap-1.5 flex-wrap">
          <span class="text-sm">🔴</span>
          <span class="truncate">Verdadero/Falso & Selección</span>
          <span class="px-1.5 py-0.2 rounded bg-black/30 text-[9px] sm:text-[10px] font-black lowercase tracking-normal">
            (máx 2 por jugador)
          </span>
        </div>

        <!-- Cols 3 & 4: Open Questions (Blue) -->
        <div class="col-span-2 p-2 sm:p-2.5 rounded-xl border-3 border-neo-black bg-blue-500 text-white font-black text-xs sm:text-sm text-center shadow-neo-sm uppercase tracking-wider flex items-center justify-center gap-1.5 flex-wrap">
          <span class="text-sm">🔵</span>
          <span class="truncate">Preguntas Abiertas</span>
          <span class="px-1.5 py-0.2 rounded bg-black/30 text-[9px] sm:text-[10px] font-black lowercase tracking-normal">
            (máx 2 por jugador)
          </span>
        </div>

        <!-- Col 5: Wildcards (Yellow) -->
        <div class="col-span-1 p-2 sm:p-2.5 rounded-xl border-3 border-neo-black bg-neo-yellow text-neo-black font-black text-xs sm:text-sm text-center shadow-neo-sm uppercase tracking-wider flex items-center justify-center gap-1 flex-wrap">
          <span class="text-sm">🌟</span>
          <span class="truncate hidden sm:inline">Comodines</span>
          <span class="truncate sm:hidden">★</span>
          <span class="px-1 py-0.2 rounded bg-black/10 text-[9px] font-black lowercase tracking-normal hidden md:inline">
            (máx 1)
          </span>
        </div>

      </div>

      <!-- Main Board Cards Grid (5 Columns) -->
      <div class="grid grid-cols-5 gap-2.5 sm:gap-3.5 md:gap-4">
        <app-card-item
          *ngFor="let card of cards; trackBy: trackByIndex"
          [card]="card"
          [isQuotaExceeded]="isQuotaExceeded(card)"
          (cardClick)="selectCard.emit($event)">
        </app-card-item>
      </div>

    </div>
  `
})
export class CardGridComponent {
  readonly service = inject(CardQaService);

  @Input({ required: true }) cards: BoardCard[] = [];
  @Output() selectCard = new EventEmitter<number>();

  trackByIndex(index: number, card: BoardCard): number {
    return card.number;
  }

  isQuotaExceeded(card: BoardCard): boolean {
    return !this.service.canPlayerPickCard(card);
  }
}
