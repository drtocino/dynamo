import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../core/i18n';

export interface WheelWedge {
  label: string;
  value: number;
  color: string;
  textColor: string;
  type: 'price' | 'bankrupt' | 'miss';
}

@Component({
  selector: 'app-roulette-wheel',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="relative w-full flex flex-col items-center select-none">
      <!-- Roulette Framing Container (Right half visible, overflowing left/center) -->
      <div class="relative w-full h-full min-h-[260px] sm:min-h-[280px] lg:min-h-[300px] rounded-2xl border-3 sm:border-4 border-neo-black bg-neo-black overflow-hidden flex items-center justify-start shadow-none">
        
        <!-- Spinning Disc Circle (Semi-aligned to right border, near pointer) -->
        <div class="absolute right-0 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 w-[420px] h-[420px] sm:w-[460px] sm:h-[460px] lg:w-[500px] lg:h-[500px] rounded-full border-4 sm:border-6 border-neo-black overflow-hidden bg-neo-black">
          <div 
            class="w-full h-full rounded-full"
            [style.transform]="'rotate(' + (targetRotation + 90) + 'deg)'"
            [style.transition-property]="'transform'"
            [style.transition-duration]="isSpinning ? '4.5s' : '0s'"
            [style.transition-timing-function]="'cubic-bezier(0.15, 0.9, 0.25, 1)'"
            (transitionend)="onTransitionEnd($event)"
            (transitioncancel)="onTransitionCancel($event)">

            <!-- SVG Pie Segments (20 wedges) -->
            <svg viewBox="0 0 100 100" class="w-full h-full transform -rotate-90">
              <g *ngFor="let wedge of wedges; let i = index">
                <path 
                  [attr.d]="getSegmentPath(i)" 
                  [attr.fill]="wedge.color"
                  stroke="#121212" 
                  stroke-width="0.8" />
              </g>
            </svg>

            <!-- Wedge Text Labels (-rotate-90 keeps letters right-side up at 3 o'clock pointer) -->
            <div 
              *ngFor="let wedge of wedges; let i = index"
              class="absolute inset-0 flex items-start justify-center pt-1 sm:pt-2 select-none pointer-events-none"
              [style.transform]="'rotate(' + getWedgeAngle(i) + 'deg)'">
              <span 
                class="font-black text-[9px] sm:text-[11px] md:text-xs tracking-tighter uppercase transform -rotate-90 mt-5 sm:mt-8 px-1 py-0.5 rounded leading-none text-center"
                [style.color]="wedge.textColor"
                [class.bg-neo-black]="wedge.type === 'bankrupt' || wedge.type === 'miss'"
                [class.text-white]="wedge.type === 'bankrupt' || wedge.type === 'miss'">
                {{ (wedge.type === 'miss' ? 'game.biblicalRoulette.missTurn' : (wedge.type === 'bankrupt' ? 'game.biblicalRoulette.bankrupt' : wedge.label)) | translate }}
              </span>
            </div>
          </div>

          <!-- Wheel Center Hub -->
          <div class="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neo-yellow border-3 sm:border-4 border-neo-black flex items-center justify-center z-20">
            <span class="text-2xl">✝️</span>
          </div>
        </div>

        <!-- Pointer Arrow on Right Rim (3 o'clock position pointing LEFT) -->
        <div class="absolute right-0 top-1/2 -translate-y-1/2 z-30 pointer-events-none flex items-center pr-0.5">
          <svg width="44" height="34" viewBox="0 0 44 34" class="overflow-visible">
            <!-- Triangular Pointer pointing LEFT into 3 o'clock wedge -->
            <polygon points="4,17 34,4 34,30" fill="#FFE600" stroke="#121212" stroke-width="3.5" stroke-linejoin="round" />
            <!-- Base Pin Circle -->
            <circle cx="34" cy="17" r="7" fill="#FF3366" stroke="#121212" stroke-width="2.5" />
          </svg>
        </div>
      </div>
    </div>
  `
})
export class RouletteWheelComponent implements OnChanges, OnDestroy {
  @Input() targetRotation: number = 0;
  @Input() lastResult: string = '';
  @Input() isSpinning: boolean = false;
  @Output() spinComplete = new EventEmitter<string>();

  displayResult: string = '';
  private fallbackTimer: any = null;

  // Exactly 20 wedges: 1 Bankrupt, 2 Miss Turn, 17 Price options
  // Regular price wedges cycle through Green (#00F59B), Yellow (#FFE600), White (#FFFFFF), and Light Blue (#4DABF7)
  wedges: WheelWedge[] = [
    { label: '300', value: 300, color: '#00F59B', textColor: '#121212', type: 'price' },       // 1. Green
    { label: '500', value: 500, color: '#FFE600', textColor: '#121212', type: 'price' },       // 2. Yellow
    { label: '200', value: 200, color: '#FFFFFF', textColor: '#121212', type: 'price' },       // 3. White
    { label: 'MISS TURN', value: 0, color: '#A855F7', textColor: '#FFFFFF', type: 'miss' },     // 4. Purple (Miss Turn 1/2)
    { label: '700', value: 700, color: '#4DABF7', textColor: '#121212', type: 'price' },       // 5. Light Blue
    { label: '400', value: 400, color: '#00F59B', textColor: '#121212', type: 'price' },       // 6. Green
    { label: '600', value: 600, color: '#FFE600', textColor: '#121212', type: 'price' },       // 7. Yellow
    { label: '150', value: 150, color: '#FFFFFF', textColor: '#121212', type: 'price' },       // 8. White
    { label: 'BANKRUPT', value: 0, color: '#FF3366', textColor: '#FFFFFF', type: 'bankrupt' },  // 9. Pink (Bankrupt 1/1)
    { label: '800', value: 800, color: '#4DABF7', textColor: '#121212', type: 'price' },       // 10. Light Blue
    { label: '250', value: 250, color: '#00F59B', textColor: '#121212', type: 'price' },       // 11. Green
    { label: '1000', value: 1000, color: '#FFE600', textColor: '#121212', type: 'price' },     // 12. Yellow
    { label: '350', value: 350, color: '#FFFFFF', textColor: '#121212', type: 'price' },       // 13. White
    { label: '450', value: 450, color: '#4DABF7', textColor: '#121212', type: 'price' },       // 14. Light Blue
    { label: 'MISS TURN', value: 0, color: '#A855F7', textColor: '#FFFFFF', type: 'miss' },     // 15. Purple (Miss Turn 2/2)
    { label: '550', value: 550, color: '#00F59B', textColor: '#121212', type: 'price' },       // 16. Green
    { label: '650', value: 650, color: '#FFE600', textColor: '#121212', type: 'price' },       // 17. Yellow
    { label: '750', value: 750, color: '#FFFFFF', textColor: '#121212', type: 'price' },       // 18. White
    { label: '100', value: 100, color: '#4DABF7', textColor: '#121212', type: 'price' },       // 19. Light Blue
    { label: '900', value: 900, color: '#FFE600', textColor: '#121212', type: 'price' }        // 20. Yellow
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isSpinning']) {
      if (changes['isSpinning'].currentValue === true) {
        this.displayResult = '';
        if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
        // Guaranteed safety trigger after 4.6 seconds in case browser delays transitionend
        this.fallbackTimer = setTimeout(() => {
          this.completeSpin();
        }, 4600);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
    }
  }

  getWedgeAngle(index: number): number {
    const anglePerSegment = 360 / this.wedges.length;
    return (index * anglePerSegment) + (anglePerSegment / 2);
  }

  getSegmentPath(index: number): string {
    const count = this.wedges.length;
    const anglePerSegment = (2 * Math.PI) / count;
    const startAngle = index * anglePerSegment;
    const endAngle = (index + 1) * anglePerSegment;

    const x1 = 50 + 50 * Math.cos(startAngle);
    const y1 = 50 + 50 * Math.sin(startAngle);
    const x2 = 50 + 50 * Math.cos(endAngle);
    const y2 = 50 + 50 * Math.sin(endAngle);

    return `M 50 50 L ${x1.toFixed(3)} ${y1.toFixed(3)} A 50 50 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
  }

  onTransitionEnd(event?: TransitionEvent): void {
    if (event && event.propertyName && event.propertyName !== 'transform') return;
    this.completeSpin();
  }

  onTransitionCancel(event?: TransitionEvent): void {
    this.completeSpin();
  }

  private completeSpin(): void {
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
    this.displayResult = this.lastResult;
    this.spinComplete.emit(this.lastResult);
  }
}
