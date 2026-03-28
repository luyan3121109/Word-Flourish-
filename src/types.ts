export interface Word {
  id?: string;
  text: string;
  pronunciation: string;
  meaning: string;
  usage: string;
  example: string;
  exampleTranslation: string;
  etymology: string;
  level: string;
  nextReviewDate: string;
  interval: number;
  repetition: number;
  easeFactor: number;
  status: 'new' | 'learning' | 'mastered';
  createdAt: string;
}

export interface LearningSession {
  id?: string;
  date: string;
  wordIds: string[];
  story: string;
  storyTranslation: string;
  podcastScript: string;
  podcastTheme?: string;
  podcastAudioUrl?: string;
}

export interface SentenceNote {
  id?: string;
  wordId: string;
  wordText: string;
  originalSentence: string;
  feedback: string;
  optimizedSentence: string;
  createdAt: string;
}

export interface WritingNote {
  id?: string;
  wordTexts: string[];
  prompt: string;
  content: string;
  feedback: string;
  optimizedContent: string;
  createdAt: string;
}

export interface ReviewQuality {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // 0: complete blackout, 5: perfect response
}
