import { FullReportNarrative } from '../result/fullReportNarrative';

interface Props { report: FullReportNarrative; }

const chakraTone = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('raiz') || n.includes('bás')) return '#a94a43';
  if (n.includes('sacral') || n.includes('umbilical')) return '#d9893e';
  if (n.includes('plexo')) return '#d1ae38';
  if (n.includes('card')) return '#659d6b';
  if (n.includes('lar')) return '#5a9db5';
  if (n.includes('frontal')) return '#596eb2';
  return '#8061a6';
};

function Logo({ large=false, watermark=false }: { large?: boolean; watermark?: boolean }) {
  return <img src="/logo-everton-oficial.svg" alt="Everton Piceni — Terapias Holísticas e Bem-Estar" className={`${large ? 'h-44 w-44 sm:h-56 sm:w-56' : 'h-16 w-16 sm:h-20 sm:w-20'} object-contain ${watermark ? 'opacity-[.075]' : ''}`} />;
}

function Botanical({ right=false, bottom=false }: { right?: boolean; bottom?: boolean }) {
  return <div className={`pointer-events-none absolute ${right ? '-right-10' : '-left-10'} ${bottom ? '-bottom-12' : '-top-12'} h-56 w-56 opacity-30 sm:h-72 sm:w-72`}>
    <span className="absolute left-14 top-14 h-32 w-12 rotate-[35deg] rounded-[100%_0_100%_0] bg-[#315d42]/50" />
    <span className="absolute left-28 top-7 h-36 w-12 rotate-[57deg] rounded-[100%_0_100%_0] bg-[#66835b]/40" />
    <span className="absolute left-5 top-28 h-28 w-11 rotate-[17deg] rounded-[100%_0_100%_0] bg-[#7f986c]/35" />
  </div>;
}

function Shell({ page, children, cover=false }: { page:number; children:React.ReactNode; cover?:boolean }) {
  return <section className={`relative overflow-hidden rounded-[2.25rem] border border-[#d9c79b] bg-[#fffaf0] shadow-[0_28px_80px_rgba(35,67,48,.13)] print:break-after-page print:rounded-none print:border-0 print:shadow-none ${cover ? 'min-h-[760px]' : ''}`}>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(219,181,92,.16),transparent_24%),linear-gradient(145deg,rgba(255,255,255,.72),transparent_52%)]" />
    <Botanical/><Botanical right bottom/>
    <div className="pointer-events-none absolute -right-20 top-36 h-80 w-80 rounded-full border border-[#c7a451]/20" />
    <div className="pointer-events-none absolute -right-6 top-48 h-52 w-52 rounded-full border border-[#c7a451]/10" />
    <div className="relative z-10 px-6 py-7 sm:px-11 sm:py-9">
      <header className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div className="pt-2 text-[8px] font-semibold uppercase leading-5 tracking-[.26em] text-[#486255]"><div>Autenticidade</div><div>Equilíbrio</div><div>Bem-estar</div><div>Sempre</div><div className="mt-3 h-px w-14 bg-[#b9903d]"/></div>
        <Logo />
        <div className="pt-2 text-right text-[8px] uppercase leading-5 tracking-[.25em] text-[#52675b]"><div>Corpo</div><div>Mente</div><div>Energia</div><div>Espírito</div><div className="ml-auto mt-3 h-px w-14 bg-[#b9903d]"/></div>
      </header>
      <div className="mt-8">{children}</div>
      <footer className="mt-10 flex items-center justify-between border-t border-[#d9c79b]/70 pt-4 text-[9px] uppercase tracking-[.17em] text-[#78847c]"><span>Everton Piceni · Terapias Holísticas e Bem-Estar</span><span>{page}/5</span></footer>
    </div>
  </section>;
}

function Title({ children, kicker }: { children:React.ReactNode; kicker?:string }) {
  return <div>{kicker && <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.3em] text-[#a47a2d]">{kicker}</div>}<h2 className="max-w-3xl font-serif text-4xl leading-[1.04] text-[#173c2c] sm:text-[3.35rem]">{children}</h2><div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#d3b468]"/><span className="text-[#b58a34]">◇</span><div className="h-px w-24 bg-[#d3b468]"/></div></div>;
}

function Text({ items }: { items:string[] }) {
  return <div className="space-y-5 text-[15px] leading-[1.82] text-[#43584c] sm:text-[16px]">{items.map((p,i)=><p key={i}>{p}</p>)}</div>;
}

function ResourceCards({ items }: { items:string[] }) {
  return <div className="mt-7 grid gap-4 sm:grid-cols-2">{items.map((text,i)=>{
    const [head,...rest]=text.split(':');
    const hasHead=rest.length>0 && head.length<48;
    return <article key={i} className="rounded-[1.6rem] border border-[#d9c99e] bg-white/65 p-5 shadow-[0_12px_35px_rgba(39,68,50,.07)]">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#c8a452]/50 bg-[#fbf1d9] font-serif text-lg text-[#a5792d]">{i+1}</div>
      {hasHead ? <><h4 className="font-serif text-xl text-[#173c2c]">{head}</h4><p className="mt-2 text-sm leading-6 text-[#56685e]">{rest.join(':').trim()}</p></> : <p className="text-sm leading-6 text-[#56685e]">{text}</p>}
    </article>;
  })}</div>;
}

export function FullReportApprovedView({ report }: Props) {
  return <div className="space-y-8">
    <Shell page={1} cover>
      <div className="grid items-center gap-7 lg:grid-cols-[1.15fr_.85fr]">
        <div className="py-5 sm:py-10">
          <div className="mb-4 text-[10px] font-semibold uppercase tracking-[.3em] text-[#a47a2d]">Relatório Completo</div>
          <h1 className="font-serif text-5xl leading-[.98] text-[#173c2c] sm:text-[4.6rem]">Leitura do <span className="italic text-[#a87828]">Seu Momento</span></h1>
          <div className="my-7 h-px w-40 bg-[#c9a252]" />
          <div className="font-serif text-3xl text-[#173c2c] sm:text-4xl">{report.nome}</div>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4f6358]">{report.page1.intro}</p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#718078]">{report.page1.subtitle}</p>
          <div className="mt-9 font-serif text-2xl italic leading-8 text-[#a87828]">Cuidar da sua energia é voltar para você.</div>
        </div>
        <div className="relative mx-auto flex min-h-[360px] w-full max-w-sm items-center justify-center">
          <div className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(231,194,102,.28),rgba(255,250,240,0)_67%)]" />
          <Logo large />
        </div>
      </div>
    </Shell>

    <Shell page={2}>
      <Title kicker="O que está acontecendo comigo?">{report.page2.title}</Title>
      <div className="grid gap-8 lg:grid-cols-[1fr_.34fr]">
        <Text items={report.page2.paragraphs}/>
        <aside className="relative hidden lg:flex items-center justify-center"><div className="absolute inset-0 flex items-center justify-center"><Logo large watermark/></div><div className="relative rounded-[2rem] border border-[#d8c89c] bg-[#fbf3df]/80 p-5 font-serif text-lg italic leading-7 text-[#8d6a2c]">Sua leitura não procura encaixar você em um rótulo. Ela procura reconhecer onde está pesado e por onde o cuidado pode começar.</div></aside>
      </div>
      {report.page2.cycle && <div className="mt-8 rounded-[1.7rem] border border-[#d8c89c] bg-[#fbf3df]/80 px-6 py-5"><div className="text-[9px] font-semibold uppercase tracking-[.25em] text-[#6b786f]">Um ciclo percebido nas suas respostas</div><div className="mt-3 font-serif text-lg italic leading-7 text-[#966d24]">{report.page2.cycle}</div></div>}
    </Shell>

    <Shell page={3}>
      <Title kicker="Forças e centros que pedem atenção">{report.page3.title}</Title>
      <Text items={report.page3.paragraphs}/>
      <div className="my-8 rounded-[1.8rem] bg-[#f8efdc]/80 p-6"><h3 className="font-serif text-2xl text-[#173c2c]">O que permanece vivo em você</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{report.page3.preserved.map((item,i)=><div key={i} className="flex gap-3 text-sm leading-6 text-[#53665b]"><span className="text-[#b18432]">✦</span><span>{item}</span></div>)}</div></div>
      <h3 className="font-serif text-3xl text-[#173c2c]">O que os seus chakras nos mostram dentro do protocolo</h3>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{report.page3.chakras.map((c,i)=><article key={i} className="relative overflow-hidden rounded-[1.6rem] border border-[#ded0ad] bg-white/65 p-5"><div className="absolute right-4 top-4 h-12 w-12 rounded-full opacity-15" style={{background:chakraTone(c.name)}}/><div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full shadow-[0_0_0_5px_rgba(205,179,112,.13)]" style={{background:chakraTone(c.name)}}/><h4 className="font-serif text-xl text-[#9a6f22]">{c.name}</h4></div><p className="mt-3 text-sm leading-6 text-[#52645a]">{c.text}</p></article>)}</div>
      <div className="mt-8 font-serif text-xl italic text-[#a87828]">Antes de pedir mais de você, o cuidado vai devolver sustentação ao que hoje está pedindo espaço.</div>
    </Shell>

    <Shell page={4}>
      <Title kicker="Seu cuidado foi pensado para estes pontos">{report.page4.title}</Title>
      <div className="rounded-[1.8rem] border-l-4 border-[#b88b37] bg-[#f7eedb]/75 px-6 py-5"><p className="font-serif text-xl leading-8 text-[#315243]">Aqui está o direcionamento da sua composição: não apenas o nome dos recursos, mas o motivo de cada escolha e o lugar que cada energia ocupa no seu cuidado.</p></div>
      <ResourceCards items={report.page4.paragraphs}/>
      <div className="mt-8 flex items-center gap-5 rounded-[1.8rem] bg-[#173c2c] p-6 text-[#f8f0df]"><div className="hidden sm:block"><Logo/></div><p className="font-serif text-lg italic leading-7">A sequência respeita o seu momento: primeiro sustentar, depois aliviar o excesso, fortalecer o que pede apoio e só então favorecer movimento e integração.</p></div>
    </Shell>

    <Shell page={5}>
      <Title kicker="Um passo de cada vez">{report.page5.title}</Title>
      <Text items={report.page5.paragraphs}/>
      <div className="relative mt-9 overflow-hidden rounded-[2rem] border border-[#d5c18e] bg-[linear-gradient(135deg,#f8edcf,#fffaf0_55%,#edf2e8)] p-7 sm:p-9"><div className="absolute -right-10 -bottom-12"><Logo large watermark/></div><div className="relative max-w-2xl"><h3 className="font-serif text-3xl text-[#173c2c]">{report.page5.closingTitle}</h3><div className="mt-5 space-y-3 font-serif text-xl italic leading-8 text-[#8e6929]">{report.page5.closing.map((x,i)=><p key={i}>{x}</p>)}</div></div></div>
      <div className="mt-8 text-center font-serif text-2xl italic text-[#a87828]">Você não precisa fazer tudo agora. Precisa apenas não se abandonar no caminho.</div>
    </Shell>
  </div>;
}
