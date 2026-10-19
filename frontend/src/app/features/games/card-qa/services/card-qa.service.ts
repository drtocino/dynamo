import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TranslationService } from '../../../../core/i18n';
import { Session } from '../../../../core/models/session.model';
import {
  BoardCard,
  CardColor,
  CardQuestion,
  CustomQuestionPackExport,
  GameConfiguration,
  PlayerRound,
  PlayerSummary,
  QuestionResult
} from '../models/card-qa.models';
import { CARD_QA_SEEDS_EN, CARD_QA_SEEDS_ES } from './card-qa-seeds';

const CUSTOM_QUESTIONS_STORAGE_KEY = 'dynamo_card_qa_custom_questions';

@Injectable({
  providedIn: 'root'
})
export class CardQaService {
  private readonly http = inject(HttpClient);
  private readonly translationService = inject(TranslationService);

  // Core State Signals
  readonly cards = signal<BoardCard[]>([]);
  readonly activeCard = signal<BoardCard | null>(null);
  readonly allResults = signal<QuestionResult[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isOfflineMode = signal<boolean>(false);

  // Session & Player Turn Tracking
  readonly currentSessionId = signal<string | null>(null);
  readonly playersRoster = signal<string[]>(['Equipo 1', 'Equipo 2', 'Equipo 3', 'Equipo 4']);
  readonly activePlayerIndex = signal<number>(0);

  readonly activePlayerName = computed<string>(() => {
    const roster = this.playersRoster();
    if (!roster.length) return 'Equipo 1';
    const idx = this.activePlayerIndex() % roster.length;
    return roster[idx];
  });

  readonly nextPlayerName = computed<string>(() => {
    const roster = this.playersRoster();
    if (roster.length <= 1) return '';
    const nextIdx = (this.activePlayerIndex() + 1) % roster.length;
    return roster[nextIdx];
  });

  // Backward compatibility round accessor for any legacy listeners
  readonly activeRound = computed<PlayerRound | null>(() => {
    return {
      playerName: this.activePlayerName(),
      questionQuota: 1,
      currentCount: 0,
      isCompleted: false
    };
  });

  readonly config = signal<GameConfiguration>({
    totalCardCount: 25, // 5 columns x 5 rows (4 fully visible rows + 1 bottom peek row)
    questionsPerTurn: 1, // 1 card pick per turn
    questionSource: 'database',
    language: 'es'
  });

  // Computed Summaries Grouped by Player
  readonly playerSummaries = computed<PlayerSummary[]>(() => {
    const results = this.allResults();
    const roster = this.playersRoster();
    const map = new Map<string, QuestionResult[]>();

    // Seed all registered players in roster
    for (const name of roster) {
      map.set(name, []);
    }

    // Populate with evaluated question records
    for (const r of results) {
      const list = map.get(r.playerName) || [];
      list.push(r);
      map.set(r.playerName, list);
    }

    const summaries: PlayerSummary[] = [];
    for (const [playerName, playerResults] of map.entries()) {
      const total = playerResults.length;
      const correct = playerResults.filter(p => p.isCorrect).length;
      const incorrect = total - correct;
      const totalPoints = playerResults.reduce((acc, r) => acc + (r.points ?? (r.isCorrect ? 3 : 0)), 0);
      const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

      summaries.push({
        playerName,
        totalPoints,
        totalAnswered: total,
        correctCount: correct,
        incorrectCount: incorrect,
        scorePercentage: percentage,
        results: playerResults
      });
    }

    return summaries.sort((a, b) => b.totalPoints - a.totalPoints || b.correctCount - a.correctCount);
  });

  readonly remainingCardsCount = computed<number>(() => {
    return this.cards().filter(c => c.state !== 'disabled').length;
  });

  constructor() {
    const currentAppLang = this.translationService.currentLang();
    this.config.update(c => ({ ...c, language: currentAppLang }));
  }

  // --- Session Synchronization & State Reset ---

  syncSession(session?: Session): void {
    if (!session) {
      if (!this.cards().length) {
        this.initializeMatch();
      }
      return;
    }

    const isNewSession = this.currentSessionId() !== session.id;

    if (isNewSession) {
      this.currentSessionId.set(session.id);
      
      // Extract registered player names from session
      const names = session.players?.map(p => p.name).filter(n => !!n?.trim()) || [];
      const defaultNames = ['Equipo 1', 'Equipo 2', 'Equipo 3', 'Equipo 4'];
      this.playersRoster.set(names.length >= 2 ? names : defaultNames);
      this.activePlayerIndex.set(0);

      // Clean all game state and regenerate brand new cards
      this.resetMatch();
    } else {
      // Same session: update roster if players changed
      const names = session.players?.map(p => p.name).filter(n => !!n?.trim()) || [];
      if (names.length && JSON.stringify(names) !== JSON.stringify(this.playersRoster())) {
        this.playersRoster.set(names);
      }
    }

    // Sync match title / name from session or localStorage
    let matchName = '';
    if (session.gameSettingsJson) {
      try {
        const parsed = JSON.parse(session.gameSettingsJson);
        if (parsed.matchName) {
          matchName = parsed.matchName;
        }
      } catch (_) {}
    }
    if (!matchName) {
      matchName = localStorage.getItem('cardQa_matchName') || '';
    }
    if (matchName && this.config().matchName !== matchName) {
      this.config.update(c => ({ ...c, matchName }));
    }
  }

  resetMatch(): void {
    this.cards.set([]);
    this.activeCard.set(null);
    this.allResults.set([]);
    this.activePlayerIndex.set(0);
    this.initializeMatch();
  }

  updateConfig(newConfig: Partial<GameConfiguration>): void {
    this.config.update(c => ({ ...c, ...newConfig }));
  }

  async initializeMatch(): Promise<void> {
    this.isLoading.set(true);
    const currentLang = this.translationService.currentLang();
    this.updateConfig({ language: currentLang });

    const seedBank = currentLang === 'es' ? CARD_QA_SEEDS_ES : CARD_QA_SEEDS_EN;
    let rawQuestions: CardQuestion[] = [];

    const customQuestions = this.getCustomQuestions().filter(q => q.language === currentLang);
    if (customQuestions.length > 0) {
      this.updateConfig({ questionSource: 'custom' });
      rawQuestions = customQuestions;
    } else {
      rawQuestions = seedBank;
    }

    // Segregate question pools by columns strictly from rawQuestions
    // Pool 1: Column 0 (Red) -> True/False (5 questions: 4 regular + 1 extra)
    const tfPool = rawQuestions.filter(q => q.type === 'true-false');
    const finalTf = tfPool.length >= 5 ? tfPool : [...tfPool, ...seedBank.filter(q => q.type === 'true-false')];

    // Pool 2: Column 1 (Red) -> Option Selection (5 questions: 4 regular + 1 extra)
    const optionsPool = rawQuestions.filter(q => q.type === 'option-selection');
    const finalOptions = optionsPool.length >= 5 ? optionsPool : [...optionsPool, ...seedBank.filter(q => q.type === 'option-selection')];
    
    // Pool 3: Columns 2 & 3 (Blue) -> Open Questions (9 questions across 2 columns)
    const bluePool = rawQuestions.filter(q => q.type === 'open-question');
    const finalBlue = bluePool.length >= 9 ? bluePool : [...bluePool, ...seedBank.filter(q => q.type === 'open-question')];

    // Pool 4: Column 4 (Yellow) -> Wildcards (4+ questions)
    const yellowPool = rawQuestions.filter(q => q.type === 'wildcard');
    const finalYellow = yellowPool.length >= 4 ? yellowPool : [...yellowPool, ...seedBank.filter(q => q.type === 'wildcard')];

    // Shuffle each pool
    const shuffledTf = [...finalTf].sort(() => Math.random() - 0.5);
    const shuffledOptions = [...finalOptions].sort(() => Math.random() - 0.5);
    const shuffledBlue = [...finalBlue].sort(() => Math.random() - 0.5);
    const shuffledYellow = [...finalYellow].sort(() => Math.random() - 0.5);

    let tfIndex = 0;
    let optionsIndex = 0;
    let blueIndex = 0;
    let yellowIndex = 0;

    const boardCards: BoardCard[] = [];
    const totalRows = 5;
    const totalCols = 5;

    for (let r = 0; r < totalRows; r++) {
      for (let c = 0; c < totalCols; c++) {
        const cardIndex = r * totalCols + c;
        const cardNumber = cardIndex + 1;
        const isBottomPeek = r === 4; // Row 4 (5th row) is the 1 bottom partially visible extra card per column (5 total)

        let question: CardQuestion;
        let color: CardColor;

        if (c === 0) {
          color = 'red';
          question = shuffledTf[tfIndex % shuffledTf.length];
          tfIndex++;
        } else if (c === 1) {
          color = 'red';
          question = shuffledOptions[optionsIndex % shuffledOptions.length];
          optionsIndex++;
        } else if (c === 2 || c === 3) {
          color = 'blue';
          question = shuffledBlue[blueIndex % shuffledBlue.length];
          blueIndex++;
        } else {
          color = 'yellow';
          question = shuffledYellow[yellowIndex % shuffledYellow.length];
          yellowIndex++;
        }

        boardCards.push({
          index: cardIndex,
          number: cardNumber,
          state: 'faced-down',
          question,
          color,
          columnIndex: c,
          rowIndex: r,
          isBottomPeek
        });
      }
    }

    this.cards.set(boardCards);
    this.activeCard.set(null);
    this.isLoading.set(false);
  }

  resetBoard(): void {
    this.cards.update(cards =>
      cards.map(c => ({
        ...c,
        state: 'faced-down'
      }))
    );
    this.activeCard.set(null);
    this.allResults.set([]);
    this.activePlayerIndex.set(0);
  }

  // --- Card Selection & Interaction ---

  selectCard(index: number): void {
    const card = this.cards()[index];
    if (!card || card.state === 'disabled' || this.activeCard()) {
      return;
    }

    const updatedCard: BoardCard = {
      ...card,
      state: 'expanded-question'
    };

    this.cards.update(list => {
      const next = [...list];
      next[index] = updatedCard;
      return next;
    });

    this.activeCard.set(updatedCard);
  }

  closeActiveCard(): void {
    const current = this.activeCard();
    if (!current) return;

    // Reset this card back to faced-down so it stays available on the board
    const resetCard: BoardCard = {
      ...current,
      state: 'faced-down'
    };

    this.cards.update(list => {
      const next = [...list];
      next[current.index] = resetCard;
      return next;
    });

    this.activeCard.set(null);
  }

  revealAnswer(): void {
    const current = this.activeCard();
    if (!current || current.state !== 'expanded-question') return;

    // Wildcards do not have an answer face; clicking awards 3 gift points immediately
    if (current.question.type === 'wildcard') {
      this.evaluateAndClose(true);
      return;
    }

    const flipped: BoardCard = {
      ...current,
      state: 'expanded-answer'
    };

    this.cards.update(list => {
      const next = [...list];
      next[current.index] = flipped;
      return next;
    });

    this.activeCard.set(flipped);
  }

  evaluateAndClose(evaluation: boolean | number): void {
    const current = this.activeCard();
    if (!current) return;

    let points: number;
    let isCorrect: boolean;

    // Wildcards always award 3 gift points
    if (current.question.type === 'wildcard') {
      points = 3;
      isCorrect = true;
    } else if (typeof evaluation === 'number') {
      points = Math.max(0, evaluation);
      isCorrect = points > 0;
    } else {
      isCorrect = evaluation;
      points = isCorrect ? 3 : 0;
    }

    const activePlayer = this.activePlayerName();

    // Record question result
    const result: QuestionResult = {
      id: crypto.randomUUID(),
      playerName: activePlayer,
      cardNumber: current.number,
      questionId: current.question.id,
      questionText: current.question.text,
      questionType: current.question.type,
      answerText: current.question.answer,
      isCorrect,
      points,
      timestamp: Date.now()
    };

    this.allResults.update(r => [...r, result]);

    // Mark card as disabled on the board
    const disabledCard: BoardCard = {
      ...current,
      state: 'disabled'
    };

    this.cards.update(list => {
      const next = [...list];
      next[current.index] = disabledCard;
      return next;
    });

    // Close modal
    this.activeCard.set(null);

    // Rule: Turn is exactly 1 pick; automatically pass turn to next player in roster
    const roster = this.playersRoster();
    if (roster.length > 0) {
      this.activePlayerIndex.update(idx => (idx + 1) % roster.length);
    }
  }

  toggleResultEvaluation(resultId: string): void {
    this.allResults.update(results =>
      results.map(r => {
        if (r.id === resultId) {
          const isCorrect = !r.isCorrect;
          return {
            ...r,
            isCorrect,
            points: isCorrect ? 3 : 0
          };
        }
        return r;
      })
    );
  }

  // --- Custom Questions Management (localStorage & JSON) ---

  getCustomQuestions(): CardQuestion[] {
    try {
      const raw = localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CardQuestion[];
    } catch {
      return [];
    }
  }

  saveCustomQuestion(questionData: Omit<CardQuestion, 'id' | 'source'>): CardQuestion {
    const questions = this.getCustomQuestions();
    const newQuestion: CardQuestion = {
      ...questionData,
      id: `custom-${crypto.randomUUID()}`,
      source: 'custom'
    };

    questions.push(newQuestion);
    localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
    return newQuestion;
  }

  deleteCustomQuestion(id: string): void {
    const questions = this.getCustomQuestions().filter(q => q.id !== id);
    localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
  }

  exportCustomQuestionsJson(): string {
    const questions = this.getCustomQuestions();
    const currentLang = this.config().language;

    const exportData: CustomQuestionPackExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      title: 'Dynamo Card Q&A Custom Questions Pack',
      language: currentLang,
      questions: questions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options,
        subPoints: q.subPoints,
        answer: q.answer,
        language: q.language
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  importCustomQuestionsJson(jsonString: string): { success: boolean; importedCount: number; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);
      const rawList = Array.isArray(parsed) 
        ? parsed 
        : (parsed?.questions && Array.isArray(parsed.questions) ? parsed.questions : null);

      if (!rawList) {
        return { success: false, importedCount: 0, error: 'Invalid JSON format: missing questions array' };
      }

      const existing = this.getCustomQuestions();
      const existingIds = new Set(existing.map(q => q.id));
      let added = 0;

      for (const q of rawList) {
        if (!q.text || !q.type) continue;
        const id = q.id && !existingIds.has(q.id) ? q.id : `custom-${crypto.randomUUID()}`;
        existing.push({
          id,
          text: q.text,
          type: q.type,
          options: q.options,
          subPoints: q.subPoints,
          answer: q.answer || '',
          language: q.language || 'es',
          source: 'custom'
        });
        existingIds.add(id);
        added++;
      }

      localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(existing));
      return { success: true, importedCount: added };
    } catch (e: any) {
      return { success: false, importedCount: 0, error: e.message || 'Parsing error' };
    }
  }

  saveCustomQuestions(questions: CardQuestion[]): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
      this.updateConfig({ questionSource: 'custom' });
    }
  }

  createShareableLink(): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const players = this.playersRoster().join(',');
    const customQuestions = this.getCustomQuestions();
    
    const params = new URLSearchParams();
    params.set('autoStart', '1');
    params.set('players', players);
    
    if (customQuestions.length > 0) {
      try {
        const jsonStr = JSON.stringify(customQuestions);
        const b64 = btoa(unescape(encodeURIComponent(jsonStr)));
        params.set('q', b64);
      } catch {
        params.set('preset', 'examen-hechos-epistolas');
      }
    } else {
      params.set('preset', 'examen-hechos-epistolas');
    }

    return `${origin}/shared-screen-setup/card-qa?${params.toString()}`;
  }
}
