import { Word, LearningSession, SentenceNote, WritingNote } from '../types';
import { addMinutes, addHours, addDays } from 'date-fns';

const STORAGE_KEYS = {
  WORDS: 'wordbuddy_words',
  SESSIONS: 'wordbuddy_sessions',
  SENTENCE_NOTES: 'wordbuddy_sentence_notes',
  WRITING_NOTES: 'wordbuddy_writing_notes',
};

const getLocal = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveLocal = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const wordService = {
  async addWords(words: Partial<Word>[]) {
    const existing = getLocal<Word>(STORAGE_KEYS.WORDS);
    const newWords: Word[] = words.map(word => ({
      id: Math.random().toString(36).substr(2, 9),
      ...word,
      status: 'new',
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date(Date.now() - 60000).toISOString(), // 1 minute ago to ensure immediate review
      createdAt: new Date().toISOString(),
    } as Word));
    saveLocal(STORAGE_KEYS.WORDS, [...newWords, ...existing]);
    return newWords;
  },

  async getWordsToReview() {
    const words = getLocal<Word>(STORAGE_KEYS.WORDS);
    const now = new Date();
    return words.filter(w => {
      if (!w.nextReviewDate) return true;
      return new Date(w.nextReviewDate) <= now;
    });
  },

  async updateWordReview(wordId: string, quality: number) {
    const words = getLocal<Word>(STORAGE_KEYS.WORDS);
    const index = words.findIndex(w => w.id === wordId);
    if (index === -1) return;

    const word = words[index];
    let { interval, repetition, easeFactor } = word;
    let nextReviewDate: Date;

    // Dynamic SRS Logic based on Quality (1, 3, 5)
    if (quality === 5) {
      // Perfect response: Accelerate progress
      if (repetition === 0) {
        interval = 30; // Skip 5m, go to 30m
        nextReviewDate = addMinutes(new Date(), 30);
        repetition = 2;
      } else if (repetition === 1) {
        interval = 720; // Skip 30m, go to 12h
        nextReviewDate = addMinutes(new Date(), 720);
        repetition = 3;
      } else {
        interval = Math.round(interval * easeFactor * 1.2);
        nextReviewDate = addDays(new Date(), interval);
        repetition += 1;
      }
    } else if (quality === 3) {
      // Hesitant response: Normal or slower progress
      if (repetition === 0) {
        interval = 5;
        nextReviewDate = addMinutes(new Date(), 5);
      } else if (repetition === 1) {
        interval = 30;
        nextReviewDate = addMinutes(new Date(), 30);
      } else {
        interval = Math.round(interval * easeFactor * 0.8);
        if (interval < 1) interval = 1;
        nextReviewDate = addDays(new Date(), interval);
      }
      repetition += 1;
    } else {
      // Failed (quality 1): Reset to immediate review cycle
      repetition = 0;
      interval = 5;
      nextReviewDate = addMinutes(new Date(), 5);
    }

    // Update Ease Factor
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    words[index] = {
      ...word,
      interval,
      repetition,
      easeFactor,
      nextReviewDate: nextReviewDate.toISOString(),
      status: quality >= 4 ? 'mastered' : 'learning'
    };
    saveLocal(STORAGE_KEYS.WORDS, words);
  },

  async getAllWords() {
    return getLocal<Word>(STORAGE_KEYS.WORDS);
  },

  async deleteWord(wordId: string) {
    const words = getLocal<Word>(STORAGE_KEYS.WORDS);
    const filtered = words.filter(w => w.id !== wordId);
    saveLocal(STORAGE_KEYS.WORDS, filtered);
  }
};

export const sessionService = {
  async saveSession(session: Partial<LearningSession>) {
    const sessions = getLocal<LearningSession>(STORAGE_KEYS.SESSIONS);
    const newSession = {
      id: Math.random().toString(36).substr(2, 9),
      ...session
    } as LearningSession;
    saveLocal(STORAGE_KEYS.SESSIONS, [newSession, ...sessions]);
    return newSession;
  },

  async getLatestSession() {
    const sessions = getLocal<LearningSession>(STORAGE_KEYS.SESSIONS);
    return sessions[0] || null;
  },

  async getAllSessions() {
    return getLocal<LearningSession>(STORAGE_KEYS.SESSIONS);
  }
};

export const noteService = {
  async saveSentenceNote(note: Partial<SentenceNote>) {
    const notes = getLocal<SentenceNote>(STORAGE_KEYS.SENTENCE_NOTES);
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      ...note,
      createdAt: new Date().toISOString()
    } as SentenceNote;
    saveLocal(STORAGE_KEYS.SENTENCE_NOTES, [newNote, ...notes]);
  },

  async saveWritingNote(note: Partial<WritingNote>) {
    const notes = getLocal<WritingNote>(STORAGE_KEYS.WRITING_NOTES);
    const newNote = {
      id: Math.random().toString(36).substr(2, 9),
      ...note,
      createdAt: new Date().toISOString()
    } as WritingNote;
    saveLocal(STORAGE_KEYS.WRITING_NOTES, [newNote, ...notes]);
  },

  async getSentenceNotes() {
    return getLocal<SentenceNote>(STORAGE_KEYS.SENTENCE_NOTES);
  },

  async getWritingNotes() {
    return getLocal<WritingNote>(STORAGE_KEYS.WRITING_NOTES);
  }
};
