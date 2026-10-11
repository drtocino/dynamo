import { Component, Input, Output, EventEmitter, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  template: `
    <div class="relative flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      <!-- Top Indicator Pointer Arrow -->
      <div class="relative z-30 -mb-5 flex flex-col items-center drop-shadow-lg">
        <div class="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[32px] border-t-neo-black filter drop-shadow"></div>
        <div class="w-4 h-4 rounded-full bg-neo-yellow border-2 border-neo-black -mt-7"></div>
      </div>

      <!-- Wheel Outer Rim (Made Bigger: up to 480px) -->
      <div class="relative w-80 h-80 sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] rounded-full border-4 sm:border-6 border-neo-black shadow-neo overflow-hidden bg-neo-black">
        <!-- Spinning Disc -->
        <div 
          class="w-full h-full rounded-full"
          [style.transform]="'rotate(' + targetRotation + 'deg)'"
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

          <!-- Wedge Text Labels -->
          <div 
            *ngFor="let wedge of wedges; let i = index"
            class="absolute inset-0 flex items-start justify-center pt-1 sm:pt-2 select-none pointer-events-none"
            [style.transform]="'rotate(' + getWedgeAngle(i) + 'deg)'">
            <span 
              class="font-black text-[9px] sm:text-[11px] md:text-xs tracking-tighter uppercase transform rotate-90 mt-5 sm:mt-8 px-1 py-0.5 rounded leading-none text-center"
              [style.color]="wedge.textColor"
              [class.bg-neo-black]="wedge.type === 'bankrupt' || wedge.type === 'miss'"
              [class.text-white]="wedge.type === 'bankrupt' || wedge.type === 'miss'">
              {{ wedge.label }}
            </span>
          </div>
        </div>

        <!-- Wheel Center Hub -->
        <div class="absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-neo-yellow border-3 sm:border-4 border-neo-black shadow-neo-sm flex items-center justify-center z-20">
          <span class="text-2xl">✝️</span>
        </div>
      </div>

      <!-- Result Banner -->
      <div class="mt-4 text-center h-10 flex items-center justify-center">
        <span 
          *ngIf="displayResult" 
          class="inline-block px-5 py-1.5 rounded-full font-black text-sm sm:text-base border-3 border-neo-black shadow-neo-sm animate-bounce"
          [ngClass]="{
            'bg-neo-pink text-white': displayResult === 'BANKRUPT',
            'bg-purple-600 text-white': displayResult === 'MISS TURN',
            'bg-neo-cyan text-neo-black': displayResult !== 'BANKRUPT' && displayResult !== 'MISS TURN'
          }">
          <span *ngIf="displayResult === 'BANKRUPT'">💥 BANKRUPT! LOSE ALL POINTS</span>
          <span *ngIf="displayResult === 'MISS TURN'">⏭️ MISS TURN! PASS TO NEXT</span>
          <span *ngIf="displayResult !== 'BANKRUPT' && displayResult !== 'MISS TURN'">🎉 LANDED ON {{ displayResult }} PTS!</span>
        </span>
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
  wedges: WheelWedge[] = [
    { label: '300', value: 300, color: '#FFE600', textColor: '#121212', type: 'price' },       // 1. Yellow
    { label: '500', value: 500, color: '#00E5FF', textColor: '#121212', type: 'price' },       // 2. Cyan
    { label: '200', value: 200, color: '#FFFFFF', textColor: '#121212', type: 'price' },       // 3. White
    { label: 'MISS TURN', value: 0, color: '#A855F7', textColor: '#FFFFFF', type: 'miss' },     // 4. Purple (Miss Turn 1/2)
    { label: '700', value: 700, color: '#FFE600', textColor: '#121212', type: 'price' },       // 5. Yellow
    { label: '400', value: 400, color: '#00E5FF', textColor: '#121212', type: 'price' },       // 6. Cyan
    { label: '600', value: 600, color: '#FFB800', textColor: '#121212', type: 'price' },       // 7. Amber
    { label: '150', value: 150, color: '#FFFFFF', textColor: '#121212', type: 'price' },       // 8. White
    { label: 'BANKRUPT', value: 0, color: '#FF3366', textColor: '#FFFFFF', type: 'bankrupt' },  // 9. Pink (Bankrupt 1/1)
    { label: '800', value: 800, color: '#00E5FF', textColor: '#121212', type: 'price' },       // 10. Cyan
    { label: '250', value: 250, color: '#FFE600', textColor: '#121212', type: 'price' },       // 11. Yellow
    { label: '1000', value: 1000, color: '#00F59B', textColor: '#121212', type: 'price' },     // 12. Green
    { label: '350', value: 350, color: '#FFFFFF', textColor: '#121212', type: 'price' },       // 13. White
    { label: '450', value: 450, color: '#FFB800', textColor: '#121212', type: 'price' },       // 14. Amber
    { label: 'MISS TURN', value: 0, color: '#A855F7', textColor: '#FFFFFF', type: 'miss' },     // 15. Purple (Miss Turn 2/2)
    { label: '550', value: 550, color: '#00E5FF', textColor: '#121212', type: 'price' },       // 16. Cyan
    { label: '650', value: 650, color: '#FFE600', textColor: '#121212', type: 'price' },       // 17. Yellow
    { label: '750', value: 750, color: '#FFB800', textColor: '#121212', type: 'price' },       // 18. Amber
    { label: '100', value: 100, color: '#FFFFFF', textColor: '#121212', type: 'price' },       // 19. White
    { label: '900', value: 900, color: '#00F59B', textColor: '#121212', type: 'price' }        // 20. Green
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
