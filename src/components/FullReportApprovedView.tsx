import { FullReportNarrative } from '../result/fullReportNarrative';

interface FullReportApprovedViewProps { report: FullReportNarrative; }

const chakraTone = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('raiz') || n.includes('bás')) return 'bg-[#a9443e]';
  if (n.includes('sacral') || n.includes('umbilical')) return 'bg-[#d78438]';
  if (n.includes('plexo')) return 'bg-[#c9a72f]';
  if (n.includes('card')) return 'bg-[#5e9a65]';
  if (n.includes('lar')) return 'bg-[#559bb2]';
  if (n.includes('frontal')) return 'bg-[#566bb0]';
  return 'bg-[#8060a4]';
};

function BrandMark() {
  return <img src="/logo-everton-oficial.svg" alt="Everton Piceni" className="h-14 w-14 object-contain sm:h-16 sm:w-16" />;
}

function BotanicalEdge({ right = false, bottom = false }: { right?: boolean; bottom?: boolean }) {
  return <div className={`pointer-events-none absolute ${right ? '-right-10' : '-left-10'} ${bottom ? '-bottom-10 rotate-180' : '-top-8'} h-64 w-40 opacity-40`}>
    <span className="absolute left-16 top-3 h-56 w-px rotate-[10deg] bg-[#496a52]/50" />
    {[0,1,2,3,4].map(i => <span key={i} className={`absolute ${i % 2 ? 'left-16' : 'left-5'} h-20 w-9 rounded-[100%_0_100%_0] bg-[#668263]/45`} style={{ top: `${18 + i * 39}px`, transform: `rotate(${i % 2 ? 55 : -18}deg)` }} />)}
  </div>;
}

function PageShell({ children, page }: { children: React.ReactNode; page: number }) {
  return <section className="relative isolate overflow-hidden rounded-[2.25rem] border border-[#d7c69d] bg-[#fbf6e9] px-6 py-7 shadow-[0_22px_65px_rgba(32,61,45,.11)] sm:px-12 sm:py-10 print:break-after-page print:rounded-none print:border-0 print:shadow-none">
    <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_80%_12%,rgba(221,190,111,.16),transparent_22%),linear-gradient(135deg,rgba(255,255,255,.82),rgba(251,246,233,.72)_50%,rgba(238,232,211,.45))]" />
    <BotanicalEdge/><BotanicalEdge right bottom/>
    <div className="pointer-events-none absolute -right-20 top-[18%] -z-10 h-72 w-72 rounded-full border border-[#b99548]/15" />
    <div className="relative z-10">
      <header className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 border-b border-[#d9cba9]/75 pb-5">
        <div className="pt-1 text-[7px] font-semibold uppercase leading-4 tracking-[.25em] text-[#557061] sm:text-[8px]"><div>Autenticidade</div><div>Equilíbrio</div><div>Bem-estar</div><div>Sempre</div></div>
        <div className="flex flex-col items-center text-center"><BrandMark/><span className="mt-1 text-[6px] font-semibold uppercase tracking-[.2em] text-[#5d6c62] sm:text-[7px]">Terapias Holísticas e Bem-Estar</span></div>
        <div className="pt-1 text-right text-[7px] uppercase leading-4 tracking-[.25em] text-[#557061] sm:text-[8px]"><div>Corpo</div><div>Mente</div><div>Energia</div><div>Espírito</div></div>
      </header>
      {children}
      <footer className="mt-10 flex items-end justify-between gap-4 border-t border-[#d9cba9] pt-4 text-[7px] uppercase tracking-[.18em] text-[#6d786f] sm:text-[8px]"><span>Everton Piceni · Terapias Holísticas e Bem-Estar</span><span>{page}/5</span></footer>
    </div>
  </section>;
}

function Kicker({ children }: { children: React.ReactNode }) { return <div className="mb-4 text-[9px] font-semibold uppercase tracking-[.28em] text-[#a17c35]">{children}</div>; }
function Title({ children }: { children: React.ReactNode }) { return <h2 className="max-w-[760px] font-serif text-[2.25rem] leading-[1.04] text-[#183d2c] sm:text-[3.3rem]">{children}</h2>; }
function GoldRule(){ return <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-[#caa858]"/><span className="text-[#b68b38]">◇</span><span className="h-px w-20 bg-[#caa858]"/></div>; }
function Paragraphs({ items }: { items: string[] }) { return <div className="space-y-4 text-[15px] leading-[1.75] text-[#43584c] sm:text-[16px] sm:leading-[1.85]">{items.map((text,index)=><p key={`${index}-${text.slice(0,24)}`}>{text}</p>)}</div>; }

function ResourceCards({ items }: { items: string[] }) {
  return <div className="mt-7 grid gap-4 sm:grid-cols-2">{items.map((text,index) => {
    const split = text.split(':');
    const hasLabel = split.length > 1 && split[0].length < 48;
    return <article key={`${index}-${text.slice(0,24)}`} className={`rounded-[1.6rem] border border-[#d9c79b] bg-[#fffaf0]/88 p-5 shadow-[0_10px_28px_rgba(44,70,54,.06)] ${index === 0 ? 'sm:col-span-2' : ''}`}>
      {hasLabel && <h4 className="font-serif text-xl leading-tight text-[#9b7229]">{split.shift()}</h4>}
      <p className={`${hasLabel ? 'mt-3' : ''} text-[14px] leading-7 text-[#46594e]`}>{hasLabel ? split.join(':').trim() : text}</p>
    </article>;
  })}</div>;
}

export function FullReportApprovedView({ report }: FullReportApprovedViewProps) {
  const page4Lead = report.page4.paragraphs.slice(0, 2);
  const page4Resources = report.page4.paragraphs.slice(2, -1);
  const page4Close = report.page4.paragraphs.slice(-1);
  return <div className="space-y-8">
    <PageShell page={1}>
      <div className="grid min-h-[620px] items-center gap-8 py-10 sm:grid-cols-[1.25fr_.75fr] sm:py-16">
        <div><Kicker>Relatório Completo</Kicker><h1 className="font-serif text-5xl leading-[.96] text-[#183d2c] sm:text-[4.4rem]">Leitura do <span className="italic text-[#a97929]">Seu Momento</span></h1><GoldRule/><div className="font-serif text-3xl text-[#183d2c] sm:text-4xl">{report.nome}</div><p className="mt-6 max-w-2xl text-lg leading-8 text-[#4c6155]">{report.page1.intro}</p><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#6b796f]">{report.page1.subtitle}</p><p className="mt-10 font-serif text-2xl italic text-[#a97929]">Cuidar da sua energia é voltar para você.</p></div>
        <div className="hidden sm:flex sm:justify-center"><div className="relative h-80 w-44 opacity-20"><div className="absolute left-1/2 top-4 h-20 w-20 -translate-x-1/2 rounded-full border-2 border-[#31533f]"/><div className="absolute left-1/2 top-24 h-48 w-px bg-[#31533f]"/>{['bg-[#7752a6]','bg-[#566bb0]','bg-[#559bb2]','bg-[#5e9a65]','bg-[#c9a72f]','bg-[#d78438]','bg-[#a9443e]'].map((c,i)=><span key={c} className={`absolute left-1/2 h-3 w-3 -translate-x-1/2 rounded-full ${c}`} style={{top:`${86+i*27}px`}}/>)}</div></div>
      </div>
    </PageShell>

    <PageShell page={2}><div className="py-5"><Kicker>Sua leitura</Kicker><Title>{report.page2.title}</Title><GoldRule/><Paragraphs items={report.page2.paragraphs}/>{report.page2.cycle && <div className="mx-auto mt-8 max-w-3xl rounded-[1.8rem] border border-[#d8c28a] bg-[#f6ecd4]/75 px-6 py-6 text-center"><div className="text-[9px] font-semibold uppercase tracking-[.24em] text-[#657469]">Um movimento que pode estar se repetindo</div><p className="mt-3 font-serif text-lg italic leading-7 text-[#966d27]">{report.page2.cycle}</p></div>}<p className="mt-9 text-center font-serif text-xl italic leading-8 text-[#a2762c]">Compreender o que pesa é o primeiro passo para escolher onde cuidar.</p></div></PageShell>

    <PageShell page={3}><div className="py-5"><Kicker>Forças e centros</Kicker><Title>{report.page3.title}</Title><GoldRule/><Paragraphs items={report.page3.paragraphs}/><div className="my-8 rounded-[1.8rem] bg-[#f3ead4]/75 p-6"><h3 className="font-serif text-2xl text-[#183d2c]">O que permanece vivo em você</h3><div className="mt-4 grid gap-2 sm:grid-cols-2">{report.page3.preserved.map(item=><div key={item} className="flex gap-3 text-sm leading-6 text-[#526359]"><span className="text-[#b48735]">◆</span><span>{item}</span></div>)}</div></div><h3 className="max-w-3xl font-serif text-3xl leading-tight text-[#183d2c]">O que os seus chakras nos mostram dentro do protocolo</h3><div className="mt-6 grid gap-4 sm:grid-cols-2">{report.page3.chakras.map(chakra=><article key={chakra.name} className="rounded-[1.5rem] border border-[#ddcfad] bg-[#fffaf0]/75 p-5"><div className="flex items-center gap-3"><span className={`h-4 w-4 rounded-full shadow-[0_0_0_5px_rgba(190,165,103,.10)] ${chakraTone(chakra.name)}`}/><h4 className="font-serif text-xl text-[#956c28]">{chakra.name}</h4></div><p className="mt-3 text-sm leading-7 text-[#4d6055]">{chakra.text}</p></article>)}</div></div></PageShell>

    <PageShell page={4}><div className="py-5"><Kicker>Direcionamento do cuidado</Kicker><Title>{report.page4.title}</Title><GoldRule/><Paragraphs items={page4Lead}/><ResourceCards items={page4Resources}/><div className="mt-7 rounded-[1.8rem] bg-[#1f4a35] px-6 py-6 text-[#f7f0df]"><p className="font-serif text-xl italic leading-8">{page4Close[0]}</p></div><p className="mt-8 font-serif text-2xl italic leading-9 text-[#a2762c]">Cada escolha precisa responder a um ponto concreto da sua leitura.</p></div></PageShell>

    <PageShell page={5}><div className="py-5"><Kicker>Próximos passos</Kicker><Title>{report.page5.title}</Title><GoldRule/><div className="grid gap-4 sm:grid-cols-2">{report.page5.paragraphs.map((text,index)=><article key={index} className="rounded-[1.5rem] border border-[#ddcfad] bg-[#fffaf0]/72 p-5"><div className="mb-2 font-serif text-2xl text-[#a2762c]">0{index+1}</div><p className="text-sm leading-7 text-[#4d6055]">{text}</p></article>)}</div><div className="my-9 h-px bg-[#d6c49b]"/><h3 className="font-serif text-3xl text-[#183d2c] sm:text-4xl">{report.page5.closingTitle}</h3><div className="mt-6"><Paragraphs items={report.page5.closing}/></div><p className="mt-9 font-serif text-2xl italic leading-9 text-[#a2762c]">Um movimento por vez, respeitando o seu momento.</p></div></PageShell>
  </div>;
}
