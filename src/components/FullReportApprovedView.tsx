import { FullReportNarrative } from '../result/fullReportNarrative';

interface FullReportApprovedViewProps { report: FullReportNarrative; }

function BrandMark({ large = false }: { large?: boolean }) {
  return <img src="/logo-everton-oficial.svg" alt="Everton Piceni" className={`object-contain ${large ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-12 w-12 sm:h-14 sm:w-14'}`} />;
}

function LeafCluster({ side = 'left', bottom = false }: { side?: 'left'|'right'; bottom?: boolean }) {
  const pos = `${side === 'left' ? '-left-10' : '-right-10'} ${bottom ? '-bottom-10' : '-top-10'}`;
  return <div className={`pointer-events-none absolute ${pos} h-48 w-48 opacity-30 sm:h-64 sm:w-64`}>
    <span className="absolute left-10 top-8 h-24 w-10 rotate-[38deg] rounded-[100%_0_100%_0] bg-[#5f7b4f]/45" />
    <span className="absolute left-20 top-3 h-28 w-11 rotate-[58deg] rounded-[100%_0_100%_0] bg-[#76915e]/35" />
    <span className="absolute left-3 top-20 h-24 w-10 rotate-[20deg] rounded-[100%_0_100%_0] bg-[#355f42]/35" />
  </div>;
}

function PageShell({ children, page, cover = false }: { children: React.ReactNode; page: number; cover?: boolean }) {
  return <section className="relative overflow-hidden rounded-[2.5rem] border border-[#d9c69b] bg-[#fffaf0] px-6 py-8 shadow-[0_24px_70px_rgba(35,67,48,.10)] sm:px-11 sm:py-10 print:break-after-page print:rounded-none print:border-0 print:shadow-none">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_15%,rgba(205,173,93,.14),transparent_22%),radial-gradient(circle_at_8%_88%,rgba(91,117,101,.07),transparent_26%),linear-gradient(135deg,rgba(255,255,255,.58),transparent_58%)]"/>
    <LeafCluster/><LeafCluster side="right" bottom/>
    <div className="pointer-events-none absolute right-[-8%] top-[22%] h-64 w-64 rounded-full border border-[#c7a451]/18"/><div className="pointer-events-none absolute right-[-3%] top-[27%] h-44 w-44 rounded-full border border-[#c7a451]/9"/>
    <div className="relative z-10">
      <header className="mb-9 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div className="pt-3 text-[8px] font-semibold uppercase leading-5 tracking-[.28em] text-[#496457]"><div>Autenticidade</div><div>Equilíbrio</div><div>Bem-estar</div><div>Sempre</div><div className="mt-3 h-px w-14 bg-[#b89447]"/></div>
        <div className="flex flex-col items-center text-center"><BrandMark large={cover}/><div className="mt-2 text-[7px] font-semibold uppercase tracking-[.22em] text-[#385446]">Terapias Holísticas e Bem-Estar</div></div>
        <div className="pt-3 text-right text-[8px] uppercase leading-5 tracking-[.28em] text-[#4b6156]"><div>Corpo</div><div>Mente</div><div>Energia</div><div>Espírito</div><div className="ml-auto mt-3 h-px w-14 bg-[#b89447]"/><div className="mt-3 font-serif text-sm normal-case italic leading-5 tracking-normal">Mais equilíbrio<br/>para uma vida<br/>com sentido.</div></div>
      </header>
      {children}
      <footer className="mt-11 flex items-end justify-between gap-4 border-t border-[#ddcfae] pt-4 text-[8px] uppercase tracking-[.22em] text-[#6f786f]"><span>Everton Piceni · Terapias Holísticas e Bem-Estar</span><span>Página {page} de 5</span></footer>
    </div>
  </section>;
}

function Title({ children }: { children: React.ReactNode }) { return <h2 className="max-w-3xl font-serif text-3xl leading-[1.08] text-[#173c2c] sm:text-[3.25rem]">{children}</h2>; }
function Divider(){return <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#d2b369]"/><span className="font-serif text-[#b38a36]">♢</span><div className="h-px w-24 bg-[#d2b369]"/></div>}
function Paragraphs({ items }: { items: string[] }) { return <div className="space-y-5 text-[15px] leading-7 text-[#40564a] sm:text-[16px] sm:leading-[1.9]">{items.map((text,index)=><p key={`${index}-${text.slice(0,32)}`}>{text}</p>)}</div>; }

export function FullReportApprovedView({ report }: FullReportApprovedViewProps) {
  return <div className="space-y-8">
    <PageShell page={1} cover><div className="max-w-3xl py-7 sm:py-12"><div className="mb-5 text-[10px] font-semibold uppercase tracking-[.28em] text-[#9d7b32]">Relatório Completo</div><h1 className="font-serif text-5xl leading-[.98] text-[#173c2c] sm:text-[4.25rem]">Leitura do <span className="italic text-[#a87828]">Seu Momento</span></h1><Divider/><div className="font-serif text-3xl text-[#173c2c] sm:text-4xl">{report.nome}</div><p className="mt-6 max-w-2xl text-lg leading-8 text-[#506258]">{report.page1.intro}</p><p className="mt-6 max-w-2xl text-base leading-7 text-[#718077]">{report.page1.subtitle}</p><div className="mt-12 font-serif text-2xl italic text-[#a87828]">Cuidar da sua energia é voltar para você.</div></div></PageShell>
    <PageShell page={2}><Title>{report.page2.title}</Title><Divider/><Paragraphs items={report.page2.paragraphs}/>{report.page2.cycle && <div className="mt-9 rounded-[2rem] border border-[#d8c89e] bg-[#fbf4e4]/80 px-5 py-6 text-center"><div className="mb-3 text-[9px] font-semibold uppercase tracking-[.24em] text-[#617268]">Um ciclo que pode estar presente neste momento</div><div className="font-serif text-lg italic leading-7 text-[#9a6f22]">{report.page2.cycle}</div></div>}<div className="mt-9 text-center font-serif text-xl italic leading-8 text-[#8f6b2b]">Aqui, a leitura não procura rotular você.<br/>Procura compreender, acolher e cuidar.</div></PageShell>
    <PageShell page={3}><Title>{report.page3.title}</Title><Divider/><Paragraphs items={report.page3.paragraphs}/><div className="my-9 rounded-[2rem] bg-[#fbf4e4]/80 px-5 py-6"><div className="font-serif text-2xl text-[#173c2c]">Recursos que permanecem vivos em você</div><div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">{report.page3.preserved.map(item=><div key={item} className="flex gap-3 text-[15px] leading-6 text-[#53655a]"><span className="text-[#b38a36]">•</span><span>{item}</span></div>)}</div><div className="mt-5 font-serif text-xl italic text-[#a87828]">É essa parte que queremos fortalecer.</div></div><h3 className="font-serif text-3xl leading-tight text-[#173c2c]">O que os seus chakras nos mostram dentro do protocolo</h3><div className="mt-6 grid gap-5 sm:grid-cols-2">{report.page3.chakras.map(chakra=><div key={chakra.name} className="border-l border-[#d2b369] pl-4"><div className="font-serif text-xl text-[#9a6f22]">{chakra.name}</div><p className="mt-2 text-[15px] leading-7 text-[#506258]">{chakra.text}</p></div>)}</div></PageShell>
    <PageShell page={4}><Title>{report.page4.title}</Title><Divider/><div className="rounded-[2rem] bg-[#fbf4e4]/65 px-5 py-6"><Paragraphs items={report.page4.paragraphs}/></div><div className="mt-8 font-serif text-2xl italic leading-9 text-[#a87828]">Cada recurso entra com uma função clara dentro do seu cuidado.</div></PageShell>
    <PageShell page={5}><Title>{report.page5.title}</Title><Divider/><Paragraphs items={report.page5.paragraphs}/><div className="my-10 h-px bg-[#dfd0ad]"/><h3 className="font-serif text-3xl text-[#173c2c] sm:text-4xl">{report.page5.closingTitle}</h3><div className="mt-6"><Paragraphs items={report.page5.closing}/></div><div className="mt-10 font-serif text-2xl italic leading-9 text-[#a87828]">Um movimento por vez, respeitando o seu momento.</div></PageShell>
  </div>;
}
