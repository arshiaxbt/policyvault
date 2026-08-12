import type { VercelRequest, VercelResponse } from '@vercel/node';

const SEND_URL = 'https://dashboard.base.org/api/v1/notifications/send';

function trunc(s: string, max: number) {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.BASE_NOTIFICATIONS_API_KEY?.trim();
  if (!apiKey) {
    return res.status(501).json({
      error:
        'Set BASE_NOTIFICATIONS_API_KEY on Vercel (Base Dashboard → Settings → API Key)',
    });
  }

  const appUrl =
    process.env.BASE_APP_URL?.trim() || 'https://policyvault-cyan.vercel.app';

  const { walletAddress, title, message, targetPath } = (req.body || {}) as {
    walletAddress?: string;
    title?: string;
    message?: string;
    targetPath?: string;
  };

  if (!walletAddress || !title || !message) {
    return res.status(400).json({
      error: 'walletAddress, title, and message are required',
    });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({ error: 'Invalid walletAddress' });
  }

  const path =
    targetPath && targetPath.startsWith('/')
      ? trunc(targetPath, 500)
      : undefined;

  const r = await fetch(SEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      app_url: appUrl,
      wallet_addresses: [walletAddress],
      title: trunc(title, 30),
      message: trunc(message, 200),
      ...(path ? { target_path: path } : {}),
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return res.status(r.status === 401 || r.status === 403 ? r.status : 502).json({
      error: data,
    });
  }
  return res.status(200).json({ ok: true, ...data });
}
