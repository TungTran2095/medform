'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing content from plan responses.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContentInputSchema = z.object({
  content: z.string().describe('The content to be summarized.'),
  contentType: z.string().describe('The type of content (e.g., SWOT, BSC, Action Plans, etc.).'),
});

export type SummarizeContentInput = z.infer<typeof SummarizeContentInputSchema>;

const SummarizeContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the content.'),
});

export type SummarizeContentOutput = z.infer<typeof SummarizeContentOutputSchema>;

export async function summarizeContent(
  input: SummarizeContentInput
): Promise<SummarizeContentOutput> {
  return summarizeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {schema: SummarizeContentInputSchema},
  output: {schema: SummarizeContentOutputSchema},
  prompt: `Bạn là một chuyên gia phân tích và tóm tắt nội dung. Hãy tóm tắt nội dung sau đây một cách ngắn gọn, súc tích và dễ hiểu.

Loại nội dung: {{{contentType}}}

Nội dung:
{{{content}}}

Tóm tắt (bằng tiếng Việt, tối đa 200 từ):`,
});

const summarizeContentFlow = ai.defineFlow(
  {
    name: 'summarizeContentFlow',
    inputSchema: SummarizeContentInputSchema,
    outputSchema: SummarizeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);


