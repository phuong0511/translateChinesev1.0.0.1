export interface TranslationHistoryItem {
  id: string;
  source: string;
  translation: string;
  timestamp: number;
}

export interface ContextVersion {
  id: string;
  content: string;
  timestamp: number;
  label: string;
}

export enum TranslationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface ModelConfig {
  temperature: number;
  topK: number;
  topP: number;
}