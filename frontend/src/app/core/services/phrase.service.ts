import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Phrase } from '../models/phrase.model';
import { getApiUrl } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class PhraseService {
  private http = inject(HttpClient);
  private get apiUrl(): string {
    return `${getApiUrl()}/phrases`;
  }

  private fallbackPhrases: Phrase[] = [
    {
      id: 'a1111111-1111-1111-1111-111111111111',
      text: 'PORQUE DE TAL MANERA AMO DIOS AL MUNDO',
      generalHint: 'Evangelio de Juan',
      specificHint: 'Juan 3:16 - Que ha dado a su Hijo unigénito',
      category: 'Evangelios',
      language: 'es'
    },
    {
      id: 'a2222222-2222-2222-2222-222222222222',
      text: 'TODO LO PUEDO EN CRISTO QUE ME FORTALECE',
      generalHint: 'Epístola a los Filipenses',
      specificHint: 'Filipenses 4:13 - Fortaleza en el Señor',
      category: 'Epístolas',
      language: 'es'
    },
    {
      id: 'a3333333-3333-3333-3333-333333333333',
      text: 'JEHOVA ES MI PASTOR NADA ME FALTARA',
      generalHint: 'Libro de Salmos',
      specificHint: 'Salmo 23:1 - El Señor es mi pastor',
      category: 'Salmos',
      language: 'es'
    },
    {
      id: 'a4444444-4444-4444-4444-444444444444',
      text: 'EL SENOR ES MI LUZ Y MI SALVACION DE QUIEN TEMERE',
      generalHint: 'Libro de Salmos',
      specificHint: 'Salmo 27:1 - Confianza y victoria',
      category: 'Salmos',
      language: 'es'
    },
    {
      id: 'a5555555-5555-5555-5555-555555555555',
      text: 'LAMPARA ES A MIS PIES TU PALABRA Y LUMBRERA A MI CAMINO',
      generalHint: 'Libro de Salmos',
      specificHint: 'Salmo 119:105 - La guía divina',
      category: 'Salmos',
      language: 'es'
    }
  ];

  getPhrases(language: string = 'es'): Observable<Phrase[]> {
    return this.http.get<Phrase[]>(`${this.apiUrl}?language=${encodeURIComponent(language)}`).pipe(
      catchError((err) => {
        console.warn('API error fetching phrases, using fallback phrases:', err);
        return of(this.fallbackPhrases.filter(p => !language || p.language.toLowerCase() === language.toLowerCase()));
      })
    );
  }
}
