export type Language = 'es' | 'en' | 'de' | 'fr' | 'it';
export interface VocabEntry {
  id: string;
  language: Language;
  word: string;
  variants?: string[];
  bridge: string;
  meaning: string;
  association: string;
  image?: string;
  category?: string;
}
export type RecallGrade = 'immediate' | 'association' | 'hint' | 'miss';
export type Direction = 'meaning-to-word' | 'word-to-meaning' | 'association-to-word-meaning';
export type Activity = 'discover' | 'review';
export interface Attempt {
  id: string;
  wordId: string;
  language: Language;
  timestamp: number;
  sessionId: string;
  direction: Direction;
  grade: RecallGrade;
  written?: boolean;
  typedCorrect?: boolean;
  repeatInSession?: boolean;
}
export interface Discovery {
  wordId: string;
  language: Language;
  timestamp: number;
}
export interface LocalState {
  version: 1;
  discoveries: Discovery[];
  attempts: Attempt[];
  favorites: string[];
}
export interface Filters {
  languages: Language[];
  favoritesOnly: boolean;
  amount: number | 'all';
  order: 'random' | 'alphabetical' | 'failed' | 'due' | 'failed-due';
  direction: Direction;
  written: boolean;
}
