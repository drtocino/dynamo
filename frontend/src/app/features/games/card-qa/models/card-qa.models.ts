/**
 * Domain Models & Types for Card Question & Answer Game
 */

export type CardQuestionType = 'true-false' | 'option-selection' | 'open-question';
export type CardState = 'faced-down' | 'expanded-question' | 'expanded-answer' | 'disabled';

export interface CardQuestion {
  id: string;
  text: string;
  type: CardQuestionType;
  options?: string[]; // Candidate options for 'option-selection'
  answer: string;     // Correct answer or proposed reference answer
  language: 'es' | 'en';
  source: 'database' | 'custom';
}

export interface BoardCard {
  index: number;         // 0-based index
  number: number;        // 1-based display number (1..N)
  state: CardState;      // Current interaction state
  question: CardQuestion; // Assigned question
}

export interface QuestionResult {
  id: string;            // Unique UUID for result record
  playerName: string;    // Name of active player at evaluation
  cardNumber: number;    // Board card number (1..N)
  questionId: string;    // Id of question answered
  questionText: string;  // Question prompt
  questionType: CardQuestionType;
  answerText: string;    // Answer displayed
  isCorrect: boolean;    // Host evaluation (toggleable in Results Modal)
  timestamp: number;     // Evaluation timestamp
}

export interface PlayerRound {
  playerName: string;
  questionQuota: number;       // Default 5 (configurable)
  currentCount: number;        // Questions answered in current turn (0..quota)
  isCompleted: boolean;        // True when currentCount === questionQuota
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
  totalCardCount: number;       // Default 20 (e.g. 12, 16, 20, 24)
  questionsPerTurn: number;     // Default 5 (e.g. 3, 5, 10)
  questionSource: 'database' | 'custom';
  language: 'es' | 'en';
}

export interface CustomQuestionPackExport {
  version: '1.0';
  exportedAt: string;          // ISO Date string
  title: string;               // Pack title
  language: 'es' | 'en';
  questions: Array<{
    id: string;
    text: string;
    type: CardQuestionType;
    options?: string[];
    answer: string;
    language: 'es' | 'en';
  }>;
}
