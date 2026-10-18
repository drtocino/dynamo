/**
 * Contract Specification: CardQaService
 * Defines the public Angular Signal API surface for the Card Question & Answer Game.
 */

import { Signal } from '@angular/core';

export type CardQuestionType = 'true-false' | 'option-selection' | 'open-question';
export type CardState = 'faced-down' | 'expanded-question' | 'expanded-answer' | 'disabled';

export interface CardQuestion {
  id: string;
  text: string;
  type: CardQuestionType;
  options?: string[];
  answer: string;
  language: 'es' | 'en';
  source: 'database' | 'custom';
}

export interface BoardCard {
  index: number;
  number: number;
  state: CardState;
  question: CardQuestion;
}

export interface QuestionResult {
  id: string;
  playerName: string;
  cardNumber: number;
  questionId: string;
  questionText: string;
  questionType: CardQuestionType;
  answerText: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface PlayerRound {
  playerName: string;
  questionQuota: number;
  currentCount: number;
  isCompleted: boolean;
}

export interface PlayerSummary {
  playerName: string;
  totalAnswered: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
  results: QuestionResult[];
}

export interface GameConfiguration {
  totalCardCount: number;
  questionsPerTurn: number;
  questionSource: 'database' | 'custom';
  language: 'es' | 'en';
}

export interface ICardQaService {
  // Reactive Signals
  readonly cards: Signal<BoardCard[]>;
  readonly activeCard: Signal<BoardCard | null>;
  readonly activeRound: Signal<PlayerRound | null>;
  readonly allResults: Signal<QuestionResult[]>;
  readonly playerSummaries: Signal<PlayerSummary[]>;
  readonly config: Signal<GameConfiguration>;
  readonly isLoading: Signal<boolean>;
  readonly isOfflineMode: Signal<boolean>;

  // Game Setup & Lifecycle
  initializeMatch(): Promise<void>;
  updateConfig(config: Partial<GameConfiguration>): void;
  startPlayerRound(playerName: string): void;
  resetBoard(): void;

  // Turn Actions
  selectCard(index: number): void;
  revealAnswer(): void;
  evaluateAndClose(isCorrect: boolean): void;

  // Results & Correction
  toggleResultEvaluation(resultId: string): void;

  // Custom Questions Management (localStorage & JSON)
  getCustomQuestions(): CardQuestion[];
  saveCustomQuestion(question: Omit<CardQuestion, 'id' | 'source'>): void;
  deleteCustomQuestion(id: string): void;
  exportCustomQuestionsJson(): string;
  importCustomQuestionsJson(jsonString: string): { success: boolean; importedCount: number; error?: string };
}
