import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      (click)="onClick.emit($event)"
      [ngClass]="getButtonClasses()"
      class="h-11 px-3 sm:px-4 font-black text-xs sm:text-sm rounded-xl border-3 border-neo-black flex items-center justify-center gap-1.5 transition active:scale-95 select-none w-full shadow-none">
      <ng-content></ng-content>
    </button>
  `
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' | 'yellow' | 'cyan' | 'pink' = 'primary';
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Output() onClick = new EventEmitter<MouseEvent>();

  getButtonClasses(): string {
    if (this.disabled) {
      return 'bg-neo-gray text-neo-muted opacity-40 cursor-not-allowed';
    }
    switch (this.variant) {
      case 'yellow':
        return 'bg-neo-yellow hover:bg-yellow-300 text-neo-black cursor-pointer';
      case 'cyan':
        return 'bg-neo-cyan hover:bg-cyan-300 text-neo-black cursor-pointer';
      case 'pink':
        return 'bg-neo-pink hover:bg-pink-500 text-white cursor-pointer';
      case 'secondary':
        return 'bg-neo-gray hover:bg-gray-200 text-neo-black cursor-pointer';
      default:
        return 'bg-neo-yellow hover:bg-yellow-300 text-neo-black cursor-pointer';
    }
  }
}
