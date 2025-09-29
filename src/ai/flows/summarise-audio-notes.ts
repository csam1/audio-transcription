'use server';

/**
 * @fileOverview Summarizes audio notes using a Genkit flow.
 *
 * - summarizeAudioNote - A function that summarizes an audio note.
 * - SummarizeAudioNoteInput - The input type for the summarizeAudioNote function.
 * - SummarizeAudioNoteOutput - The return type for the summarizeAudioNote function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SummarizeAudioNoteInputSchema = z.object({
  transcript: z.string().describe('The transcript of the audio note.'),
});
export type SummarizeAudioNoteInput = z.infer<typeof SummarizeAudioNoteInputSchema>;

const SummarizeAudioNoteOutputSchema = z.object({
  summary: z.string().describe('The summary of the audio note.'),
});
export type SummarizeAudioNoteOutput = z.infer<typeof SummarizeAudioNoteOutputSchema>;

export async function summarizeAudioNote(input: SummarizeAudioNoteInput): Promise<SummarizeAudioNoteOutput> {
  return summarizeAudioNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeAudioNotePrompt',
  input: {
    schema: z.object({
      transcript: z.string().describe('The transcript of the audio note.'),
    }),
  },
  output: {
    schema: z.object({
      summary: z.string().describe('The summary of the audio note.'),
    }),
  },
  prompt: `{{prompt}}`,
});

const summarizeAudioNoteFlow = ai.defineFlow<
  typeof SummarizeAudioNoteInputSchema,
  typeof SummarizeAudioNoteOutputSchema
>(
  {
    name: 'summarizeAudioNoteFlow',
    inputSchema: SummarizeAudioNoteInputSchema,
    outputSchema: SummarizeAudioNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
