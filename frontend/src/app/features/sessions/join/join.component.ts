import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-join',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="max-w-md mx-auto space-y-6">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-3 bg-neo-yellow border-3 border-neo-black rounded-2xl flex items-center justify-center text-3xl">
          🎟️
        </div>
        <h1 class="text-3xl font-black text-neo-black">
          Join a Match
        </h1>
        <p class="font-bold text-sm text-neo-muted mt-1">
          Enter the room code shared by your game host
        </p>
      </div>

      <div class="neo-card bg-white space-y-5">
        <!-- Room Code Input -->
        <div>
          <label class="block font-black text-sm text-neo-black mb-1">
            Room Code
          </label>
          <input 
            type="text" 
            [(ngModel)]="roomCode" 
            (input)="roomCode = roomCode.toUpperCase()"
            maxlength="6"
            placeholder="e.g. 7X9K2"
            class="neo-input text-center text-2xl font-black tracking-widest uppercase" />
        </div>

        <!-- Player Name Input -->
        <div>
          <label class="block font-black text-sm text-neo-black mb-1">
            Your Nickname
          </label>
          <input 
            type="text" 
            [(ngModel)]="playerName" 
            maxlength="30"
            placeholder="e.g. Daniel, Grace, Joshua"
            class="neo-input" />
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMessage" class="p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-800 text-xs font-bold flex items-center gap-2">
          <span>⚠️</span>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Action Button -->
        <button 
          type="button"
          (click)="onJoin()" 
          [disabled]="!roomCode.trim() || !playerName.trim() || isSubmitting"
          class="neo-btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2">
          <span *ngIf="!isSubmitting">Enter Lobby 🚀</span>
          <span *ngIf="isSubmitting">Joining Session...</span>
        </button>

        <div class="text-center pt-2">
          <a routerLink="/" class="text-xs font-bold text-neo-muted hover:text-neo-black underline">
            Cancel and return to Game Hub
          </a>
        </div>
      </div>
    </div>
  `
})
export class JoinComponent {
  private sessionService = inject(SessionService);
  private router = inject(Router);

  roomCode: string = '';
  playerName: string = '';
  errorMessage: string = '';
  isSubmitting = false;

  onJoin(): void {
    if (!this.roomCode.trim() || !this.playerName.trim()) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    this.sessionService.getSessionByCode(this.roomCode.trim()).subscribe({
      next: (session) => {
        if (!session) {
          this.isSubmitting = false;
          this.errorMessage = 'Room not found or code expired. Check with the host!';
          return;
        }

        if (session.state === 'Active' || session.state === 'Ended') {
          this.isSubmitting = false;
          this.errorMessage = 'This match is already in progress or has ended.';
          return;
        }

        this.sessionService.joinSession(session.id, this.playerName.trim()).subscribe({
          next: () => {
            this.router.navigate(['/lobby', session.id]);
          },
          error: (err) => {
            this.isSubmitting = false;
            this.errorMessage = err.error?.message || 'Failed to join session.';
          }
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Unable to connect to match room.';
      }
    });
  }
}
