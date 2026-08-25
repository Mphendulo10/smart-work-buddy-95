import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const ASSISTANT_MODEL = "google/gemini-2.5-flash";

export function createLovableAiGatewayProvider(lovableApiKey: string) {
  return createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": lovableApiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

export function getAssistantModel() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet. Missing LOVABLE_API_KEY.");
  return createLovableAiGatewayProvider(key)(ASSISTANT_MODEL);
}
