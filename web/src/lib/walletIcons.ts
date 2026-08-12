/** Local fallback icons — wagmi connectors often omit `icon` (e.g. MetaMask SDK). */
const ICONS: Record<string, string> = {
  metamask:
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="#F6851B"/><path fill="#E2761B" d="M32.2 7.2 21.4 15.3l2 4.8 8.9-2.4z"/><path fill="#E4761B" d="M7.8 7.2 18.5 15.4l-1.9 4.7-8.9-2.4z"/><path fill="#D7C1B3" d="m21.1 27.4 1.7-4.4-1.5-1.2H18.7l-1.5 1.2 1.7 4.4"/><path fill="#233447" d="m21.1 27.4 1.7-4.4 2.3 1.6zM18.9 27.4l-1.7-4.4-2.3 1.6z"/><path fill="#CD6116" d="m11.8 18.8 2.4 5.4 2.3-1.6-1.5-1.2zM28.2 18.8l-2.4 5.4-2.3-1.6 1.5-1.2z"/><path fill="#E4751F" d="m14.2 24.2 1.6 2.7 1.7-4.4zM25.8 24.2 24.2 26.9 22.5 22.5z"/><path fill="#F5841F" d="M21.1 27.4 22.8 25.8l-1.4-.1h-1.9l-1.4.1z"/><path fill="#C0AC9D" d="m22.8 25.8 1.4 1.6-.1-1.3.1-1.6zM17.2 25.8l-1.4 1.6.1-1.3-.1-1.6z"/><path fill="#161616" d="m22.5 22.5 1.7 1.7-2.3 1.6.6-3.3zM17.5 22.5l-1.7 1.7 2.3 1.6-.6-3.3z"/><path fill="#763D16" d="m33.2 15.4-1.9 9.5-5.4-4.1 1.5-1.2 2.4-5.4zM6.8 15.4l1.9 9.5 5.4-4.1-1.5-1.2-2.4-5.4z"/><path fill="#F5841F" d="M21.4 15.3 23.4 20.1l-1.9 1.6-1.1-4.1.2-2.3zM18.6 15.3 16.6 20.1l1.9 1.6 1.1-4.1-.2-2.3z"/></svg>`
    ),
  coinbase:
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#0052FF"/><path fill="#fff" d="M20 10.5a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm0 13.7a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4z"/></svg>`
    ),
  safe:
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#12FF80"/><path fill="#001428" d="M12 27.5V14.2c0-1.2.9-2.2 2.1-2.2h11.8c1.2 0 2.1 1 2.1 2.2v13.3c0 1.2-.9 2.2-2.1 2.2H14.1c-1.2 0-2.1-1-2.1-2.2zm8-2.8a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8z"/></svg>`
    ),
  walletconnect:
    'data:image/svg+xml,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#3B99FC"/><path fill="#fff" d="M12.4 16.2a10.7 10.7 0 0 1 15.2 0l.5.5a.5.5 0 0 1 0 .7l-1.7 1.7a.5.5 0 0 1-.7 0l-.7-.7a7.2 7.2 0 0 0-10.2 0l-.7.7a.5.5 0 0 1-.7 0l-1.7-1.7a.5.5 0 0 1 0-.7l.7-.5zm18.8 3.5 1.5 1.5a.5.5 0 0 1 0 .7l-6.9 6.9a.5.5 0 0 1-.7 0l-4.9-4.9a.2.2 0 0 0-.3 0l-4.9 4.9a.5.5 0 0 1-.7 0l-6.9-6.9a.5.5 0 0 1 0-.7l1.5-1.5a.5.5 0 0 1 .7 0l4.9 4.9a.2.2 0 0 0 .3 0l4.9-4.9a.5.5 0 0 1 .7 0l4.9 4.9a.2.2 0 0 0 .3 0l4.9-4.9a.5.5 0 0 1 .7 0z"/></svg>`
    ),
};

export function walletIconFor(id: string, name: string, icon?: string | null): string | null {
  if (icon && !icon.includes('undefined')) return icon;
  const key = `${id} ${name}`.toLowerCase();
  if (key.includes('metamask')) return ICONS.metamask;
  if (key.includes('coinbase')) return ICONS.coinbase;
  if (key.includes('safe')) return ICONS.safe;
  if (key.includes('walletconnect') || key === 'walletconnect') return ICONS.walletconnect;
  return null;
}
