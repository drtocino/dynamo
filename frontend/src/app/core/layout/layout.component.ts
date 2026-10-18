import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <div class="min-h-screen flex flex-col bg-neo-bg text-neo-black">
      <!-- Top Navigation Banner (Hidden in game match view) -->
      <header *ngIf="!isMatchView()" class="border-b-4 border-neo-black bg-white sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="w-10 h-10 rounded-lg bg-neo-yellow border-3 border-neo-black flex items-center justify-center font-black text-2xl group-hover:rotate-6 transition-transform">
              ⚡
            </div>
            <div>
              <span class="font-black text-2xl tracking-tight text-neo-black block leading-none">
                DYNAMO
              </span>
              <span class="text-[10px] font-black uppercase tracking-widest text-neo-black/70">
                Youth Games Hub
              </span>
            </div>
          </a>

          <!-- Navigation Links & Join Action -->
          <nav class="flex items-center gap-3">
            <a routerLink="/" 
               class="px-4 py-2 font-bold text-sm rounded-lg hover:bg-neo-gray transition-colors">
              🎮 Browse Games
            </a>
            <a routerLink="/join" 
               class="neo-btn-primary text-sm py-2 px-4 flex items-center gap-2">
              <span>🎟️</span>
              <span>Join with Code</span>
            </a>
          </nav>
        </div>
      </header>

      <!-- Main Shell Content: Full width and flush top when in match view -->
      <main [ngClass]="isMatchView() ? 'flex-1 w-full p-0 flex flex-col' : 'flex-1 max-w-6xl w-full mx-auto px-4 py-8'">
        <router-outlet></router-outlet>
      </main>

      <!-- Wholesome Neobrutalist Footer (Hidden in game match view) -->
      <footer *ngIf="!isMatchView()" class="border-t-4 border-neo-black bg-white mt-auto py-6">
        <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-neo-black/80">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded bg-neo-cyan border-2 border-neo-black text-[10px] font-black">
              WHOLESOME & SAFE
            </span>
            <span>Built for Christian Youth Fellowships & Retreats</span>
          </div>
          <div>
            <span>Dynamo Games Platform &copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class LayoutComponent {
  private router = inject(Router);
  isMatchView = signal(this.router.url.includes('/active-match'));

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.isMatchView.set(this.router.url.includes('/active-match'));
    });
  }
}

