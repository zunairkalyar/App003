import type { NextApiRequest, NextApiResponse } from 'next';
import { wooRequest } from '../../../../lib/woocommerce';

const allowedStatuses = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed', 'trash'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId } = req.query;
  const { status } = req.body;

  if (!orderId || typeof status !== 'string') {
    return res.status(400).json({ error: 'orderId and status required' });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const data = await wooRequest(`/wc/v3/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return res.status(200).json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error updating order status:', error);
    return res
      .status(500)
      .json({ error: 'Failed to update order status', details: errorMessage });
  }
}
