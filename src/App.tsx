import { lazy, Suspense, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
const AdminApp = lazy(() => import('./AdminApp'));
const AdminCommercialPaymentPanel = lazy(() => import('./components/AdminCommercialPaymentPanel').then(module => ({ default: module.AdminCommercialPaymentPanel })));
import UserAnamneseApp from './components/UserAnamneseApp';
import { AuthScreen } from './components/AuthScreen';
import { UserPaymentPanel } from './components/UserPaymentPanel';
import { supabase } from './lib/supabase';

type AppRole = 'user' | 'admin';

const LEGACY_SUBMISSIONS_KEY = 'anamnese-integrativa-submissions-v1';

function clearLegacySensitiveLocalData() {
  try {
    localStorage.removeItem(LEGACY_SUBMISSIONS_KEY);
  } catch {
    // Falha de armazenamento local não deve impedir autenticação ou encerramento de sessão.
  }
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

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
        if (active && revision === currentRevision) { setProfileError('Não foi possível carregar as permissões desta conta.'); setLoading(false); }
      }
    }

    supabase.auth.getSession().then(({ data, error }) => { if (revision === 0) { if (error) setLoading(false); else void resolveSession(data.session); } }).catch(() => { if (active && revision === 0) setLoading(false); });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setTimeout(() => { if (active) void resolveSession(nextSession); }, 0);
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

  if (loading) {
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
    return <AuthScreen />;
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
