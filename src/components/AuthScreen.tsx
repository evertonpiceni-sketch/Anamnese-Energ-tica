import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { verifyPasswordLink } from '../lib/authRecovery';
import { PrivacyPolicy } from './PrivacyPolicy';

type Mode = 'signin' | 'signup';

const PRODUCTION_APP_URL = 'https://relatorioenergetico.vercel.app';
const RECOVERY_COOLDOWN_SECONDS = 60;
const RECOVERY_COOLDOWN_KEY = 'anamnese-recovery-next-at';

function validPassword(password: string) {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('password should contain') || normalized.includes('password should be')) {
    return 'Sua senha precisa ter pelo menos 8 caracteres e combinar letras e números.';
  }
  if (normalized.includes('email address not authorized')) {
    return 'Não foi possível enviar o e-mail de confirmação para este endereço agora. Tente novamente mais tarde ou entre em contato com o atendimento.';
  }
  if (normalized.includes('email rate limit exceeded') || normalized.includes('over_email_send_rate_limit') || normalized.includes('rate limit')) {
    return 'O serviço de e-mail está protegendo sua conta porque houve vários pedidos em sequência. Aguarde um pouco antes de solicitar outro link. Se você já recebeu um e-mail recente, use somente o link mais novo.';
  }
  if (normalized.includes('one-time token not found') || normalized.includes('invalid or has expired') || normalized.includes('expired') || normalized.includes('link is invalid')) {
    return 'Este link de recuperação não está mais válido. Por segurança, os links são de uso único. Volte ao acesso e solicite um novo link quando o botão estiver disponível novamente.';
  }
  if (normalized.includes('invalid login credentials')) {
    return 'Não foi possível entrar com esses dados. Confira o e-mail e a senha. Se você já criou esta conta e não lembra a senha, use “Esqueci minha senha”.';
  }
  if (normalized.includes('email not confirmed')) {
    return 'Seu e-mail ainda precisa ser confirmado. Verifique sua caixa de entrada e, se necessário, a pasta de spam.';
  }
  return message;
}

function remainingRecoverySeconds() {
  try {
    const nextAt = Number(localStorage.getItem(RECOVERY_COOLDOWN_KEY) || 0);
    return Math.max(0, Math.ceil((nextAt - Date.now()) / 1000));
  } catch {
    return 0;
  }
}

export function AuthScreen({ initialError = '' }: { initialError?: string }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState(initialError ? friendlyAuthError(initialError) : '');
  const [recoveryRequested, setRecoveryRequested] = useState(false);
  const [recoveryLink, setRecoveryLink] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [recoveryCooldown, setRecoveryCooldown] = useState(remainingRecoverySeconds);

  useEffect(() => {
    if (recoveryCooldown <= 0) return;
    const timer = window.setInterval(() => setRecoveryCooldown(remainingRecoverySeconds()), 1000);
    return () => window.clearInterval(timer);
  }, [recoveryCooldown]);

  function startRecoveryCooldown(seconds = RECOVERY_COOLDOWN_SECONDS) {
    const nextAt = Date.now() + seconds * 1000;
    try { localStorage.setItem(RECOVERY_COOLDOWN_KEY, String(nextAt)); } catch { /* sem persistência */ }
    setRecoveryCooldown(seconds);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setErrorMessage('');

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
        if (error) throw error;
        return;
      }

      if (!consent) {
        setErrorMessage('Para criar a conta, confirme o consentimento de uso dos dados para esta experiência.');
        return;
      }

      if (!validPassword(password)) {
        setErrorMessage('Sua senha precisa ter pelo menos 8 caracteres e combinar letras e números.');
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: PRODUCTION_APP_URL,
          data: {
            display_name: name.trim(),
            consent_lgpd: true,
          },
        },
      });

      if (error) throw error;

      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setMode('signin');
        setErrorMessage('Este e-mail já possui uma conta. Entre com sua senha ou use “Esqueci minha senha” para criar uma nova. Não é necessário fazer outro cadastro.');
        return;
      }

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
          ? 'Conta criada. Seu acesso já está disponível.'
          : 'Cadastro recebido. Enviamos um e-mail para confirmar seu acesso. Abra o link mais recente recebido antes de tentar entrar.'
      );
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Não foi possível concluir o acesso.';
      setErrorMessage(friendlyAuthError(raw));
    } finally {
      setBusy(false);
    }
  }

  async function recoverPassword() {
    setMessage('');
    setErrorMessage('');

    const remaining = remainingRecoverySeconds();
    if (remaining > 0) {
      setRecoveryCooldown(remaining);
      setMessage(`Para proteger seu acesso, aguarde ${remaining} segundo${remaining === 1 ? '' : 's'} antes de pedir outro link.`);
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Informe seu e-mail para receber o link de recuperação.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo: `${PRODUCTION_APP_URL}/?setup=password` });
      if (error) throw error;
      startRecoveryCooldown();
      setRecoveryRequested(true);
      setMessage('Pedido enviado. Abra somente o e-mail de recuperação mais recente. Ao tocar no link, você será levado diretamente à tela para escolher uma nova senha. Confira também o spam.');
    } catch (error) {
      const raw = error instanceof Error ? error.message : 'Não foi possível enviar o link agora.';
      if (raw.toLowerCase().includes('rate limit')) startRecoveryCooldown();
      setErrorMessage(friendlyAuthError(raw));
    } finally {
      setBusy(false);
    }
  }

  async function openRecoveryLink() {
    setBusy(true);
    setErrorMessage('');
    try {
      await verifyPasswordLink(recoveryLink.trim());
      window.location.reload();
    } catch (cause) {
      const raw = cause instanceof Error ? cause.message : 'Não foi possível verificar o link.';
      setErrorMessage(friendlyAuthError(raw));
    } finally {
      setBusy(false);
    }
  }

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  return (
    <div className="min-h-screen px-5 py-8 text-[#173c2c] sm:py-10">
      <div className="mx-auto flex min-h-[82vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-[#d8c99f]/85 bg-[#fffaf0]/96 shadow-[0_28px_85px_rgba(23,63,45,.14)] lg:grid-cols-[.94fr_1.06fr]">
          <div
            className="relative isolate flex min-h-[330px] flex-col justify-between overflow-hidden p-7 text-white sm:p-10 lg:min-h-[560px] lg:p-11"
            style={{
              backgroundImage: 'linear-gradient(180deg,rgba(18,56,38,.34),rgba(16,49,34,.78)),url(/natureza-aprovada.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 66%'
            }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(255,246,214,.12),transparent_30%)]" />
            <div className="relative z-10">
              <img
                src="/logo-everton-oficial.png"
                alt="Everton Piceni"
                className="h-28 w-28 object-contain opacity-80 drop-shadow-[0_10px_30px_rgba(0,0,0,.16)] lg:h-36 lg:w-36"
              />
              <div className="mt-8 text-xs font-semibold tracking-[0.2em] text-[#ead79d]">ANAMNESE INTEGRATIVA</div>
              <h1 className="mt-4 max-w-md font-serif text-4xl leading-[1.08] text-[#fffdf7] sm:text-[2.7rem]">Um momento para respirar e voltar para você.</h1>
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[#edf3ee]">O que você compartilha aqui orienta uma leitura sensível e um percurso de cuidado construído no seu ritmo.</p>
            </div>
            <p className="relative z-10 mt-8 max-w-sm text-xs leading-5 text-[#d8e4dc]">Seu espaço é privado. Suas respostas são tratadas com cuidado e respeito.</p>
          </div>

          <div className="flex items-center p-7 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-md">
              <div className="lg:hidden"><img src="/logo-everton-oficial.png" alt="Everton Piceni" className="h-20 w-20 object-contain opacity-80" /></div>

              <div className="mt-5 lg:mt-0">
                <div className="text-xs font-semibold tracking-[0.18em] text-[#a18443]">{mode === 'signin' ? 'SEU ESPAÇO DE ACESSO' : 'SEU NOVO ACESSO'}</div>
                <h2 className="mt-2 font-serif text-[2.15rem] leading-tight text-[#173c2c]">{mode === 'signin' ? 'Entre para continuar' : 'Crie seu acesso'}</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#68736b]">{mode === 'signin' ? 'Use seu e-mail e senha para acessar seu espaço com segurança.' : 'Crie seu acesso para que sua jornada possa ser salva com segurança.'}</p>
              </div>

              <form onSubmit={submit} className="mt-8 space-y-5">
                {mode === 'signup' && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[#365441]">Seu nome</span>
                    <div className="relative">
                      <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8b68]" />
                      <input value={name} onChange={e => setName(e.target.value)} className="user-input pl-11" placeholder="Como prefere ser chamado(a)" />
                    </div>
                  </label>
                )}

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#365441]">E-mail</span>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8b68]" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="user-input pl-11" placeholder="voce@exemplo.com" />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#365441]">Senha</span>
                  <div className="relative">
                    <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8b68]" />
                    <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={e => setPassword(e.target.value)} className="user-input pl-11 pr-12" autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder={mode === 'signin' ? 'Sua senha' : '8+ caracteres, com letras e números'} />
                    <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'} aria-pressed={showPassword} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#365441]">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                  </div>
                  {mode === 'signup' && <span className="mt-2 block text-xs leading-5 text-[#7b837d]">Use pelo menos 8 caracteres e combine letras e números.</span>}
                </label>

                {mode === 'signup' && (
                  <label className="flex gap-3 rounded-2xl border border-[#e0d5bb] bg-white/60 p-4 text-sm leading-6 text-[#667268]">
                    <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-[#173f2d]" />
                    <span>Li a Política de Privacidade e autorizo, de forma específica, o tratamento dos dados que eu fornecer — inclusive dados pessoais sensíveis presentes na anamnese — para viabilizar minha análise, composição individual do cuidado, materiais, práticas e acompanhamento.</span>
                  </label>
                )}

                {mode === 'signup' && <button type="button" onClick={() => setShowPrivacy(true)} className="text-left text-xs font-semibold text-[#806c3f] underline underline-offset-4">Ler Política de Privacidade e LGPD</button>}

                {errorMessage && <div className="rounded-2xl border border-[#e4c3b9] bg-[#fff5f1] px-4 py-3 text-sm leading-6 text-[#9b4e40]">{errorMessage}</div>}
                {message && <div className="rounded-2xl border border-[#cad9c8] bg-[#edf3e9] px-4 py-3 text-sm leading-6 text-[#41604b]">{message}</div>}

                <button type="submit" disabled={busy} className="w-full rounded-full bg-[#173f2d] px-6 py-3.5 font-semibold text-white shadow-[0_10px_25px_rgba(23,63,45,.18)] transition hover:bg-[#22533d] disabled:opacity-50">{busy ? 'Aguarde...' : mode === 'signin' ? 'Acessar meu espaço' : 'Criar minha conta'}</button>

                {mode === 'signin' && (
                  <button
                    type="button"
                    disabled={busy || recoveryCooldown > 0}
                    onClick={() => void recoverPassword()}
                    className="w-full text-center text-sm font-medium text-[#806c3f] underline decoration-[#c4ad73] underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-55"
                  >
                    {recoveryCooldown > 0 ? `Solicitar novo link em ${recoveryCooldown}s` : 'Esqueci minha senha'}
                  </button>
                )}
              </form>

              {recoveryRequested && (
                <div className="mt-5 space-y-3 rounded-2xl border border-[#d8c99f] bg-white/70 p-4">
                  <p className="text-sm leading-6">Ao abrir o link mais recente, a tela de nova senha deve aparecer automaticamente. Se isso não acontecer, copie o endereço completo do link recebido e cole abaixo.</p>
                  <label className="block text-sm font-semibold">Link recebido no e-mail<input type="url" autoComplete="off" value={recoveryLink} onChange={event => setRecoveryLink(event.target.value)} className="user-input mt-2" /></label>
                  <button type="button" disabled={busy || !recoveryLink.trim()} onClick={() => void openRecoveryLink()} className="w-full rounded-full bg-[#173f2d] px-5 py-3 font-semibold text-white disabled:opacity-50">Abrir tela de nova senha</button>
                </div>
              )}

              <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); setErrorMessage(''); }} className="mt-6 w-full text-center text-sm font-medium text-[#806c3f] hover:text-[#5f4f2d]">{mode === 'signin' ? 'Ainda não tenho conta' : 'Já tenho uma conta'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
