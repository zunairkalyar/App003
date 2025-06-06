
export function getAuthHeader() {
  const key = process.env.WOO_CONSUMER_KEY;
  const secret = process.env.WOO_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error('WooCommerce credentials are not set');
  }
  const token = Buffer.from(`${key}:${secret}`).toString('base64');
  return `Basic ${token}`;
}

export async function wooRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.WOO_BASE_URL;
  if (!baseUrl) {
    throw new Error('WOO_BASE_URL not set');
  }
  const endpoint = `${baseUrl.replace(/\/$/, '')}${url}`;
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json() as Promise<T>;
}
