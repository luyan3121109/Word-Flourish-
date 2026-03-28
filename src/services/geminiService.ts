import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Word, WritingNote } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const analyzeWords = async (words: string[]): Promise<Partial<Word>[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following English words for a Chinese native speaker (vocabulary level 3000-4000). 
    Provide:
    1. IPA pronunciation.
    2. Chinese meaning.
    3. Detailed usage notes (使用方法).
    4. An example sentence.
    5. Chinese translation of the example sentence (例句翻译).
    6. Detailed etymology and root/prefix/suffix analysis (词源、词根、词缀解释).
    7. Difficulty level.
    Words: ${words.join(", ")}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            pronunciation: { type: Type.STRING },
            meaning: { type: Type.STRING },
            usage: { type: Type.STRING },
            example: { type: Type.STRING },
            exampleTranslation: { type: Type.STRING },
            etymology: { type: Type.STRING },
            level: { type: Type.STRING }
          },
          required: ["text", "pronunciation", "meaning", "usage", "example", "exampleTranslation", "etymology", "level"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateStoryAndPodcast = async (words: Word[]): Promise<{ story: string; storyTranslation: string; podcastScript: string; podcastTheme: string }> => {
  const wordList = words.map(w => w.text).join(", ");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a short story and a podcast script using these words: ${wordList}.
    1. The story should be engaging and help remember the words in context.
    2. Provide a Chinese translation for the story (storyTranslation).
    3. The podcast script should be a dialogue between two people discussing a theme related to these words, suitable for listening practice.
    4. IMPORTANT: In the podcast script, each speaker's turn MUST be in a separate paragraph (separated by double newlines). Do NOT merge all dialogue into a single line.
    5. Provide a short, catchy theme/title for the podcast (podcastTheme).
    Output in JSON format with 'story', 'storyTranslation', 'podcastScript', and 'podcastTheme' fields.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          story: { type: Type.STRING },
          storyTranslation: { type: Type.STRING },
          podcastScript: { type: Type.STRING },
          podcastTheme: { type: Type.STRING }
        },
        required: ["story", "storyTranslation", "podcastScript", "podcastTheme"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateReviewPodcast = async (words: string[]): Promise<{ podcastScript: string; podcastTheme: string }> => {
  const wordList = words.join(", ");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a short, engaging podcast script (dialogue) that incorporates these recently reviewed words: ${wordList}. 
    The theme should be related to the words. The script should be suitable for listening practice for a Chinese native speaker.
    IMPORTANT: In the podcast script, each speaker's turn MUST be in a separate paragraph (separated by double newlines). Do NOT merge all dialogue into a single line.
    Provide a short, catchy theme/title for the podcast (podcastTheme).
    Output in JSON format with 'podcastScript' and 'podcastTheme' fields.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          podcastScript: { type: Type.STRING },
          podcastTheme: { type: Type.STRING }
        },
        required: ["podcastScript", "podcastTheme"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generatePodcastAudio = async (script: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `TTS the following podcast script: ${script}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Failed to generate audio");
  return base64Audio;
};

export const evaluateSentence = async (word: string, sentence: string): Promise<{ feedback: string; optimizedSentence: string }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Evaluate this sentence using the word '${word}': "${sentence}".
    Is it grammatically correct and idiomatic? Provide feedback in Chinese and an optimized version of the sentence.
    Output in JSON format with 'feedback' and 'optimizedSentence' fields.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING },
          optimizedSentence: { type: Type.STRING }
        },
        required: ["feedback", "optimizedSentence"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const evaluateWriting = async (words: string[], content: string, prompt: string): Promise<{ feedback: string; optimizedContent: string }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Evaluate this short essay based on the prompt: "${prompt}". 
    The essay should use these words: ${words.join(", ")}.
    Content: "${content}".
    Provide feedback on grammar, vocabulary usage, and idiomatic expression in Chinese. Provide an optimized version.
    Output in JSON format with 'feedback' and 'optimizedContent' fields.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: { type: Type.STRING },
          optimizedContent: { type: Type.STRING }
        },
        required: ["feedback", "optimizedContent"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateClozeTests = async (words: Word[]): Promise<{ question: string; options: string[]; answer: string; explanation: string }[]> => {
  const wordList = words.map(w => w.text).join(", ");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 5 cloze test questions (fill-in-the-blanks) based on these words: ${wordList}.
    Each question should have a context sentence and 4 options.
    IMPORTANT: The 3 incorrect options (distractors) should be challenging and potentially confusing for a learner. 
    They should be words that are often confused with the correct answer, have similar meanings in certain contexts, or are common pitfalls.
    Avoid obvious wrong answers that can be easily eliminated.
    Provide a brief explanation in Chinese for why the answer is correct and why other options might be confusing.
    Output in JSON format as an array of objects with 'question', 'options', 'answer', and 'explanation' fields.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "answer", "explanation"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateMistakeAnalysis = async (mistakes: { question: string; answer: string; userAnswer: string }[]): Promise<string> => {
  const mistakesText = mistakes.map(m => `Question: ${m.question}\nCorrect Answer: ${m.answer}\nUser Answer: ${m.userAnswer}`).join("\n\n---\n\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user has made the following 10 mistakes in English cloze tests. 
    Analyze these mistakes in Chinese to identify patterns in their weaknesses (e.g., confusing similar words, misunderstanding context, grammar issues).
    Provide specific advice on how to improve their mastery of these words and concepts.
    
    Use Markdown for formatting.
    
    Mistakes:
    ${mistakesText}`,
  });
  return response.text;
};

export const generateWritingReport = async (notes: WritingNote[]): Promise<string> => {
  const notesText = notes.map(n => `Prompt: ${n.prompt}\nContent: ${n.content}\nFeedback: ${n.feedback}`).join("\n\n---\n\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following writing practice notes from the past two weeks, generate a "Writing Proficiency Report" in Chinese.
    The report should include:
    1. 表达能力进步情况 (Progress in expression ability)
    2. 表达弱项 (Weaknesses in expression)
    3. 典范例句 (Exemplary sentences from the optimized versions)
    4. 提高表达能力的建议 (Suggestions for improvement)
    
    Use Markdown for formatting. Be encouraging but professional.
    
    Notes:
    ${notesText}`,
  });
  return response.text;
};

export const generateSentencePrompt = async (word: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a short, clear sentence prompt in Chinese that requires the use of the English word '${word}'. 
    The prompt should be specific and contextual. 
    Example for 'reflect': '这份设计大纲清晰地反映了功能需求。'
    Only return the Chinese sentence.`,
  });
  return response.text.trim();
};

export const generateWritingPrompt = async (words: string[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate an engaging writing prompt or topic in Chinese that would naturally incorporate these English words: ${words.join(", ")}.
    The prompt should be a short paragraph or a few sentences describing a scenario or a question.
    Only return the Chinese prompt.`,
  });
  return response.text.trim();
};

export const generateWordAnalysis = async (words: Word[]): Promise<{ title: string; words: string[]; explanation: string }[]> => {
  const wordList = words.map(w => `${w.text}: ${w.meaning}`).join("\n");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze the following list of English words learned by a student. 
    Identify and group words that have HIGHLY related meanings (synonyms), are direct opposites (antonyms), or share very similar usage contexts.
    
    CRITICAL: Only group words if they have a strong, clear connection. Do NOT force connections between words that are only vaguely related. If a word doesn't have a strong match, exclude it from the analysis.
    
    Provide clear, professional explanations and distinctions (辨析) in Chinese for each group.
    
    Output in JSON format as an array of objects with 'title' (e.g., "Synonyms for 'Happy'"), 'words' (array of strings), and 'explanation' (string, Markdown allowed).
    
    Words:
    ${wordList}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            words: { type: Type.ARRAY, items: { type: Type.STRING } },
            explanation: { type: Type.STRING }
          },
          required: ["title", "words", "explanation"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const generateStatsEvaluation = async (stats: { masteredCount: number; learningCount: number; streak: number; expressionLevel: string; totalNotes: number }): Promise<{ evaluation: string; capabilities: string; weaknesses: string; encouragement: string }> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the following English learning statistics for a student, provide a professional and encouraging evaluation in Chinese.
    Statistics:
    - Mastered Words: ${stats.masteredCount}
    - Currently Learning: ${stats.learningCount}
    - Learning Streak: ${stats.streak} days
    - Expression Skill Level: ${stats.expressionLevel}
    - Total Practice Notes (Sentences/Essays): ${stats.totalNotes}

    The evaluation should include:
    1. A general assessment of their current level (evaluation).
    2. Specific examples of what they CAN do (capabilities) - e.g., "You can read simple children's books but might struggle with news."
    3. Areas for improvement (weaknesses).
    4. A highly encouraging sentence to keep them going (encouragement). Provide BOTH Chinese and English versions in this field (e.g., "Keep going! / 继续加油！"). Do NOT include any quotation marks in the response.

    Output in JSON format with 'evaluation', 'capabilities', 'weaknesses', and 'encouragement' fields.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          evaluation: { type: Type.STRING },
          capabilities: { type: Type.STRING },
          weaknesses: { type: Type.STRING },
          encouragement: { type: Type.STRING }
        },
        required: ["evaluation", "capabilities", "weaknesses", "encouragement"]
      }
    }
  });

  return JSON.parse(response.text);
};
