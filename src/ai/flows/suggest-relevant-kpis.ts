'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant KPIs based on inputted objectives.
 *
 * - suggestRelevantKPIs - A function that takes objectives as input and returns suggested KPIs.
 * - SuggestRelevantKPIsInput - The input type for the suggestRelevantKPIs function.
 * - SuggestRelevantKPIsOutput - The return type for the suggestRelevantKPIs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelevantKPIsInputSchema = z.object({
  objectives: z
    .string()
    .describe("A description of the objectives for the 2026 plan."),
});
export type SuggestRelevantKPIsInput = z.infer<typeof SuggestRelevantKPIsInputSchema>;

const SuggestRelevantKPIsOutputSchema = z.object({
  suggestedKPIs: z
    .string()
    .describe("A list of suggested KPIs relevant to the provided objectives."),
});
export type SuggestRelevantKPIsOutput = z.infer<typeof SuggestRelevantKPIsOutputSchema>;

export async function suggestRelevantKPIs(input: SuggestRelevantKPIsInput): Promise<SuggestRelevantKPIsOutput> {
  return suggestRelevantKPIsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelevantKPIsPrompt',
  input: {schema: SuggestRelevantKPIsInputSchema},
  output: {schema: SuggestRelevantKPIsOutputSchema},
  prompt: `You are an expert in defining Key Performance Indicators (KPIs). Given the following objectives for 2026, suggest a list of relevant KPIs that can be used to track progress and success.\n\nObjectives: {{{objectives}}}\n\nSuggested KPIs:`,
});

const suggestRelevantKPIsFlow = ai.defineFlow(
  {
    name: 'suggestRelevantKPIsFlow',
    inputSchema: SuggestRelevantKPIsInputSchema,
    outputSchema: SuggestRelevantKPIsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
