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
    <div className="report-content relative z-10 px-6 py-7 sm:px-16 sm:py-9">
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

  const direction = report.page4.paragraphs.filter(text => !resources.includes(text));
  return <Shell page={1} total={1}>
    <Title kicker={report.journeyDays ? `Seu cuidado · ${report.journeyDays} dias` : 'Relatório completo'}>Leitura do <span className="italic text-[#a87828]">Seu Momento</span></Title>
    <h3 className="mb-4 font-serif text-2xl text-[#173c2c]">{report.nome}, o que suas respostas nos ajudam a compreender</h3>
    <div className="rounded-2xl border-l-4 border-[#789365] bg-[#edf2df]/75 px-5 py-5"><Text items={report.page2.paragraphs}/></div>
    {report.page3.paragraphs.filter(text => !text.startsWith('No nosso protocolo')).slice(0, 3).length > 0 && <div className="mt-5"><Text items={report.page3.paragraphs.filter(text => !text.startsWith('No nosso protocolo')).slice(0, 3)}/></div>}
    <div className="my-6 border-y border-[#d9c79b]/70 py-5" data-pdf-block><h3 className="mb-3 font-serif text-2xl text-[#173c2c]">O que permanece vivo em você</h3><Text items={report.page3.preserved}/></div>
    <section className="my-6 rounded-2xl border border-[#c7a451] bg-[#173c2c] px-6 py-6"><h3 className="mb-4 font-serif text-3xl text-[#f2d786]">Como vamos cuidar disso com você</h3><div className="space-y-3 font-serif text-base leading-7 text-[#fffaf0]">{direction.map((text,index)=><p key={index}>{text}</p>)}</div></section>
    {report.page3.chakras.length > 0 && <section className="mt-6" aria-label="Chakras do cuidado">
      <h3 className="font-serif text-2xl text-[#173c2c]">Centros energéticos que acompanham este cuidado</h3><p className="mt-3 font-serif text-sm leading-6 text-[#52645a]">Conforme a análise das suas respostas, os centros abaixo organizam as necessidades de cuidado que apareceram no seu relato.</p>
      <div className="mt-4 grid gap-x-7 gap-y-4 sm:grid-cols-2">{report.page3.chakras.map(c => <article key={c.name} className="flex items-start gap-3" data-pdf-block><ChakraSymbol name={c.name}/><div><h4 className="font-serif text-xl text-[#9a6f22]">{c.name}</h4><p className="mt-1 font-serif text-sm leading-6 text-[#52645a]">{c.text}</p></div></article>)}</div>
      <p className="mt-4 font-serif text-sm leading-6 text-[#52645a]">Os centros energéticos organizam as intenções do nosso protocolo a partir do que você relatou; esta leitura simbólica não representa uma medição do seu corpo.</p>
    </section>}
    {!schedule.length && <section className="mt-6 border-t border-[#d9c79b] pt-5" aria-label="Energias do cuidado">
      <h3 className="font-serif text-2xl text-[#173c2c]">Energias que serão trabalhadas</h3>
      {energyNames.length ? <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">{energyNames.map(name => <li key={name} className="font-serif text-lg text-[#9a6f22]">{name}</li>)}</ul> : <p role="status" className="mt-3 font-serif leading-7 text-[#43584c]">Estamos preparando sua composição individual a partir das suas respostas.</p>}
      {!!resources.length && !libraryResources.length && <div className="mt-4"><Text items={resources}/></div>}
    </section>}
    {!!report.journeyResources?.length && <section className="mt-6 rounded-2xl border border-[#c5d2aa] bg-[#edf2df]/75 p-5" aria-label="Apoios de toda a jornada">
      <h3 className="font-serif text-2xl text-[#173c2c]">Um apoio contínuo ao longo dos {report.journeyDays} dias</h3>
      <div className="mt-4 space-y-4">{report.journeyResources.map(resource => <article key={resource.id} data-pdf-block><h4 className="font-serif text-lg text-[#9a6f22]">{resource.category} · {resource.name}</h4><p className="mt-1 font-serif text-sm leading-6 text-[#43584c]">{resource.explanation}</p><p className="mt-1 font-serif text-sm leading-6 text-[#52645a]">{resource.guidance}</p></article>)}</div>
    </section>}
    {libraryResources.some(item => item.category === 'Banho energético') && <section className="mt-6 rounded-2xl border border-[#d9c79b] bg-[#fff9e8] p-5" aria-label="Como receber os banhos de luz" data-pdf-block><h3 className="font-serif text-2xl text-[#173c2c]">Como receber os banhos de luz</h3><p className="mt-3 font-serif leading-7 text-[#43584c]">Chamamos de banho uma prática espiritual de imersão em luz colorida. Acomode-se sentado ou deitado e, se fizer sentido para você, imagine uma piscina de luz da cor indicada para aquele dia envolvendo suavemente seu corpo. O banho pode ser recebido durante a sessão de escuta; o manual também sugere esse momento antes de dormir. Everton integra a intenção do banho à programação do seu cuidado.</p><p className="mt-2 font-serif leading-7 text-[#52645a]">Você não precisa preparar água ou ervas, visualizar com nitidez ou sentir algo especial. Pode apenas descansar. O motivo da escolha de cada cor aparece no dia correspondente, para que você compreenda o cuidado que está recebendo.</p></section>}
    {!!schedule.length && <section className="mt-7" aria-label="Programação diária">
      <h3 className="font-serif text-3xl text-[#173c2c]">Seu cuidado, dia a dia</h3>
      <p className="mt-3 font-serif leading-7 text-[#43584c]">A sequência começa pelo que hoje pede mais apoio e avança até a integração. Cada dia abaixo mostra a intenção e o motivo das escolhas para você.</p>
      <ol className="mt-4 space-y-4">{schedule.map(entry => <li key={entry.day} className="rounded-2xl border border-[#d9c79b] bg-[#fff9e8]/85 p-5" data-pdf-block>
        <div className="mb-3 flex items-start gap-3 border-b border-[#d9c79b] pb-3"><h4 className="shrink-0 rounded-lg bg-[#b28a34] px-3 py-1 font-serif text-xl text-[#fffaf0]">Dia {entry.day}</h4><p className="font-serif text-xl text-[#173c2c]">{entry.intention}</p></div>
        {entry.reason && <p className="mb-3 font-serif text-base leading-7 text-[#43584c]">{entry.reason}</p>}
        <div className="mt-3 space-y-2">{entry.energyNames.map(name => <p key={name} className="font-serif text-sm leading-6 text-[#43584c]"><strong className="text-[#173c2c]">{name}:</strong> {entry.energyDetails?.find(detail => detail.name === name)?.explanation || entry.intention}</p>)}</div>


        {!!entry.resources?.length && <div className="mt-3 border-l-2 border-[#d9c79b] pl-4" aria-label={`Apoios do dia ${entry.day}`}><h5 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9a6f22]">O cuidado que acompanha este dia</h5><ul className="space-y-2">{entry.resources.filter(resource => !report.journeyResources?.some(item => item.id === resource.id)).map(resource => <li key={resource.id} className="font-serif text-sm leading-6 text-[#52645a]"><strong>{resource.category} · {resource.name}:</strong> {resource.explanation}</li>)}</ul></div>}

        {entry.invitation && <p className="mt-4 border-t border-[#d9c79b]/70 pt-3 font-serif text-sm leading-6 text-[#43584c]"><strong className="text-[#173c2c]">Um gesto possível para hoje:</strong> {entry.invitation}</p>}
      </li>)}</ol>
    </section>}
    {!!libraryResources.length && <p className="mt-5 font-serif text-sm leading-6 text-[#52645a]">Os cristais etéricos integram a composição energética; você não precisa adquirir pedras físicas. O floral e o aroma seguem as orientações apresentadas acima, durante todo o percurso.</p>}
    <p className="mt-6 font-serif text-xl italic leading-8 text-[#a87828]" data-pdf-block>Você não precisa dar conta de tudo para merecer cuidado. Há espaço para pausar, receber apoio e seguir um passo de cada vez.</p>
  </Shell>;
}
