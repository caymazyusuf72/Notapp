'use server';

import { analyzeNoteCreativity } from '@/ai/flows/analyze-note-creativity';
import type { AnalyzeNoteCreativityOutput } from '@/ai/flows/analyze-note-creativity';

export async function analyzeNote(content: string): Promise<AnalyzeNoteCreativityOutput> {
  if (!content.trim()) {
    return { isCreative: false, creativityExplanation: 'Note is empty.' };
  }
  try {
    const result = await analyzeNoteCreativity({ noteContent: content });
    return result;
  } catch (error) {
    console.error('Error analyzing note creativity:', error);
    // Return a default non-creative assessment on error
    return { isCreative: false, creativityExplanation: 'Could not analyze creativity.' };
  }
}
