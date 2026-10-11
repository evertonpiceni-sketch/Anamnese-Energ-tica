import { lazy, Suspense, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
const AdminApp = lazy(() => import('./AdminApp'));
const AdminCommercialPaymentPanel = lazy(() => import('./components/AdminCommercialPaymentPanel').then(module => ({ default: module.AdminCommercialPaymentPanel })));
import UserAnamneseApp from './components/UserAnamneseApp';
import { PasswordSetupScreen } from './components/PasswordSetupScreen';
import { AuthScreen } from './components/AuthScreen';
import { UserPaymentPanel } from './components/UserPaymentPanel';
import { supabase } from './lib/supabase';
import { verifyPasswordLink } from './lib/authRecovery';

type AppRole = 'user' | 'admin';

const LEGACY_SUBMISSIONS_KEY = 'anamnese-integrativa-submissions-v1';

function clearLegacySensitiveLocalData() {
  try {
    localStorage.removeItem(LEGACY_SUBMISSIONS_KEY);
  } catch {
    // Falha de armazenamento local não deve impedir autenticação ou encerramento de sessão.
  }
}

function recoveryIntentFromUrl() {
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const type = hash.get('type') || url.searchParams.get('type');
  return url.searchParams.get('setup') === 'password' || type === 'recovery' || type === 'invite';
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linkVerifying, setLinkVerifying] = useState(() => {
    const url = new URL(window.location.href);
    const hash = new URLSearchParams(url.hash.slice(1));
    return url.searchParams.has('token_hash') || (hash.has('access_token') && hash.has('refresh_token'));
  });
  const [passwordSetup, setPasswordSetup] = useState(recoveryIntentFromUrl);

  useEffect(() => {
    let active = true;
    let revision = 0;

    clearLegacySensitiveLocalData();

    async function resolveSession(nextSession: Session | null) {
      if (!active) return;
      const currentRevision = ++revision;
      setSession(nextSession);
      setRole(null);
      setProfileError('');

      if (!nextSession?.user) {
        clearLegacySensitiveLocalData();
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', nextSession.user.id)
          .single();

        if (!active || revision !== currentRevision) return;

        if (error) {
          setProfileError('Não foi possível carregar as permissões desta conta.');
          setLoading(false);
          return;
        }

        setRole(data?.role === 'admin' ? 'admin' : 'user');
        setLoading(false);
      } catch {
        if (active && revision === currentRevision) {
          setProfileError('Não foi possível carregar as permissões desta conta.');
          setLoading(false);
        }
      }
    }

    async function bootstrapSession() {
      const initialUrl = new URL(window.location.href);
      const hash = new URLSearchParams(initialUrl.hash.slice(1));
      const recoveryType = hash.get('type');

      try {
        if (initialUrl.searchParams.has('token_hash')) {
          const nextSession = await verifyPasswordLink(initialUrl.href);
          if (!active) return;
          setPasswordSetup(true);
          setLinkVerifying(false);
          await resolveSession(nextSession);
          return;
        }

        if (
          ['recovery', 'invite'].includes(recoveryType || '') &&
          hash.get('access_token') &&
          hash.get('refresh_token')
        ) {
          const { data, error } = await supabase.auth.setSession({
            access_token: hash.get('access_token')!,
            refresh_token: hash.get('refresh_token')!,
          });
          if (error || !data.session) throw error || new Error('Sessão de recuperação não encontrada.');
          if (!active) return;

          setPasswordSetup(true);
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.set('setup', 'password');
          cleanUrl.hash = '';
          window.history.replaceState({}, '', cleanUrl);
          setLinkVerifying(false);
          await resolveSession(data.session);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (!active || revision !== 0) return;
        if (error) {
          setLoading(false);
          setLinkVerifying(false);
          return;
        }
        await resolveSession(data.session);
        setLinkVerifying(false);
      } catch {
        if (!active) return;
        setLinkVerifying(false);
        setLinkError('O link expirou, já foi utilizado ou não pôde ser validado. Solicite um novo link em “Esqueci minha senha”.');
        setLoading(false);
      }
    }

    void bootstrapSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordSetup(true);
      setTimeout(() => {
        if (active) void resolveSession(nextSession);
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    clearLegacySensitiveLocalData();
    await supabase.auth.signOut();
  }

  if (!linkVerifying && session && passwordSetup) {
    return (
      <PasswordSetupScreen
        onComplete={() => {
          setPasswordSetup(false);
          const url = new URL(window.location.href);
          url.searchParams.delete('setup');
          url.searchParams.delete('token_hash');
          url.searchParams.delete('token');
          url.searchParams.delete('type');
          url.hash = '';
          window.history.replaceState({}, '', url);
        }}
      />
    );
  }

  if (loading || linkVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e6] px-5 text-[#173c2c]">
        <div className="text-center">
          <img
            src="/logo-everton-oficial.png"
            alt="Everton Piceni"
            className="mx-auto h-20 w-20 object-contain"
          />
          <div className="mt-5 font-serif text-2xl">Preparando seu espaço...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthScreen initialError={linkError} />;
  }

  if (profileError || !role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e6] px-5">
        <div className="max-w-md rounded-2xl border border-[#d8c99f] bg-[#fffaf0] p-7 text-center text-[#173c2c]">
          <h1 className="font-serif text-2xl">Não foi possível abrir sua área.</h1>
          <p className="mt-3 text-sm leading-6 text-[#667268]">
            {profileError || 'O perfil desta conta ainda não está disponível.'}
          </p>
          <button
            type="button"
            onClick={signOut}
            className="mt-5 rounded-full border border-[#cdbc91] px-5 py-2.5 text-sm font-semibold"
          >
            Sair e tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <>
        <Suspense fallback={<p className="p-8">Preparando sua área...</p>}><AdminApp onSignOut={signOut} /><AdminCommercialPaymentPanel /></Suspense>
      </>
    );
  }

  return (
    <>
      <UserAnamneseApp key={session.user.id} userId={session.user.id} onSignOut={signOut} />
      <UserPaymentPanel />
    </>
  );
}
