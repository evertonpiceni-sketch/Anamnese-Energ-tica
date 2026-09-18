import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import AdminApp from './AdminApp';
import UserAnamneseApp from './components/UserAnamneseApp';
import { AuthScreen } from './components/AuthScreen';
import { supabase } from './lib/supabase';

type AppRole = 'user' | 'admin';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    let active = true;

    async function resolveSession(nextSession: Session | null) {
      if (!active) return;
      setSession(nextSession);
      setRole(null);
      setProfileError('');

      if (!nextSession?.user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', nextSession.user.id)
        .single();

      if (!active) return;

      if (error) {
        setProfileError('Não foi possível carregar as permissões desta conta.');
        setLoading(false);
        return;
      }

      setRole(data?.role === 'admin' ? 'admin' : 'user');
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => resolveSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      resolveSession(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e6] px-5 text-[#173c2c]">
        <div className="text-center">
          <img
            src="/logo-everton-oficial.svg"
            alt="Everton Piceni"
            className="mx-auto h-20 w-20 rounded-full object-cover"
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
    return <AdminApp onSignOut={signOut} />;
  }

  return <UserAnamneseApp userId={session.user.id} onSignOut={signOut} />;
}
