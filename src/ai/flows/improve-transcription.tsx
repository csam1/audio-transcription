'use server';
/**
 * @fileOverview A transcription improving AI agent.
 *
 * - improveTranscription - A function that handles the transcription improving process.
 * - ImproveTranscriptionInput - The input type for the improveTranscription function.
 * - ImproveTranscriptionOutput - The return type for the improveTranscription function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ImproveTranscriptionInputSchema = z.object({
  audioUrl: z.string().describe('The URL of the audio recording.'),
  initialTranscription: z.string().describe('The initial transcription of the audio.'),
});
export type ImproveTranscriptionInput = z.infer<typeof ImproveTranscriptionInputSchema>;

const ImproveTranscriptionOutputSchema = z.object({
  improvedTranscription: z.string().describe('The refined and corrected transcription.'),
});
export type ImproveTranscriptionOutput = z.infer<typeof ImproveTranscriptionOutputSchema>;

export async function improveTranscription(input: ImproveTranscriptionInput): Promise<ImproveTranscriptionOutput> {
  return improveTranscriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveTranscriptionPrompt',
  input: {
    schema: z.object({
      audioUrl: z.string().describe('The URL of the audio recording.'),
      initialTranscription: z.string().describe('The initial transcription of the audio.'),
    }),
  },
  output: {
    schema: z.object({
      improvedTranscription: z.string().describe('The refined and corrected transcription.'),
    }),
  },
  prompt: `{{prompt}}`,
});

const improveTranscriptionFlow = ai.defineFlow<
  typeof ImproveTranscriptionInputSchema,
  typeof ImproveTranscriptionOutputSchema
>(
  {
    name: 'improveTranscriptionFlow',
    inputSchema: ImproveTranscriptionInputSchema,
    outputSchema: ImproveTranscriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      improvedTranscription: output!.improvedTranscription,
    };
  }
);
