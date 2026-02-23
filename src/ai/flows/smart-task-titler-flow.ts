'use server';
/**
 * @fileOverview This file implements the Smart Task Titler Genkit flow.
 *
 * - smartTaskTitler - A function that leverages AI to suggest creative and concise titles for tasks.
 * - SmartTaskTitlerInput - The input type for the smartTaskTitler function.
 * - SmartTaskTitlerOutput - The return type for the smartTaskTitler function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SmartTaskTitlerInputSchema = z.object({
  description: z
    .string()
    .describe('A short description of the task for which titles are needed.'),
});
export type SmartTaskTitlerInput = z.infer<typeof SmartTaskTitlerInputSchema>;

const SmartTaskTitlerOutputSchema = z.object({
  suggestedTitles: z
    .array(z.string())
    .describe('An array of creative and concise suggested titles for the task.'),
});
export type SmartTaskTitlerOutput = z.infer<typeof SmartTaskTitlerOutputSchema>;

export async function smartTaskTitler(
  input: SmartTaskTitlerInput
): Promise<SmartTaskTitlerOutput> {
  return smartTaskTitlerFlow(input);
}

const smartTaskTitlerPrompt = ai.definePrompt({
  name: 'smartTaskTitlerPrompt',
  input: { schema: SmartTaskTitlerInputSchema },
  output: { schema: SmartTaskTitlerOutputSchema },
  prompt: `You are a creative assistant that specializes in generating concise and engaging task titles.
Based on the following task description, suggest 3 to 5 creative and concise titles.
The titles should be short, impactful, and clearly represent the core of the task.

Task Description:
{{{description}}}

Please provide your suggestions in a JSON object with a single key 'suggestedTitles' which contains an array of strings.`,
});

const smartTaskTitlerFlow = ai.defineFlow(
  {
    name: 'smartTaskTitlerFlow',
    inputSchema: SmartTaskTitlerInputSchema,
    outputSchema: SmartTaskTitlerOutputSchema,
  },
  async (input) => {
    const { output } = await smartTaskTitlerPrompt(input);
    return output!;
  }
);
