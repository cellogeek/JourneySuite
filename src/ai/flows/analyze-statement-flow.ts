
'use server';
/**
 * @fileOverview An AI flow to analyze a financial statement and suggest
 *               debt account association and statement date.
 *
 * - analyzeStatement - Analyzes a statement file (data URI) and returns suggestions.
 * - AnalyzeStatementInput - Input type for the analyzeStatement function.
 * - AnalyzeStatementOutput - Return type for the analyzeStatement function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define a simple schema for what a debt account might look like for the AI
const DebtAccountInfoSchema = z.object({
  id: z.string().describe('The unique identifier of the debt account.'),
  name: z.string().describe('The name of the debt account (e.g., "Commercial Mortgage - Main St", "Company Credit Card").'),
  // Potentially add other distinguishing features like partial account numbers if available
});

const AnalyzeStatementInputSchema = z.object({
  fileDataUri: z
    .string()
    .describe(
      "The content of the financial statement file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  fileName: z.string().optional().describe('The original name of the file, if available.'),
  existingDebtAccounts: z.array(DebtAccountInfoSchema).describe('A list of known debt accounts to help with association.'),
});
export type AnalyzeStatementInput = z.infer<typeof AnalyzeStatementInputSchema>;

const AnalyzeStatementOutputSchema = z.object({
  suggestedDebtId: z.string().nullable().describe('The ID of the debt account the AI suggests this statement belongs to, or null if no suggestion.'),
  suggestedStatementDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "If a date is provided, it must be in YYYY-MM-DD format.")
    .nullable()
    .describe('The statement date (YYYY-MM-DD) extracted by the AI, or null if not found.'),
  ocrTextSnippet: z.string().optional().describe('A short snippet of OCR-extracted text, for context or debugging.'),
  confidence: z.number().min(0).max(1).optional().describe('A confidence score (0-1) for the suggestions.'),
});
export type AnalyzeStatementOutput = z.infer<typeof AnalyzeStatementOutputSchema>;

export async function analyzeStatement(input: AnalyzeStatementInput): Promise<AnalyzeStatementOutput> {
  return analyzeStatementFlow(input);
}

// This is a STUBBED prompt. A real implementation would involve more complex OCR and analysis.
const prompt = ai.definePrompt({
  name: 'analyzeStatementPrompt',
  input: { schema: AnalyzeStatementInputSchema },
  output: { schema: AnalyzeStatementOutputSchema },
  prompt: `You are an expert financial document analyzer.
Given the content of a financial statement (conceptually, from the fileDataUri, though you will not actually process the URI in this stub) and a list of existing debt accounts, your task is to:
1. Identify which debt account the statement most likely belongs to from the 'existingDebtAccounts' list.
2. Extract the statement date (period end date) from the document.

File name (for context): {{{fileName}}}
Known Debt Accounts:
{{#each existingDebtAccounts}}
- ID: {{id}}, Name: {{name}}
{{/each}}

Based on the (conceptual) content of the document, provide your best suggestion for the debt account ID and the statement date in YYYY-MM-DD format.

Provide a snippet of text that seems relevant for your decision.
Provide a confidence score between 0 and 1.

Example (for a different document):
Statement for: "Commercial Mortgage - Main St", Account ending in 1234
Statement Period: Jan 1, 2024 - Jan 31, 2024

Expected output format:
{
  "suggestedDebtId": "debt_account_id_here",
  "suggestedStatementDate": "YYYY-MM-DD",
  "ocrTextSnippet": "Relevant text snippet here...",
  "confidence": 0.85
}

If you cannot determine the debt or date, return null for those fields.
For this STUB, you will return a plausible but DUMMY suggestion.
Do not attempt to process fileDataUri.
If '{{{fileName}}}' contains 'mortgage', suggest the first debt ID. If it contains 'credit card', suggest the second.
Suggest a date from last month.
`,
});

const analyzeStatementFlow = ai.defineFlow(
  {
    name: 'analyzeStatementFlow',
    inputSchema: AnalyzeStatementInputSchema,
    outputSchema: AnalyzeStatementOutputSchema,
  },
  async (input) => {
    // STUBBED LOGIC: In a real scenario, you'd send the fileDataUri to a model capable of OCR
    // or use a separate OCR step and then send the text to an LLM.
    // For now, we simulate this based on filename and known accounts.

    console.log("AI Flow STUB: Analyzing statement - ", input.fileName);
    // const { output } = await prompt(input); // Calling actual LLM is disabled for this stub

    // Dummy logic for stubbed response:
    let suggestedDebtId: string | null = null;
    let suggestedStatementDate: string | null = null;
    const snippet = "Stubbed OCR text: Account Balance $1234.56. Statement Date: near today.";
    let confidence = 0.7;

    if (input.existingDebtAccounts.length > 0) {
      if (input.fileName?.toLowerCase().includes('mortgage')) {
        suggestedDebtId = input.existingDebtAccounts[0].id;
      } else if (input.fileName?.toLowerCase().includes('credit') && input.existingDebtAccounts.length > 1) {
        suggestedDebtId = input.existingDebtAccounts[1].id;
      } else {
         // Fallback to the first account if no keywords match or only one account exists
        suggestedDebtId = input.existingDebtAccounts[0].id;
      }
    }
    
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() -1, 15); // 15th of last month
    suggestedStatementDate = lastMonth.toISOString().split('T')[0];


    const simulatedOutput: AnalyzeStatementOutput = {
      suggestedDebtId,
      suggestedStatementDate,
      ocrTextSnippet: snippet,
      confidence
    };
    
    // Ensure the output matches the schema, even for a stub.
    const parsedOutput = AnalyzeStatementOutputSchema.safeParse(simulatedOutput);
    if (!parsedOutput.success) {
      console.error("AI flow stub output failed Zod validation:", parsedOutput.error.flatten());
      // Fallback to a generic safe response or throw error
      return {
        suggestedDebtId: null,
        suggestedStatementDate: null,
        ocrTextSnippet: "Error in stubbed AI processing.",
        confidence: 0.1
      };
    }

    return parsedOutput.data;
  }
);

