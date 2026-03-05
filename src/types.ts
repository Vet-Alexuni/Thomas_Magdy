export type StageType = 'eden' | 'ark' | 'babel' | 'abraham' | 'joseph';

export interface Question {
  id: string;
  stage: StageType;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  verse: string;
  image?: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  keys: StageType[];
}

export interface GameSettings {
  timerDuration: number;
}

export interface AnswerHistory {
  teamId: string;
  stage: StageType;
  questionId: string;
  questionText: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export type GameState = 'setup' | 'playing' | 'admin' | 'results';
