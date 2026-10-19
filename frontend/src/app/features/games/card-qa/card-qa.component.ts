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
    <div class="w-full space-y-3">
      
      <!-- Consolidated Compact Top Bar: Title, Active Turn, Roster & Actions -->
      <div class="neo-card bg-white border-3 border-neo-black p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm select-none">
        
        <!-- Left: Game Icon, Title, and Active Turn Status -->
        <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div class="w-8 h-8 rounded-lg border-2 border-neo-black bg-neo-yellow flex items-center justify-center text-base shrink-0 font-black">
            🃏
          </div>
          <div class="flex items-center gap-1.5">
            <h2 class="text-sm sm:text-base font-black text-neo-black leading-none">
              {{ 'game.cardQa.title' | translate }}
            </h2>
            <span 
              *ngIf="service.isOfflineMode()" 
              class="px-1.5 py-0.5 rounded text-[9px] font-black bg-neo-yellow border border-neo-black text-neo-black">
              {{ 'game.cardQa.offlineBadge' | translate }}
            </span>
          </div>

          <span class="hidden md:inline-block w-px h-5 bg-neo-black/20 mx-0.5"></span>

          <!-- Active Turn Badge -->
          <div class="flex items-center gap-1.5 bg-neo-bg px-2.5 py-1 rounded-xl border-2 border-neo-black text-xs">
            <span class="text-[10px] font-black uppercase text-neo-muted">Turno:</span>
            <span class="font-black text-xs sm:text-sm text-neo-black flex items-center gap-1 truncate max-w-[130px] sm:max-w-none">
              <span>🎯</span> {{ service.activePlayerName() }}
            </span>
            <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-400 font-black text-[9px]">
              1 pick
            </span>
          </div>

          <!-- Next Player Tag -->
          <div *ngIf="service.nextPlayerName()" class="hidden lg:flex items-center gap-1 text-xs">
            <span class="font-bold text-neo-muted text-[11px]">Siguiente:</span>
            <span class="px-2 py-0.5 rounded-lg bg-white border border-neo-black font-black text-neo-black text-xs">
              {{ service.nextPlayerName() }}
            </span>
          </div>

          <!-- Remaining Cards Counter -->
          <div class="flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg bg-gray-50 border border-neo-black">
            <span>🎴</span>
            <span>{{ service.remainingCardsCount() }} / {{ service.cards().length }}</span>
          </div>
        </div>

        <!-- Right: Actions Toolbar with Fullscreen -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <!-- Fullscreen Toggle Button -->
          <app-button
            variant="secondary"
            (onClick)="toggleFullscreen()"
            [title]="isFullscreen ? ('game.cardQa.exitFullscreen' | translate) : ('game.cardQa.fullscreen' | translate)">
            <span class="text-sm">{{ isFullscreen ? '🗗' : '⛶' }}</span>
            <span class="hidden sm:inline text-xs font-black">
              {{ isFullscreen ? ('game.cardQa.exitFullscreen' | translate) : ('game.cardQa.fullscreen' | translate) }}
            </span>
          </app-button>

          <!-- Results Button -->
          <app-button
            variant="cyan"
            (onClick)="isResultsModalOpen = true">
            <span>📊</span>
            <span class="hidden sm:inline text-xs">{{ 'game.cardQa.viewResults' | translate }}</span>
          </app-button>

          <!-- Custom Questions Button -->
          <app-button
            variant="secondary"
            (onClick)="isCustomQuestionsOpen = true">
            <span>✏️</span>
            <span class="hidden md:inline text-xs">{{ 'game.cardQa.manageCustomQuestions' | translate }}</span>
          </app-button>

          <!-- Config / Settings Button -->
          <app-button
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
        (evaluate)="service.evaluateAndClose($event)">
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

    </div>
  `
})
export class CardQaComponent implements OnInit, OnChanges, OnDestroy {
  readonly service = inject(CardQaService);

  @Input() session?: Session;

  isResultsModalOpen = false;
  isConfigModalOpen = false;
  isCustomQuestionsOpen = false;
  isFullscreen = false;

  private readonly fullscreenListener = () => {
    this.isFullscreen = !!document.fullscreenElement;
  };

  ngOnInit(): void {
    this.service.syncSession(this.session);
    document.addEventListener('fullscreenchange', this.fullscreenListener);
    document.addEventListener('webkitfullscreenchange', this.fullscreenListener);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['session']) {
      this.service.syncSession(this.session);
    }
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.fullscreenListener);
    document.removeEventListener('webkitfullscreenchange', this.fullscreenListener);
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      const docEl = document.documentElement as HTMLElement & {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
        mozRequestFullScreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    } else {
      const doc = document as Document & {
        exitFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        msExitFullscreen?: () => Promise<void>;
      };
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
  }

  onSelectCard(index: number): void {
    this.service.selectCard(index);
  }
}
