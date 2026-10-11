import { FullReportNarrative } from '../result/fullReportNarrative';

interface FullReportApprovedViewProps {
  report: FullReportNarrative;
}

function PageShell({ children, page }: { children: React.ReactNode; page: number }) {
  return (
    <section className="relative overflow-hidden rounded-[2.4rem] border border-[#dccba6] bg-[#fffaf0] p-7 shadow-xl shadow-[#244735]/8 sm:p-10 print:break-after-page print:rounded-none print:border-0 print:shadow-none">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_12%,rgba(213,190,126,0.15),transparent_25%),radial-gradient(circle_at_8%_92%,rgba(57,101,70,0.11),transparent_29%),linear-gradient(135deg,rgba(255,255,255,0.2),transparent_60%)]" />
      <div className="pointer-events-none absolute -left-20 -top-16 h-52 w-52 rounded-full border border-[#75906f]/12 bg-[#b9c9ad]/8 blur-[1px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full border border-[#c9aa62]/12 bg-[#ddc98f]/7" />
      <div className="pointer-events-none absolute right-[-7%] top-[32%] h-56 w-56 rounded-full border border-[#c7a451]/15" />

      <div className="relative z-10">
        <header className="mb-9 grid grid-cols-[1fr_auto_1fr] items-start gap-4">
          <div className="pt-5 text-[9px] font-semibold uppercase leading-5 tracking-[0.27em] text-[#496457]">
            <div>Autenticidade</div>
            <div>Equilíbrio</div>
            <div>Bem-estar</div>
            <div>Sempre</div>
            <div className="mt-3 h-px w-14 bg-[#b89447]" />
          </div>

          <div className="text-center">
            <img
              src="/logo-everton-oficial.svg"
              alt="Everton Piceni"
              className="mx-auto h-28 w-28 object-contain opacity-100 sm:h-36 sm:w-36"
            />
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#173c2c]">Terapias Holísticas e Bem-Estar</div>
            <div className="mt-1 text-[8px] uppercase tracking-[0.32em] text-[#9a7a38]">Corpo · Mente · Energia · Espírito</div>
            <div className="mx-auto mt-3 h-px w-44 bg-[#c6a350]" />
            <div className="mt-2 text-[8px] uppercase tracking-[0.24em] text-[#66766d]">Cuidar da sua energia é voltar para você</div>
          </div>

          <div className="pt-5 text-right text-[9px] uppercase leading-5 tracking-[0.27em] text-[#4b6156]">
            <div>Corpo</div>
            <div>Mente</div>
            <div>Energia</div>
            <div>Espírito</div>
            <div className="ml-auto mt-3 h-px w-14 bg-[#b89447]" />
            <div className="mt-3 font-serif text-sm normal-case italic leading-5 tracking-normal text-[#496457]">Mais equilíbrio<br />para uma vida<br />com sentido.</div>
          </div>
        </header>

        {children}

        <footer className="mt-10 flex items-end justify-between gap-4 border-t border-[#ddcfae] pt-4 text-[9px] uppercase tracking-[0.22em] text-[#6f786f]">
          <span>Everton Piceni · Terapias Holísticas e Bem-Estar</span>
          <span>Página {page} de 5</span>
        </footer>
      </div>
    </section>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="font-serif text-3xl leading-tight text-[#173c2c] sm:text-[3.25rem]">{children}</h2>;
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="space-y-4 text-[15px] leading-7 text-[#44584b] sm:text-[16px] sm:leading-[1.85]">
      {items.map((text, index) => <p key={`${index}-${text.slice(0, 24)}`}>{text}</p>)}
    </div>
  );
}

export function FullReportApprovedView({ report }: FullReportApprovedViewProps) {
  return (
    <div className="space-y-7">
      <PageShell page={1}>
        <div className="max-w-3xl py-6 sm:py-10">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#a07f36]">Relatório Completo</div>
          <h1 className="font-serif text-4xl leading-[1.03] text-[#173c2c] sm:text-[3.8rem]">
            Leitura do <span className="text-[#a87828]">Seu Momento</span>
          </h1>
          <div className="my-7 flex items-center gap-3"><div className="h-px flex-1 bg-[#caa451]" /><div className="font-serif text-lg text-[#aa8439]">◇</div><div className="h-px flex-1 bg-[#caa451]" /></div>
          <div className="font-serif text-3xl text-[#173c2c] sm:text-4xl">{report.nome}</div>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#506258]">{report.page1.intro}</p>
          <p className="mt-6 max-w-2xl text-base leading-7 text-[#718077]">{report.page1.subtitle}</p>
          <div className="mt-12 font-serif text-2xl italic text-[#a87828]">Cuidar da sua energia é voltar para você.</div>
        </div>
      </PageShell>

      <PageShell page={2}>
        <Title>{report.page2.title}</Title>
        <div className="my-6 h-px w-full bg-[#d2b369]" />
        <Paragraphs items={report.page2.paragraphs} />
        {report.page2.cycle && <div className="mt-8 rounded-[1.75rem] border border-[#dec98e] bg-[#fbf3df] px-6 py-5 text-center font-serif text-lg italic leading-8 text-[#9a6f22]">{report.page2.cycle}</div>}
        <p className="mt-6 text-base leading-7 text-[#5d6b62]">Esse ciclo não define você. Ele apenas nos ajuda a compreender o que pode estar acontecendo neste momento para que possamos cuidar justamente do ponto onde tudo começa a pesar.</p>
      </PageShell>

      <PageShell page={3}>
        <Title>{report.page3.title}</Title>
        <div className="my-6 h-px w-full bg-[#d2b369]" />
        <Paragraphs items={report.page3.paragraphs} />

        <div className="my-8 rounded-[1.75rem] border border-[#e2d4b3] bg-white/55 p-6">
          <div className="font-serif text-2xl text-[#173c2c]">Recursos que permanecem vivos em você</div>
          <ul className="mt-4 space-y-2 text-[15px] leading-6 text-[#53655a]">{report.page3.preserved.map(item => <li key={item}>• {item}</li>)}</ul>
          <div className="mt-5 font-serif text-xl italic text-[#a87828]">É essa parte que queremos fortalecer.</div>
        </div>

        <div className="mt-8">
          <h3 className="font-serif text-3xl leading-tight text-[#173c2c]">O que os seus chakras nos mostram dentro do protocolo</h3>
          <div className="mt-5 space-y-5">
            {report.page3.chakras.map(chakra => <div key={chakra.name} className="border-l-2 border-[#c8a656] pl-4"><div className="font-semibold text-[#9a6f22]">{chakra.name}</div><p className="mt-1 text-[15px] leading-7 text-[#506258]">{chakra.text}</p></div>)}
          </div>
          <p className="mt-7 text-base leading-7 text-[#5d6b62]">Nada disso significa que há algo errado com você. Significa apenas que existem partes suas pedindo reorganização, descanso, sustentação e cuidado.</p>
        </div>
      </PageShell>

      <PageShell page={4}>
        <Title>{report.page4.title}</Title>
        <div className="my-6 h-px w-full bg-[#d2b369]" />
        <Paragraphs items={report.page4.paragraphs} />
        <div className="mt-9 rounded-[1.75rem] bg-[#edf1e8] px-6 py-5 font-serif text-xl italic leading-8 text-[#375542]">O cuidado é escolhido para dialogar com a sua história — não para se sobrepor a ela.</div>
      </PageShell>

      <PageShell page={5}>
        <Title>{report.page5.title}</Title>
        <div className="my-6 h-px w-full bg-[#d2b369]" />
        <Paragraphs items={report.page5.paragraphs} />
        <div className="my-9 h-px w-full bg-[#e0d1ad]" />
        <h3 className="font-serif text-3xl text-[#173c2c] sm:text-4xl">{report.page5.closingTitle}</h3>
        <div className="mt-5"><Paragraphs items={report.page5.closing} /></div>
        <div className="mt-9 font-serif text-2xl italic leading-9 text-[#a87828]">Você não precisa carregar tudo sem apoio. Seu ritmo será respeitado. Sem pressa, mas com presença.</div>
      </PageShell>
    </div>
  );
}
