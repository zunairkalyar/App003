import type { NextApiRequest, NextApiResponse } from 'next';
import { wooRequest } from '../../../lib/woocommerce';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const page = parseInt((req.query.page as string) || '1', 10);

  try {
    const data = await wooRequest(`/wp-json/wc/v3/orders?per_page=100&page=${page}`);
    return res.status(200).json(data);
  } catch (err: unknown) {
    const messageErr = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching orders', err);
    return res.status(500).json({ error: messageErr });
  }
}
