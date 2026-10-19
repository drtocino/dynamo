import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardQaService } from '../../services/card-qa.service';
import { CardQuestion, CardQuestionType } from '../../models/card-qa.models';
import { TranslatePipe } from '../../../../../core/i18n';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-custom-questions-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="'game.cardQa.customQuestionsTitle' | translate"
      icon="✏️"
      maxWidth="xl"
      (close)="close.emit()">
      
      <div class="space-y-6 max-h-[75vh] overflow-y-auto pr-1">

        <!-- Top Actions Bar: Import / Export / Add Toggle -->
        <div class="flex flex-wrap items-center justify-between gap-3 p-3 bg-neo-bg rounded-xl border-2 border-neo-black">
          <div class="flex items-center gap-2">
            <app-button
              variant="yellow"
              (onClick)="isAddingNew = !isAddingNew">
              <span>{{ isAddingNew ? '✕' : '＋' }}</span> {{ isAddingNew ? ('common.cancel' | translate) : ('game.cardQa.addQuestion' | translate) }}
            </app-button>
          </div>

          <div class="flex items-center gap-2">
            <app-button
              variant="secondary"
              (onClick)="onExportJson()">
              <span>📥</span> {{ 'game.cardQa.exportJson' | translate }}
            </app-button>

            <label class="h-11 px-3 sm:px-4 font-black text-xs sm:text-sm rounded-xl border-3 border-neo-black bg-white hover:bg-gray-100 text-neo-black flex items-center justify-center gap-1.5 cursor-pointer shadow-none active:scale-95 transition-transform">
              <span>📤</span> {{ 'game.cardQa.importJson' | translate }}
              <input
                type="file"
                accept=".json"
                (change)="onImportJson($event)"
                class="hidden" />
            </label>
          </div>
        </div>

        <!-- Add Question Form -->
        <div *ngIf="isAddingNew" class="neo-card bg-neo-yellow/30 border-3 border-neo-black p-4 space-y-4 animate-scale-in">
          <h3 class="font-black text-base text-neo-black flex items-center gap-2">
            <span>✨</span> {{ 'game.cardQa.addQuestion' | translate }}
          </h3>

          <!-- Question Type Select -->
          <div class="space-y-1.5">
            <label class="font-black text-xs text-neo-black uppercase tracking-wider">
              {{ 'game.cardQa.questionType' | translate }}
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                *ngFor="let t of types"
                (click)="newType = t.value"
                [class.bg-neo-black]="newType === t.value"
                [class.text-white]="newType === t.value"
                [class.bg-white]="newType !== t.value"
                [class.text-neo-black]="newType !== t.value"
                class="py-2 rounded-xl border-2 border-neo-black font-black text-xs transition">
                {{ t.label }}
              </button>
            </div>
          </div>

          <!-- Prompt Text Input -->
          <div class="space-y-1.5">
            <label class="font-black text-xs text-neo-black uppercase tracking-wider">
              {{ 'game.cardQa.promptLabel' | translate }} *
            </label>
            <input
              type="text"
              [(ngModel)]="newText"
              placeholder="¿Qué profeta desafió a los profetas de Baal?"
              class="w-full px-3 py-2 rounded-xl border-2 border-neo-black font-bold text-sm bg-white" />
          </div>

          <!-- Options Input (for option-selection) -->
          <div *ngIf="newType === 'option-selection'" class="space-y-1.5">
            <label class="font-black text-xs text-neo-black uppercase tracking-wider">
              {{ 'game.cardQa.optionsLabel' | translate }} *
            </label>
            <input
              type="text"
              [(ngModel)]="newOptionsRaw"
              placeholder="A) Elías, B) Eliseo, C) Isaías, D) Jeremías"
              class="w-full px-3 py-2 rounded-xl border-2 border-neo-black font-bold text-sm bg-white" />
          </div>

          <!-- Answer Text Input -->
          <div class="space-y-1.5">
            <label class="font-black text-xs text-neo-black uppercase tracking-wider">
              {{ 'game.cardQa.answerLabel' | translate }} *
            </label>
            <input
              type="text"
              [(ngModel)]="newAnswer"
              placeholder="Elías (1 Reyes 18)"
              class="w-full px-3 py-2 rounded-xl border-2 border-neo-black font-bold text-sm bg-white" />
          </div>

          <!-- Save Button -->
          <div class="flex justify-end gap-2 pt-2">
            <app-button
              variant="secondary"
              (onClick)="isAddingNew = false">
              {{ 'common.cancel' | translate }}
            </app-button>
            <app-button
              variant="yellow"
              [disabled]="!newText.trim() || !newAnswer.trim()"
              (onClick)="onSaveNewQuestion()">
              {{ 'common.save' | translate }}
            </app-button>
          </div>
        </div>

        <!-- Custom Questions List -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-black text-xs uppercase tracking-wider text-neo-muted">
              Preguntas Almacenadas ({{ customQuestions.length }})
            </span>
          </div>

          <div *ngIf="!customQuestions.length" class="text-center py-6 bg-neo-bg rounded-xl border-2 border-dashed border-neo-black/30">
            <span class="text-3xl block mb-1">📝</span>
            <p class="font-bold text-xs text-neo-muted">
              No hay preguntas personalizadas guardadas aún en este navegador.
            </p>
          </div>

          <div 
            *ngFor="let q of customQuestions"
            class="bg-white border-2 border-neo-black rounded-xl p-3 flex items-start justify-between gap-3 text-xs shadow-sm">
            
            <div class="space-y-1 min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded bg-neo-black text-white font-black text-[10px] uppercase">
                  {{ q.type }}
                </span>
                <span class="px-2 py-0.5 rounded bg-neo-yellow text-neo-black font-black text-[10px] uppercase">
                  {{ q.language }}
                </span>
              </div>
              <p class="font-black text-neo-black text-sm">{{ q.text }}</p>
              <div *ngIf="q.options?.length" class="flex flex-wrap gap-1 text-[11px] text-neo-muted">
                <span *ngFor="let opt of q.options" class="bg-neo-bg px-1.5 py-0.5 rounded border border-neo-black/20">
                  {{ opt }}
                </span>
              </div>
              <p class="text-emerald-700 font-bold text-xs">
                <span class="font-black text-neo-black">R:</span> {{ q.answer }}
              </p>
            </div>

            <button
              type="button"
              (click)="onDeleteQuestion(q.id)"
              class="w-7 h-7 rounded-lg border border-neo-black bg-neo-pink text-white font-black hover:bg-rose-600 transition flex items-center justify-center shrink-0">
              ✕
            </button>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="border-t-3 border-neo-black pt-4 flex justify-end">
        <app-button
          variant="yellow"
          (onClick)="close.emit()">
          {{ 'common.close' | translate }}
        </app-button>
      </div>

    </app-modal>
  `
})
export class CustomQuestionsModalComponent {
  private service = inject(CardQaService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  customQuestions: CardQuestion[] = [];
  isAddingNew = false;

  newType: CardQuestionType = 'true-false';
  newText = '';
  newOptionsRaw = '';
  newAnswer = '';

  types: { value: CardQuestionType; label: string }[] = [
    { value: 'true-false', label: 'Verdadero / Falso' },
    { value: 'option-selection', label: 'Opciones' },
    { value: 'open-question', label: 'Abierta' }
  ];

  ngOnInit(): void {
    this.refreshList();
  }

  refreshList(): void {
    this.customQuestions = this.service.getCustomQuestions();
  }

  onSaveNewQuestion(): void {
    if (!this.newText.trim() || !this.newAnswer.trim()) return;

    let options: string[] | undefined = undefined;
    if (this.newType === 'option-selection' && this.newOptionsRaw.trim()) {
      options = this.newOptionsRaw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }

    this.service.saveCustomQuestion({
      text: this.newText.trim(),
      type: this.newType,
      options,
      answer: this.newAnswer.trim(),
      language: this.service.config().language
    });

    this.newText = '';
    this.newOptionsRaw = '';
    this.newAnswer = '';
    this.isAddingNew = false;
    this.refreshList();
  }

  onDeleteQuestion(id: string): void {
    this.service.deleteCustomQuestion(id);
    this.refreshList();
  }

  onExportJson(): void {
    const jsonStr = this.service.exportCustomQuestionsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dynamo-card-qa-pack-${this.service.config().language}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onImportJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const result = this.service.importCustomQuestionsJson(reader.result as string);
      if (result.success) {
        alert(`Se importaron ${result.importedCount} preguntas exitosamente.`);
        this.refreshList();
      } else {
        alert(`Error al importar: ${result.error}`);
      }
      input.value = '';
    };
    reader.readAsText(file);
  }
}
