import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

/** Supabase validates the invitation/recovery link before this authenticated screen is shown. */
export function PasswordSetupScreen({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (password !== confirmation) { setError('As senhas precisam ser iguais.'); return; }
    if (password.length < 8) { setError('Escolha uma senha com pelo menos 8 caracteres.'); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onComplete();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a senha. Tente novamente.'); }
    finally { setBusy(false); }
  }
  return <main className="flex min-h-screen items-center justify-center px-5 py-10"><section className="w-full max-w-md rounded-3xl border border-[#d8c99f] bg-[#fffaf0] p-8 text-[#173c2c] shadow-xl"><img src="/logo-everton-oficial.png" alt="Everton Piceni" className="mx-auto h-28 w-28 object-contain"/><h1 className="mt-5 font-serif text-3xl">Defina sua senha</h1><p className="mt-3 text-sm leading-6">Escolha uma senha para acessar sua conta. Depois de salvar, você poderá entrar com seu e-mail e essa senha.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block">Nova senha<div className="relative mt-2"><input type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={8} required aria-label="Nova senha" value={password} onChange={event => setPassword(event.target.value)} className="user-input pr-12"/><button type="button" aria-label={showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#365441]">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></label><label className="block">Confirme a senha<div className="relative mt-2"><input type={showConfirmation ? 'text' : 'password'} autoComplete="new-password" minLength={8} required aria-label="Confirme a senha" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="user-input pr-12"/><button type="button" aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'} aria-pressed={showConfirmation} onClick={() => setShowConfirmation(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#365441]">{showConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></label>{error && <p role="alert" className="text-sm text-red-800">{error}</p>}<button disabled={busy} className="w-full rounded-full bg-[#173f2d] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? 'Salvando...' : 'Salvar senha e continuar'}</button></form></section></main>;
}
