
'use server';
/**
 * @fileOverview An AI flow to suggest a fictional mailing address.
 *
 * - suggestAddress - A function that suggests an address based on a query.
 * - SuggestAddressInput - The input type for the suggestAddress function.
 * - SuggestAddressOutput - The return type for the suggestAddress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SuggestAddressInputSchema = z.object({
  query: z.string().min(1).describe('The name or company name used as a basis for suggesting a fictional address. For example, "Acme Corp" or "John Doe".'),
});
export type SuggestAddressInput = z.infer<typeof SuggestAddressInputSchema>;

const SuggestAddressOutputSchema = z.object({
  name: z.string().describe('The suggested full name or company name for the address. This might be an elaborated version of the input query.'),
  street: z.string().describe("The suggested street address (e.g., '123 Fictional Way', 'Apt 4B, 789 Placeholder Dr')."),
  city: z.string().describe("The suggested city name (e.g., 'Springfield', 'Metropolis')."),
  state: z.string().length(2).describe("The suggested 2-letter US state abbreviation (e.g., 'CA', 'NY')."),
  zip: z.string().regex(/^\d{5}$/, "Must be a 5-digit ZIP code").describe("The suggested 5-digit US ZIP code (e.g., '90210', '10001')."),
});
export type SuggestAddressOutput = z.infer<typeof SuggestAddressOutputSchema>;

export async function suggestAddress(input: SuggestAddressInput): Promise<SuggestAddressOutput> {
  return suggestAddressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAddressPrompt',
  input: { schema: SuggestAddressInputSchema },
  output: { schema: SuggestAddressOutputSchema },
  prompt: `You are an address suggestion assistant.
Given the following name or company name, generate a complete, plausible, but entirely fictional United States mailing address.
The address must include:
- A full name or company name (it can be the same as the query or an elaborated version).
- A street address (e.g., "123 Fictional Ave", "Suite 4B, 789 Nonexistent Rd").
- A city name.
- A 2-letter state abbreviation (e.g., "NY", "TX").
- A 5-digit ZIP code.

Ensure the generated address components are distinct and form a coherent, realistic-looking, but non-real address. Do not use real company names or addresses.

Query: {{{query}}}
`,
});

const suggestAddressFlow = ai.defineFlow(
  {
    name: 'suggestAddressFlow',
    inputSchema: SuggestAddressInputSchema,
    outputSchema: SuggestAddressOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to get a suggestion from the AI model.");
    }
    const parsedOutput = SuggestAddressOutputSchema.safeParse(output);
    if (!parsedOutput.success) {
        console.error("AI output failed Zod validation:", parsedOutput.error.flatten());
        throw new Error("AI returned an invalid address format. " + parsedOutput.error.message);
    }
    return parsedOutput.data;
  }
);
