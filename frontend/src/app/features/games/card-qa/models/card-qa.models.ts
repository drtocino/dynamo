/**
 * Domain Models & Types for Card Question & Answer Game
 */

export type CardQuestionType = 'true-false' | 'option-selection' | 'open-question' | 'wildcard';
export type CardState = 'faced-down' | 'expanded-question' | 'expanded-answer' | 'disabled';
export type CardColor = 'red' | 'blue' | 'yellow';

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
  color: CardColor;      // 'red' | 'blue' | 'yellow'
  columnIndex: number;   // 0 to 4
  rowIndex: number;      // 0 to 5
  isBottomPeek?: boolean; // True for cards on bottom rows that are not fully visible
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
  points: number;        // 3 if correct, 0 if incorrect
  timestamp: number;     // Evaluation timestamp
}

export interface PlayerRound {
  playerName: string;
  questionQuota: number;       // 1 pick per turn
  currentCount: number;        // 0..1
  isCompleted: boolean;
}

export interface PlayerSummary {
  playerName: string;
  totalPoints: number;         // 3 points per correct answer
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
