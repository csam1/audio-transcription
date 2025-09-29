'use server';
/**
 * @fileOverview A flow to suggest relevant tags for an audio note based on the transcribed content.
 *
 * - suggestTags - A function that handles the tag suggestion process.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio note.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the audio note.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {
    schema: z.object({
      transcription: z.string().describe('The transcribed text from the audio note.'),
    }),
  },
  output: {
    schema: z.object({
      tags: z.array(z.string()).describe('An array of suggested tags for the audio note.'),
    }),
  },
  prompt: `{{prompt}}`,
});

const suggestTagsFlow = ai.defineFlow<
  typeof SuggestTagsInputSchema,
  typeof SuggestTagsOutputSchema
>(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
