import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="isVisible" 
      class="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen z-[100] flex items-center justify-center p-4 bg-neo-black/70 backdrop-blur-md overflow-y-auto select-none animate-fade-in"
      (click)="onBackdropClick($event)">
      
      <div 
        class="relative w-full bg-white rounded-2xl border-4 border-neo-black p-6 space-y-4 animate-scale-in my-auto"
        [ngClass]="maxWidthClass"
        (click)="$event.stopPropagation()">
        
        <!-- Modal Header -->
        <div *ngIf="title || icon" class="flex items-center justify-between border-b-3 border-neo-black pb-3">
          <div class="flex items-center gap-2.5">
            <span *ngIf="icon" class="text-3xl">{{ icon }}</span>
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-neo-black leading-tight">{{ title }}</h2>
              <p *ngIf="subtitle" class="text-xs font-bold text-neo-muted">{{ subtitle }}</p>
            </div>
          </div>

          <button 
            *ngIf="showCloseButton"
            (click)="handleClose()"
            class="w-8 h-8 rounded-full border-2 border-neo-black bg-neo-pink text-white font-black hover:bg-red-600 transition flex items-center justify-center text-sm cursor-pointer shadow-none">
            ✕
          </button>
        </div>

        <!-- Projected Content -->
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ModalComponent {
  private modalService = inject(ModalService);

  @Input() modalId?: string;
  @Input() isOpen: boolean = false;
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() maxWidth: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() showCloseButton: boolean = true;
  @Input() closeOnBackdrop: boolean = true;

  @Output() close = new EventEmitter<void>();

  get isVisible(): boolean {
    if (this.modalId) {
      return this.modalService.isOpen(this.modalId) || this.isOpen;
    }
    return this.isOpen;
  }

  get maxWidthClass(): string {
    switch (this.maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      default: return 'max-w-md';
    }
  }

  handleClose(): void {
    if (this.modalId) {
      this.modalService.close();
    }
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.handleClose();
    }
  }
}
