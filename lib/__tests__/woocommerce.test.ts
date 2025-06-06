import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAuthHeader, wooRequest } from '../woocommerce';

// helper to mock fetch

const mockResponse = (data: any) => ({
  ok: true,
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(''),
});

describe('getAuthHeader', () => {
  it('creates a Basic auth header', () => {
    process.env.WOO_CONSUMER_KEY = 'key';
    process.env.WOO_CONSUMER_SECRET = 'secret';
    const header = getAuthHeader();
    const token = Buffer.from('key:secret').toString('base64');
    expect(header).toBe(`Basic ${token}`);
  });

  it('throws when env vars missing', () => {
    delete process.env.WOO_CONSUMER_KEY;
    delete process.env.WOO_CONSUMER_SECRET;
    expect(() => getAuthHeader()).toThrow();
  });
});

describe('wooRequest', () => {
  beforeEach(() => {
    process.env.WOO_CONSUMER_KEY = 'key';
    process.env.WOO_CONSUMER_SECRET = 'secret';
    process.env.WOO_BASE_URL = 'https://store.com';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls fetch with correct headers and url', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse({ ok: true }) as any);
    await wooRequest('/test');
    const token = Buffer.from('key:secret').toString('base64');
    expect(fetchMock).toHaveBeenCalledWith('https://store.com/test', expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: `Basic ${token}`,
        'Content-Type': 'application/json',
      }),
    }));
  });
});
