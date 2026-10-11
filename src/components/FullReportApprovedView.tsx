import { FullReportNarrative } from '../result/fullReportNarrative';
import { ChakraSymbol } from './ChakraSymbol';

interface Props { report: FullReportNarrative; }

function Logo({ large=false, watermark=false }: { large?: boolean; watermark?: boolean }) {
  return <img src="/logo-everton-oficial.png" alt="Everton Piceni — Terapias Holísticas e Bem-Estar" className={`${large ? 'h-44 w-44 sm:h-56 sm:w-56' : 'h-28 w-28 sm:h-40 sm:w-40'} object-contain ${watermark ? 'opacity-[.075]' : ''}`} />;
}

function Shell({ page, children, cover=false, total=1 }: { total?:number; page:number; children:React.ReactNode; cover?:boolean }) {
  return <section className={`report-page relative overflow-hidden rounded-[2.25rem] border border-[#d9c79b] bg-[#fffaf0] shadow-[0_28px_80px_rgba(35,67,48,.13)] print:break-after-page print:rounded-none print:border-0 print:shadow-none ${cover ? 'min-h-[760px]' : ''}`}>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(219,181,92,.16),transparent_24%),linear-gradient(145deg,rgba(255,255,255,.72),transparent_52%)]" />
    <div className="pointer-events-none absolute -right-20 top-36 h-80 w-80 rounded-full border border-[#c7a451]/20" />
    <div className="pointer-events-none absolute -right-6 top-48 h-52 w-52 rounded-full border border-[#c7a451]/10" />
    <div className="relative z-10 px-6 py-7 sm:px-16 sm:py-9">
      <header className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div className="self-end pb-2 text-[8px] font-semibold uppercase leading-5 tracking-[.26em] text-[#486255]"><div>Autenticidade</div><div>Equilíbrio</div><div>Bem-estar</div><div>Sempre</div><div className="mt-3 h-px w-14 bg-[#b9903d]"/></div>
        <Logo />
        <div className="pt-2 text-right text-[8px] uppercase leading-5 tracking-[.25em] text-[#52675b]"><div>Corpo</div><div>Mente</div><div>Energia</div><div>Espírito</div><div className="ml-auto mt-3 h-px w-14 bg-[#b9903d]"/></div>
      </header>
      <div className="mt-8">{children}</div>
      <footer className="mt-10 flex items-center justify-between border-t border-[#d9c79b]/70 pt-4 text-[9px] uppercase tracking-[.17em] text-[#78847c]"><span>Everton Piceni · Terapias Holísticas e Bem-Estar</span><span>{total > 1 ? `${page}/${total}` : 'Cuidar da sua energia é voltar para você'}</span></footer>
    </div>
  </section>;
}

function Title({ children, kicker }: { children:React.ReactNode; kicker?:string }) {
  return <div>{kicker && <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.3em] text-[#a47a2d]">{kicker}</div>}<h2 className="max-w-3xl font-serif text-4xl leading-[1.04] text-[#173c2c] sm:text-[3.35rem]">{typeof children === 'string' && children === 'Diagnóstico da Anamnese' ? <>Diagnóstico da <span className="text-[#a87828]">Anamnese</span></> : typeof children === 'string' && children === 'O que suas respostas contam sobre você' ? <>O que suas respostas <span className="text-[#a87828]">contam sobre você</span></> : children}</h2><div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#d3b468]"/><span className="text-[#b58a34]">✿</span><div className="h-px w-24 bg-[#d3b468]"/></div></div>;
}

function Text({ items }: { items:string[] }) {
  return <div className="space-y-5 font-serif text-[16px] leading-[1.6] text-[#43584c] sm:text-[16px]">{items.map((p,i)=><p key={i}>{p}</p>)}</div>;
}

export function FullReportApprovedView({ report }: Props) {
  const schedule = report.dailyEnergySchedule || [];
  const energyNames = Array.from(new Set(schedule.length ? schedule.flatMap(day => day.energyNames) : report.energyNames || []));
  const resources = report.page4.paragraphs.filter(text => /^(Frequência de apoio|Cristais etéricos|Florais|Aromaterapia|Banho de apoio)/.test(text));
  const libraryResources = report.careResources || [];
  const categories = Array.from(new Set(libraryResources.map(resource => resource.category)));
  const direction = report.page4.paragraphs.filter(text => !resources.includes(text));
  return <Shell page={1} total={1}>
    <Title kicker={report.journeyDays ? `Seu cuidado · ${report.journeyDays} dias` : 'Relatório completo'}>Leitura do <span className="italic text-[#a87828]">Seu Momento</span></Title>
    <Text items={report.page2.paragraphs}/>
    {report.page3.paragraphs.filter(text => !text.startsWith('No nosso protocolo')).length > 0 && <div className="mt-5"><Text items={report.page3.paragraphs.filter(text => !text.startsWith('No nosso protocolo'))}/></div>}
    <div className="my-6 border-y border-[#d9c79b]/70 py-5" data-pdf-block><h3 className="mb-3 font-serif text-2xl text-[#173c2c]">O que permanece vivo em você</h3><Text items={report.page3.preserved}/></div>
    <h3 className="mb-4 font-serif text-3xl text-[#173c2c]">Como vamos cuidar disso com você</h3>
    <Text items={direction}/>
    {report.page3.chakras.length > 0 && <section className="mt-6" aria-label="Chakras do cuidado">
      <h3 className="font-serif text-2xl text-[#173c2c]">Centros energéticos que acompanham este cuidado</h3>
      <div className="mt-4 grid gap-x-7 gap-y-4 sm:grid-cols-2">{report.page3.chakras.map(c => <article key={c.name} className="flex items-start gap-3" data-pdf-block><ChakraSymbol name={c.name}/><div><h4 className="font-serif text-xl text-[#9a6f22]">{c.name}</h4><p className="mt-1 font-serif text-sm leading-6 text-[#52645a]">{c.text}</p></div></article>)}</div>
      <p className="mt-4 font-serif text-sm leading-6 text-[#52645a]">Os centros energéticos organizam as intenções do nosso protocolo a partir do que você relatou; esta leitura simbólica não representa uma medição do seu corpo.</p>
    </section>}
    <section className="mt-6 border-t border-[#d9c79b] pt-5" aria-label="Energias do cuidado">
      <h3 className="font-serif text-2xl text-[#173c2c]">Energias que serão trabalhadas</h3>
      {energyNames.length ? <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">{energyNames.map(name => <li key={name} className="font-serif text-lg text-[#9a6f22]">{name}</li>)}</ul> : <p role="status" className="mt-3 font-serif leading-7 text-[#43584c]">Estamos preparando sua composição individual a partir das suas respostas.</p>}
      {!!resources.length && !libraryResources.length && <div className="mt-4"><Text items={resources}/></div>}
    </section>
    {!!libraryResources.length && <section className="mt-6" aria-label="Recursos da biblioteca">
      <h3 className="font-serif text-2xl text-[#173c2c]">Recursos que acompanham o seu percurso</h3>
      <div className="mt-4 space-y-4">{categories.map(category => {
        const items = libraryResources.filter(resource => resource.category === category);
        return <article key={category} data-pdf-block><h4 className="font-serif text-lg text-[#9a6f22]">{category} · {items.map(item => item.name).join(' · ')}</h4><p className="mt-1 font-serif text-sm leading-6 text-[#43584c]">{items[0].explanation}</p>{items[0].guidance && <p className="font-serif text-sm leading-6 text-[#52645a]">{items[0].guidance}</p>}</article>;
      })}</div>
    </section>}
    {!!schedule.length && <section className="mt-7" aria-label="Programação diária">
      <h3 className="font-serif text-3xl text-[#173c2c]">Seu cuidado, dia a dia</h3>
      <p className="mt-3 font-serif leading-7 text-[#43584c]">A partir das suas respostas, o motor selecionou os recursos da biblioteca para o seu percurso de {report.journeyDays || schedule.length} dias.</p>
      <ol className="mt-4 space-y-4">{schedule.map(entry => <li key={entry.day} className="border-b border-[#d9c79b]/70 pb-4" data-pdf-block>
        <h4 className="font-serif text-xl text-[#a87828]">Dia {entry.day}</h4>
        <p className="mt-1 font-serif font-semibold leading-6 text-[#173c2c]">{entry.energyNames.join(' · ')}</p>
        <p className="mt-1 font-serif leading-6 text-[#43584c]">{entry.intention}</p>
        {entry.reason && <p className="mt-1 font-serif text-sm leading-6 text-[#52645a]">{entry.reason}</p>}
        {!!entry.resources?.length && <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{entry.resources.map(resource => <li key={resource.id} className="font-serif text-sm leading-6 text-[#52645a]"><strong>{resource.category}:</strong> {resource.name}</li>)}</ul>}
      </li>)}</ol>
    </section>}
    <div className="mt-6"><Text items={report.page5.paragraphs.filter(text => text.startsWith('Reserve um momento') || text.startsWith('Não é preciso medir'))}/></div>
    <p className="mt-6 font-serif text-xl italic leading-8 text-[#a87828]" data-pdf-block>Você não precisa dar conta de tudo para merecer cuidado. Há espaço para pausar, receber apoio e seguir um passo de cada vez.</p>
  </Shell>;
}
