import { FullReportNarrative } from '../result/fullReportNarrative';
import { ChakraSymbol } from './ChakraSymbol';

interface Props { report: FullReportNarrative; }

function Logo({ large=false, watermark=false }: { large?: boolean; watermark?: boolean }) {
  return <img src="/logo-everton-oficial.png" alt="Everton Piceni — Terapias Holísticas e Bem-Estar" className={`${large ? 'h-40 w-40 sm:h-52 sm:w-52' : 'h-24 w-24 sm:h-32 sm:w-32'} object-contain ${watermark ? 'opacity-[.075]' : 'opacity-70'}`} />;
}

function Shell({ page, children, cover=false, total=1 }: { total?:number; page:number; children:React.ReactNode; cover?:boolean }) {
  return <section className={`report-page relative overflow-hidden rounded-[2.25rem] border border-[#d9c79b] bg-[#fffaf0] shadow-[0_28px_80px_rgba(35,67,48,.13)] print:break-after-page print:rounded-none print:border-0 print:shadow-none ${cover ? 'min-h-[760px]' : 'min-h-[760px]'}`}>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(219,181,92,.16),transparent_24%),linear-gradient(145deg,rgba(255,255,255,.72),transparent_52%)]" />
    <div className="pointer-events-none absolute -right-20 top-36 h-80 w-80 rounded-full border border-[#c7a451]/20" />
    <div className="pointer-events-none absolute -right-6 top-48 h-52 w-52 rounded-full border border-[#c7a451]/10" />
    <div className="report-content relative z-10 flex min-h-[760px] flex-col px-6 py-7 sm:px-16 sm:py-9">
      <header className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
        <div className="self-end pb-2 text-[8px] font-semibold uppercase leading-5 tracking-[.26em] text-[#486255]"><div>Autenticidade</div><div>Equilíbrio</div><div>Bem-estar</div><div>Sempre</div><div className="mt-3 h-px w-14 bg-[#b9903d]"/></div>
        <Logo />
        <div className="pt-2 text-right text-[8px] uppercase leading-5 tracking-[.25em] text-[#52675b]"><div>Corpo</div><div>Mente</div><div>Energia</div><div>Espírito</div><div className="ml-auto mt-3 h-px w-14 bg-[#b9903d]"/></div>
      </header>
      <div className="mt-7 flex-1">{children}</div>
      <footer className="mt-8 flex items-center justify-between border-t border-[#d9c79b]/70 pt-4 text-[9px] uppercase tracking-[.17em] text-[#78847c]"><span>Everton Piceni · Terapias Holísticas e Bem-Estar</span><span>{page}/{total}</span></footer>
    </div>
  </section>;
}

function Title({ children, kicker }: { children:React.ReactNode; kicker?:string }) {
  return <div>{kicker && <div className="mb-3 text-[10px] font-semibold uppercase tracking-[.3em] text-[#a47a2d]">{kicker}</div>}<h2 className="max-w-3xl font-serif text-4xl leading-[1.04] text-[#173c2c] sm:text-[3.15rem]">{children}</h2><div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#d3b468]"/><span className="text-[#b58a34]">✿</span><div className="h-px w-24 bg-[#d3b468]"/></div></div>;
}

function Text({ items }: { items:string[] }) {
  return <div className="space-y-5 font-serif text-[16px] leading-[1.65] text-[#43584c]">{items.map((p,i)=><p key={i}>{p}</p>)}</div>;
}

export function FullReportApprovedView({ report }: Props) {
  const schedule = report.dailyEnergySchedule || [];
  const resources = report.page4.paragraphs.filter(text => /^(Frequência de apoio|Cristais etéricos|Florais|Aromaterapia|Banho de apoio|Banho de luz)/.test(text));
  const direction = report.page4.paragraphs.filter(text => !resources.includes(text));
  const libraryResources = report.careResources || [];
  const scheduleGroups = Array.from({ length: Math.ceil(schedule.length / 7) }, (_, index) => schedule.slice(index * 7, index * 7 + 7));
  const total = 5 + scheduleGroups.length;

  return <div className="space-y-8 print:space-y-0">
    <Shell page={1} total={total} cover>
      <div className="grid items-center gap-8 sm:grid-cols-[1.05fr_.95fr]">
        <div>
          <Title kicker={report.journeyDays ? `Seu cuidado · ${report.journeyDays} dias` : 'Relatório completo'}>Leitura do <span className="italic text-[#a87828]">Seu Momento</span></Title>
          <h3 className="font-serif text-2xl leading-8 text-[#173c2c]">{report.nome}, este espaço começa pela sua história.</h3>
          <p className="mt-5 font-serif text-lg leading-8 text-[#43584c]">{report.page1.subtitle}</p>
          <p className="mt-5 font-serif text-[16px] leading-7 text-[#52645a]">{report.page1.intro}</p>
          <p className="mt-7 font-serif text-xl italic leading-8 text-[#a87828]">Aqui, você não precisa provar nada nem chegar a uma conclusão imediata. A proposta é compreender, acolher e organizar o cuidado no seu ritmo.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-[#d9c79b] shadow-[0_18px_50px_rgba(35,67,48,.12)]">
          <img src="/natureza-aprovada.jpg" alt="Paisagem contemplativa" className="h-[430px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173c2c]/30 via-transparent to-[#fffaf0]/10" />
          <div className="absolute bottom-5 right-5"><Logo watermark large /></div>
        </div>
      </div>
    </Shell>

    <Shell page={2} total={total}>
      <Title kicker="Primeiro, escutar">Leitura do <span className="text-[#a87828]">seu momento</span></Title>
      <h3 className="mb-4 font-serif text-2xl text-[#173c2c]">{report.nome}, o que suas respostas nos ajudam a perceber</h3>
      <div className="rounded-2xl border-l-4 border-[#789365] bg-[#edf2df]/75 px-5 py-5"><Text items={report.page2.paragraphs}/></div>
      {report.page2.cycle && <div className="mt-6 border-y border-[#d9c79b]/70 py-5"><h3 className="mb-3 font-serif text-2xl text-[#173c2c]">Um movimento que merece delicadeza</h3><p className="font-serif text-[16px] leading-7 text-[#43584c]">{report.page2.cycle}</p></div>}
      <p className="mt-7 font-serif text-lg italic leading-8 text-[#a87828]">Nada do que aparece aqui define quem você é. Esta leitura apenas organiza aquilo que, neste momento, parece pedir mais cuidado.</p>
    </Shell>

    <Shell page={3} total={total}>
      <Title kicker="Além do que está difícil">O que suas respostas <span className="text-[#a87828]">contam sobre você</span></Title>
      <Text items={report.page3.paragraphs.filter(text => !text.startsWith('Dentro deste protocolo'))}/>
      <div className="my-6 border-y border-[#d9c79b]/70 py-5" data-pdf-block><h3 className="mb-3 font-serif text-2xl text-[#173c2c]">O que permanece vivo em você</h3><Text items={report.page3.preserved}/></div>
      {report.page3.chakras.length > 0 && <section className="mt-6" aria-label="Chakras do cuidado">
        <h3 className="font-serif text-2xl text-[#173c2c]">Centros energéticos que ajudam a organizar este cuidado</h3>
        <p className="mt-3 font-serif text-sm leading-6 text-[#52645a]">Dentro da proposta integrativa, esses centros funcionam como referências simbólicas para aproximar suas respostas de intenções de cuidado. Eles não representam diagnóstico nem medição do seu corpo.</p>
        <div className="mt-4 grid gap-x-7 gap-y-4 sm:grid-cols-2">{report.page3.chakras.map(c => <article key={c.name} className="flex items-start gap-3" data-pdf-block><ChakraSymbol name={c.name}/><div><h4 className="font-serif text-xl text-[#9a6f22]">{c.name}</h4><p className="mt-1 font-serif text-sm leading-6 text-[#52645a]">{c.text}</p></div></article>)}</div>
      </section>}
    </Shell>

    <Shell page={4} total={total}>
      <Title kicker="Cuidado integrado">Como vamos <span className="text-[#a87828]">cuidar disso com você</span></Title>
      <Text items={direction}/>
      {!!report.journeyResources?.length && <section className="mt-7 border-t border-[#d9c79b]/70 pt-5" aria-label="Apoios da jornada">
        <h3 className="font-serif text-2xl text-[#173c2c]">Apoios que acompanham o percurso</h3>
        <p className="mt-2 font-serif text-sm leading-6 text-[#52645a]">Eles não aparecem como itens soltos: cada recurso entra para acompanhar um movimento que surgiu na sua anamnese.</p>
        <div className="mt-4 space-y-5">{report.journeyResources.map(resource => <article key={resource.id} data-pdf-block><h4 className="font-serif text-lg text-[#9a6f22]">{resource.name}</h4><p className="mt-1 font-serif text-sm leading-6 text-[#43584c]">{resource.explanation}</p><p className="mt-1 font-serif text-sm leading-6 text-[#52645a]">{resource.guidance}</p></article>)}</div>
      </section>}
      {libraryResources.some(item => item.category === 'Banho energético') && <section className="mt-6 border-t border-[#d9c79b]/70 pt-5" aria-label="Banhos de luz" data-pdf-block><h3 className="font-serif text-2xl text-[#173c2c]">Sobre os banhos de luz</h3><p className="mt-3 font-serif leading-7 text-[#43584c]">Neste protocolo, “banho” não significa água, ervas ou qualquer preparo físico. É uma prática de visualização e recepção simbólica de uma cor de luz. A cor aparece somente quando conversa com a intenção daquele dia.</p><p className="mt-2 font-serif leading-7 text-[#52645a]">Você não precisa visualizar com nitidez nem sentir algo especial. Pode apenas se acomodar e deixar a imagem acompanhar o momento.</p></section>}
      {!!resources.length && !libraryResources.length && <div className="mt-6"><Text items={resources}/></div>}
    </Shell>

    <Shell page={5} total={total}>
      <Title kicker="Um passo de cada vez">{report.page5.title}</Title>
      <Text items={report.page5.paragraphs}/>
      <div className="mt-8 rounded-2xl border border-[#c5d2aa] bg-[#edf2df]/75 p-6" data-pdf-block><h3 className="font-serif text-2xl text-[#173c2c]">{report.page5.closingTitle}</h3><div className="mt-4"><Text items={report.page5.closing}/></div></div>
      <p className="mt-7 font-serif text-xl italic leading-8 text-[#a87828]">Você não precisa dar conta de tudo para merecer cuidado. Há espaço para pausar, receber apoio e seguir um passo de cada vez.</p>
    </Shell>

    {scheduleGroups.map((group, groupIndex) => <Shell key={groupIndex} page={6 + groupIndex} total={total}>
      <Title kicker="Programação diária">Seu cuidado, <span className="text-[#a87828]">dia a dia</span></Title>
      <p className="mb-5 font-serif leading-7 text-[#43584c]">A sequência começa pelo que hoje pede mais apoio e avança com delicadeza. Cada dia reúne intenção, energias, cristal, banho de luz quando houver indicação e uma prática simples — tudo dentro do mesmo fio de cuidado.</p>
      <ol className="space-y-4">{group.map(entry => <li key={entry.day} className="rounded-2xl border border-[#d9c79b] bg-[#fff9e8]/85 p-4" data-pdf-block>
        <div className="mb-3 flex items-start gap-3 border-b border-[#d9c79b] pb-3"><h4 className="shrink-0 rounded-lg bg-[#b28a34] px-3 py-1 font-serif text-lg text-[#fffaf0]">Dia {entry.day}</h4><p className="font-serif text-lg text-[#173c2c]">{entry.intention}</p></div>
        {entry.reason && <p className="mb-3 font-serif text-sm leading-6 text-[#43584c]">{entry.reason}</p>}
        <div className="space-y-2">{entry.energyNames.map(name => <p key={name} className="font-serif text-sm leading-6 text-[#43584c]"><strong className="text-[#173c2c]">{name}:</strong> {entry.energyDetails?.find(detail => detail.name === name)?.explanation || entry.intention}</p>)}</div>
        {!!entry.resources?.length && <div className="mt-3 border-l-2 border-[#d9c79b] pl-4" aria-label={`Apoios do dia ${entry.day}`}><h5 className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9a6f22]">O que acompanha este cuidado</h5><div className="space-y-2">{entry.resources.filter(resource => !report.journeyResources?.some(item => item.id === resource.id)).map(resource => <p key={resource.id} className="font-serif text-sm leading-6 text-[#52645a]"><strong>{resource.name}:</strong> {resource.explanation}</p>)}</div></div>}
        {entry.invitation && <p className="mt-4 border-t border-[#d9c79b]/70 pt-3 font-serif text-sm leading-6 text-[#43584c]"><strong className="text-[#173c2c]">Uma prática possível para hoje:</strong> {entry.invitation}</p>}
      </li>)}</ol>
    </Shell>)}
  </div>;
}
