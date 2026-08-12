import { n8nResponseSchema, type N8nResponse } from "../../shared/schema.js";

interface AihubmaxMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface AihubmaxChatRequest {
  model: string;
  messages: AihubmaxMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: string };
}

interface AihubmaxChatResponse {
  choices: {
    message: {
      content?: string;
    };
  }[];
}

export async function analyzeWithAihubmax(
  csvContent: string,
  _fileName: string,
  apiKey: string,
  apiBaseUrl: string,
  model: string
): Promise<N8nResponse> {
  const prompt = `You are a senior financial analyst AI specializing in small business health diagnostics and P&L anomaly detection. Analyze the following CSV financial data and return ONLY valid JSON matching this exact schema:

{
  "healthScore": number,
  "anomalies": [{"severity": "High|Medium|Low", "description": "string", "variance": number}],
  "chartData": [{"month": "string", "revenue": number, "expenses": number}],
  "expenseBreakdown": [{"category": "string", "amount": number, "percentage": number}],
  "aiCommentary": "string"
}

ANALYSIS RULES:
1. healthScore: integer 0-100 based on:
   - Revenue stability and growth trajectory (weight: 30)
   - Expense control and margin preservation (weight: 25)
   - Cash flow patterns and operational efficiency (weight: 25)
   - Risk indicators and anomaly severity (weight: 20)

2. anomalies: identify 3-6 significant financial anomalies with:
   - severity: "High" for >15% deviations or critical cash flow issues, "Medium" for 5-15% deviations, "Low" for <5% or informational items
   - description: specific, actionable explanation with business impact
   - variance: numeric percentage change (positive or negative)
   - Focus on: revenue drops, expense spikes, margin compression, seasonal patterns, cost overruns

3. chartData: extract monthly revenue and expenses from CSV, organize chronologically

4. expenseBreakdown: aggregate expenses into 5-10 meaningful categories with:
   - category: descriptive business expense category
   - amount: total for the period
   - percentage: percentage of total expenses

5. aiCommentary: write 3-4 sentences covering:
   - Overall financial health assessment
   - Top 2-3 key insights or risks
   - Specific actionable recommendations
   - Industry context where relevant

CSV Content:
${csvContent.slice(0, 50_000)}

Return ONLY the JSON object, no markdown formatting, no explanations outside JSON.`;

  const requestBody: AihubmaxChatRequest = {
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a precision financial analysis engine. Always return valid JSON matching the requested schema. Never include markdown code fences or explanatory text outside the JSON object.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 2500,
  };

  const baseUrl = apiBaseUrl.replace(/\/+$/, "");
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as AihubmaxChatResponse;
  const content = data.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }

  const parsed: unknown = JSON.parse(content);
  return n8nResponseSchema.parse(parsed);
}
