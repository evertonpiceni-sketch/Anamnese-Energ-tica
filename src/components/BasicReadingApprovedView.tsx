import type { UserMomentData } from '../services/userMomentBackend';

function Block({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[#d7c69b] bg-[#fffaf0]/95 p-5 text-[#173c2c] sm:p-6"><h2 className="mb-4 flex items-start gap-3 font-serif text-xl"><span className="rounded bg-[#a87828] px-2 text-[#fffaf0]">{number}</span>{title}</h2><div className="font-serif leading-7">{children}</div></section>;
}
const names = (items: unknown[]) => items.map(item => typeof item === 'string' ? item : (item as { nome?: string })?.nome).filter(Boolean).join(', ');

/** The basic reading uses only the person's published result, never the ADM report. */
export function BasicReadingApprovedView({ data }: { data: UserMomentData }) {
  if (!data.result || !data.entitlement) return null;
  const result = data.result;
  return <article className="overflow-hidden rounded-[2rem] bg-[#173c2c] p-4 sm:p-6">
    <header className="relative mb-4 grid gap-6 rounded-xl bg-cover bg-center p-6 text-[#fff5d5] sm:grid-cols-[1fr_auto] sm:p-10" style={{ backgroundImage: 'linear-gradient(90deg,rgba(13,42,27,.82),rgba(13,42,27,.4)),url(/natureza-aprovada.jpg)' }}>
      <div><p className="text-xs uppercase tracking-[.22em]">Uma leitura gentil para o seu momento atual</p><h1 className="mt-3 font-serif text-5xl">Leitura Básica</h1><p className="mt-4 font-serif text-2xl italic">{data.intake?.personName}</p><p className="mt-5 font-serif italic">Cuidar da sua energia é voltar para você.</p></div><img src="/logo-everton-oficial.png" alt="Everton Piceni" className="h-40 w-40 rounded-xl bg-[#fffaf0]/90 p-3"/>
    </header>
    <div className="grid gap-4 lg:grid-cols-3">
      <Block number={1} title="Como você chega neste momento"><h3 className="mb-3 text-xl">{result.headline}</h3><p>{result.intro}</p></Block>
      <Block number={2} title="O que será trabalhado">{result.priorities.length ? <ul className="list-disc space-y-2 pl-5">{result.priorities.map((item, i) => <li key={i}>{item}</li>)}</ul> : <p>Vamos acolher seu pedido e encontrar com você o que faz sentido cuidar neste momento.</p>}</Block>
      <Block number={3} title="Intenção do cuidado"><p>{result.intention}</p></Block>
    </div>
    {data.audio && <div className="mt-4"><Block number={4} title="Sua sessão exclusiva"><p>{data.audio.titulo}</p><p>{data.audio.intencao}</p></Block></div>}
    <div className="mt-4"><Block number={5} title="Recursos de apoio"><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {result.solfeggio?.hz && <p><strong>Frequência da sessão</strong><br/>{result.solfeggio.hz} Hz</p>}
      {result.ethericCrystals.length > 0 && <p><strong>Cristais etéricos</strong><br/>{names(result.ethericCrystals)}<br/><span className="text-sm">Referências energéticas, sem necessidade de pedras físicas.</span></p>}
      {result.floral.length > 0 && <p><strong>Floral</strong><br/>{names(result.floral)}</p>}
      {result.aromatherapy.length > 0 && <p><strong>Aromaterapia</strong><br/>{names(result.aromatherapy)}</p>}
    </div></Block></div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2"><Block number={6} title={`Como usar nos próximos ${data.entitlement.days} dias`}><ol className="list-decimal space-y-2 pl-5"><li>Reserve um momento tranquilo para você.</li><li>Ouça sua sessão quando estiver disponível.</li><li>Use os recursos conforme a orientação recebida.</li><li>Observe e registre suas percepções.</li></ol></Block><Block number={7} title="Fechamento"><p>{result.closing}</p></Block></div>
  </article>;
}
