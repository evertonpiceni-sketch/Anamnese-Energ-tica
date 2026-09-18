import { AudioLines, Fingerprint, Layers3, ShieldCheck } from 'lucide-react';
import { PreparatoryAudioAdminCard } from './PreparatoryAudioAdminCard';

export function AudioLibraryView() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400">
            <AudioLines className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-100">Gerador de Áudios Personalizados</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-400">
              Não existe biblioteca de áudios finais reutilizáveis. Cada sessão sonora nasce da anamnese daquela pessoa
              e da combinação específica de sistemas, recursos, Solfeggio e apoios selecionados para aquele momento.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={<Fingerprint className="h-5 w-5" />}
          title="Exclusivo por usuário"
          text="Cada plano recebe um identificador próprio e fica vinculado a uma única anamnese."
        />
        <InfoCard
          icon={<Layers3 className="h-5 w-5" />}
          title="Composição única"
          text="Sistema-base, sistema principal, complementares, recursos internos e Solfeggio formam a assinatura da sessão."
        />
        <InfoCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Sem reaproveitamento automático"
          text="Mesmo que duas pessoas tenham prioridades parecidas, o áudio final não é tratado como o mesmo arquivo nem como tratamento genérico."
        />
      </div>

      <PreparatoryAudioAdminCard />

      <section className="mt-5 rounded-2xl border border-stone-800 bg-stone-900 p-6">
        <h2 className="font-semibold text-stone-100">O que a biblioteca passa a guardar</h2>
        <div className="mt-4 grid gap-3 text-sm text-stone-400 sm:grid-cols-2">
          <div className="rounded-xl bg-stone-950/60 p-4">Blocos de locução e estrutura de sessão</div>
          <div className="rounded-xl bg-stone-950/60 p-4">Sistemas e recursos energéticos documentados</div>
          <div className="rounded-xl bg-stone-950/60 p-4">Regras de composição por eixo e prioridade</div>
          <div className="rounded-xl bg-stone-950/60 p-4">Solfeggio e elementos sonoros de fundo</div>
          <div className="rounded-xl bg-stone-950/60 p-4">Florais, aromaterapia e cristais etéricos indicados</div>
          <div className="rounded-xl bg-stone-950/60 p-4">Histórico de versões geradas para cada usuário</div>
        </div>
      </section>
    </div>
  );
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
      <div className="text-amber-400">{icon}</div>
      <h2 className="mt-3 font-semibold text-stone-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-stone-400">{text}</p>
    </article>
  );
}
