import { FormEvent, useState } from 'react';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Mode = 'signin' | 'signup';

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setErrorMessage('');

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return;
      }

      if (!consent) {
        setErrorMessage('Para criar a conta, confirme o consentimento de uso dos dados para esta experiência.');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: name.trim(),
          },
        },
      });

      if (error) throw error;

      if (data.user && data.session) {
        await supabase
          .from('profiles')
          .update({
            display_name: name.trim() || null,
            consent_lgpd_at: new Date().toISOString(),
          })
          .eq('id', data.user.id);
      }

      setMessage(
        data.session
          ? 'Conta criada. Você já pode continuar.'
          : 'Conta criada. Confira seu e-mail para confirmar o acesso.'
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível concluir o acesso.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f1e6] px-5 py-10 text-[#173c2c]">
      <div className="mx-auto flex min-h-[78vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0] shadow-2xl shadow-[#173f2d]/10 lg:grid-cols-[.9fr_1.1fr]">
          <div className="hidden bg-[#173f2d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <img
                src="/logo-everton-oficial.svg"
                alt="Everton Piceni"
                className="h-24 w-24 rounded-full object-cover opacity-95"
              />
              <div className="mt-8 text-xs font-semibold tracking-[0.18em] text-[#dfc988]">
                ANAMNESE INTEGRATIVA
              </div>
              <h1 className="mt-4 font-serif text-4xl leading-tight">
                Um espaço reservado para o seu cuidado.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#d7e2da]">
                Entre para acessar sua anamnese, seu resultado, suas práticas e os recursos que forem preparados para o seu momento.
              </p>
            </div>
            <p className="text-xs leading-5 text-[#aec1b4]">
              Seus dados ficam vinculados à sua conta e protegidos pelas regras de acesso do sistema.
            </p>
          </div>

          <div className="p-7 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="lg:hidden">
                <img
                  src="/logo-everton-oficial.svg"
                  alt="Everton Piceni"
                  className="h-20 w-20 rounded-full object-cover"
                />
              </div>

              <div className="mt-5 lg:mt-0">
                <div className="text-xs font-semibold tracking-[0.16em] text-[#a18443]">
                  {mode === 'signin' ? 'BEM-VINDO DE VOLTA' : 'CRIAR MEU ACESSO'}
                </div>
                <h2 className="mt-2 font-serif text-3xl text-[#173c2c]">
                  {mode === 'signin' ? 'Entrar' : 'Criar conta'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#68736b]">
                  {mode === 'signin'
                    ? 'Use o e-mail e a senha cadastrados.'
                    : 'Crie seu acesso para que sua jornada possa ser salva com segurança.'}
                </p>
              </div>

              <form onSubmit={submit} className="mt-7 space-y-4">
                {mode === 'signup' && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#365441]">Seu nome</span>
                    <div className="relative">
                      <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8b68]" />
                      <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="user-input pl-11"
                        placeholder="Como prefere ser chamado(a)"
                      />
                    </div>
                  </label>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#365441]">E-mail</span>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8b68]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="user-input pl-11"
                      placeholder="voce@exemplo.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#365441]">Senha</span>
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8b68]" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="user-input pl-11"
                      placeholder="Mínimo de 8 caracteres"
                    />
                  </div>
                </label>

                {mode === 'signup' && (
                  <label className="flex gap-3 rounded-2xl border border-[#e0d5bb] bg-white/60 p-4 text-sm leading-6 text-[#667268]">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#173f2d]"
                    />
                    <span>
                      Autorizo o armazenamento dos dados que eu fornecer para viabilizar minha anamnese, resultado, práticas e acompanhamento.
                    </span>
                  </label>
                )}

                {errorMessage && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {errorMessage}
                  </div>
                )}

                {message && (
                  <div className="rounded-xl border border-[#cad9c8] bg-[#edf3e9] p-3 text-sm text-[#41604b]">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-[#173f2d] px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-[#22533d] disabled:opacity-50"
                >
                  {busy ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar minha conta'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setMessage('');
                  setErrorMessage('');
                }}
                className="mt-5 w-full text-center text-sm font-medium text-[#806c3f] hover:text-[#5f4f2d]"
              >
                {mode === 'signin' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
