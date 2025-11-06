import OpenAI from 'openai';

/**
 * Groq API client
 * Groq offers fast inference with OpenAI-compatible API
 * Free tier: 14,400 requests/day, 30 requests/minute
 */
let groqClient: OpenAI | null = null;

export const getGroqClient = (): OpenAI => {
  if (groqClient) {
    return groqClient;
  }

  const apiKey = import.meta.env.VITE_GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('VITE_GROQ_API_KEY is not configured. Please add it to your .env file.');
  }

  groqClient = new OpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // Safe: Groq API key is public-facing for client-side usage
  });

  return groqClient;
};

/**
 * Generate content using Groq
 * @param prompt - The prompt to send to the model
 * @param model - The model to use (default: 'llama-3.3-70b-versatile' or 'mixtral-8x7b-32768')
 * @param options - Additional options for the request
 */
export const generateWithGroq = async (
  prompt: string,
  model: string = 'llama-3.3-70b-versatile',
  options: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'json_object' };
  } = {}
) => {
  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that generates side hustle ideas. Always respond with valid JSON when requested.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options.temperature ?? 0.8,
    max_tokens: options.maxTokens ?? 2000,
    ...(options.responseFormat && { response_format: options.responseFormat }),
  });

  return response.choices[0]?.message?.content || '';
};

/**
 * Available Groq models
 */
export const GROQ_MODELS = {
  // Fast and efficient models
  'llama-3.3-70b-versatile': 'Llama 3.3 70B - Best for general tasks',
  'mixtral-8x7b-32768': 'Mixtral 8x7B - Good for long context',
  'llama-3.1-70b-versatile': 'Llama 3.1 70B - Alternative option',
  'gemma2-9b-it': 'Gemma2 9B - Lightweight option',
} as const;

export type GroqModel = keyof typeof GROQ_MODELS;

