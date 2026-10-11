import { FullReportNarrative } from '../result/fullReportNarrative';

interface FullReportApprovedViewProps {
  report: FullReportNarrative;
}

function PageShell({ children, page }: { children: React.ReactNode; page: number }) {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-[#dccba6] bg-[#fffaf0] p-7 shadow-xl shadow-[#244735]/8 sm:p-10 print:break-after-page print:rounded-none print:border-0 print:shadow-none">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(215,196,143,0.14),transparent_24%),radial-gradient(circle_at_10%_90%,rgba(73,111,82,0.08),transparent_28%)]" />
      <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full border border-[#c9aa62]/15" />
      <div className="pointer-events-none absolute -bottom-16 -right-12 h-64 w-64 rounded-full border border-[#c9aa62]/10" />

      <div className="relative z-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-everton-oficial.svg"
              alt="Everton Piceni"
              className="h-16 w-16 rounded-full object-cover opacity-95 sm:h-20 sm:w-20"
            />
            <div>
              <div className="font-serif text-lg font-semibold tracking-wide text-[#173c2c]">Everton Piceni</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9b7d38]">Terapias Holísticas e Bem-Estar</div>
            </div>
          </div>
          <div className="hidden text-right text-[10px] uppercase tracking-[0.25em] text-[#65766b] sm:block">
            <div>Corpo</div><div>Mente</div><div>Energia</div><div>Espírito</div>
          </div>
        </header>

        {children}

        <footer className="mt-10 flex items-end justify-between gap-4 border-t border-[#ddcfae] pt-4 text-[10px] uppercase tracking-[0.22em] text-[#6f786f]">
          <span>Everton Piceni · Terapias Holísticas e Bem-Estar</span>
          <span>Página {page} de 5</span>
        </footer>
      </div>
    </section>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-serif text-3xl leading-tight text-[#173c2c] sm:text-5xl">
      {children}
    </h2>
  );
}

function Paragraphs({ items }: { items: string[] }) {
  return (
    <div className="space-y-4 text-[15px] leading-7 text-[#44584b] sm:text-[17px] sm:leading-8">
      {items.map((text, index) => <p key={`${index}-${text.slice(0, 24)}`}>{text}</p>)}
    </div>
  );
}

export function FullReportApprovedView({ report }: FullReportApprovedViewProps) {
  return (
    <div className="space-y-7">
      <PageShell page={1}>
        <div className="max-w-3xl py-8 sm:py-14">
          <div className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#a07f36]">Relatório Completo</div>
          <h1 className="font-serif text-4xl leading-[1.02] text-[#173c2c] sm:text-6xl">
            Leitura do <span className="text-[#a87828]">Seu Momento</span>
          </h1>
          <div className="my-7 h-px w-40 bg-[#caa451]" />
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
        {report.page2.cycle && (
          <div className="mt-8 rounded-[1.75rem] border border-[#dec98e] bg-[#fbf3df] px-6 py-5 text-center font-serif text-lg italic leading-8 text-[#9a6f22]">
            {report.page2.cycle}
          </div>
        )}
        <p className="mt-6 text-base leading-7 text-[#5d6b62]">
          Esse ciclo não define você. Ele apenas nos ajuda a compreender o que pode estar acontecendo neste momento para que possamos cuidar justamente do ponto onde tudo começa a pesar.
        </p>
      </PageShell>

      <PageShell page={3}>
        <Title>{report.page3.title}</Title>
        <div className="my-6 h-px w-full bg-[#d2b369]" />
        <Paragraphs items={report.page3.paragraphs} />

        <div className="my-8 rounded-[1.75rem] border border-[#e2d4b3] bg-white/55 p-6">
          <div className="font-serif text-2xl text-[#173c2c]">Recursos que permanecem vivos em você</div>
          <ul className="mt-4 space-y-2 text-[15px] leading-6 text-[#53655a]">
            {report.page3.preserved.map(item => <li key={item}>• {item}</li>)}
          </ul>
          <div className="mt-5 font-serif text-xl italic text-[#a87828]">É essa parte que queremos fortalecer.</div>
        </div>

        <div className="mt-8">
          <h3 className="font-serif text-3xl leading-tight text-[#173c2c]">O que os seus chakras nos mostram dentro do protocolo</h3>
          <div className="mt-5 space-y-5">
            {report.page3.chakras.map(chakra => (
              <div key={chakra.name} className="border-l-2 border-[#c8a656] pl-4">
                <div className="font-semibold text-[#9a6f22]">{chakra.name}</div>
                <p className="mt-1 text-[15px] leading-7 text-[#506258]">{chakra.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-7 text-base leading-7 text-[#5d6b62]">
            Nada disso significa que há algo errado com você. Significa apenas que existem partes suas pedindo reorganização, descanso, sustentação e cuidado.
          </p>
        </div>
      </PageShell>

      <PageShell page={4}>
        <Title>{report.page4.title}</Title>
        <div className="my-6 h-px w-full bg-[#d2b369]" />
        <Paragraphs items={report.page4.paragraphs} />
        <div className="mt-9 rounded-[1.75rem] bg-[#edf1e8] px-6 py-5 font-serif text-xl italic leading-8 text-[#375542]">
          O cuidado é escolhido para dialogar com a sua história — não para se sobrepor a ela.
        </div>
      </PageShell>

      <PageShell page={5}>
        <Title>{report.page5.title}</Title>
        <div className="my-6 h-px w-full bg-[#d2b369]" />
        <Paragraphs items={report.page5.paragraphs} />

        <div className="my-9 h-px w-full bg-[#e0d1ad]" />
        <h3 className="font-serif text-3xl text-[#173c2c] sm:text-4xl">{report.page5.closingTitle}</h3>
        <div className="mt-5">
          <Paragraphs items={report.page5.closing} />
        </div>
        <div className="mt-9 font-serif text-2xl italic leading-9 text-[#a87828]">
          Você não precisa carregar tudo sozinha. Seu ritmo será respeitado. Sem pressa, mas com presença.
        </div>
      </PageShell>
    </div>
  );
}
