import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Heart, LayoutDashboard, PlusCircle, Route, ShieldCheck, Sparkles } from 'lucide-react';
import { AnamneseInput } from '../types';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { saveIntakeSession } from '../services/backend';
import { UserMomentArea } from './UserMomentArea';
import { PrivacyPolicy } from './PrivacyPolicy';

type Step = 'welcome' | 'intro' | 'profile' | 'questions' | 'reflection' | 'review' | 'processing' | 'sent';
type UserArea = 'anamnese' | 'momento' | 'jornada';
const STORAGE_KEY = 'anamnese-integrativa-draft-v1';
const scaleLabels = ['Não acontece comigo', 'Acontece um pouco', 'Acontece às vezes', 'Acontece bastante', 'Está muito presente'];

const emptyIntake = (): AnamneseInput => ({
  id: `ANAM-${crypto.randomUUID()}`,
  data: new Date().toISOString().split('T')[0],
  nomePessoa: '', idade: '', contato: '', historicoEnergetico: '', intencaoDeclarada: '',
  respostasObjetivas: {}, relatoLivreNecessidade: '', relatoLivreDesafios: '', relatoLivrePreservado: '',
  regioesCorporaisPercebidas: [], preferenciasAtendimento: '', sensibilidadeEnergetica: 'moderada',
});

interface Props { userId: string; onSubmit?: (data: AnamneseInput) => void; onSignOut?: () => void | Promise<void>; }

export default function UserAnamneseApp({ userId, onSubmit, onSignOut }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [userArea, setUserArea] = useState<UserArea>('anamnese');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [form, setForm] = useState<AnamneseInput>(emptyIntake);
  const [submissionError, setSubmissionError] = useState('');
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const answered = PERGUNTAS_ANAMNESE.filter(q => Number.isInteger(form.respostasObjetivas[q.id]) && form.respostasObjetivas[q.id] >= 0 && form.respostasObjetivas[q.id] <= 4).length;
  const progress = Math.round((answered / PERGUNTAS_ANAMNESE.length) * 100);
  const currentQuestion = PERGUNTAS_ANAMNESE[questionIndex];
  const canAdvanceProfile = form.nomePessoa.trim().length > 1;
  const allAnswered = answered === PERGUNTAS_ANAMNESE.length;
  const firstName = useMemo(() => form.nomePessoa.trim().split(/\s+/)[0] || '', [form.nomePessoa]);
  const draftKey = useMemo(() => `${STORAGE_KEY}:${userId}`, [userId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed?.form && typeof parsed.form.nomePessoa === 'string' && parsed.form.respostasObjetivas && typeof parsed.form.respostasObjetivas === 'object' && Array.isArray(parsed.form.regioesCorporaisPercebidas)) setForm({ ...emptyIntake(), ...parsed.form });
      if (Number.isInteger(parsed?.questionIndex)) setQuestionIndex(Math.max(0, Math.min(PERGUNTAS_ANAMNESE.length - 1, parsed.questionIndex)));
      if (['welcome','intro','profile','questions','reflection','review'].includes(parsed?.step)) setStep(parsed.step);
      else if (parsed?.step === 'processing') setStep('review');
    } catch { /* rascunho inválido */ } finally { setDraftLoaded(true); }
  }, [draftKey]);

  useEffect(() => {
    if (!draftLoaded || step === 'sent') return;
    try { localStorage.setItem(draftKey, JSON.stringify({ form, step, questionIndex })); } catch { /* O formulário continua disponível sem armazenamento local. */ }
  }, [draftKey, draftLoaded, form, step, questionIndex]);

  function setField<K extends keyof AnamneseInput>(key: K, value: AnamneseInput[K]) { setForm(prev => ({ ...prev, [key]: value })); }
  function answer(value: number) { if (currentQuestion) setForm(prev => ({ ...prev, respostasObjetivas: { ...prev.respostasObjetivas, [currentQuestion.id]: value } })); }
  function resetIntake() { setUserArea('anamnese'); setForm(emptyIntake()); setSubmissionError(''); setQuestionIndex(0); setStep('welcome'); }
  function nextQuestion() { if (questionIndex < PERGUNTAS_ANAMNESE.length - 1) setQuestionIndex(i => i + 1); else setStep('reflection'); }
  function previousQuestion() { if (questionIndex > 0) setQuestionIndex(i => i - 1); else setStep('profile'); }

  async function submit() {
    if (step === 'processing' || !allAnswered || !canAdvanceProfile) return;
    const finalData = { ...form, nomePessoa: form.nomePessoa.trim() };
    setSubmissionError('');
    setStep('processing');
    try {
      await saveIntakeSession({ userId, intake: finalData });
      setForm(finalData);
      onSubmit?.(finalData);
      try { localStorage.removeItem(draftKey); } catch { /* armazenamento indisponível */ }
      setStep('sent');
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : 'Não foi possível salvar sua anamnese com segurança.');
      setStep('review');
    }
  }

  if (showPrivacy) return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;

  return (
    <div className="min-h-screen bg-[#f6f1e6] text-[#173c2c]">
      <header className="sticky top-0 z-30 border-b border-[#d9caa8]/70 bg-[#fffaf0]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/logo-everton-oficial.png" alt="Everton Piceni" className="h-12 w-12 object-contain" />
            <div className="hidden sm:block"><div className="font-serif text-lg">Everton Piceni</div><div className="text-[10px] tracking-[.2em] text-[#96773b]">ANAMNESE INTEGRATIVA</div></div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <TopButton active={userArea === 'anamnese'} onClick={resetIntake}><PlusCircle className="h-4 w-4" /> Nova</TopButton>
            <TopButton active={userArea === 'momento'} onClick={() => setUserArea('momento')}><LayoutDashboard className="h-4 w-4" /> Momento</TopButton>
            <TopButton active={userArea === 'jornada'} onClick={() => setUserArea('jornada')}><Route className="h-4 w-4" /> Jornada</TopButton>
            {onSignOut && <button onClick={() => void onSignOut()} className="px-3 py-2 text-xs text-[#66766d]">Sair</button>}
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0"><div className="absolute -left-40 top-16 h-96 w-96 rounded-full bg-[#cbd9c5]/30 blur-3xl" /><div className="absolute -right-40 top-96 h-[28rem] w-[28rem] rounded-full bg-[#e8d4a0]/25 blur-3xl" /></div>
        <div className={`relative mx-auto px-5 py-10 sm:py-14 max-w-5xl`}>
          {userArea === 'anamnese' && (
            <>
              {step === 'welcome' && (
                <section className="grid min-h-[70vh] items-center gap-10 lg:grid-cols-2"><div className="pointer-events-none absolute -left-24 top-0 -z-10 h-[32rem] w-[32rem] rounded-full bg-[#f1d48a]/35 blur-3xl" aria-hidden="true" />
                  <div className="space-y-6"><Eyebrow>UM ENCONTRO COM O SEU MOMENTO</Eyebrow><h1 className="font-serif text-5xl leading-tight sm:text-6xl">Como você está <span className="italic text-[#a87828]">de verdade?</span></h1><p className="max-w-xl text-lg leading-8 text-[#52665b]">Antes de tudo, respire. Este é um espaço para ouvir você, acolher o que está vivendo e encontrar um caminho de cuidado no seu ritmo.</p><Primary onClick={() => setStep('intro')}>Começar meu cuidado <ArrowRight className="h-5 w-5" /></Primary></div>
                  <div className="relative mx-auto min-h-[440px] w-full overflow-hidden rounded-[3rem] border border-[#d6c28b] shadow-2xl shadow-[#244735]/20 sm:min-h-[520px]">
                    <img src="/natureza-aprovada.jpg" alt="Uma pessoa contemplando o nascer do sol entre montanhas e árvores" className="absolute inset-0 h-full w-full object-cover object-[center_72%]" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123526]/95 via-[#123526]/65 to-transparent px-7 pb-8 pt-24 text-[#fff5d8]">
                      <p className="font-serif text-2xl italic leading-8">Cuidar da sua energia é voltar para você.</p>
                      <p className="mt-3 text-sm leading-6 text-[#fffaf0]">Você pode começar com uma pausa. O próximo passo vem no seu tempo.</p>
                    </div>
                  </div>
                </section>
              )}

              {step === 'intro' && <Card><Eyebrow>ANTES DE COMEÇAR</Eyebrow><h2 className="font-serif text-4xl">Você pode responder no seu tempo.</h2><p className="text-lg leading-8 text-[#5a6a60]">Não existem respostas certas. Escolha aquilo que mais se aproxima do que você vive agora.</p><Nav><Secondary onClick={() => setStep('welcome')}>Voltar</Secondary><Primary onClick={() => setStep('profile')}>Quero começar</Primary></Nav></Card>}

              {step === 'profile' && <Card><Eyebrow>PRIMEIRO, VOCÊ</Eyebrow><h2 className="font-serif text-4xl">Como podemos chamar você?</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="Seu nome"><input value={form.nomePessoa} onChange={e => setField('nomePessoa', e.target.value)} className="user-input" placeholder="Como prefere ser chamado(a)" /></Field><Field label="Idade ou faixa etária"><input value={form.idade || ''} onChange={e => setField('idade', e.target.value)} className="user-input" placeholder="Opcional" /></Field><Field label="Contato"><input value={form.contato || ''} onChange={e => setField('contato', e.target.value)} className="user-input" placeholder="Opcional" /></Field><Field label="O que você espera encontrar aqui?"><input value={form.intencaoDeclarada} onChange={e => setField('intencaoDeclarada', e.target.value)} className="user-input" placeholder="Uma frase é suficiente" /></Field></div><Nav><Secondary onClick={() => setStep('intro')}>Voltar</Secondary><Primary disabled={!canAdvanceProfile} onClick={() => setStep('questions')}>Continuar</Primary></Nav></Card>}

              {step === 'questions' && currentQuestion && (
                <section className="mx-auto max-w-4xl">
                  <div className="mb-8 flex items-end justify-between"><div><Eyebrow>{firstName ? `${firstName.toUpperCase()} · ` : ''}PERGUNTA {questionIndex + 1}</Eyebrow><div className="mt-2 text-xs text-[#788078]">{questionIndex + 1} de {PERGUNTAS_ANAMNESE.length}</div></div><div className="w-48"><div className="mb-2 text-right text-xs text-[#8d7743]">{progress}%</div><div className="h-px bg-[#d9cfb7]"><div className="h-px bg-[#a87828]" style={{ width: `${progress}%` }} /></div></div></div>
                  <div className="border-y border-[#d7c69d] bg-[#fffaf0]/60 px-3 py-10 sm:px-10"><h2 className="mx-auto max-w-3xl text-center font-serif text-3xl leading-snug">{currentQuestion.texto}</h2>{currentQuestion.dicaAcolhedora && <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-[#748077]">{currentQuestion.dicaAcolhedora}</p>}<div className="mx-auto mt-8 grid max-w-3xl gap-2">{scaleLabels.map((label, value) => { const selected = form.respostasObjetivas[currentQuestion.id] === value; return <button key={value} onClick={() => answer(value)} className={`flex items-center gap-4 border-b px-3 py-4 text-left ${selected ? 'border-[#a87828]' : 'border-[#ded5c0]'}`}><span className={`flex h-9 w-9 items-center justify-center rounded-full border ${selected ? 'bg-[#173f2d] text-white' : ''}`}>{selected ? <Check className="h-4 w-4" /> : value}</span>{label}</button>; })}</div><div className="mx-auto mt-9 flex max-w-3xl justify-between"><Secondary onClick={previousQuestion}><ChevronLeft className="h-4 w-4" /> Voltar</Secondary><Primary disabled={form.respostasObjetivas[currentQuestion.id] === undefined} onClick={nextQuestion}>{questionIndex === PERGUNTAS_ANAMNESE.length - 1 ? 'Continuar' : 'Próxima'} <ChevronRight className="h-4 w-4" /></Primary></div></div>
                </section>
              )}

              {step === 'reflection' && <Card><Eyebrow>AGORA, COM SUAS PALAVRAS</Eyebrow><h2 className="font-serif text-4xl">O que precisa ser acolhido?</h2><Field label="O que mais pede cuidado neste momento?"><textarea rows={4} value={form.relatoLivreNecessidade} onChange={e => setField('relatoLivreNecessidade', e.target.value)} className="user-input resize-none" /></Field><Field label="Há algo que se repete ou tem sido difícil atravessar?"><textarea rows={3} value={form.relatoLivreDesafios} onChange={e => setField('relatoLivreDesafios', e.target.value)} className="user-input resize-none" /></Field><Field label="O que continua vivo e forte em você?"><textarea rows={3} value={form.relatoLivrePreservado} onChange={e => setField('relatoLivrePreservado', e.target.value)} className="user-input resize-none" /></Field><Nav><Secondary onClick={() => { setStep('questions'); setQuestionIndex(PERGUNTAS_ANAMNESE.length - 1); }}>Voltar</Secondary><Primary onClick={() => setStep('review')}>Revisar</Primary></Nav></Card>}

              {step === 'review' && <Card><Eyebrow>ANTES DE ENVIAR</Eyebrow><h2 className="font-serif text-4xl">Isso representa seu momento?</h2><p className="text-[#617066]">{answered} de {PERGUNTAS_ANAMNESE.length} perguntas respondidas.</p>{form.relatoLivreNecessidade && <blockquote className="border-l border-[#c6a350] pl-5 leading-7 text-[#617066]">{form.relatoLivreNecessidade}</blockquote>}{!allAnswered && <p className="text-sm text-[#806520]">Ainda existem perguntas sem resposta.</p>}{submissionError && <p className="text-sm text-rose-700">{submissionError}</p>}<Nav><Secondary onClick={() => setStep('reflection')}><ArrowLeft className="h-4 w-4" /> Revisar</Secondary><Primary disabled={!allAnswered || !canAdvanceProfile} onClick={submit}>Enviar minha anamnese <Sparkles className="h-4 w-4" /></Primary></Nav></Card>}

              {step === 'processing' && <section className="flex min-h-[60vh] flex-col items-center justify-center text-center"><Sparkles className="mb-6 h-10 w-10 animate-pulse text-[#a87828]" /><Eyebrow>RECEBENDO SUAS RESPOSTAS</Eyebrow><h2 className="mt-4 font-serif text-4xl">Estamos recebendo sua anamnese.</h2><p className="mt-4 max-w-xl leading-7 text-[#5c6d62]">Estamos guardando com cuidado o que você compartilhou para preparar sua leitura.</p></section>}

              {step === 'sent' && <Card><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#c6a350]"><Heart className="h-7 w-7" /></div><Eyebrow>ANAMNESE RECEBIDA</Eyebrow><h2 className="font-serif text-4xl">A leitura é o começo, não o fim.</h2><p className="leading-7 text-[#5c6d62]">Você poderá acompanhar o que for efetivamente liberado em Meu Momento e Minha Jornada.</p><Nav><Primary onClick={() => setUserArea('momento')}>Ir para Meu Momento</Primary><Secondary onClick={resetIntake}>Nova anamnese</Secondary></Nav></Card>}
            </>
          )}

          {userArea === 'momento' && <UserMomentArea mode="momento" onStartNewIntake={resetIntake} />}
          {userArea === 'jornada' && <UserMomentArea mode="jornada" onStartNewIntake={resetIntake} />}
        </div>
      </main>

      <footer className="border-t border-[#ddd1b7]/70 px-5 py-7 text-center text-xs text-[#788078]">Anamnese Integrativa · Um espaço de acolhimento e direcionamento complementar.<button onClick={() => setShowPrivacy(true)} className="ml-2 font-semibold text-[#806c3f] underline underline-offset-4">Privacidade e LGPD</button></footer>
    </div>
  );
}

function TopButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) { return <button onClick={onClick} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold ${active ? 'border-[#b89546] bg-[#173f2d] text-white' : 'border-[#d8c99f] bg-white/60 text-[#617066]'}`}>{children}</button>; }
function Card({ children }: { children: React.ReactNode }) { return <section className="mx-auto max-w-3xl border-y border-[#d6c28b] bg-[#fffaf0]/60 px-3 py-10 sm:px-10 sm:py-14"><div className="space-y-6">{children}</div></section>; }
function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="text-xs font-semibold tracking-[.2em] text-[#a18443]">{children}</div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-[#365441]">{label}</span>{children}</label>; }
function Nav({ children }: { children: React.ReactNode }) { return <div className="flex flex-wrap gap-3 pt-3">{children}</div>; }
function Primary({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) { return <button disabled={disabled} onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f2d] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#173f2d]/15 transition hover:bg-[#22533d] disabled:opacity-40">{children}</button>; }
function Secondary({ children, onClick }: { children: React.ReactNode; onClick: () => void | Promise<void> }) { return <button onClick={() => void onClick()} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cdbc91] bg-white/50 px-5 py-3 font-semibold text-[#53675b] hover:bg-white">{children}</button>; }
