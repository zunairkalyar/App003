import type { NextApiRequest, NextApiResponse } from 'next';
import { pushflowRequest } from '../../lib/pushflow';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phoneNumber, message } = req.body as {
    phoneNumber?: string;
    message?: string;
  };
  if (!phoneNumber || !message) {
    return res.status(400).json({
      error: 'phoneNumber and message are required',
    });
  }

  // Basic phone number validation (you might want a more robust solution)
  const phoneRegex = /^\+\d{1,15}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number format' });
  }

  try {
    const data = await pushflowRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({ to: phoneNumber, text: message }), // Changed 'message' to 'text'
    });
    return res.status(200).json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending message:', error);
    return res
      .status(500)
      .json({ error: 'Failed to send message', details: errorMessage });
  }
}
