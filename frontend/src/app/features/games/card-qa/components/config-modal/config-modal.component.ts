import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardQaService } from '../../services/card-qa.service';
import { TranslatePipe } from '../../../../../core/i18n';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'app-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      [isOpen]="isOpen"
      [title]="'game.cardQa.configTitle' | translate"
      icon="⚙️"
      maxWidth="md"
      (close)="close.emit()">
      
      <div class="space-y-5">
        
        <!-- Total Card Count Selector -->
        <div class="space-y-2">
          <label class="block font-black text-sm text-neo-black">
            {{ 'game.cardQa.totalCards' | translate }}
          </label>
          <div class="grid grid-cols-4 gap-2">
            <button
              *ngFor="let count of cardOptions"
              type="button"
              (click)="selectedCards = count"
              [class.bg-neo-black]="selectedCards === count"
              [class.text-white]="selectedCards === count"
              [class.bg-neo-bg]="selectedCards !== count"
              [class.text-neo-black]="selectedCards !== count"
              class="py-2.5 rounded-xl border-2 border-neo-black font-black text-sm hover:scale-105 active:scale-95 transition-transform">
              {{ count }}
            </button>
          </div>
        </div>

        <!-- Questions Per Turn Selector -->
        <div class="space-y-2">
          <label class="block font-black text-sm text-neo-black">
            {{ 'game.cardQa.questionsPerTurn' | translate }}
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              *ngFor="let quota of turnOptions"
              type="button"
              (click)="selectedTurnQuota = quota"
              [class.bg-neo-black]="selectedTurnQuota === quota"
              [class.text-white]="selectedTurnQuota === quota"
              [class.bg-neo-bg]="selectedTurnQuota !== quota"
              [class.text-neo-black]="selectedTurnQuota !== quota"
              class="py-2.5 rounded-xl border-2 border-neo-black font-black text-sm hover:scale-105 active:scale-95 transition-transform">
              {{ quota }}
            </button>
          </div>
        </div>

        <!-- Question Sourcing Option -->
        <div class="space-y-2">
          <label class="block font-black text-sm text-neo-black">
            {{ 'game.cardQa.questionSource' | translate }}
          </label>
          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              (click)="selectedSource = 'database'"
              [class.bg-neo-yellow]="selectedSource === 'database'"
              [class.bg-neo-bg]="selectedSource !== 'database'"
              class="py-3 px-3 rounded-xl border-2 border-neo-black font-black text-xs text-neo-black flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-transform">
              <span>📚</span> {{ 'game.cardQa.sourceDatabase' | translate }}
            </button>

            <button
              type="button"
              (click)="selectedSource = 'custom'"
              [class.bg-neo-cyan]="selectedSource === 'custom'"
              [class.bg-neo-bg]="selectedSource !== 'custom'"
              class="py-3 px-3 rounded-xl border-2 border-neo-black font-black text-xs text-neo-black flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 transition-transform">
              <span>✏️</span> {{ 'game.cardQa.sourceCustom' | translate }}
            </button>
          </div>
        </div>

        <!-- Match Name Field -->
        <div class="space-y-1">
          <label class="block font-black text-sm text-neo-black">
            {{ 'configure.matchNameLabel' | translate }}
          </label>
          <input 
            type="text" 
            [(ngModel)]="matchNameInput" 
            [placeholder]="'configure.matchNamePlaceholder' | translate"
            class="neo-input text-xs font-bold py-2" />
        </div>

      </div>

      <!-- Footer Buttons -->
      <div class="border-t-3 border-neo-black pt-4 flex items-center justify-end gap-3">
        <app-button
          variant="secondary"
          (onClick)="close.emit()">
          {{ 'common.cancel' | translate }}
        </app-button>
        <app-button
          variant="yellow"
          (onClick)="saveAndApply()">
          {{ 'common.save' | translate }}
        </app-button>
      </div>

    </app-modal>
  `
})
export class ConfigModalComponent {
  private service = inject(CardQaService);

  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  cardOptions = [12, 16, 20, 24];
  turnOptions = [3, 5, 10];

  selectedCards = 20;
  selectedTurnQuota = 5;
  selectedSource: 'database' | 'custom' = 'database';
  matchNameInput: string = '';

  ngOnInit(): void {
    const current = this.service.config();
    this.selectedCards = current.totalCardCount;
    this.selectedTurnQuota = current.questionsPerTurn;
    this.selectedSource = current.questionSource;
    this.matchNameInput = current.matchName || localStorage.getItem('cardQa_matchName') || '';
  }

  saveAndApply(): void {
    const trimmed = this.matchNameInput.trim();
    if (trimmed) {
      localStorage.setItem('cardQa_matchName', trimmed);
    }
    this.service.updateConfig({
      totalCardCount: this.selectedCards,
      questionsPerTurn: this.selectedTurnQuota,
      questionSource: this.selectedSource,
      matchName: trimmed
    });
    this.service.initializeMatch();
    this.close.emit();
  }
}
