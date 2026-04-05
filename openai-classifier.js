import { AIClassifier } from './ai-classifier.js';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

export class OpenAIClassifier extends AIClassifier {
  async createFeatureExtractor() {
    return async (text) => {
      let embedding = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
        encoding_format: "float",
      });
      return {
        data: embedding?.data?.[0]?.embedding
      };
    };
  }
}

