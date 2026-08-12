import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const bot = process.env.TELEGRAM_BOT_TOKEN;
  if (!bot) {
    return res.status(501).json({
      error: 'Set TELEGRAM_BOT_TOKEN on Vercel to enable Telegram alerts',
    });
  }

  const { chatId, text } = req.body || {};
  if (!chatId || !text) return res.status(400).json({ error: 'chatId and text required' });

  const r = await fetch(`https://api.telegram.org/bot${bot}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  const data = await r.json();
  if (!r.ok) return res.status(502).json({ error: data });
  return res.status(200).json({ ok: true });
}
