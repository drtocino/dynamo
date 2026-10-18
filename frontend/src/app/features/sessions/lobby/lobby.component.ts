import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SessionService } from '../../../core/services/session.service';
import { RealtimeService } from '../../../core/services/realtime.service';
import { Session } from '../../../core/models/session.model';
import { GameStore } from '../../../store/game.store';
import { InputService } from '../../../core/services/input.service';
import { TranslatePipe } from '../../../core/i18n';

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div *ngIf="session" class="max-w-3xl mx-auto space-y-6">
      <!-- Lobby Header Card -->
      <div class="neo-card bg-neo-yellow relative overflow-hidden">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="neo-badge bg-neo-black text-white">
                {{ getGameNameKey(session.gameSlug) | translate }}
              </span>
              <span 
                [class.bg-neo-cyan]="session.mode === 'RoomBased'"
                [class.bg-neo-pink]="session.mode === 'SharedScreen'"
                [class.text-white]="session.mode === 'SharedScreen'"
                class="neo-badge text-neo-black">
                {{ (session.mode === 'RoomBased' ? 'hub.badgeRoomBased' : 'hub.badgeSharedScreen') | translate }}
              </span>
            </div>
            <h1 class="text-3xl font-black text-neo-black">{{ 'lobby.title' | translate }}</h1>
            <p class="font-bold text-sm text-neo-black/80">
              {{ 'lobby.details' | translate:{ rounds: session.rounds, seconds: session.timeLimitSeconds, max: session.maxPlayers } }}
            </p>
          </div>

          <!-- Room Code Callout -->
          <div class="bg-white border-3 border-neo-black rounded-xl p-4 text-center min-w-[160px]">
            <span class="text-[10px] font-black uppercase tracking-widest text-neo-muted block">
              {{ 'lobby.roomCode' | translate }}
            </span>
            <div class="text-3xl font-black text-neo-black tracking-widest my-1 select-all">
              {{ session.roomCode }}
            </div>
            <button 
              (click)="copyCode()"
              class="text-xs font-bold text-neo-black hover:underline cursor-pointer">
              {{ (copied ? 'lobby.copied' : 'lobby.copyCode') | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Players Section -->
      <div class="neo-card bg-white space-y-4">
        <div class="flex items-center justify-between border-b-3 border-neo-black pb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">👥</span>
            <h2 class="text-xl font-black text-neo-black">
              {{ 'lobby.joinedParticipants' | translate:{ count: session.players.length, max: session.maxPlayers } }}
            </h2>
          </div>
          <span *ngIf="session.players.length < 2" class="text-xs font-bold text-neo-muted">
            {{ 'lobby.waitingForPlayers' | translate }}
          </span>
        </div>

        <!-- Players Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <div 
            *ngFor="let player of session.players"
            class="p-3 rounded-xl border-3 border-neo-black bg-neo-gray flex flex-col items-center text-center relative group">
            <!-- Host Indicator Badge -->
            <span 
              *ngIf="player.clientId === session.hostClientId" 
              class="absolute -top-2.5 -right-2 bg-neo-yellow text-neo-black text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-neo-black">
              {{ 'lobby.hostBadge' | translate }}
            </span>

            <div class="w-12 h-12 rounded-full border-2 border-neo-black bg-white flex items-center justify-center text-xl mb-2 font-black">
              {{ getAvatarEmoji(player.name) }}
            </div>
            <span class="font-black text-sm text-neo-black truncate max-w-full">
              {{ player.name }}
            </span>
          </div>

          <!-- Empty Slot Placeholders -->
          <div 
            *ngFor="let slot of emptySlots"
            class="p-3 rounded-xl border-3 border-dashed border-neo-black/30 flex flex-col items-center justify-center text-neo-muted min-h-[104px]">
            <span class="text-xl opacity-40">👤</span>
            <span class="text-xs font-bold mt-1 opacity-60">{{ 'lobby.openSlot' | translate }}</span>
          </div>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button 
          (click)="leaveMatch()" 
          class="neo-btn-secondary w-full sm:w-auto text-sm py-2.5">
          {{ 'lobby.leaveMatch' | translate }}
        </button>

        <!-- Host Start Button or Waiting Banner -->
        <div *ngIf="isHost; else guestWaiting" class="w-full sm:w-auto">
          <button 
            (click)="startMatch()" 
            [disabled]="session.players.length < 1 || isStarting"
            class="neo-btn-primary w-full sm:w-auto py-3 px-8 text-base font-black flex items-center justify-center gap-2">
            <span>🎮</span>
            <span>{{ (isStarting ? 'lobby.starting' : 'lobby.startMatch') | translate }}</span>
          </button>
        </div>

        <ng-template #guestWaiting>
          <div class="flex items-center gap-2 font-bold text-sm text-neo-muted animate-pulse">
            <span class="w-3 h-3 rounded-full bg-neo-cyan border-2 border-neo-black"></span>
            {{ 'lobby.waitingForHost' | translate }}
          </div>
        </ng-template>
      </div>
    </div>
  `
})
export class LobbyComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sessionService = inject(SessionService);
  private realtime = inject(RealtimeService);
  public gameStore = inject(GameStore);
  private inputService = inject(InputService);

  session: Session | undefined;
  copied = false;
  isStarting = false;
  private subs: Subscription[] = [];

  get isHost(): boolean {
    if (!this.session) return false;
    const currentClientId = this.sessionService.getClientId();
    return this.session.hostClientId === currentClientId;
  }

  get emptySlots(): number[] {
    if (!this.session) return [];
    const count = Math.max(0, this.session.maxPlayers - this.session.players.length);
    return Array.from({ length: Math.min(count, 4) }, (_, i) => i);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.sessionService.getSessionById(id).subscribe(data => {
      if (!data) {
        this.router.navigate(['/']);
        return;
      }
      this.session = data;
      const clientId = this.sessionService.getClientId();
      this.realtime.listenToSession(data.id);
      this.gameStore.initSync(data.id, clientId);

      // Subscribe to real-time events
      this.subs.push(
        this.realtime.playerJoined$.subscribe(player => {
          if (this.session && !this.session.players.some(p => p.id === player.id || p.clientId === player.clientId)) {
            this.session.players.push(player);
          }
        }),
        this.realtime.playerLeft$.subscribe(event => {
          if (this.session) {
            this.session.players = this.session.players.filter(p => p.id !== event.playerId);
            if (event.newHostClientId) {
              this.session.hostClientId = event.newHostClientId;
            }
          }
        }),
        this.realtime.stateChanged$.subscribe(state => {
          const stateStr = typeof state === 'string' ? state : (state as any)?.state;
          if (this.session) {
            this.session.state = stateStr as any;
            if (stateStr === 'Active' || stateStr === 'InProgress') {
              this.router.navigate(['/active-match', this.session.id]);
            }
          }
        })
      );

      // Resilient background sync to guarantee state convergence
      const pollInterval = setInterval(() => {
        if (!this.session?.id) return;
        this.sessionService.getSessionById(this.session.id).subscribe(refreshed => {
          if (refreshed && this.session) {
            this.session.players = refreshed.players;
            this.session.state = refreshed.state;
            if (refreshed.state === 'Active') {
              this.router.navigate(['/active-match', refreshed.id]);
            }
          }
        });
      }, 2000);
      this.subs.push({ unsubscribe: () => clearInterval(pollInterval) } as Subscription);
    });
  }

  getGameNameKey(slug: string | undefined): string {
    if (!slug) return 'hub.games.biblicalRoulette.name';
    const camel = slug.replace(/-([a-z])/g, (_, g) => g.toUpperCase());
    return `hub.games.${camel}.name`;
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  copyCode(): void {
    if (this.session?.roomCode) {
      navigator.clipboard.writeText(this.session.roomCode);
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    }
  }

  startMatch(): void {
    if (!this.session) return;
    this.isStarting = true;
    this.inputService.dispatchIntent('START_GAME', null, this.session.id);
    this.sessionService.changeState(this.session.id, 'Active').subscribe(() => {
      this.router.navigate(['/active-match', this.session!.id]);
    });
  }

  leaveMatch(): void {
    if (!this.session) return;
    const currentPlayer = this.session.players.find(
      p => p.clientId === this.sessionService.getClientId()
    );
    if (currentPlayer) {
      this.sessionService.leaveSession(this.session.id, currentPlayer.id).subscribe(() => {
        this.router.navigate(['/']);
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  getAvatarEmoji(name: string): string {
    const emojis = ['🌟', '⚡', '🕊️', '🔥', '🛡️', '👑', '🌈', '💡', '🍇', '🌿'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return emojis[hash % emojis.length];
  }
}
