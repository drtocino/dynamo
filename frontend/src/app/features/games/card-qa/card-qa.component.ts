import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardQaService } from './services/card-qa.service';
import { TranslatePipe } from '../../../core/i18n';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardGridComponent } from './components/card-grid/card-grid.component';
import { CardModalComponent } from './components/card-modal/card-modal.component';
import { ResultsModalComponent } from './components/results-modal/results-modal.component';
import { ConfigModalComponent } from './components/config-modal/config-modal.component';
import { CustomQuestionsModalComponent } from './components/custom-questions-modal/custom-questions-modal.component';
import { Session } from '../../../core/models/session.model';

@Component({
  selector: 'app-card-qa',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ButtonComponent,
    CardGridComponent,
    CardModalComponent,
    ResultsModalComponent,
    ConfigModalComponent,
    CustomQuestionsModalComponent
  ],
  template: `
    <div class="w-full space-y-2">
      
      <!-- Consolidated Compact Top Bar: Title, Active Turn, Roster & Actions -->
      <div class="neo-card bg-white border-3 border-neo-black py-1.5 px-2.5 sm:px-3 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 shadow-sm select-none">
        
        <!-- Left: Game Icon, Title, and Active Turn Status -->
        <div class="flex items-center gap-1.5 sm:gap-2.5 flex-wrap">
          <div class="w-7 h-7 rounded-lg border-2 border-neo-black bg-neo-yellow flex items-center justify-center text-sm shrink-0 font-black">
            🃏
          </div>
          <div class="flex items-center gap-1.5">
            <h2 class="text-xs sm:text-sm font-black text-neo-black leading-none truncate max-w-[180px] sm:max-w-xs" [title]="matchTitle">
              {{ matchTitle }}
            </h2>
            <span 
              *ngIf="session?.roomCode" 
              class="px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-white border-2 border-neo-black text-neo-black">
              #{{ session!.roomCode }}
            </span>
            <span 
              *ngIf="service.isOfflineMode()" 
              class="px-1 py-0.2 rounded text-[8px] font-black bg-neo-yellow border border-neo-black text-neo-black">
              {{ 'game.cardQa.offlineBadge' | translate }}
            </span>
          </div>

          <span class="hidden md:inline-block w-px h-4 bg-neo-black/20 mx-0.5"></span>

          <!-- Active Turn Badge -->
          <div class="flex items-center gap-1 bg-neo-bg px-2 py-0.5 rounded-lg border-2 border-neo-black text-xs">
            <span class="text-[9px] font-black uppercase text-neo-muted">Turno:</span>
            <span class="font-black text-xs text-neo-black flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
              <span>🎯</span> {{ service.activePlayerName() }}
            </span>
          </div>

          <!-- Active Player Section Quota Status -->
          <div class="hidden sm:flex items-center gap-1.5 text-[11px] font-black bg-white px-2 py-0.5 rounded-lg border-2 border-neo-black select-none">
            <span class="text-[9px] uppercase text-neo-muted font-black">Cuota:</span>
            <span 
              [class.text-emerald-700]="service.activePlayerQuota().selection.used >= 2"
              [class.text-neo-black]="service.activePlayerQuota().selection.used < 2"
              title="Selección (V/F y Opciones): 2 preguntas máximo">
              🔴 {{ service.activePlayerQuota().selection.used }}/2
            </span>
            <span class="text-neo-black/30">·</span>
            <span 
              [class.text-emerald-700]="service.activePlayerQuota().open.used >= 2"
              [class.text-neo-black]="service.activePlayerQuota().open.used < 2"
              title="Preguntas Abiertas: 2 preguntas máximo">
              🔵 {{ service.activePlayerQuota().open.used }}/2
            </span>
            <span class="text-neo-black/30">·</span>
            <span 
              [class.text-emerald-700]="service.activePlayerQuota().wildcard.used >= 1"
              [class.text-neo-black]="service.activePlayerQuota().wildcard.used < 1"
              title="Comodín: 1 máximo">
              🌟 {{ service.activePlayerQuota().wildcard.used }}/1
            </span>
          </div>

          <!-- Next Player Tag -->
          <div *ngIf="service.nextPlayerName()" class="hidden lg:flex items-center gap-1 text-xs">
            <span class="font-bold text-neo-muted text-[10px]">Siguiente:</span>
            <span class="px-1.5 py-0.2 rounded-md bg-white border-2 border-neo-black font-black text-neo-black text-xs">
              {{ service.nextPlayerName() }}
            </span>
          </div>

          <!-- Remaining Cards Counter -->
          <div class="flex items-center gap-1 text-xs font-black px-1.5 py-0.5 rounded-md bg-gray-50 border-2 border-neo-black">
            <span>🎴</span>
            <span>{{ service.remainingCardsCount() }} / {{ service.cards().length }}</span>
          </div>
        </div>

        <!-- Right: Actions Toolbar with Smaller Buttons -->
        <div class="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          <!-- Share Match Link Button -->
          <app-button
            size="sm"
            variant="yellow"
            (onClick)="onShareMatch()"
            [title]="'game.cardQa.shareMatchTitle' | translate">
            <span>🔗</span>
            <span class="hidden sm:inline font-black">{{ 'game.cardQa.shareMatch' | translate }}</span>
          </app-button>

          <!-- Results Button -->
          <app-button
            size="sm"
            variant="cyan"
            (onClick)="isResultsModalOpen = true">
            <span>📊</span>
            <span class="hidden sm:inline">{{ 'game.cardQa.viewResults' | translate }}</span>
          </app-button>

          <!-- Custom Questions Button -->
          <app-button
            size="sm"
            variant="secondary"
            (onClick)="isCustomQuestionsOpen = true">
            <span>✏️</span>
            <span class="hidden md:inline">{{ 'game.cardQa.manageCustomQuestions' | translate }}</span>
          </app-button>

          <!-- Config / Settings Button -->
          <app-button
            size="sm"
            variant="secondary"
            (onClick)="isConfigModalOpen = true">
            <span>⚙️</span>
          </app-button>
        </div>

      </div>

      <!-- Main Board Cards Grid (5 Columns: Red, Blue, Yellow) -->
      <app-card-grid
        [cards]="service.cards()"
        (selectCard)="onSelectCard($event)">
      </app-card-grid>

      <!-- Active Expanding Card Modal with 3D Flip -->
      <app-card-modal
        *ngIf="service.activeCard()"
        [card]="service.activeCard()!"
        (flipToAnswer)="service.revealAnswer()"
        (evaluate)="service.evaluateAndClose($event)"
        (closeCard)="service.closeActiveCard()">
      </app-card-modal>

      <!-- Results Scoreboard Modal (Collapsible by Default) -->
      <app-results-modal
        [isOpen]="isResultsModalOpen"
        (close)="isResultsModalOpen = false">
      </app-results-modal>

      <!-- Configuration Settings Modal -->
      <app-config-modal
        [isOpen]="isConfigModalOpen"
        (close)="isConfigModalOpen = false">
      </app-config-modal>

      <!-- Custom Questions Editor & JSON Import/Export Modal -->
      <app-custom-questions-modal
        [isOpen]="isCustomQuestionsOpen"
        (close)="isCustomQuestionsOpen = false">
      </app-custom-questions-modal>

      <!-- Copied Link Toast Notification -->
      <div 
        *ngIf="copiedLinkToast" 
        class="fixed top-14 right-4 z-50 bg-neo-black text-white px-4 py-2.5 rounded-xl border-2 border-white shadow-neo-lg text-xs font-black flex items-center gap-2 animate-bounce-subtle select-none">
        <span>✅</span> {{ 'game.cardQa.linkCopied' | translate }}
      </div>

      <!-- Quota Limit Alert Toast -->
      <div 
        *ngIf="service.quotaAlert() as alert" 
        class="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-rose-500 text-white px-4 py-3 rounded-2xl border-3 border-neo-black shadow-neo-lg text-xs sm:text-sm font-black flex items-center gap-2 animate-bounce-subtle select-none max-w-lg text-center">
        <span class="text-base">⚠️</span>
        <span>
          ¡{{ alert.playerName }} ya respondió sus {{ alert.max }} {{ alert.max === 1 ? 'pregunta' : 'preguntas' }} de {{ alert.sectionLabel }}! Elige de otra sección.
        </span>
        <button 
          type="button" 
          (click)="service.clearQuotaAlert()" 
          class="ml-2 w-5 h-5 rounded-full bg-black/30 hover:bg-black/50 text-white text-[10px] flex items-center justify-center cursor-pointer shrink-0">
          ✕
        </button>
      </div>

    </div>
  `
})
export class CardQaComponent implements OnInit, OnChanges {
  readonly service = inject(CardQaService);

  @Input() session?: Session;

  isResultsModalOpen = false;
  isConfigModalOpen = false;
  isCustomQuestionsOpen = false;
  copiedLinkToast = false;

  get matchTitle(): string {
    const configTitle = this.service.config().matchName?.trim();
    if (configTitle) return configTitle;

    if (this.session?.gameSettingsJson) {
      try {
        const parsed = JSON.parse(this.session.gameSettingsJson);
        if (parsed.matchName?.trim()) {
          return parsed.matchName.trim();
        }
      } catch (_) { }
    }

    const stored = localStorage.getItem('cardQa_matchName')?.trim();
    if (stored) return stored;

    if (this.session?.roomCode) {
      return `Partida #${this.session.roomCode}`;
    }
    return 'Partida de Cartas Q&A';
  }

  ngOnInit(): void {
    this.service.syncSession(this.session);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['session']) {
      this.service.syncSession(this.session);
    }
  }

  onSelectCard(index: number): void {
    this.service.selectCard(index);
  }

  onShareMatch(): void {
    const link = this.service.createShareableLink();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        this.copiedLinkToast = true;
        setTimeout(() => {
          this.copiedLinkToast = false;
        }, 3500);
      }).catch(() => {
        window.prompt('Copia este enlace de partida:', link);
      });
    } else {
      window.prompt('Copia este enlace de partida:', link);
    }
  }
}
