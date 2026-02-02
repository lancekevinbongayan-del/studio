'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a summary report of visitor data.
 *
 * The flow analyzes visit logs to identify the busiest hours of the day and the most common reasons for visits.
 * It exports the `generateSummaryReport` function, the `GenerateSummaryReportInput` type, and the `GenerateSummaryReportOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSummaryReportInputSchema = z.object({
  visitLogs: z.string().describe('A stringified JSON array of visit log objects, each containing timestamp and reason for visit.'),
});
export type GenerateSummaryReportInput = z.infer<typeof GenerateSummaryReportInputSchema>;

const GenerateSummaryReportOutputSchema = z.object({
  summaryReport: z.string().describe('A summary report detailing the busiest hours and most common reasons for visits.'),
});
export type GenerateSummaryReportOutput = z.infer<typeof GenerateSummaryReportOutputSchema>;

export async function generateSummaryReport(input: GenerateSummaryReportInput): Promise<GenerateSummaryReportOutput> {
  return generateSummaryReportFlow(input);
}

const generateSummaryReportPrompt = ai.definePrompt({
  name: 'generateSummaryReportPrompt',
  input: {schema: GenerateSummaryReportInputSchema},
  output: {schema: GenerateSummaryReportOutputSchema},
  prompt: `You are an AI assistant helping a college Dean understand visitor trends.

  Analyze the following visit logs to identify the busiest hours of the day and the most common reasons for visits.  Your report should be concise and easy to understand.

  Visit Logs: {{{visitLogs}}}

  Summary Report: `,
});

const generateSummaryReportFlow = ai.defineFlow(
  {
    name: 'generateSummaryReportFlow',
    inputSchema: GenerateSummaryReportInputSchema,
    outputSchema: GenerateSummaryReportOutputSchema,
  },
  async input => {
    const {output} = await generateSummaryReportPrompt(input);
    return output!;
  }
);
