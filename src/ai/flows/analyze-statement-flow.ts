
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

const prompt = ai.definePrompt({
  name: 'analyzeStatementPrompt',
  input: { schema: AnalyzeStatementInputSchema },
  output: { schema: AnalyzeStatementOutputSchema },
  prompt: `You are an expert financial document analyzer.
Given the content of a financial statement, conceptually represented by the fileDataUri, and a list of existing debt accounts, your task is to:
1. Identify which debt account the statement most likely belongs to from the 'existingDebtAccounts' list. Use the file name as a strong hint.
2. Extract the statement date (period end date) from the document. If multiple dates are present, prefer the latest one that seems to be a statement period end date.

File name (for context): {{{fileName}}}
Known Debt Accounts:
{{#each existingDebtAccounts}}
- ID: {{id}}, Name: {{name}}
{{/each}}

Focus on analyzing the file name and any conceptual text patterns (you won't actually see the image/PDF content for this prompt, but reason based on typical statement structures).
Provide your best suggestion for the debt account ID and the statement date in YYYY-MM-DD format.

Provide a snippet of text that seems relevant for your decision (e.g., "Statement for account ending in 1234").
Provide a confidence score between 0 and 1 for your suggestions.

Example based on a document named "Mortgage_Statement_Jan2024.pdf" and an account "Commercial Mortgage - Main St":
{
  "suggestedDebtId": "debt_account_id_of_Commercial_Mortgage_Main_St",
  "suggestedStatementDate": "2024-01-31",
  "ocrTextSnippet": "Extracted from filename: Mortgage_Statement_Jan2024.pdf",
  "confidence": 0.85
}

If you cannot determine the debt or date, return null for those fields.
The document content is provided via a data URI: {{media url=fileDataUri}}
However, for this task, you will prioritize textual analysis from the file name and any metadata, rather than direct image/PDF content processing.
If the fileDataUri is a plain text file, you can use its content.
If the file name contains 'mortgage', try to associate it with a mortgage-like account.
If it contains 'credit' or 'card', try to associate it with a credit card account.
If it contains a month and year, use that to infer the statement date (assume end of month).
`,
});

const analyzeStatementFlow = ai.defineFlow(
  {
    name: 'analyzeStatementFlow',
    inputSchema: AnalyzeStatementInputSchema,
    outputSchema: AnalyzeStatementOutputSchema,
  },
  async (input) => {
    console.log("AI Flow: Analyzing statement - ", input.fileName);
    const { output } = await prompt(input); // Calling actual LLM

    if (!output) {
      console.error("AI flow did not return an output for:", input.fileName);
      // Fallback to a generic safe response or throw error
      return {
        suggestedDebtId: null,
        suggestedStatementDate: null,
        ocrTextSnippet: "AI model did not return an output.",
        confidence: 0.1
      };
    }
    
    // Ensure the output matches the schema.
    const parsedOutput = AnalyzeStatementOutputSchema.safeParse(output);
    if (!parsedOutput.success) {
      console.error("AI flow output failed Zod validation:", parsedOutput.error.flatten());
      // Fallback to a generic safe response or throw error
      return {
        suggestedDebtId: null,
        suggestedStatementDate: null,
        ocrTextSnippet: "AI returned data in an unexpected format.",
        confidence: 0.1
      };
    }

    return parsedOutput.data;
  }
);

