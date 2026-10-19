import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Game } from '../models/game.model';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/v1/games';

  private fallbackGames: Game[] = [
    {
      id: '11111111-1111-1111-1111-111111111111',
      slug: 'trivia-pro',
      name: 'Bible Trivia Showdown',
      description: 'Fast-paced Christian knowledge trivia challenge for youth groups with timed rounds.',
      thumbnailUrl: 'assets/games/trivia.png',
      supportedModes: ['RoomBased', 'SharedScreen'],
      settingsSchemaJson: '{"maxPlayers": 12, "defaultRounds": 5, "defaultTime": 30}'
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      slug: 'charades-flash',
      name: 'Faith Charades Party',
      description: 'Act out stories, parables, and heroes of faith on one shared screen with live turn cycling.',
      thumbnailUrl: 'assets/games/charades.png',
      supportedModes: ['SharedScreen'],
      settingsSchemaJson: '{"maxPlayers": 20, "defaultRounds": 3, "defaultTime": 60}'
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      slug: 'scripture-duel',
      name: 'Scripture Memory Duel',
      description: 'Fill in the missing verses and test biblical memory in real-time head-to-head lobbies.',
      thumbnailUrl: 'assets/games/scripture.png',
      supportedModes: ['RoomBased'],
      settingsSchemaJson: '{"maxPlayers": 8, "defaultRounds": 4, "defaultTime": 45}'
    },
    {
      id: '44444444-4444-4444-4444-444444444444',
      slug: 'biblical-roulette',
      name: 'Biblical Roulette',
      description: 'Spin the wheel, reveal letters, and solve the hidden verse with live dynamic vowel pricing.',
      thumbnailUrl: 'assets/games/roulette.png',
      supportedModes: ['SharedScreen'],
      settingsSchemaJson: '{"maxPlayers": 6, "defaultRounds": 3, "defaultTime": 45}',
      language: 'es'
    },
    {
      id: '55555555-5555-5555-5555-555555555555',
      slug: 'card-qa',
      name: 'Card Question & Answer',
      description: 'Numbered 3D flip cards with interactive questions and answers for group trivia and evaluation.',
      thumbnailUrl: 'assets/games/card-qa.png',
      supportedModes: ['SharedScreen'],
      settingsSchemaJson: '{"maxPlayers": 10, "defaultRounds": 5, "defaultTime": 60}'
    }
  ];

  getGames(language?: string): Observable<Game[]> {
    const url = language ? `${this.apiUrl}?language=${encodeURIComponent(language)}` : this.apiUrl;
    return this.http.get<Game[]>(url).pipe(
      catchError((err) => {
        console.warn('API error fetching games, falling back to cached catalog:', err);
        return of(this.fallbackGames.filter(g => !language || !g.language || g.language.toLowerCase() === language.toLowerCase()));
      })
    );
  }

  getGameBySlug(slug: string): Observable<Game | undefined> {
    return of(this.fallbackGames.find(g => g.slug === slug));
  }
}
