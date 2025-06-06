import type { NextApiRequest, NextApiResponse } from 'next';
import { wooRequest } from '../../../../lib/woocommerce';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const { status } = req.body;

  if (!orderId || typeof status !== 'string') {
    return res.status(400).json({ error: 'orderId and status required' });
  }

  try {
    const data = await wooRequest(`/wp-json/wc/v3/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.status(200).json(data);
  } catch (err: unknown) {
    const messageErr = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error updating order status', err);
    return res.status(500).json({ error: messageErr });
  }
}
