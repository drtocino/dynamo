import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardCard } from '../../models/card-qa.models';
import { TranslatePipe } from '../../../../../core/i18n';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe, ButtonComponent],
  styleUrls: ['./card-modal.component.scss'],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      
      <!-- 3D Perspective Container -->
      <div class="card-perspective w-full max-w-lg min-h-[460px] h-[520px] max-h-[90vh]">
        
        <!-- Flipper -->
        <div 
          class="card-flipper"
          [class.flipped]="card.state === 'expanded-answer' && card.question.type !== 'wildcard'">

          <!-- FRONT FACE: Question / Wildcard -->
          <div 
            (click)="onCardClick()"
            [class.bg-rose-500]="card.color === 'red'"
            [class.text-white]="card.color === 'red' || card.color === 'blue'"
            [class.bg-blue-500]="card.color === 'blue'"
            [class.bg-neo-yellow]="card.color === 'yellow'"
            [class.text-neo-black]="card.color === 'yellow'"
            class="card-face card-front neo-card border-4 border-neo-black p-6 sm:p-8 flex flex-col justify-between cursor-pointer hover:shadow-neo-lg transition-shadow relative overflow-hidden">
            
            <!-- Top Bar: Number & Question Type -->
            <div class="flex items-center justify-between gap-2 border-b-3 border-neo-black pb-3">
              <span class="px-3 py-1 rounded-full bg-neo-black text-white font-black text-xs uppercase tracking-wider">
                {{ 'game.cardQa.cardNumber' | translate:{ number: card.number } }}
              </span>

              <span class="px-2.5 py-0.5 rounded-lg border-2 border-neo-black bg-white font-black text-xs text-neo-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                {{ getTypeLabel(card.question.type) }}
              </span>
            </div>

            <!-- Question Body -->
            <div class="my-auto py-4 text-center space-y-4">
              <!-- Wildcard Icon Banner if applicable -->
              <div *ngIf="card.question.type === 'wildcard'" class="text-4xl sm:text-5xl animate-bounce-subtle">
                🌟
              </div>

              <h2 class="text-xl sm:text-2xl md:text-3xl font-black leading-snug">
                {{ card.question.text }}
              </h2>

              <!-- Options (if option-selection) -->
              <div *ngIf="card.question.type === 'option-selection' && card.question.options?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2 pointer-events-none">
                <div 
                  *ngFor="let opt of card.question.options"
                  class="bg-white border-2 border-neo-black rounded-xl p-2.5 font-bold text-xs sm:text-sm text-neo-black shadow-sm">
                  {{ opt }}
                </div>
              </div>

              <!-- True / False Options Display (not selectable/clickable, just shown for clarity) -->
              <div *ngIf="card.question.type === 'true-false'" class="grid grid-cols-2 gap-3 max-w-xs mx-auto pt-2 pointer-events-none">
                <div class="bg-white border-2 border-neo-black rounded-xl p-2.5 sm:p-3 font-black text-xs sm:text-sm text-neo-black shadow-sm flex items-center justify-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-emerald-400 border-2 border-neo-black text-neo-black text-xs flex items-center justify-center font-black">✓</span>
                  <span>{{ card.question.language === 'en' ? 'True' : 'Verdadero' }}</span>
                </div>
                <div class="bg-white border-2 border-neo-black rounded-xl p-2.5 sm:p-3 font-black text-xs sm:text-sm text-neo-black shadow-sm flex items-center justify-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-rose-400 border-2 border-neo-black text-neo-black text-xs flex items-center justify-center font-black">✕</span>
                  <span>{{ card.question.language === 'en' ? 'False' : 'Falso' }}</span>
                </div>
              </div>
            </div>

            <!-- Bottom Prompt to Flip or Claim Gift Points -->
            <div class="text-center border-t-3 border-neo-black/30 pt-3">
              <!-- Wildcard Claim Action -->
              <div *ngIf="card.question.type === 'wildcard'" class="space-y-1">
                <button 
                  type="button"
                  (click)="onEvaluate(true); $event.stopPropagation()"
                  class="w-full py-3 px-4 bg-neo-black text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-neutral-800 active:scale-98 transition-all shadow-neo-sm flex items-center justify-center gap-2 cursor-pointer">
                  <span>🎁</span> {{ 'game.cardQa.claimWildcard' | translate }}
                </button>
                <p class="text-[11px] font-black text-neo-black/80">
                  {{ 'game.cardQa.wildcardPrompt' | translate }}
                </p>
              </div>

              <!-- Normal Question Prompt -->
              <p *ngIf="card.question.type !== 'wildcard'"
                 class="font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse"
                 [class.text-white]="card.color === 'red' || card.color === 'blue'"
                 [class.text-neo-black]="card.color === 'yellow'">
                <span>👉</span> {{ 'game.cardQa.revealAnswer' | translate }}
              </p>
            </div>
          </div>

          <!-- BACK FACE: Answer & Host Evaluation (Only for questions that have answers) -->
          <div 
            *ngIf="card.question.type !== 'wildcard'"
            class="card-face card-back neo-card bg-white border-4 border-neo-black p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            
            <!-- Top Bar -->
            <div class="flex items-center justify-between gap-2 border-b-3 border-neo-black pb-3">
              <span class="px-3 py-1 rounded-full bg-neo-black text-white font-black text-xs uppercase tracking-wider">
                {{ 'game.cardQa.cardNumber' | translate:{ number: card.number } }}
              </span>

              <span class="px-2.5 py-0.5 rounded-lg border-2 border-neo-black bg-neo-cyan font-black text-xs text-neo-black uppercase tracking-wider">
                {{ 'game.cardQa.revealAnswer' | translate }}
              </span>
            </div>

            <!-- Answer Body -->
            <div class="my-auto py-4 text-center space-y-3">
              <span class="text-xs font-black uppercase tracking-wider text-neo-muted">
                {{ 'game.cardQa.answerLabel' | translate }}
              </span>
              <div class="p-4 bg-neo-yellow/30 border-3 border-neo-black rounded-2xl">
                <p class="text-xl sm:text-2xl md:text-3xl font-black text-neo-black leading-snug">
                  {{ card.question.answer }}
                </p>
              </div>
            </div>

            <!-- Host Evaluation Controls -->
            <div class="border-t-3 border-neo-black pt-4 space-y-2">
              <p class="text-center font-black text-xs uppercase tracking-wider text-neo-muted mb-2">
                Evaluación del Anfitrión
              </p>
              <div class="grid grid-cols-2 gap-3">
                <app-button 
                  variant="cyan"
                  (onClick)="onEvaluate(true)">
                  <span>✓</span> {{ 'game.cardQa.evalCorrect' | translate }}
                </app-button>
                <app-button 
                  variant="pink"
                  (onClick)="onEvaluate(false)">
                  <span>✕</span> {{ 'game.cardQa.evalIncorrect' | translate }}
                </app-button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  `
})
export class CardModalComponent {
  @Input({ required: true }) card!: BoardCard;
  @Output() flipToAnswer = new EventEmitter<void>();
  @Output() evaluate = new EventEmitter<boolean>();

  onCardClick(): void {
    if (this.card.state === 'expanded-question') {
      if (this.card.question.type === 'wildcard') {
        this.onEvaluate(true);
      } else {
        this.flipToAnswer.emit();
      }
    }
  }

  onEvaluate(isCorrect: boolean): void {
    this.evaluate.emit(isCorrect);
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'true-false': return 'Verdadero / Falso';
      case 'option-selection': return 'Opciones Múltiples';
      case 'open-question': return 'Pregunta Abierta';
      case 'wildcard': return '🌟 Comodín';
      default: return 'Trivia';
    }
  }
}
