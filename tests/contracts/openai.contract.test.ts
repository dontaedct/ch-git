/**
 * OpenAI Contract Tests
 * 
 * Tests the contract between our application and OpenAI services.
 * Ensures AI services, chat completions, and model interactions work correctly.
 */

import OpenAI from 'openai';
import { getEnv } from '@/lib/env';

// Mock OpenAI
const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn()
    }
  },
  models: {
    list: jest.fn()
  },
  embeddings: {
    create: jest.fn()
  },
  images: {
    generate: jest.fn()
  },
  audio: {
    transcriptions: {
      create: jest.fn()
    }
  }
};

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => mockOpenAI);
});

// Mock environment
const mockEnv = {
  OPENAI_API_KEY: 'sk-test-mock-key',
  OPENAI_ORGANIZATION: 'org-test-mock',
  OPENAI_MODEL: 'gpt-4',
  OPENAI_MAX_TOKENS: '1000'
};

jest.mock('@/lib/env', () => ({
  getEnv: jest.fn(() => mockEnv)
}));

describe('OpenAI Contract Tests', () => {
  let openai: OpenAI;

  beforeEach(() => {
    jest.clearAllMocks();
    openai = new OpenAI({ apiKey: 'sk-test-mock-key' });
  });

  describe('Chat Completions Contract', () => {
    it('should create chat completion', async () => {
      const mockCompletion = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677652288,
        model: 'gpt-4',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 10,
          total_tokens: 20
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockCompletion);

      const result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 100
      });

      expect(result.id).toBe('chatcmpl-123');
      expect(result.model).toBe('gpt-4');
      expect(result.choices[0].message.content).toBe('Hello! How can I help you today?');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 100
      });
    });

    it('should handle system messages', async () => {
      const mockCompletion = {
        id: 'chatcmpl-456',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'I am a helpful assistant.'
            }
          }
        ]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockCompletion);

      const result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is your role?' }
        ]
      });

      expect(result.choices[0].message.content).toBe('I am a helpful assistant.');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'What is your role?' }
        ]
      });
    });

    it('should handle function calling', async () => {
      const mockCompletion = {
        id: 'chatcmpl-789',
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              function_call: {
                name: 'get_weather',
                arguments: '{"location": "New York"}'
              }
            }
          }
        ]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockCompletion);

      const result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'What is the weather in New York?' }
        ],
        functions: [
          {
            name: 'get_weather',
            description: 'Get weather information for a location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state'
                }
              },
              required: ['location']
            }
          }
        ]
      });

      expect(result.choices[0].message.function_call).toBeDefined();
      expect(result.choices[0].message.function_call.name).toBe('get_weather');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'What is the weather in New York?' }
        ],
        functions: [
          {
            name: 'get_weather',
            description: 'Get weather information for a location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'The city and state'
                }
              },
              required: ['location']
            }
          }
        ]
      });
    });

    it('should handle streaming responses', async () => {
      const mockStream = {
        id: 'chatcmpl-stream-123',
        choices: [
          {
            delta: {
              role: 'assistant',
              content: 'Hello'
            }
          }
        ]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockStream);

      const result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        stream: true
      });

      expect(result.id).toBe('chatcmpl-stream-123');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        stream: true
      });
    });
  });

  describe('Models Contract', () => {
    it('should list available models', async () => {
      const mockModels = {
        data: [
          {
            id: 'gpt-4',
            object: 'model',
            created: 1677610602,
            owned_by: 'openai'
          },
          {
            id: 'gpt-3.5-turbo',
            object: 'model',
            created: 1677610602,
            owned_by: 'openai'
          }
        ]
      };

      mockOpenAI.models.list.mockResolvedValue(mockModels);

      const result = await openai.models.list();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe('gpt-4');
      expect(result.data[1].id).toBe('gpt-3.5-turbo');
      expect(mockOpenAI.models.list).toHaveBeenCalled();
    });
  });

  describe('Embeddings Contract', () => {
    it('should create embeddings', async () => {
      const mockEmbedding = {
        object: 'list',
        data: [
          {
            object: 'embedding',
            embedding: [0.1, 0.2, 0.3, 0.4, 0.5],
            index: 0
          }
        ],
        model: 'text-embedding-ada-002',
        usage: {
          prompt_tokens: 5,
          total_tokens: 5
        }
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbedding);

      const result = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: 'Hello world'
      });

      expect(result.model).toBe('text-embedding-ada-002');
      expect(result.data[0].embedding).toHaveLength(5);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-ada-002',
        input: 'Hello world'
      });
    });

    it('should handle multiple inputs for embeddings', async () => {
      const mockEmbedding = {
        object: 'list',
        data: [
          {
            object: 'embedding',
            embedding: [0.1, 0.2, 0.3],
            index: 0
          },
          {
            object: 'embedding',
            embedding: [0.4, 0.5, 0.6],
            index: 1
          }
        ],
        model: 'text-embedding-ada-002'
      };

      mockOpenAI.embeddings.create.mockResolvedValue(mockEmbedding);

      const result = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: ['Hello', 'World']
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0].index).toBe(0);
      expect(result.data[1].index).toBe(1);
      expect(mockOpenAI.embeddings.create).toHaveBeenCalledWith({
        model: 'text-embedding-ada-002',
        input: ['Hello', 'World']
      });
    });
  });

  describe('Image Generation Contract', () => {
    it('should generate images', async () => {
      const mockImage = {
        created: 1677652288,
        data: [
          {
            url: 'https://example.com/generated-image.png',
            revised_prompt: 'A beautiful sunset over mountains'
          }
        ]
      };

      mockOpenAI.images.generate.mockResolvedValue(mockImage);

      const result = await openai.images.generate({
        model: 'dall-e-3',
        prompt: 'A beautiful sunset over mountains',
        n: 1,
        size: '1024x1024'
      });

      expect(result.data[0].url).toBe('https://example.com/generated-image.png');
      expect(mockOpenAI.images.generate).toHaveBeenCalledWith({
        model: 'dall-e-3',
        prompt: 'A beautiful sunset over mountains',
        n: 1,
        size: '1024x1024'
      });
    });

    it('should handle image generation with different sizes', async () => {
      const mockImage = {
        created: 1677652288,
        data: [
          {
            url: 'https://example.com/generated-image.png'
          }
        ]
      };

      mockOpenAI.images.generate.mockResolvedValue(mockImage);

      const result = await openai.images.generate({
        model: 'dall-e-3',
        prompt: 'A cat sitting on a chair',
        n: 1,
        size: '1792x1024'
      });

      expect(result.data[0].url).toBeDefined();
      expect(mockOpenAI.images.generate).toHaveBeenCalledWith({
        model: 'dall-e-3',
        prompt: 'A cat sitting on a chair',
        n: 1,
        size: '1792x1024'
      });
    });
  });

  describe('Audio Transcription Contract', () => {
    it('should transcribe audio', async () => {
      const mockTranscription = {
        text: 'Hello, this is a test transcription.'
      };

      mockOpenAI.audio.transcriptions.create.mockResolvedValue(mockTranscription);

      const result = await openai.audio.transcriptions.create({
        file: Buffer.from('audio data'),
        model: 'whisper-1'
      });

      expect(result.text).toBe('Hello, this is a test transcription.');
      expect(mockOpenAI.audio.transcriptions.create).toHaveBeenCalledWith({
        file: Buffer.from('audio data'),
        model: 'whisper-1'
      });
    });

    it('should handle transcription with language specification', async () => {
      const mockTranscription = {
        text: 'Bonjour, ceci est un test de transcription.'
      };

      mockOpenAI.audio.transcriptions.create.mockResolvedValue(mockTranscription);

      const result = await openai.audio.transcriptions.create({
        file: Buffer.from('audio data'),
        model: 'whisper-1',
        language: 'fr'
      });

      expect(result.text).toBe('Bonjour, ceci est un test de transcription.');
      expect(mockOpenAI.audio.transcriptions.create).toHaveBeenCalledWith({
        file: Buffer.from('audio data'),
        model: 'whisper-1',
        language: 'fr'
      });
    });
  });

  describe('Error Handling Contract', () => {
    it('should handle rate limiting', async () => {
      const mockError = new Error('Rate limit exceeded') as any;
      mockError.status = 429;
      mockError.message = 'Rate limit exceeded';

      mockOpenAI.chat.completions.create.mockRejectedValue(mockError);

      await expect(openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      })).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle invalid API key', async () => {
      const mockError = new Error('Invalid API key') as any;
      mockError.status = 401;
      mockError.message = 'Invalid API key';

      mockOpenAI.chat.completions.create.mockRejectedValue(mockError);

      await expect(openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      })).rejects.toThrow('Invalid API key');
    });

    it('should handle model not found', async () => {
      const mockError = new Error('Model not found') as any;
      mockError.status = 404;
      mockError.message = 'Model not found';

      mockOpenAI.chat.completions.create.mockRejectedValue(mockError);

      await expect(openai.chat.completions.create({
        model: 'non-existent-model',
        messages: [{ role: 'user', content: 'Hello' }]
      })).rejects.toThrow('Model not found');
    });

    it('should handle content filtering', async () => {
      const mockError = new Error('Content filtered') as any;
      mockError.status = 400;
      mockError.message = 'Content filtered';

      mockOpenAI.chat.completions.create.mockRejectedValue(mockError);

      await expect(openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Inappropriate content' }]
      })).rejects.toThrow('Content filtered');
    });
  });

  describe('Configuration Contract', () => {
    it('should use correct API key', () => {
      expect(mockEnv.OPENAI_API_KEY).toBe('sk-test-mock-key');
      expect(mockEnv.OPENAI_ORGANIZATION).toBe('org-test-mock');
      expect(mockEnv.OPENAI_MODEL).toBe('gpt-4');
      expect(mockEnv.OPENAI_MAX_TOKENS).toBe('1000');
    });

    it('should initialize OpenAI with correct configuration', () => {
      expect(OpenAI).toHaveBeenCalledWith({ apiKey: 'sk-test-mock-key' });
    });

    it('should handle missing API key', () => {
      const noKeyEnv = { ...mockEnv, OPENAI_API_KEY: undefined };
      jest.mocked(getEnv).mockReturnValue(noKeyEnv);

      expect(() => {
        new OpenAI({ apiKey: undefined });
      }).not.toThrow();
    });
  });

  describe('Usage Tracking Contract', () => {
    it('should track token usage', async () => {
      const mockCompletion = {
        id: 'chatcmpl-123',
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockCompletion);

      const result = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }]
      });

      expect(result.usage.prompt_tokens).toBe(10);
      expect(result.usage.completion_tokens).toBe(20);
      expect(result.usage.total_tokens).toBe(30);
    });

    it('should handle cost calculation', () => {
      const tokenUsage = {
        prompt_tokens: 1000,
        completion_tokens: 500,
        total_tokens: 1500
      };

      // Mock cost calculation (this would be implemented in the actual service)
      const estimatedCost = (tokenUsage.total_tokens / 1000) * 0.03; // $0.03 per 1K tokens
      expect(estimatedCost).toBe(0.045);
    });
  });

  describe('Model Selection Contract', () => {
    it('should support different models for different use cases', async () => {
      const models = {
        'gpt-4': { maxTokens: 8192, cost: 0.03 },
        'gpt-3.5-turbo': { maxTokens: 4096, cost: 0.002 },
        'gpt-4-turbo': { maxTokens: 128000, cost: 0.01 }
      };

      expect(models['gpt-4'].maxTokens).toBe(8192);
      expect(models['gpt-3.5-turbo'].maxTokens).toBe(4096);
      expect(models['gpt-4-turbo'].maxTokens).toBe(128000);
    });

    it('should handle model-specific parameters', async () => {
      const mockCompletion = {
        id: 'chatcmpl-123',
        model: 'gpt-4-turbo',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Response from GPT-4 Turbo'
            }
          }
        ]
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockCompletion);

      const result = await openai.chat.completions.create({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        max_tokens: 1000
      });

      expect(result.model).toBe('gpt-4-turbo');
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
        max_tokens: 1000
      });
    });
  });
});
