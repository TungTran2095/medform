'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest a prioritized list of 5-7 key initiatives for 2026 based on a unit's SWOT analysis.
 *
 * - prioritize2026Initiatives - A function that triggers the AI-powered initiative prioritization process.
 * - Prioritize2026InitiativesInput - The input type for the prioritize2026Initiatives function.
 * - Prioritize2026InitiativesOutput - The return type for the prioritize2026Initiatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const Prioritize2026InitiativesInputSchema = z.object({
  strengths: z.string().describe('Strengths identified in the SWOT analysis.'),
  weaknesses: z.string().describe('Weaknesses identified in the SWOT analysis.'),
  opportunities: z.string().describe('Opportunities identified in the SWOT analysis.'),
  threats: z.string().describe('Threats identified in the SWOT analysis.'),
});
export type Prioritize2026InitiativesInput = z.infer<typeof Prioritize2026InitiativesInputSchema>;

const Prioritize2026InitiativesOutputSchema = z.object({
  prioritizedInitiatives: z
    .array(z.string())
    .describe('A prioritized list of 5-7 key initiatives for 2026.'),
  reasoning: z.string().describe('The reasoning behind the prioritization.'),
});
export type Prioritize2026InitiativesOutput = z.infer<typeof Prioritize2026InitiativesOutputSchema>;

export async function prioritize2026Initiatives(
  input: Prioritize2026InitiativesInput
): Promise<Prioritize2026InitiativesOutput> {
  return prioritize2026InitiativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritize2026InitiativesPrompt',
  input: {schema: Prioritize2026InitiativesInputSchema},
  output: {schema: Prioritize2026InitiativesOutputSchema},
  prompt: `You are a strategic planning expert assisting a unit leader in identifying key initiatives for 2026.

  Based on the SWOT analysis provided, suggest a prioritized list of 5-7 key initiatives for 2026, along with a clear explanation of the reasoning behind your choices.

  Strengths: {{{strengths}}}
  Weaknesses: {{{weaknesses}}}
  Opportunities: {{{opportunities}}}
  Threats: {{{threats}}}

  Prioritized Initiatives (5-7 items):
  Reasoning: `,
});

const prioritize2026InitiativesFlow = ai.defineFlow(
  {
    name: 'prioritize2026InitiativesFlow',
    inputSchema: Prioritize2026InitiativesInputSchema,
    outputSchema: Prioritize2026InitiativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
