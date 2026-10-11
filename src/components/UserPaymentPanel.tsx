import { useEffect, useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import { canAccessFullReport } from '../commercial/entitlements';
import { createInfinitePayCheckout, InfinitePayAmountCents } from '../services/infinitePayCheckout';
import { loadUserMoment, UserMomentData } from '../services/userMomentBackend';

const INITIAL_OPTIONS: Array<{
  amountCents: InfinitePayAmountCents;
  title: string;
  price: string;
  description: string;
}> = [
  {
    amountCents: 100,
    title: 'Plano teste — 7 dias',
    price: 'R$ 1,00',
    description: 'Plano válido de teste para conferir o fluxo completo de pagamento e liberação do cuidado básico.',
  },
  {
    amountCents: 5000,
    title: 'Cuidado personalizado — 7 dias',
    price: 'R$ 50',
    description: 'Áudio personalizado exclusivo por 7 dias, sem meditação guiada.',
  },
  {
    amountCents: 6500,
    title: 'Cuidado personalizado + leitura completa',
    price: 'R$ 65',
    description: 'Áudio personalizado por 7 dias e Relatório Completo da sua anamnese.',
  },
  {
    amountCents: 10000,
    title: 'Cuidado com meditação guiada — 7 dias',
    price: 'R$ 100',
    description: 'Áudio personalizado com meditação guiada e Relatório Completo incluído.',
  },
  {
    amountCents: 18000,
    title: 'Jornada de 21 dias',
    price: 'R$ 180',
    description: 'Percurso ampliado de 21 dias, com meditação guiada e Relatório Completo.',
  },
];

export function UserPaymentPanel() {
  const [data, setData] = useState<UserMomentData | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<InfinitePayAmountCents | null>(null);
  const [message, setMessage] = useState('');

  async function refresh() {
    setLoading(true);
    try {
      setData(await loadUserMoment());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener('focus', onFocus);
    const timer = window.setInterval(() => void refresh(), 12_000);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(timer);
    };
  }, []);

  if (loading || !data?.intake) return null;

  const basicNeedsFullReport =
    data.entitlement?.productCode === 'CARE_7_BASIC' &&
    !canAccessFullReport(data.entitlement);

  if (data.entitlement && !basicNeedsFullReport) return null;

  const options = data.entitlement
    ? [
        {
          amountCents: 1500 as InfinitePayAmountCents,
          title: 'Leitura completa da sua anamnese',
          price: '+ R$ 15',
          description: 'Libera o Relatório Completo mantendo o seu cuidado de 7 dias exatamente como contratado.',
        },
      ]
    : INITIAL_OPTIONS;

  async function startCheckout(amountCents: InfinitePayAmountCents) {
    if (!data?.intake?.id) return;
    setPaying(amountCents);
    setMessage('');
    try {
      const checkout = await createInfinitePayCheckout({
        intakeId: data.intake.id,
        amountCents,
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível abrir o pagamento agora.'
      );
      setPaying(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#173f2d] px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-[#173f2d]/20 transition hover:-translate-y-0.5 hover:bg-[#22533d]"
      >
        <CreditCard className="h-4 w-4" />
        {data.entitlement ? 'Relatório completo + R$ 15' : 'Escolher meu cuidado'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0] p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-[0.18em] text-[#a18443]">
                  PAGAMENTO SEGURO • INFINITEPAY
                </div>
                <h2 className="mt-2 font-serif text-3xl text-[#173c2c]">
                  {data.entitlement ? 'Conheça sua leitura completa' : 'Escolha o cuidado que faz sentido para você'}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#667268]">
                  O pagamento é processado pela InfinitePay. Seu acesso só é liberado depois da confirmação real do pagamento.
                </p>
                <p className="mt-2 max-w-2xl text-xs leading-5 text-[#7a817b]">
                  Em pagamentos com cartão, podem existir taxas e encargos informados pela InfinitePay antes da confirmação. O pagamento pode ser parcelado em até 6x com juros, conforme as condições apresentadas no checkout.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#d8c99f] p-2 text-[#667268]"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {options.map(option => (
                <article
                  key={option.amountCents}
                  className="flex flex-col rounded-2xl border border-[#dfd2b5] bg-white/65 p-5"
                >
                  <div className="font-serif text-xl text-[#214b38]">{option.title}</div>
                  <div className="mt-2 text-2xl font-semibold text-[#8b7135]">{option.price}</div>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#627067]">{option.description}</p>
                  <button
                    type="button"
                    disabled={paying !== null}
                    onClick={() => void startCheckout(option.amountCents)}
                    className="mt-5 rounded-full bg-[#173f2d] px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60"
                  >
                    {paying === option.amountCents ? 'Abrindo InfinitePay...' : 'Continuar para pagamento'}
                  </button>
                </article>
              ))}
            </div>

            {message && (
              <div className="mt-5 rounded-2xl border border-[#e0c7aa] bg-[#fff4e8] p-4 text-sm leading-6 text-[#805b45]">
                {message}
              </div>
            )}

            <p className="mt-5 text-xs leading-5 text-[#7a817b]">
              A confirmação comercial não altera sua anamnese nem o conteúdo técnico do seu cuidado. Ela apenas libera os recursos correspondentes ao plano escolhido.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
