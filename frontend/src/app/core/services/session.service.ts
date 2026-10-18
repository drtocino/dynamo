import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, catchError } from 'rxjs';
import { Session, CreateSessionRequest, CreateSharedScreenSessionRequest, SessionState } from '../models/session.model';
import { Player } from '../models/player.model';
import { RealtimeService } from './realtime.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private http = inject(HttpClient);
  private realtime = inject(RealtimeService);
  private apiUrl = 'http://localhost:5000/api/v1/sessions';

  // In-memory sessions storage for local resilience / demo
  private localSessions = new Map<string, Session>();

  getClientId(): string {
    let clientId = localStorage.getItem('dynamo_client_id');
    const isGuid = clientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clientId);
    if (!isGuid) {
      clientId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : this.generateGuid();
      localStorage.setItem('dynamo_client_id', clientId);
    }
    return clientId!;
  }

  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  createSession(request: CreateSessionRequest): Observable<Session> {
    const lang = request.language || localStorage.getItem('dynamo_language') || 'es';
    const payload: CreateSessionRequest = {
      ...request,
      language: lang
    };
    return this.http.post<Session>(this.apiUrl, payload).pipe(
      tap(session => this.cacheSession(session)),
      catchError(err => {
        console.warn('Backend API offline, creating local resilient session:', err);
        const fallbackSession: Session = {
          id: 'sess-' + Math.random().toString(36).substring(2, 9),
          roomCode: this.generateRoomCode(),
          gameId: request.gameId,
          gameSlug: 'trivia-pro',
          gameName: 'Bible Trivia Showdown',
          hostClientId: request.hostClientId,
          mode: request.mode,
          state: 'Lobby',
          maxPlayers: request.maxPlayers || 8,
          rounds: request.rounds || 3,
          timeLimitSeconds: request.timeLimitSeconds || 60,
          language: lang,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
          players: []
        };
        this.cacheSession(fallbackSession);
        return of(fallbackSession);
      })
    );
  }

  createSharedScreenSession(request: CreateSharedScreenSessionRequest): Observable<Session> {
    const lang = request.language || localStorage.getItem('dynamo_language') || 'es';
    const payload: CreateSharedScreenSessionRequest = {
      ...request,
      language: lang
    };
    return this.http.post<Session>(`${this.apiUrl}/shared-screen`, payload).pipe(
      tap(session => this.cacheSession(session)),
      catchError(err => {
        console.warn('Backend API offline, creating local shared-screen session:', err);
        const players: Player[] = request.playerNames.map((name, index) => ({
          id: 'ply-' + Math.random().toString(36).substring(2, 9),
          sessionId: '',
          clientId: request.hostClientId,
          name,
          orderIndex: index
        }));

        const fallbackSession: Session = {
          id: 'sess-' + Math.random().toString(36).substring(2, 9),
          roomCode: this.generateRoomCode(),
          gameId: request.gameId,
          gameSlug: 'charades-flash',
          gameName: 'Faith Charades Party',
          hostClientId: request.hostClientId,
          mode: 'SharedScreen',
          state: 'Lobby',
          maxPlayers: request.maxPlayers || 8,
          rounds: request.rounds || 3,
          timeLimitSeconds: request.timeLimitSeconds || 60,
          language: lang,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
          activePlayerId: players.length > 0 ? players[0].id : undefined,
          players
        };
        fallbackSession.players.forEach(p => p.sessionId = fallbackSession.id);
        this.cacheSession(fallbackSession);
        return of(fallbackSession);
      })
    );
  }

  getSessionById(id: string): Observable<Session | undefined> {
    return this.http.get<Session>(`${this.apiUrl}/${id}`).pipe(
      tap(session => this.cacheSession(session)),
      catchError(() => of(this.localSessions.get(id)))
    );
  }

  getSessionByCode(code: string): Observable<Session | undefined> {
    return this.http.get<Session>(`${this.apiUrl}/code/${code.toUpperCase()}`).pipe(
      tap(session => this.cacheSession(session)),
      catchError(() => {
        const found = Array.from(this.localSessions.values()).find(
          s => s.roomCode.toUpperCase() === code.trim().toUpperCase()
        );
        return of(found);
      })
    );
  }

  joinSession(sessionId: string, playerName: string): Observable<Player> {
    const clientId = this.getClientId();
    return this.http.post<Player>(`${this.apiUrl}/${sessionId}/players`, { clientId, name: playerName }).pipe(
      tap(player => {
        const session = this.localSessions.get(sessionId);
        if (session && !session.players.some(p => p.id === player.id)) {
          session.players.push(player);
        }
        this.realtime.emitPlayerJoined(player);
      }),
      catchError(() => {
        const session = this.localSessions.get(sessionId);
        const player: Player = {
          id: 'ply-' + Math.random().toString(36).substring(2, 9),
          sessionId,
          clientId,
          name: playerName.trim(),
          orderIndex: session ? session.players.length : 0
        };
        if (session) {
          session.players.push(player);
          if (!session.activePlayerId) {
            session.activePlayerId = player.id;
          }
        }
        this.realtime.emitPlayerJoined(player);
        return of(player);
      })
    );
  }

  leaveSession(sessionId: string, playerId: string): Observable<Session | undefined> {
    const clientId = this.getClientId();
    return this.http.delete<Session>(`${this.apiUrl}/${sessionId}/players/${playerId}?clientId=${clientId}`).pipe(
      tap(session => {
        this.cacheSession(session);
        this.realtime.emitPlayerLeft({ playerId, newHostClientId: session.hostClientId });
      }),
      catchError(() => {
        const session = this.localSessions.get(sessionId);
        if (session) {
          session.players = session.players.filter(p => p.id !== playerId);
          if (session.hostClientId === clientId && session.players.length > 0) {
            session.hostClientId = session.players[0].clientId;
          }
          this.realtime.emitPlayerLeft({ playerId, newHostClientId: session.hostClientId });
        }
        return of(session);
      })
    );
  }

  changeState(sessionId: string, state: SessionState): Observable<Session | undefined> {
    return this.http.put<Session>(`${this.apiUrl}/${sessionId}/state`, { state }).pipe(
      tap(session => {
        this.cacheSession(session);
        this.realtime.emitStateChanged(state);
      }),
      catchError(() => {
        const session = this.localSessions.get(sessionId);
        if (session) {
          session.state = state;
          this.realtime.emitStateChanged(state);
        }
        return of(session);
      })
    );
  }

  advanceTurn(sessionId: string): Observable<Session | undefined> {
    return this.http.post<Session>(`${this.apiUrl}/${sessionId}/turn/advance`, {}).pipe(
      tap(session => {
        this.cacheSession(session);
        if (session.activePlayerId) {
          this.realtime.emitTurnAdvanced(session.activePlayerId);
        }
      }),
      catchError(() => {
        const session = this.localSessions.get(sessionId);
        if (session && session.players.length > 0) {
          const currentIndex = session.players.findIndex(p => p.id === session.activePlayerId);
          const nextIndex = (currentIndex + 1) % session.players.length;
          session.activePlayerId = session.players[nextIndex].id;
          this.realtime.emitTurnAdvanced(session.activePlayerId);
        }
        return of(session);
      })
    );
  }

  private cacheSession(session: Session): void {
    this.localSessions.set(session.id, session);
  }

  private generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
