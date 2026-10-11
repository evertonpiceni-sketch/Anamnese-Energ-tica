import { FullReportNarrative } from '../result/fullReportNarrative';
import { ChakraSymbol } from './ChakraSymbol';

interface Props { report: FullReportNarrative; }

function Logo({ large=false, watermark=false }: { large?: boolean; watermark?: boolean }) {
  return <img src="/logo-everton-oficial.png" alt="Everton Piceni — Terapias Holísticas e Bem-Estar" className={`${large ? 'h-40 w-40 sm:h-52 sm:w-52' : 'h-24 w-24 sm:h-32 sm:w-32'} object-contain ${watermark ? 'opacity-[.075]' : 'opacity-75'}`} />;
}

function Shell({ page, children, cover=false, total=1 }: { total?:number; page:number; children:React.ReactNode; cover?:boolean }) {
  return <section className={`report-page relative overflow-hidden rounded-[2.25rem] border border-[#d4c08d] bg-[#fffaf0] shadow-[0_28px_80px_rgba(35,67,48,.15)] print:break-after-page print:rounded-none print:border-0 print:shadow-none ${cover ? 'min-h-[760px]' : 'min-h-[760px]'}`}>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(219,181,92,.15),transparent_24%),linear-gradient(145deg,rgba(255,255,255,.72),transparent_52%)]" />
    <div className="pointer-events-none absolute -right-20 top-36 h-80 w-80 rounded-full border border-[#c7a451]/14" />
    <div className="pointer-events-none absolute -right-6 top-48 h-52 w-52 rounded-full border border-[#c7a451]/8" />
    <div className="report-content relative z-10 flex min-h-[760px] flex-col px-7 py-7 sm:px-16 sm:py-9">
      <header className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 opacity-90">
        <div className="self-end pb-2 text-[7px] font-semibold uppercase leading-5 tracking-[.3em] text-[#52675b]"><div>Autenticidade</div><div>Equilíbrio</div><div>Bem-estar</div><div className="mt-3 h-px w-10 bg-[#b9903d]/70"/></div>
        <Logo />
        <div className="pt-2 text-right text-[7px] font-semibold uppercase leading-5 tracking-[.3em] text-[#52675b]"><div>Corpo</div><div>Mente</div><div>Energia</div><div>Espírito</div><div className="ml-auto mt-3 h-px w-10 bg-[#b9903d]/70"/></div>
      </header>
      <div className="mt-7 flex-1">{children}</div>
      <footer className="mt-8 flex items-center justify-between border-t border-[#d9c79b]/65 pt-4 text-[8px] font-medium uppercase tracking-[.18em] text-[#6f7d74]"><span>Everton Piceni · Terapias Holísticas e Bem-Estar</span><span>{page}/{total}</span></footer>
    </div>
  </section>;
}

function Title({ children, kicker }: { children:React.ReactNode; kicker?:string }) {
  return <div>{kicker && <div className="mb-3 text-[10px] font-bold uppercase tracking-[.3em] text-[#9a6f22]">{kicker}</div>}<h2 className="max-w-3xl font-serif text-4xl font-medium leading-[1.04] text-[#103b2b] sm:text-[3.15rem]">{children}</h2><div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-[#c8a657]/80"/><span className="text-[#a87828]">✿</span><div className="h-px w-24 bg-[#c8a657]/80"/></div></div>;
}

function Text({ items }: { items:string[] }) {
  return <div className="space-y-5 font-serif text-[16px] leading-[1.72] text-[#31483d]">{items.map((p,i)=><p key={i}>{p}</p>)}</div>;
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
          <Title kicker={report.journeyDays ? `Seu cuidado · ${report.journeyDays} dias` : 'Relatório completo'}>Leitura do <span className="italic text-[#9d6b20]">Seu Momento</span></Title>
          <h3 className="font-serif text-2xl font-medium leading-8 text-[#103b2b]">{report.nome}, este espaço começa pela sua história.</h3>
          <p className="mt-5 font-serif text-lg leading-8 text-[#31483d]">{report.page1.subtitle}</p>
          <p className="mt-5 font-serif text-[16px] leading-7 text-[#40584b]">{report.page1.intro}</p>
          <p className="mt-7 font-serif text-xl italic leading-8 text-[#9d6b20]">Aqui, você não precisa provar nada nem chegar a uma conclusão imediata. A proposta é compreender, acolher e organizar o cuidado no seu ritmo.</p>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] border border-[#d9c79b] shadow-[0_18px_50px_rgba(35,67,48,.16)]">
          <img src="/natureza-aprovada.jpg" alt="Paisagem contemplativa" className="h-[430px] w-full object-cover saturate-[1.18] contrast-[1.06] brightness-[1.04]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#173c2c]/22 via-transparent to-transparent" />
          <div className="absolute bottom-5 right-5"><Logo watermark large /></div>
        </div>
      </div>
    </Shell>

    <Shell page={2} total={total}>
      <Title kicker="Primeiro, escutar">Leitura do <span className="text-[#9d6b20]">seu momento</span></Title>
      <h3 className="mb-4 font-serif text-2xl font-medium text-[#103b2b]">{report.nome}, o que suas respostas nos ajudam a perceber</h3>
      <div className="rounded-[1.5rem] border border-[#c7d2b4] bg-[#eef3e3]/78 px-6 py-6"><Text items={report.page2.paragraphs}/></div>
      {report.page2.cycle && <div className="mt-6 border-y border-[#d9c79b]/70 py-5"><h3 className="mb-3 font-serif text-2xl font-medium text-[#103b2b]">Um movimento que merece delicadeza</h3><p className="font-serif text-[16px] leading-7 text-[#31483d]">{report.page2.cycle}</p></div>}
      <p className="mt-7 font-serif text-lg italic leading-8 text-[#9d6b20]">Nada do que aparece aqui define quem você é. Esta leitura apenas organiza aquilo que, neste momento, parece pedir mais cuidado.</p>
    </Shell>

    <Shell page={3} total={total}>
      <Title kicker="Além do que está difícil">O que suas respostas <span className="text-[#9d6b20]">contam sobre você</span></Title>
      <Text items={report.page3.paragraphs.filter(text => !text.startsWith('Dentro deste protocolo'))}/>
      <div className="my-6 border-y border-[#d9c79b]/70 py-5" data-pdf-block><h3 className="mb-3 font-serif text-2xl font-medium text-[#103b2b]">O que permanece vivo em você</h3><Text items={report.page3.preserved}/></div>
      {report.page3.chakras.length > 0 && <section className="mt-6" aria-label="Chakras do cuidado"><h3 className="font-serif text-2xl font-medium text-[#103b2b]">Centros energéticos que ajudam a organizar este cuidado</h3><p className="mt-3 font-serif text-sm leading-6 text-[#40584b]">Dentro da proposta integrativa, esses centros funcionam como referências simbólicas para aproximar suas respostas de intenções de cuidado. Eles não representam diagnóstico nem medição do seu corpo.</p><div className="mt-4 grid gap-x-7 gap-y-4 sm:grid-cols-2">{report.page3.chakras.map(c => <article key={c.name} className="flex items-start gap-3" data-pdf-block><ChakraSymbol name={c.name}/><div><h4 className="font-serif text-xl font-medium text-[#93691f]">{c.name}</h4><p className="mt-1 font-serif text-sm leading-6 text-[#40584b]">{c.text}</p></div></article>)}</div></section>}
    </Shell>

    <Shell page={4} total={total}>
      <Title kicker="Cuidado integrado">Como vamos <span className="text-[#9d6b20]">cuidar disso com você</span></Title>
      <Text items={direction}/>
      {!!report.journeyResources?.length && <section className="mt-7 border-t border-[#d9c79b]/70 pt-5" aria-label="Apoios da jornada"><h3 className="font-serif text-2xl font-medium text-[#103b2b]">Apoios que acompanham o percurso</h3><p className="mt-2 font-serif text-sm leading-6 text-[#40584b]">Cada recurso entra para acompanhar um movimento que apareceu na sua anamnese, dentro do mesmo fio de cuidado.</p><div className="mt-4 space-y-5">{report.journeyResources.map(resource => <article key={resource.id} data-pdf-block><h4 className="font-serif text-lg font-medium text-[#93691f]">{resource.name}</h4><p className="mt-1 font-serif text-sm leading-6 text-[#31483d]">{resource.explanation}</p><p className="mt-1 font-serif text-sm leading-6 text-[#40584b]">{resource.guidance}</p></article>)}</div></section>}
      {libraryResources.some(item => item.category === 'Banho energético') && <section className="mt-6 border-t border-[#d9c79b]/70 pt-5" aria-label="Banhos de luz" data-pdf-block><h3 className="font-serif text-2xl font-medium text-[#103b2b]">Sobre os banhos de luz</h3><p className="mt-3 font-serif leading-7 text-[#31483d]">Neste protocolo, “banho” não significa água, ervas ou qualquer preparo físico. É uma prática de visualização e recepção simbólica de uma cor de luz, integrada ao cuidado daquele dia.</p><p className="mt-2 font-serif leading-7 text-[#40584b]">Não é preciso visualizar com nitidez nem sentir algo especial. Basta se acomodar e permitir que essa imagem acompanhe a pausa.</p></section>}
      {!!resources.length && !libraryResources.length && <div className="mt-6"><Text items={resources}/></div>}
    </Shell>

    <Shell page={5} total={total}>
      <Title kicker="Um passo de cada vez">{report.page5.title}</Title>
      <Text items={report.page5.paragraphs}/>
      <div className="mt-8 rounded-2xl border border-[#c5d2aa] bg-[#edf2df]/82 p-6" data-pdf-block><h3 className="font-serif text-2xl font-medium text-[#103b2b]">{report.page5.closingTitle}</h3><div className="mt-4"><Text items={report.page5.closing}/></div></div>
      <p className="mt-7 font-serif text-xl italic leading-8 text-[#9d6b20]">Você não precisa dar conta de tudo para merecer cuidado. Há espaço para pausar, receber apoio e seguir um passo de cada vez.</p>
    </Shell>

    {scheduleGroups.map((group, groupIndex) => <Shell key={groupIndex} page={6 + groupIndex} total={total}>
      <Title kicker="Programação diária">Seu cuidado, <span className="text-[#9d6b20]">dia a dia</span></Title>
      <p className="mb-6 max-w-3xl font-serif text-[16px] leading-7 text-[#40584b]">Cada dia foi pensado para conversar com uma parte do que você contou. Não há nada para cumprir perfeitamente: apenas um espaço de cuidado para atravessar no seu ritmo.</p>
      <ol className="space-y-6">{group.map(entry => {
        const dailyResources = entry.resources?.filter(resource => !report.journeyResources?.some(item => item.id === resource.id)) || [];
        return <li key={entry.day} className="rounded-[1.75rem] border border-[#d8c28b] bg-[#fffdf7]/95 px-5 py-5 shadow-[0_10px_32px_rgba(35,67,48,.07)]" data-pdf-block>
          <div className="flex flex-wrap items-center gap-3 border-b border-[#dfcfaa] pb-4"><span className="rounded-xl bg-[#b2822b] px-3 py-1 font-serif text-lg text-[#fffaf0]">Dia {entry.day}</span><h4 className="font-serif text-2xl font-medium leading-7 text-[#103b2b]">{entry.intention}</h4></div>

          {entry.reason && <div className="mt-5"><p className="font-serif text-[16px] leading-7 text-[#31483d]">{entry.reason}</p></div>}

          <section className="mt-5 rounded-[1.4rem] border border-[#d8dfc9] bg-[#f1f4e9]/82 px-5 py-5" aria-label={`Cuidado integrado do dia ${entry.day}`}>
            <h5 className="mb-4 font-serif text-xl font-medium text-[#103b2b]">Um cuidado que te acompanha hoje</h5>
            <div className="space-y-4 font-serif text-[15px] leading-7 text-[#31483d]">
              {entry.energyNames.map(name => <p key={name}><strong className="font-semibold text-[#103b2b]">{name}</strong> {entry.energyDetails?.find(detail => detail.name === name)?.explanation || entry.intention}</p>)}
              {dailyResources.map(resource => <p key={resource.id}><strong className="font-semibold text-[#103b2b]">{resource.name}</strong> {resource.explanation}</p>)}
            </div>
          </section>

          {entry.invitation && <section className="mt-5 rounded-[1.4rem] border border-[#ead8b0] bg-[#fff6e7]/88 px-5 py-5" aria-label={`Prática do dia ${entry.day}`}>
            <h5 className="font-serif text-xl font-medium text-[#103b2b]">Prática de hoje</h5>
            <p className="mt-2 font-serif text-[15px] leading-7 text-[#31483d]">{entry.invitation}</p>
          </section>}

          <section className="mt-5 rounded-[1.4rem] border border-[#cbd8c4] bg-[#eef3e9]/88 px-5 py-5" aria-label={`Fechamento do dia ${entry.day}`}>
            <h5 className="font-serif text-xl font-medium text-[#103b2b]">Ao terminar</h5>
            <p className="mt-2 font-serif text-[15px] leading-7 text-[#31483d]">Quando sentir que este momento chegou ao fim, permaneça alguns instantes em silêncio e deixe a respiração voltar ao ritmo natural. Para encerrar, você pode repetir devagar, algumas vezes:</p>
            <blockquote className="mt-3 border-l-4 border-[#8ba17d] bg-white/45 px-4 py-3 font-serif text-lg italic leading-7 text-[#17412f]">“Sinto muito. Me perdoe. Eu te amo. Sou grato.”</blockquote>
            <p className="mt-3 font-serif text-sm leading-6 text-[#40584b]">Use essas palavras como um gesto de reconciliação e cuidado consigo mesmo, sem exigir uma emoção específica. Apenas permita que o dia termine com um pouco mais de presença.</p>
          </section>
        </li>})}</ol>
    </Shell>)}
  </div>;
}
