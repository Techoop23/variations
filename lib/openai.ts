import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export const isValidApiKey = () => {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  return apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
};