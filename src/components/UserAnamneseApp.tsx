import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Download, Heart, Leaf, Mail, Save, ShieldCheck, Sparkles, LayoutDashboard, Route, PlusCircle } from 'lucide-react';
import { AnamneseInput, EixoId } from '../types';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { executarAnaliseIntegrativa, AnaliseCompletaResultado } from '../engine/analysisEngine';
import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { criarPlanoAudioPersonalizado, PersonalizedAudioPlan } from '../audio/audioCatalog';
import { ProgrammedAudioCard } from './ProgrammedAudioCard';
import { PracticeHistory } from './PracticeHistory';
import { selectComplementaryCare } from '../care/complementaryCatalogs';
import { buildCareComposition, CareComposition } from '../care/careComposer';
import { selectSolfeggioFrequency } from '../care/solfeggioCatalog';
import { saveIntakeSession } from '../services/backend';
import { downloadUserResultPdf } from '../pdf/userResultPdf';
import { requestResultEmail } from '../services/resultEmail';
import { UserMomentArea } from './UserMomentArea';
import { PrivacyPolicy } from './PrivacyPolicy';

type Step = 'welcome' | 'intro' | 'profile' | 'questions' | 'reflection' | 'review' | 'processing' | 'result' | 'sent';
type UserArea = 'anamnese' | 'momento' | 'jornada';

type FriendlyResult = {
  headline: string;
  intro: string;
  priorities: string[];
  intention: string;
  closing: string;
};

const STORAGE_KEY = 'anamnese-integrativa-draft-v1';
const SUBMISSIONS_KEY = 'anamnese-integrativa-submissions-v1';

const emptyIntake = (): AnamneseInput => ({
  id: `ANAM-${Date.now().toString().slice(-6)}`,
  data: new Date().toISOString().split('T')[0],
  nomePessoa: '',
  idade: '',
  contato: '',
  historicoEnergetico: '',
  intencaoDeclarada: '',
  respostasObjetivas: {},
  relatoLivreNecessidade: '',
  relatoLivreDesafios: '',
  relatoLivrePreservado: '',
  regioesCorporaisPercebidas: [],
  preferenciasAtendimento: '',
  sensibilidadeEnergetica: 'moderada',
});

interface UserAnamneseAppProps {
  userId: string;
  onSubmit?: (data: AnamneseInput) => void;
  onSignOut?: () => void | Promise<void>;
}

const scaleLabels = [
  'Não acontece comigo',
  'Acontece um pouco',
  'Acontece às vezes',
  'Acontece bastante',
  'Está muito presente',
];

export default function UserAnamneseApp({ userId, onSubmit, onSignOut }: UserAnamneseAppProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [userArea, setUserArea] = useState<UserArea>('anamnese');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [form, setForm] = useState<AnamneseInput>(emptyIntake);
  const [analysis, setAnalysis] = useState<AnaliseCompletaResultado | null>(null);
  const [friendlyResult, setFriendlyResult] = useState<FriendlyResult | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<PersonalizedAudioPlan | null>(null);
  const [careComposition, setCareComposition] = useState<CareComposition | null>(null);
  const [submissionError, setSubmissionError] = useState('');
  const [backendIntakeId, setBackendIntakeId] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');
  const [showIdleSupport, setShowIdleSupport] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed?.form) setForm(parsed.form);
      if (parsed?.questionIndex !== undefined) setQuestionIndex(parsed.questionIndex);
      if (parsed?.step && parsed.step !== 'sent') setStep(parsed.step);
    } catch {
      // rascunho inválido é ignorado sem interromper a experiência
    }
  }, []);

  useEffect(() => {
    if (step === 'sent') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, step, questionIndex }));
  }, [form, step, questionIndex]);

  useEffect(() => {
    setShowIdleSupport(false);

    if (userArea !== 'anamnese' || step !== 'questions' || !currentQuestion) {
      return;
    }

    const alreadyAnswered =
      form.respostasObjetivas[currentQuestion.id] !== undefined;

    if (alreadyAnswered) return;

    const timer = window.setTimeout(() => {
      setShowIdleSupport(true);
    }, 60_000);

    return () => window.clearTimeout(timer);
  }, [
    userArea,
    step,
    questionIndex,
    currentQuestion?.id,
    form.respostasObjetivas,
  ]);

  const answered = Object.keys(form.respostasObjetivas).length;
  const progress = Math.round((answered / PERGUNTAS_ANAMNESE.length) * 100);
  const currentQuestion = PERGUNTAS_ANAMNESE[questionIndex];

  const canAdvanceProfile = form.nomePessoa.trim().length > 1;
  const allAnswered = answered === PERGUNTAS_ANAMNESE.length;

  const firstName = useMemo(() => form.nomePessoa.trim().split(/\s+/)[0] || '', [form.nomePessoa]);

  function setField<K extends keyof AnamneseInput>(key: K, value: AnamneseInput[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function answer(value: number) {
    setForm(prev => ({
      ...prev,
      respostasObjetivas: { ...prev.respostasObjetivas, [currentQuestion.id]: value },
    }));
  }

  function nextQuestion() {
    if (questionIndex < PERGUNTAS_ANAMNESE.length - 1) {
      setQuestionIndex(i => i + 1);
    } else {
      setStep('reflection');
    }
  }

  function previousQuestion() {
    if (questionIndex > 0) setQuestionIndex(i => i - 1);
    else setStep('profile');
  }

  async function submit() {
    const finalData = { ...form, nomePessoa: form.nomePessoa.trim() };
    setSubmissionError('');
    setStep('processing');

    try {
      const backendIntakeId = await saveIntakeSession({
        userId,
        intake: finalData,
      });

      setBackendIntakeId(backendIntakeId);

      const technicalAnalysis = executarAnaliseIntegrativa(finalData, BIBLIOTECA_MESTRA);
      const friendly = buildFriendlyResult(technicalAnalysis, finalData.nomePessoa);
      const axes = technicalAnalysis.relatorioEverton.eixosOrdenados;
      const complementary = selectComplementaryCare(axes);
      const solfeggio = selectSolfeggioFrequency(axes);
      const audio = criarPlanoAudioPersonalizado({
        userId,
        anamneseId: backendIntakeId,
        nomePessoa: finalData.nomePessoa,
        eixos: axes,
        relatorio: technicalAnalysis.relatorioEverton,
        solfeggio,
      });
      const composition = buildCareComposition(audio, complementary, solfeggio);

      setAnalysis(technicalAnalysis);
      setFriendlyResult(friendly);
      setSelectedAudio(audio);
      setCareComposition(composition);

      const savedRecord = {
        ...finalData,
        backendUserId: userId,
        backendIntakeId,
        enviadoEm: new Date().toISOString(),
        status: 'concluida',
        resultadoPessoa: friendly,
        audioProgramado: audio,
        composicaoCuidado: composition,
        analiseTecnica: technicalAnalysis,
      };

      try {
        const existing = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '[]');
        const submissions = Array.isArray(existing) ? existing : [];
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([...submissions, savedRecord]));
      } catch {
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify([savedRecord]));
      }

      onSubmit?.(finalData);
      localStorage.removeItem(STORAGE_KEY);
      setStep('result');
    } catch (error) {
      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar sua anamnese com segurança.'
      );
      setStep('review');
    }
  }

  if (showPrivacy) {
    return <PrivacyPolicy onBack={() => setShowPrivacy(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#f6f1e6] text-[#173c2c]">
      <header className="border-b border-[#d9caa8]/70 bg-[#fffaf0]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo-everton-oficial.svg"
              alt="Everton Piceni"
              className="h-12 w-12 rounded-full object-cover shadow-sm ring-1 ring-[#c9aa62]/40"
            />
            <div>
              <div className="font-serif text-lg font-semibold tracking-wide text-[#204a37]">Everton Piceni</div>
              <div className="text-xs tracking-[0.18em] text-[#8e7946]">ANAMNESE INTEGRATIVA</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setUserArea('anamnese');
                setForm(emptyIntake());
                setAnalysis(null);
                setFriendlyResult(null);
                setSelectedAudio(null);
                setCareComposition(null);
                setBackendIntakeId(null);
                setEmailMessage('');
                setQuestionIndex(0);
                setStep('welcome');
              }}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                userArea === 'anamnese'
                  ? 'border-[#b89546] bg-[#173f2d] text-white'
                  : 'border-[#d8c99f] bg-white/60 text-[#617066] hover:bg-white'
              }`}
            >
              <PlusCircle className="h-4 w-4" /> Nova Anamnese
            </button>

            <button
              type="button"
              onClick={() => setUserArea('momento')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                userArea === 'momento'
                  ? 'border-[#b89546] bg-[#173f2d] text-white'
                  : 'border-[#d8c99f] bg-white/60 text-[#617066] hover:bg-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Meu Momento
            </button>

            <button
              type="button"
              onClick={() => setUserArea('jornada')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                userArea === 'jornada'
                  ? 'border-[#b89546] bg-[#173f2d] text-white'
                  : 'border-[#d8c99f] bg-white/60 text-[#617066] hover:bg-white'
              }`}
            >
              <Route className="h-4 w-4" /> Minha Jornada
            </button>

            {onSignOut && (
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="rounded-full border border-[#d8c99f] bg-white/60 px-4 py-2 text-xs font-semibold text-[#617066] hover:bg-white"
              >
                Sair
              </button>
            )}
          </div>
          {userArea === 'anamnese' && step !== 'welcome' && step !== 'sent' && (
            <div className="hidden items-center gap-2 text-xs text-[#6f756d] sm:flex">
              <Save className="h-4 w-4 text-[#b89546]" />
              Seu progresso é salvo neste dispositivo
            </div>
          )}
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-50">
          <div className="absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#dce8dc] blur-3xl" />
          <div className="absolute -right-28 top-72 h-80 w-80 rounded-full bg-[#efe0bb] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl px-5 py-10 sm:py-14">
          {userArea === 'anamnese' && (
            <>
          {step === 'welcome' && (
            <section className="grid min-h-[68vh] items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
              <div className="space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#ceb878] bg-white/60 px-4 py-2 text-xs font-semibold tracking-wide text-[#8c7339]">
                  <Leaf className="h-4 w-4" /> UM ESPAÇO PARA VOCÊ
                </span>
                <div className="space-y-4">
                  <h1 className="max-w-3xl font-serif text-4xl leading-tight text-[#173c2c] sm:text-5xl">
                    Como você está de verdade?
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-[#52665b]">
                    Este é um espaço de escuta. Suas respostas vão nos ajudar a compreender o que pede mais cuidado neste momento e a organizar seu próximo passo com mais presença.
                  </p>
                </div>
                <button
                  onClick={() => setStep('intro')}
                  className="inline-flex items-center gap-3 rounded-full bg-[#173f2d] px-7 py-4 font-semibold text-white shadow-lg shadow-[#173f2d]/15 transition hover:-translate-y-0.5 hover:bg-[#22533d]"
                >
                  Começar meu cuidado <ArrowRight className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mx-auto w-full max-w-md">
                <div className="absolute inset-6 rounded-[2.5rem] bg-[#234f39]/10 blur-xl" />
                <div className="relative rounded-[2rem] border border-[#d7c48f] bg-[#fffaf0]/90 p-7 shadow-xl shadow-[#28513a]/10">
                  <div className="mb-8 flex items-center justify-center">
                    <img src="/logo-everton-oficial.svg" alt="" className="h-40 w-40 rounded-full object-cover opacity-95" />
                  </div>
                  <div className="space-y-4 text-sm leading-6 text-[#5f685f]">
                    <div className="flex gap-3">
                      <Heart className="mt-0.5 h-5 w-5 shrink-0 text-[#b89546]" />
                      <p>Não existem respostas certas ou erradas. O mais importante é responder como você se percebe agora.</p>
                    </div>
                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#b89546]" />
                      <p>A experiência do usuário é simples e acolhedora. Toda a análise técnica permanece reservada à área administrativa.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {step === 'intro' && (
            <CenteredCard>
              <SmallEyebrow>ANTES DE COMEÇAR</SmallEyebrow>
              <h2 className="font-serif text-3xl text-[#173c2c]">Você pode responder no seu tempo.</h2>
              <p className="text-base leading-7 text-[#5a6a60]">
                Algumas perguntas podem tocar áreas diferentes da sua vida. Escolha a resposta que mais se aproxima do que você sente neste momento. Se precisar parar, seu progresso fica salvo neste dispositivo.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <SecondaryButton onClick={() => setStep('welcome')}>Voltar</SecondaryButton>
                <PrimaryButton onClick={() => setStep('profile')}>Quero começar</PrimaryButton>
              </div>
            </CenteredCard>
          )}

          {step === 'profile' && (
            <CenteredCard>
              <SmallEyebrow>UM POUCO SOBRE VOCÊ</SmallEyebrow>
              <h2 className="font-serif text-3xl text-[#173c2c]">Como podemos chamar você?</h2>
              <p className="text-[#647066]">Vamos pedir apenas o necessário para personalizar sua experiência.</p>
              <div className="grid gap-5 pt-2 sm:grid-cols-2">
                <Field label="Seu nome">
                  <input
                    value={form.nomePessoa}
                    onChange={e => setField('nomePessoa', e.target.value)}
                    className="user-input"
                    placeholder="Como prefere ser chamado(a)"
                  />
                </Field>
                <Field label="Idade ou faixa etária">
                  <input
                    value={form.idade || ''}
                    onChange={e => setField('idade', e.target.value)}
                    className="user-input"
                    placeholder="Opcional"
                  />
                </Field>
                <Field label="Contato">
                  <input
                    value={form.contato || ''}
                    onChange={e => setField('contato', e.target.value)}
                    className="user-input"
                    placeholder="Opcional"
                  />
                </Field>
                <Field label="O que você espera encontrar aqui?">
                  <input
                    value={form.intencaoDeclarada}
                    onChange={e => setField('intencaoDeclarada', e.target.value)}
                    className="user-input"
                    placeholder="Uma frase é suficiente"
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <SecondaryButton onClick={() => setStep('intro')}>Voltar</SecondaryButton>
                <PrimaryButton disabled={!canAdvanceProfile} onClick={() => setStep('questions')}>Continuar</PrimaryButton>
              </div>
            </CenteredCard>
          )}

          {step === 'questions' && currentQuestion && (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-xs text-[#6f756d]">
                  <span>{firstName ? `${firstName}, pergunta ${questionIndex + 1} de ${PERGUNTAS_ANAMNESE.length}` : `Pergunta ${questionIndex + 1} de ${PERGUNTAS_ANAMNESE.length}`}</span>
                  <span>{progress}% concluído</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e4dccb]">
                  <div className="h-full rounded-full bg-[#b89546] transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 shadow-xl shadow-[#173f2d]/8 sm:p-9">
                <SmallEyebrow>COMO ISSO APARECE PARA VOCÊ?</SmallEyebrow>
                <h2 className="mt-4 font-serif text-2xl leading-10 text-[#173c2c] sm:text-3xl">{currentQuestion.texto}</h2>
                {currentQuestion.dicaAcolhedora && (
                  <p className="mt-3 text-sm leading-6 text-[#748077]">{currentQuestion.dicaAcolhedora}</p>
                )}

                {showIdleSupport && (
                  <div className="mt-5 rounded-2xl border border-[#d9caa8] bg-[#f7f0df] p-4">
                    <p className="text-sm leading-6 text-[#5d6c63]">
                      Pode ir no seu tempo. Não existe resposta certa aqui — escolha apenas o que mais se aproxima de como você se percebe hoje.
                    </p>
                  </div>
                )}

                <div className="mt-8 space-y-3">
                  {scaleLabels.map((label, value) => {
                    const selected = form.respostasObjetivas[currentQuestion.id] === value;
                    return (
                      <button
                        type="button"
                        key={value}
                        onClick={() => answer(value)}
                        className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                          selected
                            ? 'border-[#b89546] bg-[#f3e7c8] text-[#173c2c] shadow-sm'
                            : 'border-[#ded5c0] bg-white/70 text-[#57685e] hover:border-[#c9b578] hover:bg-white'
                        }`}
                      >
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                          selected ? 'border-[#b89546] bg-[#173f2d] text-white' : 'border-[#cfc4aa] bg-[#faf5e9] text-[#7a705c]'
                        }`}>
                          {selected ? <Check className="h-4 w-4" /> : value}
                        </span>
                        <span className="font-medium">{label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <SecondaryButton onClick={previousQuestion}><ChevronLeft className="h-4 w-4" /> Voltar</SecondaryButton>
                  <PrimaryButton
                    disabled={form.respostasObjetivas[currentQuestion.id] === undefined}
                    onClick={nextQuestion}
                  >
                    {questionIndex === PERGUNTAS_ANAMNESE.length - 1 ? 'Continuar' : 'Próxima'}
                    <ChevronRight className="h-4 w-4" />
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}

          {step === 'reflection' && (
            <CenteredCard>
              <SmallEyebrow>ESPAÇO DE ESCUTA</SmallEyebrow>
              <h2 className="font-serif text-3xl text-[#173c2c]">Existe algo que você gostaria que fosse acolhido?</h2>
              <p className="leading-7 text-[#647066]">
                Você pode contar com suas próprias palavras. Este espaço existe para aquilo que não coube nas perguntas anteriores.
              </p>
              <div className="space-y-5 pt-2">
                <Field label="O que mais pede cuidado neste momento?">
                  <textarea
                    rows={4}
                    value={form.relatoLivreNecessidade}
                    onChange={e => setField('relatoLivreNecessidade', e.target.value)}
                    className="user-input resize-none"
                    placeholder="Escreva do seu jeito..."
                  />
                </Field>
                <Field label="Há algo que se repete ou tem sido difícil atravessar?">
                  <textarea
                    rows={3}
                    value={form.relatoLivreDesafios}
                    onChange={e => setField('relatoLivreDesafios', e.target.value)}
                    className="user-input resize-none"
                    placeholder="Opcional"
                  />
                </Field>
                <Field label="O que você sente que continua vivo e forte em você?">
                  <textarea
                    rows={3}
                    value={form.relatoLivrePreservado}
                    onChange={e => setField('relatoLivrePreservado', e.target.value)}
                    className="user-input resize-none"
                    placeholder="Opcional"
                  />
                </Field>
              </div>
              <div className="flex flex-wrap gap-3 pt-3">
                <SecondaryButton onClick={() => { setStep('questions'); setQuestionIndex(PERGUNTAS_ANAMNESE.length - 1); }}>Voltar</SecondaryButton>
                <PrimaryButton onClick={() => setStep('review')}>Revisar minhas respostas</PrimaryButton>
              </div>
            </CenteredCard>
          )}

          {step === 'review' && (
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-7 shadow-xl shadow-[#173f2d]/8 sm:p-9">
                <SmallEyebrow>ANTES DE ENVIAR</SmallEyebrow>
                <h2 className="mt-3 font-serif text-3xl text-[#173c2c]">Confira se isso representa seu momento.</h2>
                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <ReviewItem label="Nome" value={form.nomePessoa || 'Não informado'} />
                  <ReviewItem label="Perguntas respondidas" value={`${answered} de ${PERGUNTAS_ANAMNESE.length}`} />
                </div>
                <div className="mt-4 rounded-2xl border border-[#e0d5bb] bg-white/60 p-5">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#a18443]">O que você compartilhou</div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-[#617066]">
                    {form.relatoLivreNecessidade || 'Você preferiu não acrescentar um relato livre neste momento.'}
                  </p>
                </div>
                {!allAnswered && (
                  <div className="mt-4 rounded-2xl border border-[#dfc785] bg-[#fff5d8] p-4 text-sm text-[#735f2c]">
                    Ainda existem perguntas sem resposta. Volte ao questionário antes de enviar.
                  </div>
                )}
                {submissionError && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Não foi possível salvar sua anamnese no momento. {submissionError}
                  </div>
                )}
                <div className="mt-7 flex flex-wrap gap-3">
                  <SecondaryButton onClick={() => setStep('reflection')}><ArrowLeft className="h-4 w-4" /> Revisar</SecondaryButton>
                  <PrimaryButton disabled={!allAnswered || !canAdvanceProfile} onClick={submit}>
                    Enviar minha anamnese <Sparkles className="h-4 w-4" />
                  </PrimaryButton>
                </div>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <CenteredCard>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e7eddf] text-[#28533d]">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <SmallEyebrow>ORGANIZANDO SEU CUIDADO</SmallEyebrow>
              <h2 className="font-serif text-3xl text-[#173c2c]">Estamos olhando com atenção para o que você compartilhou.</h2>
              <p className="leading-7 text-[#5c6d62]">
                Este momento serve para organizar sua leitura de forma acolhedora. A análise técnica acontece em segundo plano e não será exibida aqui.
              </p>
            </CenteredCard>
          )}

          {step === 'result' && friendlyResult && (
            <div className="mx-auto max-w-3xl space-y-5">
              <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-7 shadow-xl shadow-[#173f2d]/8 sm:p-10">
                <SmallEyebrow>SEU MOMENTO</SmallEyebrow>
                <h2 className="mt-3 font-serif text-3xl leading-tight text-[#173c2c]">{friendlyResult.headline}</h2>
                <p className="mt-4 text-base leading-7 text-[#5c6d62]">{friendlyResult.intro}</p>

                <div className="mt-7 space-y-3">
                  {friendlyResult.priorities.map((item) => (
                    <div key={item} className="flex gap-3 rounded-2xl border border-[#e0d5bb] bg-white/60 p-4">
                      <Heart className="mt-0.5 h-5 w-5 shrink-0 text-[#b89546]" />
                      <p className="text-sm leading-6 text-[#50665a]">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#e9efe4] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8d7743]">Intenção para o próximo passo</div>
                  <p className="mt-2 leading-7 text-[#365441]">{friendlyResult.intention}</p>
                </div>

                <p className="mt-6 text-sm leading-6 text-[#748077]">{friendlyResult.closing}</p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <PrimaryButton onClick={() => setStep('sent')}>Ver próximos passos</PrimaryButton>
                  <SecondaryButton
                    onClick={() =>
                      downloadUserResultPdf({
                        nome: form.nomePessoa,
                        data: form.data,
                        headline: friendlyResult.headline,
                        intro: friendlyResult.intro,
                        priorities: friendlyResult.priorities,
                        intention: friendlyResult.intention,
                        closing: friendlyResult.closing,
                        composition: careComposition,
                      })
                    }
                  >
                    <Download className="h-4 w-4" /> Baixar meu resultado em PDF
                  </SecondaryButton>
                  <SecondaryButton
                    onClick={async () => {
                      if (!backendIntakeId || emailSending) return;
                      setEmailSending(true);
                      setEmailMessage('');
                      try {
                        const response = await requestResultEmail({
                          userId,
                          intakeId: backendIntakeId,
                          requestedBy: 'user',
                          pdfData: {
                            nome: form.nomePessoa,
                            data: form.data,
                            headline: friendlyResult.headline,
                            intro: friendlyResult.intro,
                            priorities: friendlyResult.priorities,
                            intention: friendlyResult.intention,
                            closing: friendlyResult.closing,
                            composition: careComposition,
                          },
                        });
                        setEmailMessage(response.message);
                      } catch (error) {
                        setEmailMessage(
                          error instanceof Error
                            ? `Não foi possível preparar o envio: ${error.message}`
                            : 'Não foi possível preparar o envio por e-mail.'
                        );
                      } finally {
                        setEmailSending(false);
                      }
                    }}
                  >
                    <Mail className="h-4 w-4" /> {emailSending ? 'Preparando envio...' : 'Receber por e-mail'}
                  </SecondaryButton>
                </div>
                {emailMessage && (
                  <div className="mt-4 rounded-2xl border border-[#dfcf9d] bg-[#fff6df] p-4 text-sm leading-6 text-[#6f5d31]">
                    {emailMessage}
                  </div>
                )}
              </section>

              {selectedAudio && (
                <ProgrammedAudioCard audio={selectedAudio} userId={form.id} />
              )}

              {careComposition?.solfeggio && (
                <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 shadow-lg shadow-[#173f2d]/8 sm:p-8">
                  <SmallEyebrow>FREQUÊNCIA DA SESSÃO</SmallEyebrow>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="font-serif text-4xl text-[#173c2c]">{careComposition.solfeggio.hz} Hz</div>
                    <div className="pb-1 text-sm text-[#718076]">{careComposition.solfeggio.chakraProjeto}</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#607067]">
                    {careComposition.solfeggio.intencaoProjeto}
                  </p>
                  <p className="mt-3 text-xs leading-5 text-[#8a8d85]">
                    Esta frequência faz parte da experiência sonora do protocolo e não substitui cuidados de saúde.
                  </p>
                </section>
              )}

              {careComposition &&
                (careComposition.floral.length > 0 ||
                  careComposition.aromatherapy.length > 0 ||
                  careComposition.ethericCrystals.length > 0) && (
                  <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 shadow-lg shadow-[#173f2d]/8 sm:p-8">
                    <SmallEyebrow>APOIOS COMPLEMENTARES</SmallEyebrow>
                    <h3 className="mt-2 font-serif text-2xl text-[#173c2c]">Recursos indicados para este momento</h3>
                    <div className="mt-5 space-y-4">
                      {careComposition.floral.length > 0 && (
                        <div className="rounded-2xl border border-[#e0d5bb] bg-white/60 p-4">
                          <div className="text-sm font-semibold text-[#365441]">Florais</div>
                          <div className="mt-2 space-y-2 text-sm leading-6 text-[#657168]">
                            {careComposition.floral.map(item => <p key={item.id}>{item.nome}</p>)}
                          </div>
                        </div>
                      )}
                      {careComposition.aromatherapy.length > 0 && (
                        <div className="rounded-2xl border border-[#e0d5bb] bg-white/60 p-4">
                          <div className="text-sm font-semibold text-[#365441]">Aromaterapia</div>
                          <div className="mt-2 space-y-2 text-sm leading-6 text-[#657168]">
                            {careComposition.aromatherapy.map(item => <p key={item.id}>{item.nome}</p>)}
                          </div>
                        </div>
                      )}
                      {careComposition.ethericCrystals.length > 0 && (
                        <div className="rounded-2xl border border-[#e0d5bb] bg-white/60 p-4">
                          <div className="text-sm font-semibold text-[#365441]">Cristais etéricos</div>
                          <div className="mt-2 space-y-2 text-sm leading-6 text-[#657168]">
                            {careComposition.ethericCrystals.map(item => <p key={item.id}>{item.nome}</p>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}
            </div>
          )}

          {step === 'sent' && (
            <CenteredCard>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e3ecd9] text-[#28533d]">
                <Heart className="h-8 w-8" />
              </div>
              <SmallEyebrow>ANAMNESE RECEBIDA</SmallEyebrow>
              <h2 className="font-serif text-3xl text-[#173c2c]">Obrigado por compartilhar seu momento.</h2>
              <p className="leading-7 text-[#5c6d62]">
                A partir daqui, seu cuidado poderá ser organizado com os recursos mais adequados disponíveis no protocolo. A leitura técnica permanece reservada ao painel administrativo.
              </p>
              <p className="text-sm text-[#7b817b]">
                Você poderá acompanhar a publicação do seu cuidado em Meu Momento e Minha Jornada.
              </p>

              <PracticeHistory />

              <div className="flex flex-wrap gap-3">
                <PrimaryButton onClick={() => setUserArea('momento')}>
                  Ir para Meu Momento
                </PrimaryButton>
                <SecondaryButton onClick={() => { setForm(emptyIntake()); setAnalysis(null); setFriendlyResult(null); setSelectedAudio(null); setCareComposition(null); setBackendIntakeId(null); setEmailMessage(''); setQuestionIndex(0); setStep('welcome'); }}>
                  Nova anamnese
                </SecondaryButton>
              </div>
            </CenteredCard>
          )}
            </>
          )}

          {userArea === 'momento' && (
            <UserMomentArea
              mode="momento"
              onStartNewIntake={() => {
                setUserArea('anamnese');
                setStep('welcome');
              }}
            />
          )}

          {userArea === 'jornada' && (
            <UserMomentArea
              mode="jornada"
              onStartNewIntake={() => {
                setUserArea('anamnese');
                setStep('welcome');
              }}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-[#ddd1b7] bg-[#efe7d6]/70 px-5 py-6 text-center text-xs leading-5 text-[#788078]">
        <div>Anamnese Integrativa • Um espaço de acolhimento e direcionamento complementar.</div>
        <button
          type="button"
          onClick={() => setShowPrivacy(true)}
          className="mt-2 font-semibold text-[#806c3f] underline underline-offset-4"
        >
          Política de Privacidade e LGPD
        </button>
      </footer>
    </div>
  );
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-3xl rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-7 shadow-xl shadow-[#173f2d]/8 sm:p-10">
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function SmallEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-semibold tracking-[0.18em] text-[#a18443]">{children}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#365441]">{label}</span>
      {children}
    </label>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e0d5bb] bg-white/60 p-4">
      <div className="text-xs uppercase tracking-[0.12em] text-[#a18443]">{label}</div>
      <div className="mt-1 font-medium text-[#365441]">{value}</div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#173f2d] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#22533d] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cdbc91] bg-white/60 px-5 py-3 font-semibold text-[#53675b] transition hover:bg-white"
    >
      {children}
    </button>
  );
}


const FRIENDLY_AXIS_COPY: Record<EixoId, string> = {
  seguranca: 'encontrar mais chão, segurança e estabilidade para seguir no seu ritmo',
  emocional: 'acolher o que está sendo sentido sem precisar carregar tudo sozinho(a)',
  autovalor: 'reconhecer seu próprio valor com mais gentileza e menos cobrança',
  mente: 'criar mais espaço interno, clareza e descanso para a mente',
  movimento: 'retomar movimento aos poucos, sem transformar cada passo em cobrança',
  vitalidade: 'recuperar energia e respeitar o ritmo do corpo antes de exigir mais de si',
  corpo: 'voltar a perceber o corpo como lugar de presença, cuidado e escuta',
  relacionamentos: 'cuidar das trocas, dos limites e da forma como você se encontra com o outro',
  prazer: 'reabrir espaço para descanso, prazer e contato com as próprias sensações',
  criatividade: 'dar mais espaço à sua expressão, ideias e espontaneidade',
  limpeza: 'soltar pesos que já não precisam ocupar tanto espaço agora',
  padroes: 'perceber repetições com mais clareza para abrir novas possibilidades de resposta',
  prosperidade: 'fortalecer segurança e movimento em relação à vida prática e material',
  poder_pessoal: 'fortalecer limites, escolhas e confiança para sustentar o que é importante para você',
  proposito: 'reencontrar direção e um próximo passo que faça sentido',
  espiritualidade: 'reaproximar-se daquilo que traz conexão, sentido e presença',
  protecao: 'preservar melhor sua energia e criar mais sensação de limite e resguardo',
  receber: 'permitir-se receber cuidado, apoio e descanso sem precisar compensar imediatamente',
  recomeco: 'abrir espaço para um novo começo sem exigir que tudo esteja resolvido primeiro',
  integracao: 'reunir corpo, emoções e pensamentos em uma experiência mais inteira e coerente',
};

function buildFriendlyResult(analysis: AnaliseCompletaResultado, nome: string): FriendlyResult {
  const topAxes = analysis.relatorioEverton.eixosOrdenados.slice(0, 3);
  const priorities = topAxes.map(eixo => FRIENDLY_AXIS_COPY[eixo.eixoId]);
  const firstName = nome.trim().split(/\s+/)[0];

  return {
    headline: firstName ? `${firstName}, seu cuidado pode começar por aqui.` : 'Seu cuidado pode começar por aqui.',
    intro: 'Neste momento, algumas áreas parecem pedir mais presença. Isso não define quem você é; é apenas uma leitura do que aparece com mais força agora.',
    priorities,
    intention:
      priorities[0]
        ? `Dar atenção, com gentileza, a ${priorities[0]}, respeitando seu ritmo e escolhendo um próximo passo possível.`
        : 'Seguir com gentileza, respeitando seu ritmo e escolhendo um próximo passo possível.',
    closing:
      'Esta leitura é complementar e serve para orientar as práticas do protocolo. Ela não substitui avaliação ou tratamento médico ou psicológico quando necessários.',
  };
}
