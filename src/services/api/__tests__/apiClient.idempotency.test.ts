import { apiClient, generateIdempotencyKey } from '../apiClient';
import { ideasApi } from '../ideasApi';
import { tokenStorage } from '../../storage/tokenStorage';

describe('API-02 Mobile Idempotency Key Integration', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(tokenStorage, 'getToken').mockResolvedValue('test-jwt-token');
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  describe('generateIdempotencyKey', () => {
    it('generates valid RFC4122 v4 UUIDs', () => {
      const key1 = generateIdempotencyKey();
      const key2 = generateIdempotencyKey();

      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
      expect(key1).toMatch(uuidV4Regex);
      expect(key2).toMatch(uuidV4Regex);
      expect(key1).not.toBe(key2);
    });
  });

  describe('apiClient fetch isolation & header forwarding', () => {
    it('attaches Idempotency-Key header and does NOT leak idempotencyKey into fetch init options', async () => {
      let capturedInit: any = null;
      global.fetch = jest.fn().mockImplementation((_url, init) => {
        capturedInit = init;
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve(JSON.stringify({ success: true })),
        });
      });

      const testKey = '550e8400-e29b-41d4-a716-446655440000';
      await apiClient.post('/api/test', { data: 'value' }, { idempotencyKey: testKey });

      expect(capturedInit).toBeDefined();
      // Crucial requirement: idempotencyKey must NOT leak into native fetch options
      expect(capturedInit.idempotencyKey).toBeUndefined();
      // Crucial requirement: sent ONLY through headers['Idempotency-Key']
      expect(capturedInit.headers['Idempotency-Key']).toBe(testKey);
      expect(capturedInit.headers['X-Request-ID']).toBeDefined();
      expect(capturedInit.headers['X-Request-ID']).not.toBe(testKey);
    });

    it('trims whitespace and ignores empty string idempotencyKey', async () => {
      let capturedInit: any = null;
      global.fetch = jest.fn().mockImplementation((_url, init) => {
        capturedInit = init;
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () => Promise.resolve(JSON.stringify({ success: true })),
        });
      });

      // Whitespace trimmed
      await apiClient.post('/api/test', {}, { idempotencyKey: '  my-key-123  ' });
      expect(capturedInit.headers['Idempotency-Key']).toBe('my-key-123');

      // Empty string omitted
      capturedInit = null;
      await apiClient.post('/api/test', {}, { idempotencyKey: '   ' });
      expect(capturedInit.headers['Idempotency-Key']).toBeUndefined();
    });
  });

  describe('All 7 credit-consuming operations forward idempotencyKey', () => {
    let capturedInit: any = null;

    beforeEach(() => {
      global.fetch = jest.fn().mockImplementation((_url, init) => {
        capturedInit = init;
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers(),
          text: () =>
            Promise.resolve(
              JSON.stringify({
                _id: 'idea-101',
                overallScore: 85,
                analysis: { marketDemand: { score: 85 } },
                pitchDeckContent: { problem: 'Manual steps' },
                canvasContent: { keyPartners: 'Vendors' },
                competitorAnalysis: { summary: 'Market summary', competitors: [] },
                pitchSimulation: { questions: [{ id: 'q1', question: 'Q?' }] },
              })
            ),
        });
      });
    });

    it('1. submitIdea forwards idempotencyKey', async () => {
      await ideasApi.submitIdea({ ideaText: 'A new startup idea for logistics tracking' }, {
        idempotencyKey: 'key-submit-1',
      });
      expect(capturedInit.headers['Idempotency-Key']).toBe('key-submit-1');
      expect(capturedInit.idempotencyKey).toBeUndefined();
    });

    it('2. generatePitchDeck forwards idempotencyKey', async () => {
      await ideasApi.generatePitchDeck('idea-101', {
        idempotencyKey: 'key-deck-gen-1',
      });
      expect(capturedInit.headers['Idempotency-Key']).toBe('key-deck-gen-1');
      expect(capturedInit.idempotencyKey).toBeUndefined();
    });

    it('3. regeneratePitchDeck forwards idempotencyKey', async () => {
      await ideasApi.regeneratePitchDeck('idea-101', {
        idempotencyKey: 'key-deck-regen-1',
      });
      expect(capturedInit.headers['Idempotency-Key']).toBe('key-deck-regen-1');
      expect(capturedInit.idempotencyKey).toBeUndefined();
    });

    it('4. generateCanvas forwards idempotencyKey', async () => {
      await ideasApi.generateCanvas('idea-101', {
        idempotencyKey: 'key-canvas-gen-1',
      });
      expect(capturedInit.headers['Idempotency-Key']).toBe('key-canvas-gen-1');
      expect(capturedInit.idempotencyKey).toBeUndefined();
    });

    it('5. regenerateCanvas forwards idempotencyKey', async () => {
      await ideasApi.regenerateCanvas('idea-101', {
        idempotencyKey: 'key-canvas-regen-1',
      });
      expect(capturedInit.headers['Idempotency-Key']).toBe('key-canvas-regen-1');
      expect(capturedInit.idempotencyKey).toBeUndefined();
    });

    it('6. analyzeCompetitors forwards idempotencyKey', async () => {
      await ideasApi.analyzeCompetitors('idea-101', true, {
        idempotencyKey: 'key-competitors-1',
      });
      expect(capturedInit.headers['Idempotency-Key']).toBe('key-competitors-1');
      expect(capturedInit.idempotencyKey).toBeUndefined();
    });

    it('7. simulatePitch forwards idempotencyKey', async () => {
      await ideasApi.simulatePitch('idea-101', true, {
        idempotencyKey: 'key-simulate-1',
      });
      expect(capturedInit.headers['Idempotency-Key']).toBe('key-simulate-1');
      expect(capturedInit.idempotencyKey).toBeUndefined();
    });
  });
});
