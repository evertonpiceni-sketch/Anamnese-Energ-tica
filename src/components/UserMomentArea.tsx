import { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Flower2,
  Gem,
  Headphones,
  History,
  Leaf,
  RefreshCcw,
  Sparkles,
  Waves,
} from 'lucide-react';
import { ProgrammedAudioCard } from './ProgrammedAudioCard';
import { PreparatoryAudioCard } from './PreparatoryAudioCard';
import { PracticeHistory } from './PracticeHistory';
import { loadUserMoment, UserMomentData } from '../services/userMomentBackend';
import { downloadUserResultPdf } from '../pdf/userResultPdf';

interface UserMomentAreaProps {
  mode: 'momento' | 'jornada';
  onStartNewIntake: () => void;
}

export function UserMomentArea({ mode, onStartNewIntake }: UserMomentAreaProps) {
  const [data, setData] = useState<UserMomentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function refresh() {
    setLoading(true);
    setMessage('');
    try {
      setData(await loadUserMoment());
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar seu cuidado agora.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const firstName = useMemo(
    () => data?.intake?.personName?.trim().split(/\s+/)[0] || '',
    [data?.intake?.personName]
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-8 text-center text-[#52665b]">
        Carregando seu espaço de cuidado...
      </div>
    );
  }

  if (message) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-8">
        <div className="text-sm leading-6 text-[#7b5f45]">{message}</div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#173f2d] px-5 py-3 font-semibold text-white"
        >
          <RefreshCcw className="h-4 w-4" /> Tentar novamente
        </button>
      </div>
    );
  }

  if (!data?.intake) {
    return (
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-[#b89546]" />
        <h2 className="mt-4 font-serif text-3xl text-[#173c2c]">
          Seu espaço começa pela anamnese.
        </h2>
        <p className="mt-3 leading-7 text-[#627067]">
          Quando você concluir sua primeira anamnese, seu momento e o acompanhamento que estiverem efetivamente liberados aparecerão aqui.
        </p>
        <button
          type="button"
          onClick={onStartNewIntake}
          className="mt-6 rounded-full bg-[#173f2d] px-6 py-3 font-semibold text-white"
        >
          Iniciar minha anamnese
        </button>
      </div>
    );
  }

  if (mode === 'momento') {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-7 shadow-xl shadow-[#173f2d]/8 sm:p-9">
          <div className="text-xs font-semibold tracking-[0.18em] text-[#a18443]">
            MEU MOMENTO
          </div>

          {!data.entitlement ? (
            <>
              <h1 className="mt-3 font-serif text-3xl text-[#173c2c]">
                {firstName
                  ? `${firstName}, sua anamnese foi recebida.`
                  : 'Sua anamnese foi recebida.'}
              </h1>
              <p className="mt-4 leading-7 text-[#5c6d62]">
                Neste momento ainda não existe um plano comercial ativo vinculado a esta anamnese. Por segurança, nenhum relatório completo, recurso ou áudio é liberado por suposição.
              </p>
              <div className="mt-6 rounded-2xl border border-[#dfcf9d] bg-[#fff6df] p-5 text-sm leading-6 text-[#715f36]">
                Assim que a contratação estiver confirmada, esta área passa a mostrar somente aquilo que fizer parte do seu cuidado e estiver efetivamente publicado.
              </div>
            </>
          ) : data.result ? (
            <>
              <EntitlementBadge days={data.entitlement.days} />
              <h1 className="mt-3 font-serif text-3xl leading-tight text-[#173c2c]">
                {data.result.headline}
              </h1>
              <p className="mt-4 leading-7 text-[#5c6d62]">{data.result.intro}</p>

              <div className="mt-6 space-y-3">
                {data.result.priorities.map(item => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#e0d5bb] bg-white/60 p-4 text-sm leading-6 text-[#50665a]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-[#e9efe4] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d7743]">
                  Intenção para o próximo passo
                </div>
                <p className="mt-2 leading-7 text-[#365441]">
                  {data.result.intention}
                </p>
              </div>

              <p className="mt-6 text-sm leading-6 text-[#748077]">
                {data.result.closing}
              </p>

              <button
                type="button"
                onClick={() =>
                  downloadUserResultPdf({
                    nome: data.intake?.personName || 'Pessoa',
                    data: data.intake?.completedAt?.slice(0, 10) || '',
                    headline: data.result!.headline,
                    intro: data.result!.intro,
                    priorities: data.result!.priorities,
                    intention: data.result!.intention,
                    closing: data.result!.closing,
                    composition: null,
                    publicCare: {
                      solfeggio: data.carePlan?.solfeggio || null,
                      floralNames:
                        data.carePlan?.floral
                          ?.map(item => item?.nome)
                          .filter(Boolean) || [],
                      aromatherapyNames:
                        data.carePlan?.aromatherapy
                          ?.map(item => item?.nome)
                          .filter(Boolean) || [],
                      crystalNames:
                        data.carePlan?.ethericCrystals
                          ?.map(item => item?.nome)
                          .filter(Boolean) || [],
                      hasExclusiveAudio: Boolean(
                        data.carePlan?.audioStatus === 'published'
                      ),
                    },
                  })
                }
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#cdbc91] bg-white/70 px-5 py-3 font-semibold text-[#53675b]"
              >
                <Download className="h-4 w-4" /> Baixar meu resultado em PDF
              </button>
            </>
          ) : (
            <>
              <EntitlementBadge days={data.entitlement.days} />
              <h1 className="mt-3 font-serif text-3xl text-[#173c2c]">
                {firstName
                  ? `${firstName}, seu cuidado já está em preparação.`
                  : 'Seu cuidado já está em preparação.'}
              </h1>
              <p className="mt-4 leading-7 text-[#5c6d62]">
                A contratação está confirmada. Sua composição individual ainda passa pela revisão antes de aparecer como resultado permanente.
              </p>
              <div className="mt-6 rounded-2xl border border-[#dfcf9d] bg-[#fff6df] p-5 text-sm leading-6 text-[#715f36]">
                Nada é improvisado: o conteúdo permanente só é publicado depois da revisão administrativa.
              </div>
            </>
          )}
        </section>

        <button
          type="button"
          onClick={onStartNewIntake}
          className="inline-flex items-center gap-2 rounded-full border border-[#cdbc91] bg-white/70 px-5 py-3 font-semibold text-[#53675b]"
        >
          Nova anamnese
        </button>
      </div>
    );
  }

  if (!data.entitlement) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-7 shadow-xl shadow-[#173f2d]/8 sm:p-9">
          <div className="text-xs font-semibold tracking-[0.18em] text-[#a18443]">
            MINHA JORNADA
          </div>
          <h1 className="mt-3 font-serif text-3xl text-[#173c2c]">
            {firstName
              ? `${firstName}, sua jornada ainda não foi liberada.`
              : 'Sua jornada ainda não foi liberada.'}
          </h1>
          <p className="mt-4 leading-7 text-[#5c6d62]">
            Sua anamnese está registrada, mas ainda não há um plano comercial ativo confirmado para esta etapa.
          </p>
          <div className="mt-6 rounded-2xl border border-[#dfcf9d] bg-[#fff6df] p-5 text-sm leading-6 text-[#715f36]">
            Por isso, o áudio preparativo, o áudio exclusivo e os demais recursos permanecem protegidos até a confirmação da contratação.
          </div>
        </section>
      </div>
    );
  }

  const exclusiveAudioPublished =
    data.carePlan?.audioStatus === 'published' && Boolean(data.audio);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-7 shadow-xl shadow-[#173f2d]/8 sm:p-9">
        <div className="text-xs font-semibold tracking-[0.18em] text-[#a18443]">
          MINHA JORNADA
        </div>
        <EntitlementBadge days={data.entitlement.days} />
        <h1 className="mt-3 font-serif text-3xl text-[#173c2c]">
          {firstName
            ? `${firstName}, este é o seu cuidado atual.`
            : 'Este é o seu cuidado atual.'}
        </h1>
        <p className="mt-3 leading-7 text-[#5c6d62]">
          Aqui ficam reunidos somente os recursos que já foram liberados para o seu momento atual e o seu histórico de práticas.
        </p>
      </section>

      {exclusiveAudioPublished && data.audio ? (
        <ProgrammedAudioCard audio={data.audio} />
      ) : (
        <>
          <section className="rounded-2xl border border-[#dfcf9d] bg-[#fff6df] p-5 text-sm leading-6 text-[#715f36]">
            Sua contratação está confirmada e o material personalizado ainda está em preparação. Enquanto isso, o áudio preparativo do protocolo pode acompanhar este período de espera, quando estiver publicado.
          </section>
          <PreparatoryAudioCard />
        </>
      )}

      {data.carePlan ? (
        <section className="grid gap-4 md:grid-cols-2">
          <JourneyResource
            icon={<Waves className="h-5 w-5" />}
            title="Frequência da sessão"
            value={
              data.carePlan.solfeggio?.hz
                ? `${data.carePlan.solfeggio.hz} Hz • ${data.carePlan.solfeggio.chakraProjeto || ''}`
                : 'Sem frequência publicada neste momento'
            }
          />
          <JourneyResource
            icon={<Flower2 className="h-5 w-5" />}
            title="Floral"
            value={names(
              data.carePlan.floral,
              'Nenhum floral publicado neste momento'
            )}
          />
          <JourneyResource
            icon={<Leaf className="h-5 w-5" />}
            title="Aromaterapia"
            value={names(
              data.carePlan.aromatherapy,
              'Nenhum recurso publicado neste momento'
            )}
          />
          <JourneyResource
            icon={<Gem className="h-5 w-5" />}
            title="Cristais etéricos"
            value={names(
              data.carePlan.ethericCrystals,
              'Nenhum cristal publicado neste momento'
            )}
          />
        </section>
      ) : (
        <section className="rounded-2xl border border-[#dfcf9d] bg-[#fff6df] p-5 text-sm leading-6 text-[#715f36]">
          A composição individual ainda está sendo revisada. Os recursos específicos aparecerão aqui somente depois da publicação.
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-2 text-[#365441]">
          <History className="h-5 w-5 text-[#a18443]" />
          <h2 className="font-semibold">Histórico</h2>
        </div>
        <PracticeHistory />
      </section>

      <section className="rounded-2xl border border-[#e0d5bb] bg-white/55 p-5">
        <div className="flex items-start gap-3">
          <Headphones className="mt-0.5 h-5 w-5 text-[#a18443]" />
          <div>
            <h2 className="font-semibold text-[#365441]">Reavaliação</h2>
            <p className="mt-2 text-sm leading-6 text-[#677268]">
              A reavaliação será liberada para registrar o que mudou, o que permaneceu e o que precisa de um novo cuidado.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function EntitlementBadge({ days }: { days: 7 | 21 }) {
  return (
    <div className="mt-4 inline-flex rounded-full border border-[#d4c28e] bg-[#f7efd9] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#856e37]">
      Percurso de {days} dias confirmado
    </div>
  );
}

function names(items: any[], empty: string) {
  const values = items
    .map(item => (typeof item === 'string' ? item : item?.nome))
    .filter(Boolean);
  return values.length ? values.join(', ') : empty;
}

function JourneyResource({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#e9efe4] p-2.5 text-[#28533d]">{icon}</div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a18443]">
            {title}
          </div>
          <div className="mt-2 text-sm leading-6 text-[#4f6257]">{value}</div>
        </div>
      </div>
    </div>
  );
}
