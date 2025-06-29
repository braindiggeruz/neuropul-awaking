import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getArchetypeAnalysis, analyzeFallbackArchetype } from '../lib/api/callGpt';

// Mock the callGPT function
vi.mock('../lib/api/callGpt', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    callGPT: vi.fn()
  };
});

describe('Archetype Analysis', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getArchetypeAnalysis', () => {
    it('should return error when no answers provided', async () => {
      const result = await getArchetypeAnalysis([]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('No answers provided');
    });

    it('should handle successful API response with valid JSON', async () => {
      // Setup mock
      const mockCallGPT = vi.fn().mockResolvedValue({
        success: true,
        data: JSON.stringify({
          type: 'Воин',
          description: 'Test description',
          CTA: 'Test CTA'
        })
      });
      vi.stubGlobal('callGPT', mockCallGPT);

      const result = await getArchetypeAnalysis(['Answer 1', 'Answer 2']);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        type: 'Воин',
        description: 'Test description',
        CTA: 'Test CTA'
      });
      expect(result.strategy).toBe('direct_json_parse');
    });

    it('should handle API response with JSON embedded in text', async () => {
      // Setup mock
      const mockCallGPT = vi.fn().mockResolvedValue({
        success: true,
        data: 'Here is the result: {"type": "Маг", "description": "Test description", "CTA": "Test CTA"}'
      });
      vi.stubGlobal('callGPT', mockCallGPT);

      const result = await getArchetypeAnalysis(['Answer 1', 'Answer 2']);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        type: 'Маг',
        description: 'Test description',
        CTA: 'Test CTA'
      });
      expect(result.strategy).toBe('regex_json_extraction');
    });

    it('should handle API response with malformed JSON but extractable fields', async () => {
      // Setup mock
      const mockCallGPT = vi.fn().mockResolvedValue({
        success: true,
        data: '{ "type" : "Искатель" , "description" : "Test description" , "CTA" : "Test CTA" '
      });
      vi.stubGlobal('callGPT', mockCallGPT);

      const result = await getArchetypeAnalysis(['Answer 1', 'Answer 2']);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('Искатель');
      expect(result.strategy).toBe('field_extraction');
    });

    it('should handle API response with only keywords', async () => {
      // Setup mock
      const mockCallGPT = vi.fn().mockResolvedValue({
        success: true,
        data: 'Based on the answers, the user is clearly a Тень archetype. They show analytical thinking.'
      });
      vi.stubGlobal('callGPT', mockCallGPT);

      const result = await getArchetypeAnalysis(['Answer 1', 'Answer 2']);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBe('Тень');
      expect(result.strategy).toBe('keyword_analysis');
    });

    it('should use fallback when API response cannot be parsed', async () => {
      // Setup mock
      const mockCallGPT = vi.fn().mockResolvedValue({
        success: true,
        data: 'Invalid response with no keywords or JSON'
      });
      vi.stubGlobal('callGPT', mockCallGPT);

      const result = await getArchetypeAnalysis([
        { answer: "Я предпочитаю действовать быстро", weight: { warrior: 3, mage: 0, seeker: 0, shadow: 0 } }
      ]);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBeDefined();
      expect(['Воин', 'Маг', 'Искатель', 'Тень']).toContain(result.data.type);
      expect(result.strategy).toBe('fallback_local_analysis');
    });

    it('should handle API failure gracefully', async () => {
      // Setup mock
      const mockCallGPT = vi.fn().mockResolvedValue({
        success: false,
        error: 'API error'
      });
      vi.stubGlobal('callGPT', mockCallGPT);

      const result = await getArchetypeAnalysis(['Answer 1', 'Answer 2']);
      
      expect(result.success).toBe(true);
      expect(result.data.type).toBeDefined();
      expect(['Воин', 'Маг', 'Искатель', 'Тень']).toContain(result.data.type);
      expect(result.strategy).toBe('fallback_local_analysis');
    });
  });

  describe('Fallback Archetype Analysis', () => {
    it('should determine archetype based on keywords in answers', () => {
      const answers = [
        { answer: 'Я предпочитаю действовать быстро и решительно', weight: { warrior: 3, mage: 0, seeker: 1, shadow: 0 } },
        { answer: 'Мне нравится преодолевать препятствия', weight: { warrior: 2, mage: 0, seeker: 1, shadow: 1 } }
      ];
      
      const result = analyzeFallbackArchetype(answers);
      
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('CTA');
      expect(['Воин', 'Маг', 'Искатель', 'Тень']).toContain(result.type);
      expect(result.type).toBe('Воин'); // Should be Warrior based on weights and keywords
    });

    it('should handle answers with mixed archetype signals', () => {
      const answers = [
        { answer: 'Я люблю изучать новое', weight: { warrior: 0, mage: 2, seeker: 3, shadow: 0 } },
        { answer: 'Мне нравится анализировать скрытые мотивы', weight: { warrior: 0, mage: 1, seeker: 0, shadow: 3 } }
      ];
      
      const result = analyzeFallbackArchetype(answers);
      
      expect(['Искатель', 'Тень']).toContain(result.type); // Could be either based on implementation
    });

    it('should handle empty answers array', () => {
      const result = analyzeFallbackArchetype([]);
      
      expect(result).toHaveProperty('type');
      expect(['Воин', 'Маг', 'Искатель', 'Тень']).toContain(result.type);
    });

    it('should handle answers without weight property', () => {
      const answers = [
        'Я предпочитаю действовать быстро и решительно',
        'Мне нравится преодолевать препятствия'
      ];
      
      const result = analyzeFallbackArchetype(answers);
      
      expect(result).toHaveProperty('type');
      expect(['Воин', 'Маг', 'Искатель', 'Тень']).toContain(result.type);
      expect(result.type).toBe('Воин'); // Should detect warrior keywords
    });

    it('should handle answers with no clear archetype signals', () => {
      const answers = [
        { answer: 'Нейтральный ответ без ключевых слов', weight: { warrior: 1, mage: 1, seeker: 1, shadow: 1 } }
      ];
      
      const result = analyzeFallbackArchetype(answers);
      
      expect(result).toHaveProperty('type');
      expect(['Воин', 'Маг', 'Искатель', 'Тень']).toContain(result.type);
    });
  });
});