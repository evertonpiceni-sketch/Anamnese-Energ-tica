import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

/** Supabase valida o link de convite/recuperação antes desta tela autenticada ser exibida. */
export function PasswordSetupScreen({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('As senhas precisam ser iguais.');
      return;
    }

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError('Escolha uma senha com pelo menos 8 caracteres, combinando letras e números.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      onComplete();
    } catch (cause) {
      const raw = cause instanceof Error ? cause.message : '';
      setError(
        raw.toLowerCase().includes('password')
          ? 'Não foi possível salvar essa senha. Use pelo menos 8 caracteres, combinando letras e números.'
          : 'Não foi possível salvar a senha. Solicite um novo link de recuperação e tente novamente.'
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-[#d8c99f] bg-[#fffaf0] p-8 text-[#173c2c] shadow-xl">
        <img src="/logo-everton-oficial.png" alt="Everton Piceni" className="mx-auto h-28 w-28 object-contain opacity-80" />
        <div className="mt-5 text-center text-xs font-semibold tracking-[0.18em] text-[#a18443]">RECUPERAÇÃO DE ACESSO</div>
        <h1 className="mt-2 text-center font-serif text-3xl">Crie sua nova senha</h1>
        <p className="mt-3 text-center text-sm leading-6 text-[#667268]">
          Escolha uma nova senha para este e-mail. Depois de salvar, você será levado ao seu espaço automaticamente.
        </p>

        <form onSubmit={submit} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold text-[#365441]">
            Nova senha
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                aria-label="Nova senha"
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="user-input pr-12"
                placeholder="8+ caracteres, com letras e números"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(value => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#365441]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          <label className="block text-sm font-semibold text-[#365441]">
            Confirme a nova senha
            <div className="relative mt-2">
              <input
                type={showConfirmation ? 'text' : 'password'}
                autoComplete="new-password"
                minLength={8}
                required
                aria-label="Confirme a senha"
                value={confirmation}
                onChange={event => setConfirmation(event.target.value)}
                className="user-input pr-12"
                placeholder="Digite novamente"
              />
              <button
                type="button"
                aria-label={showConfirmation ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                aria-pressed={showConfirmation}
                onClick={() => setShowConfirmation(value => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#365441]"
              >
                {showConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>

          <p className="text-xs leading-5 text-[#7b837d]">A senha deve ter pelo menos 8 caracteres e conter letras e números.</p>

          {error && (
            <div role="alert" className="rounded-2xl border border-[#e4c3b9] bg-[#fff5f1] px-4 py-3 text-sm leading-6 text-[#9b4e40]">
              {error}
            </div>
          )}

          <button disabled={busy} className="w-full rounded-full bg-[#173f2d] px-5 py-3.5 font-semibold text-white disabled:opacity-50">
            {busy ? 'Salvando...' : 'Salvar nova senha e continuar'}
          </button>
        </form>
      </section>
    </main>
  );
}
