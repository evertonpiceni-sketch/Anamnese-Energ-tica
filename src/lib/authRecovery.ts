import { supabase } from './supabase';

export function parsePasswordLink(value: string) {
  const url = new URL(value);
  const isApp = ['relatorioenergetico.vercel.app', 'localhost', '127.0.0.1'].includes(url.hostname);
  const isAuth = url.hostname === 'aokdwgvwcsyqfhrgrboo.supabase.co' && url.pathname === '/auth/v1/verify';
  if ((!isApp && !isAuth) || !['https:', 'http:'].includes(url.protocol)) throw new Error('Cole o link de acesso recebido no e-mail.');
  const type = url.searchParams.get('type');
  const tokenHash = url.searchParams.get('token_hash') || (isAuth ? url.searchParams.get('token') : null);
  if (!tokenHash || !['invite', 'recovery'].includes(type || '')) throw new Error('Esse link não é de definição de senha. Solicite um novo link.');
  return { token_hash: tokenHash, type: type as 'invite' | 'recovery' };
}

// Deduplicate verification: React StrictMode must not consume the same one-use link twice.
let verification: { key: string; promise: ReturnType<typeof supabase.auth.verifyOtp> } | undefined;
export async function verifyPasswordLink(value: string) {
  const parameters = parsePasswordLink(value);
  const key = `${parameters.type}:${parameters.token_hash}`;
  if (!verification || verification.key !== key) verification = { key, promise: supabase.auth.verifyOtp(parameters) };
  const { data, error } = await verification.promise;
  if (error || !data.session) throw new Error('O link expirou ou já foi utilizado. Solicite um novo link em “Esqueci minha senha”.');
  const url = new URL(window.location.href);
  url.searchParams.delete('token_hash'); url.searchParams.delete('token'); url.searchParams.delete('type');
  url.searchParams.set('setup', 'password'); url.hash = '';
  window.history.replaceState({}, '', url);
  return data.session;
}
