'use server';

/**
 * @fileOverview A flow for analyzing the creativity of a note's content.
 *
 * - analyzeNoteCreativity - A function that analyzes the creativity of a note.
 * - AnalyzeNoteCreativityInput - The input type for the analyzeNoteCreativity function.
 * - AnalyzeNoteCreativityOutput - The return type for the analyzeNoteCreativity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeNoteCreativityInputSchema = z.object({
  noteContent: z
    .string()
    .describe('The content of the note to analyze for creativity.'),
});
export type AnalyzeNoteCreativityInput = z.infer<
  typeof AnalyzeNoteCreativityInputSchema
>;

const AnalyzeNoteCreativityOutputSchema = z.object({
  isCreative: z
    .boolean()
    .describe(
      'Whether the note content is considered particularly creative by the AI.'
    ),
  creativityExplanation: z
    .string()
    .describe('The AI explanation for its creativity assessment.'),
});
export type AnalyzeNoteCreativityOutput = z.infer<
  typeof AnalyzeNoteCreativityOutputSchema
>;

export async function analyzeNoteCreativity(
  input: AnalyzeNoteCreativityInput
): Promise<AnalyzeNoteCreativityOutput> {
  return analyzeNoteCreativityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeNoteCreativityPrompt',
  input: {schema: AnalyzeNoteCreativityInputSchema},
  output: {schema: AnalyzeNoteCreativityOutputSchema},
  prompt: `You are an AI assistant designed to evaluate the creativity of user notes.

  Please analyze the following note content and determine if it is particularly creative.
  Provide a brief explanation for your assessment.

  Note Content: {{{noteContent}}}

  Respond with a JSON object including:
  - isCreative (boolean): true if the note is creative, false otherwise.
  - creativityExplanation (string): A short explanation of why the note is or is not creative.
  `,
});

const analyzeNoteCreativityFlow = ai.defineFlow(
  {
    name: 'analyzeNoteCreativityFlow',
    inputSchema: AnalyzeNoteCreativityInputSchema,
    outputSchema: AnalyzeNoteCreativityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
