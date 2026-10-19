import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardQaService } from '../../services/card-qa.service';
import { TranslatePipe } from '../../../../../core/i18n';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-results-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="'game.cardQa.resultsTitle' | translate"
      [subtitle]="'game.cardQa.resultsSubtitle' | translate"
      icon="📊"
      maxWidth="lg"
      (close)="close.emit()">
      
      <div class="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        
        <!-- Toggle Help Note & Expand/Collapse All Toolbar -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
          <p class="font-bold text-neo-muted bg-neo-bg p-2 rounded-lg border border-neo-black/20 flex items-center gap-1.5 flex-1">
            <span>💡</span> {{ 'game.cardQa.toggleStatus' | translate }}
          </p>

          <button
            *ngIf="service.playerSummaries().length > 1"
            type="button"
            (click)="allExpanded() ? collapseAll() : expandAll()"
            class="px-3 py-1.5 font-black text-xs border-2 border-neo-black bg-white rounded-lg shadow-neo-sm hover:bg-neo-yellow active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer">
            <span>{{ allExpanded() ? '▲' : '▼' }}</span>
            <span>{{ (allExpanded() ? 'game.cardQa.collapseAll' : 'game.cardQa.expandAll') | translate }}</span>
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!service.playerSummaries().length" class="text-center py-8">
          <span class="text-4xl block mb-2">📭</span>
          <p class="font-bold text-neo-muted text-sm">
            {{ 'game.cardQa.noResultsYet' | translate }}
          </p>
        </div>

        <!-- Collapsible Players List (Default is Collapsed) -->
        <div class="space-y-3">
          <div 
            *ngFor="let summary of service.playerSummaries()" 
            class="neo-card bg-neo-bg border-3 border-neo-black rounded-2xl overflow-hidden transition-all shadow-neo-sm">
            
            <!-- Collapsible Player Header Card -->
            <button
              type="button"
              (click)="togglePlayer(summary.playerName)"
              class="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 bg-white hover:bg-yellow-50/70 transition-colors cursor-pointer select-none border-b-2"
              [class.border-neo-black]="isExpanded(summary.playerName)"
              [class.border-transparent]="!isExpanded(summary.playerName)">
              
              <!-- Left: Player Info & General Results -->
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-2xl">👤</span>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-black text-sm sm:text-base text-neo-black truncate">{{ summary.playerName }}</span>
                    <span class="px-2.5 py-0.5 rounded-full bg-neo-black text-white font-black text-xs shrink-0">
                      {{ summary.totalPoints }} pts ({{ summary.scorePercentage }}%)
                    </span>
                  </div>

                  <!-- General Overview Badges visible at all times -->
                  <div class="flex items-center gap-2 mt-1 text-xs font-black flex-wrap">
                    <span class="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-400">
                      ✓ {{ summary.correctCount }} acertadas
                    </span>
                    <span class="text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-400">
                      ✕ {{ summary.incorrectCount }} erradas
                    </span>
                    <span class="text-neo-muted text-[11px] font-bold">
                      ({{ summary.totalAnswered }} {{ summary.totalAnswered === 1 ? 'pregunta' : 'preguntas' }})
                    </span>
                  </div>
                </div>
              </div>

              <!-- Right: Chevron & Action Hint -->
              <div class="flex items-center gap-2 shrink-0">
                <span class="text-xs font-bold text-neo-muted hidden sm:inline">
                  {{ (isExpanded(summary.playerName) ? 'game.cardQa.hideDetails' : 'game.cardQa.viewDetails') | translate }}
                </span>
                <div 
                  [class.rotate-180]="isExpanded(summary.playerName)"
                  class="w-7 h-7 rounded-lg border-2 border-neo-black bg-neo-bg flex items-center justify-center font-black text-xs text-neo-black shadow-neo-sm transition-transform duration-200">
                  ▼
                </div>
              </div>
            </button>

            <!-- Detailed Answered Questions List (Shown when Expanded) -->
            <div 
              *ngIf="isExpanded(summary.playerName)"
              class="p-3 sm:p-4 space-y-2 bg-neo-bg/60 animate-fade-in">
              
              <div 
                *ngFor="let res of summary.results"
                class="bg-white border-2 border-neo-black rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs shadow-sm">
                
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5 mb-1">
                    <span class="px-1.5 py-0.5 rounded bg-neo-black text-white font-black text-[10px]">
                      #{{ res.cardNumber }}
                    </span>
                    <span class="font-black text-neo-black truncate">{{ res.questionText }}</span>
                  </div>
                  <div class="text-[11px] text-neo-muted truncate pl-0.5">
                    <span *ngIf="res.questionType === 'wildcard'" class="font-black text-amber-700">
                      🌟 Comodín (+3 pts de regalo)
                    </span>
                    <span *ngIf="res.questionType !== 'wildcard'">
                      <span class="font-black text-neo-black/70">R:</span> {{ res.answerText }}
                    </span>
                  </div>
                </div>

                <!-- Clickable Evaluation Toggle Badge -->
                <button
                  type="button"
                  (click)="service.toggleResultEvaluation(res.id)"
                  [class.bg-emerald-100]="res.isCorrect"
                  [class.text-emerald-800]="res.isCorrect"
                  [class.border-emerald-500]="res.isCorrect"
                  [class.bg-rose-100]="!res.isCorrect"
                  [class.text-rose-800]="!res.isCorrect"
                  [class.border-rose-500]="!res.isCorrect"
                  class="px-2.5 py-1.5 rounded-lg border-2 font-black text-xs shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer shadow-sm">
                  {{ res.isCorrect ? '✓ Correcto (+3 pts)' : '✕ Incorrecto (0 pts)' }}
                </button>
              </div>

            </div>

          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="border-t-3 border-neo-black pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <app-button
          variant="secondary"
          (onClick)="onResetClick()">
          <span>🔄</span> {{ 'game.cardQa.resetBoard' | translate }}
        </app-button>

        <app-button
          variant="yellow"
          (onClick)="close.emit()">
          {{ 'common.close' | translate }}
        </app-button>
      </div>

    </app-modal>
  `
})
export class ResultsModalComponent {
  readonly service = inject(CardQaService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  // Collapsible players state: default is empty set (all collapsed)
  readonly expandedPlayers = signal<Set<string>>(new Set());

  togglePlayer(playerName: string): void {
    this.expandedPlayers.update(set => {
      const next = new Set(set);
      if (next.has(playerName)) {
        next.delete(playerName);
      } else {
        next.add(playerName);
      }
      return next;
    });
  }

  isExpanded(playerName: string): boolean {
    return this.expandedPlayers().has(playerName);
  }

  expandAll(): void {
    const allNames = this.service.playerSummaries().map(s => s.playerName);
    this.expandedPlayers.set(new Set(allNames));
  }

  collapseAll(): void {
    this.expandedPlayers.set(new Set());
  }

  allExpanded(): boolean {
    const summaries = this.service.playerSummaries();
    return summaries.length > 0 && summaries.every(s => this.expandedPlayers().has(s.playerName));
  }

  onResetClick(): void {
    const confirmed = window.confirm(
      '¿Estás seguro de que deseas reiniciar el tablero y las puntuaciones para una nueva partida?'
    );
    if (confirmed) {
      this.service.resetBoard();
      this.close.emit();
    }
  }
}
