import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener } from '@angular/core';
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
    <div 
      (click)="onBackdropClick($event)"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      
      <!-- 3D Perspective Container -->
      <div class="card-perspective w-full max-w-lg min-h-[460px] h-[520px] max-h-[90vh]">
        
        <!-- Flipper -->
        <div 
          class="card-flipper"
          [class.flipped]="card.state === 'expanded-answer'">

          <!-- FRONT FACE: Question / Wildcard / Sub-points -->
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

              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-lg border-2 border-neo-black bg-white font-black text-xs text-neo-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  {{ getTypeLabel(card.question.type) }}
                </span>

                <button 
                  type="button"
                  (click)="onClose($event)"
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 border-neo-black bg-white hover:bg-rose-100 text-neo-black font-black text-sm flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-sm cursor-pointer shrink-0"
                  [title]="'game.cardQa.closeQuestion' | translate"
                  [attr.aria-label]="'game.cardQa.closeQuestionAria' | translate">
                  ✕
                </button>
              </div>
            </div>

            <!-- Question Body -->
            <div class="my-auto py-3 text-center space-y-3 overflow-y-auto max-h-[300px]">
              <!-- Wildcard Icon Banner if applicable -->
              <div *ngIf="card.question.type === 'wildcard'" class="text-4xl sm:text-5xl animate-bounce-subtle">
                🌟
              </div>

              <h2 class="text-lg sm:text-xl md:text-2xl font-black leading-snug">
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

            <!-- Bottom Actions -->
            <div class="border-t-3 border-neo-black/30 pt-3">
              <!-- Wildcard Claim Action -->
              <div *ngIf="card.question.type === 'wildcard'" class="space-y-1 text-center">
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

              <!-- Question Prompt with Answer to Flip (T/F, Option, and Open Questions) -->
              <p *ngIf="card.question.type !== 'wildcard'"
                 class="text-center font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse"
                 [class.text-white]="card.color === 'red' || card.color === 'blue'"
                 [class.text-neo-black]="card.color === 'yellow'">
                <span>👉</span> {{ 'game.cardQa.revealAnswer' | translate }}
              </p>
            </div>

          </div>

          <!-- BACK FACE: Answer & Host Evaluation (For all non-wildcard questions) -->
          <div 
            *ngIf="card.question.type !== 'wildcard'"
            class="card-face card-back neo-card bg-white border-4 border-neo-black p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden">
            
            <!-- Top Bar -->
            <div class="flex items-center justify-between gap-2 border-b-3 border-neo-black pb-3">
              <span class="px-3 py-1 rounded-full bg-neo-black text-white font-black text-xs uppercase tracking-wider">
                {{ 'game.cardQa.cardNumber' | translate:{ number: card.number } }}
              </span>

              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-lg border-2 border-neo-black bg-neo-cyan font-black text-xs text-neo-black uppercase tracking-wider">
                  {{ 'game.cardQa.revealAnswer' | translate }}
                </span>

                <button 
                  type="button"
                  (click)="onClose($event)"
                  class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 border-neo-black bg-white hover:bg-rose-100 text-neo-black font-black text-sm flex items-center justify-center transition hover:scale-105 active:scale-95 shadow-sm cursor-pointer shrink-0"
                  [title]="'game.cardQa.closeQuestion' | translate"
                  [attr.aria-label]="'game.cardQa.closeQuestionAria' | translate">
                  ✕
                </button>
              </div>
            </div>

            <!-- Answer Body -->
            <div class="my-auto py-3 text-center space-y-3">
              <span class="text-xs font-black uppercase tracking-wider text-neo-muted">
                {{ 'game.cardQa.answerLabel' | translate }}
              </span>

              <!-- Simple Text Answer (T/F & Option Selection) -->
              <div *ngIf="card.question.answer" class="p-4 bg-neo-yellow/30 border-3 border-neo-black rounded-2xl">
                <p class="text-xl sm:text-2xl md:text-3xl font-black text-neo-black leading-snug">
                  {{ card.question.answer }}
                </p>
              </div>

              <!-- Sub-points as Answer Criteria (Open Questions) -->
              <div *ngIf="!card.question.answer && card.question.subPoints?.length" class="space-y-2 text-left max-h-[38vh] overflow-y-auto pr-1">
                <div 
                  *ngFor="let point of card.question.subPoints"
                  class="bg-blue-50 border-2 border-neo-black rounded-xl p-3 font-bold text-xs sm:text-sm text-neo-black shadow-sm flex items-start gap-2.5">
                  <span class="text-blue-600 font-black text-base leading-none">✓</span>
                  <span class="leading-snug">{{ point }}</span>
                </div>
              </div>

              <!-- Fallback if no specific answer text or subpoints exist -->
              <div *ngIf="!card.question.answer && (!card.question.subPoints || !card.question.subPoints.length)" class="p-4 bg-neutral-100 border-2 border-neo-black rounded-2xl">
                <p class="text-sm font-bold text-neutral-600 italic">
                  (Respuesta libre / a criterio del anfitrión)
                </p>
              </div>
            </div>

            <!-- Host Evaluation Controls for Open Questions -->
            <div *ngIf="card.question.type === 'open-question'" class="border-t-3 border-neo-black pt-2.5 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-black text-xs uppercase tracking-wider text-neo-muted">
                  Calificación (Pregunta Abierta)
                </span>
                <span class="px-2 py-0.5 rounded-xl border-3 border-neo-black bg-neo-yellow text-neo-black font-black text-xs">
                  {{ openQuestionScore }} {{ openQuestionScore === 1 ? 'punto' : 'puntos' }}
                </span>
              </div>

              <!-- Quick Score Selector Buttons: 0, 1, 2, 3 -->
              <div class="grid grid-cols-4 gap-1.5">
                <button
                  *ngFor="let pts of [0, 1, 2, 3]"
                  type="button"
                  (click)="openQuestionScore = pts"
                  [class.bg-neo-black]="openQuestionScore === pts"
                  [class.text-white]="openQuestionScore === pts"
                  [class.bg-neo-bg]="openQuestionScore !== pts"
                  [class.text-neo-black]="openQuestionScore !== pts"
                  class="py-1.5 rounded-xl border-3 border-neo-black font-black text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer">
                  {{ pts }} pts
                </button>
              </div>

              <!-- Stepper & Submit Button -->
              <div class="flex items-center gap-2 pt-0.5">
                <div class="flex items-center border-3 border-neo-black rounded-xl overflow-hidden shrink-0 bg-white">
                  <button 
                    type="button"
                    (click)="changeOpenScore(-1)"
                    class="w-8 h-10 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 font-black text-sm flex items-center justify-center border-r-2 border-neo-black cursor-pointer">
                    -
                  </button>
                  <span class="w-9 h-10 flex items-center justify-center font-black text-xs bg-white">
                    {{ openQuestionScore }}
                  </span>
                  <button 
                    type="button"
                    (click)="changeOpenScore(1)"
                    class="w-8 h-10 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 font-black text-sm flex items-center justify-center border-l-2 border-neo-black cursor-pointer">
                    +
                  </button>
                </div>

                <app-button 
                  [variant]="openQuestionScore > 0 ? 'cyan' : 'secondary'"
                  (onClick)="onEvaluate(openQuestionScore)">
                  <span>✓</span> Asignar {{ openQuestionScore }} {{ openQuestionScore === 1 ? 'pto' : 'pts' }}
                </app-button>
              </div>
            </div>

            <!-- Standard Host Evaluation Controls (True/False & Option Selection) -->
            <div *ngIf="card.question.type !== 'open-question'" class="border-t-3 border-neo-black pt-4 space-y-2">
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

            <!-- Optional Cancel Link in Back Face Footer -->
            <div class="text-center pt-1.5">
              <button 
                type="button"
                (click)="onClose($event)"
                class="text-[11px] font-black text-neo-muted hover:text-neo-black hover:underline cursor-pointer">
                ✕ {{ 'game.cardQa.closeQuestionAria' | translate }}
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  `
})
export class CardModalComponent implements OnChanges {
  @Input({ required: true }) card!: BoardCard;
  @Output() flipToAnswer = new EventEmitter<void>();
  @Output() evaluate = new EventEmitter<boolean | number>();
  @Output() closeCard = new EventEmitter<void>();

  openQuestionScore = 3;

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeCard.emit();
  }

  onClose(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.closeCard.emit();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['card']) {
      this.openQuestionScore = 3;
    }
  }

  changeOpenScore(delta: number): void {
    this.openQuestionScore = Math.max(0, Math.min(10, this.openQuestionScore + delta));
  }

  onCardClick(): void {
    if (this.card.state === 'expanded-question') {
      if (this.card.question.type === 'wildcard') {
        this.onEvaluate(true);
      } else {
        this.flipToAnswer.emit();
      }
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose(event);
    }
  }

  onEvaluate(result: boolean | number): void {
    this.evaluate.emit(result);
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
