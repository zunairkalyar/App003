import type { NextApiRequest, NextApiResponse } from 'next';
import { pushflowRequest } from '../../lib/pushflow';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, message } = req.body as { phoneNumber?: string; message?: string };
  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'phoneNumber and message are required' });
  }

  try {
    const data = await pushflowRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ to: phoneNumber, message }),
    });
    return res.status(200).json(data);
  } catch (err: unknown) {
    const messageErr = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error sending message', err);
    return res.status(500).json({ error: messageErr });
  }
}
