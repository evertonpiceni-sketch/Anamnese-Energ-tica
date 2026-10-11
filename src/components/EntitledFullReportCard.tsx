import { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import type { CommercialEntitlement } from '../commercial/entitlements';
import { canAccessFullReport } from '../commercial/entitlements';
import type { FullReportPublication } from '../services/fullReportBackend';
import { loadOwnFullReport } from '../services/fullReportBackend';
import type { FullReportNarrative } from '../result/fullReportNarrative';
import { FullReportApprovedView } from './FullReportApprovedView';
import { downloadFullReportPdf } from '../pdf/fullReportPdf';
import { supabase } from '../lib/supabase';

type TestIntake = {
  person_name: string | null;
  answers: Record<string, number> | null;
  free_text_strengths: string | null;
};

function answer(answers: Record<string, number>, key: string) {
  return Number(answers[key] || 0);
}

function buildTestReport(intake: TestIntake): FullReportNarrative {
  const answers = intake.answers || {};
  const nome = intake.person_name?.trim().split(/\s+/)[0] || 'Você';

  const mind = answer(answers, 'q2_mente_acelerada');
  const security = answer(answers, 'q3_sensacao_ameaca_inseguranca');
  const exhaustion = answer(answers, 'q4_cansaco_esgotamento');
  const selfPressure = answer(answers, 'q5_autocobranca_insuficiencia');
  const emotions = answer(answers, 'q6_engolir_emocoes');
  const receiving = answer(answers, 'q8_dificuldade_receber');
  const patterns = answer(answers, 'q10_repeticao_ciclos');
  const body = answer(answers, 'q11_desconexao_corpo_prazer');
  const purpose = answer(answers, 'q14_falta_direcao_proposito');
  const spirituality = answer(answers, 'q15_desconexao_espiritual');
  const integration = answer(answers, 'q18_sensacao_fragmentacao');
  const tension = answer(answers, 'q19_tensao_corporal_cronica');
  const relationships = answer(answers, 'q20_conflitos_relacionamento');
  const movement = answer(answers, 'q1_procrastinacao_inicio');
  const restart = answer(answers, 'q17_desejo_recomeco');

  const strongest: string[] = [];
  if (security >= 3) strongest.push('segurança e sustentação interna');
  if (mind >= 3) strongest.push('desaceleração mental e clareza');
  if (exhaustion >= 3) strongest.push('respeito ao ritmo e recuperação de presença');
  if (emotions >= 3) strongest.push('acolhimento emocional e expressão do que fica guardado');
  if (movement >= 3) strongest.push('retomada gradual do movimento');
  if (patterns >= 3) strongest.push('consciência dos ciclos que se repetem');

  const openingFocus = strongest.slice(0, 3).join(', ');
  const preserved = [
    intake.free_text_strengths?.trim()
      ? `Você reconhece ${intake.free_text_strengths.trim()} como um recurso que permanece disponível em você.`
      : 'Existe capacidade de perceber o próprio momento.',
    restart >= 3
      ? 'Existe desejo verdadeiro de recomeço, mesmo sem todas as respostas prontas.'
      : 'Existe abertura para um próximo passo possível.',
    'Existe capacidade de se observar e reconhecer quando algo precisa mudar.',
    'Existe abertura para receber cuidado de uma forma diferente da cobrança.',
    'Existe uma parte sua que ainda busca equilíbrio — e é essa parte que o cuidado pretende fortalecer.',
  ];

  const chakraItems = [
    {
      name: 'Raiz',
      text:
        security >= 3 || tension >= 3
          ? 'aparece ligado à necessidade de mais chão, estabilidade e sensação de amparo. O cuidado aqui busca fortalecer presença antes de exigir movimento.'
          : 'entra como apoio de presença, estabilidade e contato com o momento atual.',
    },
    {
      name: 'Frontal',
      text:
        mind >= 3
          ? 'aparece associado à atividade mental intensa. A intenção é criar mais espaço interno para que pensamento e percepção não precisem permanecer em alerta constante.'
          : 'entra como apoio para clareza e percepção mais organizada do próprio momento.',
    },
    {
      name: 'Plexo Solar',
      text:
        selfPressure >= 3 || movement >= 3
          ? 'aparece relacionado à autocobrança, confiança nas próprias escolhas e dificuldade de agir quando existe pressão demais. O cuidado busca firmeza sem rigidez.'
          : 'entra como apoio para confiança, escolha e movimento possível.',
    },
    {
      name: 'Cardíaco',
      text:
        receiving >= 3 || emotions >= 3 || relationships >= 3
          ? 'aparece ligado à forma como você oferece, guarda e recebe cuidado. O convite é ampliar reciprocidade, acolhimento e espaço para também ser sustentado.'
          : 'entra como apoio para acolhimento, reciprocidade e integração emocional.',
    },
    {
      name: 'Coronário',
      text:
        spirituality >= 3 || purpose >= 3 || integration >= 3
          ? 'aparece relacionado a sentido, direção e integração. O cuidado busca aproximar conexão e presença, sem separar a dimensão interna da vida concreta.'
          : 'entra como apoio para integração, sentido e presença.',
    },
  ];

  const page4Paragraphs = [
    `A partir desta leitura, o cuidado não será construído para “consertar” você. Ele será organizado para acompanhar você de volta para si. Neste momento, o eixo principal pede ${openingFocus || 'mais presença, organização interna e um próximo passo possível'}.`,
    'Para o teste completo, o cruzamento de apoio prioriza referências já documentadas no protocolo: 396 Hz como frequência simbólica de aterramento e estabilidade; Turmalina Negra como referência de chão e proteção; Ametista para clareza e percepção de padrões; e Quartzo Rosa para acolhimento e receptividade.',
    'Como recursos complementares, Lavanda em uso olfativo/ambiental aparece ligada a tranquilidade e conforto. Aspen conversa com inseguranças e receios difusos; Larch, quando necessário, apoia o eixo de confiança e movimento. Esses recursos são apresentados como apoios do protocolo, sem promessa médica ou substituição de outros cuidados.',
    'Nada entra apenas porque “combina”. Mesmo nesta versão de teste, a lógica é aproximar cada recurso do que apareceu nas respostas: estabilizar antes de estimular, acolher antes de aprofundar e favorecer movimento sem transformar o processo em mais uma cobrança.',
  ];

  return {
    nome,
    page1: {
      title: 'Relatório Completo — Leitura do Seu Momento',
      subtitle:
        'Uma leitura acolhedora do seu momento, dos padrões percebidos e do caminho de cuidado para os próximos 7 ou 21 dias.',
      intro: `${nome}, este relatório foi preparado a partir da sua anamnese para acolher o que suas respostas revelam neste momento e mostrar, com delicadeza e profundidade, como o seu cuidado poderá ser conduzido.`,
    },
    page2: {
      title: 'Diagnóstico da Anamnese',
      paragraphs: [
        `${nome}, antes de qualquer coisa, suas respostas mostram um momento em que muitas demandas internas parecem estar acontecendo ao mesmo tempo. Isso não reduz você a um problema: apenas indica que existem áreas pedindo mais sustentação agora.`,
        mind >= 3
          ? 'A mente aparece muito ativa, tentando antecipar, organizar ou sustentar várias coisas ao mesmo tempo. Quando isso se combina com cansaço e insegurança, até decisões simples podem parecer maiores do que realmente são.'
          : 'A leitura mostra necessidade de organizar pensamentos e prioridades para que o próximo passo fique mais simples e possível.',
        exhaustion >= 3 || movement >= 3
          ? 'Também existe uma distância entre perceber o que precisa ser feito e conseguir transformar essa percepção em movimento sem aumentar a pressão. Isso não aponta falta de vontade; muitas vezes, quando a sobrecarga cresce, começar passa a parecer mais uma exigência.'
          : 'O movimento aparece como algo que precisa ser sustentado de forma gradual, sem exigir grandes viradas de uma vez.',
        patterns >= 3
          ? 'Quando suas respostas são observadas em conjunto, alguns ciclos ficam mais visíveis. Reconhecer um padrão não significa se definir por ele. Significa perceber onde algo tende a se repetir para que exista mais escolha na próxima vez.'
          : 'O objetivo é ampliar consciência sobre o que se repete e abrir espaço para respostas novas, sem julgamento.',
      ],
      cycle:
        'muitas demandas → sobrecarga → dificuldade de decidir ou começar → adiamento → pequeno alívio momentâneo → cobrança → cansaço → nova tentativa.',
    },
    page3: {
      title: 'O que suas respostas contam sobre você',
      paragraphs: [
        emotions >= 3 || receiving >= 3
          ? 'Suas respostas também sugerem que uma parte importante do cuidado passa por permitir que o que você sente tenha espaço sem precisar ser imediatamente resolvido. Receber apoio pode ser tão importante quanto oferecer.'
          : 'Existe um convite para se incluir mais dentro do próprio cuidado, sem transformar autocuidado em mais uma tarefa para cumprir.',
        selfPressure >= 3
          ? 'A autocobrança aparece como um ponto sensível. Quando ela cresce, conquistas podem parecer pequenas e dificuldades podem ocupar espaço demais. O cuidado busca devolver proporção, gentileza e confiança à forma como você se percebe.'
          : 'O cuidado busca fortalecer uma percepção mais justa de si, reconhecendo recursos e limites ao mesmo tempo.',
        body >= 3 || tension >= 3
          ? 'O corpo também pede presença. Quando muita energia fica concentrada em pensamentos, demandas ou tensão, o corpo pode ser percebido apenas quando já está cansado. Voltar ao corpo, aqui, significa recuperar um lugar de presença.'
          : 'A presença corporal entra como base para que o processo não aconteça apenas no pensamento.',
      ],
      preserved,
      chakras: chakraItems,
    },
    page4: {
      title: 'O que vamos trabalhar com você',
      paragraphs: page4Paragraphs,
    },
    page5: {
      title: 'Os próximos 7 ou 21 dias',
      paragraphs: [
        'Você não precisa mudar tudo de uma vez. O percurso começa pela estabilização: criar mais chão, diminuir excesso de pressão e permitir que mente, emoção e corpo voltem a conversar entre si.',
        'Depois, o foco é favorecer clareza e movimento possível. Pequenos passos consistentes importam mais do que grandes decisões tomadas sob cobrança. O objetivo é perceber o que muda quando você se trata com mais presença.',
        restart >= 3
          ? 'Seu desejo de recomeço aparece como um recurso importante. Ele não precisa virar pressa. Pode ser usado como direção: um movimento por vez, observando o que se torna mais leve, o que ainda pede cuidado e o que começa a ganhar forma.'
          : 'A proposta é acompanhar o que se reorganiza ao longo dos dias e permitir que o próximo passo apareça com mais clareza.',
        'Ao final do percurso, a reavaliação serve para reconhecer mudanças, permanências e necessidades novas. O cuidado continua sendo ajustado ao seu momento, e não o contrário.',
      ],
      closingTitle: `Uma última coisa, ${nome}`,
      closing: [
        'voltar a se ouvir.',
        'voltar a se perceber.',
        'voltar a se incluir na própria vida.',
        'O restante nós vamos construindo com você, passo a passo.',
        'Você não precisa carregar tudo sozinho.',
        'Seu ritmo será respeitado.',
        'E este pode ser um novo começo — sem pressa, mas com presença.',
      ],
    },
  };
}

export function EntitledFullReportCard({
  intakeId,
  entitlement,
}: {
  intakeId: string;
  entitlement: CommercialEntitlement | null;
}) {
  const allowed = canAccessFullReport(entitlement);
  const isOneRealTest = entitlement?.paidAmountCents === 100;
  const [publication, setPublication] = useState<FullReportPublication | null>(null);
  const [testReport, setTestReport] = useState<FullReportNarrative | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;
    setPublication(null);
    setTestReport(null);
    setMessage('');

    if (!allowed) return () => { active = false; };

    setLoading(true);
    loadOwnFullReport(intakeId)
      .then(async result => {
        if (!active) return;
        setPublication(result);

        if (!result && isOneRealTest) {
          const { data, error } = await supabase
            .from('intake_sessions')
            .select('person_name,answers,free_text_strengths')
            .eq('id', intakeId)
            .maybeSingle();

          if (!active) return;
          if (error) throw error;
          if (data) setTestReport(buildTestReport(data as TestIntake));
        }
      })
      .catch(error => {
        if (!active) return;
        setMessage(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar seu relatório completo agora.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [allowed, intakeId, isOneRealTest]);

  if (!allowed) return null;

  if (loading) {
    return (
      <section className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 text-sm text-[#657168]">
        Preparando a visualização do seu relatório completo...
      </section>
    );
  }

  const report = publication?.report || testReport;

  if (!report) {
    return (
      <section className="rounded-[2rem] border border-[#dfcf9d] bg-[#fff6df] p-6">
        <div className="flex items-start gap-3">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-[#a18443]" />
          <div>
            <h2 className="font-serif text-xl text-[#173c2c]">Relatório completo incluído</h2>
            <p className="mt-2 text-sm leading-6 text-[#715f36]">
              Seu plano dá acesso ao relatório completo. Ele aparecerá aqui assim que a composição for revisada e a versão final for publicada.
            </p>
            {message && <p className="mt-2 text-xs leading-5 text-[#8a6a57]">{message}</p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[2rem] border border-[#d8c99f] bg-[#fffaf0]/95 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold tracking-[0.16em] text-[#a18443]">
              {publication ? 'RELATÓRIO COMPLETO' : 'RELATÓRIO COMPLETO • TESTE R$ 1'}
            </div>
            <h2 className="mt-2 font-serif text-2xl text-[#173c2c]">
              Sua leitura completa está disponível.
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#667268]">
              {publication
                ? 'Esta é a versão completa vinculada à sua anamnese e à composição aprovada para este momento.'
                : 'Esta versão de teste é construída diretamente a partir da sua própria anamnese para validar a experiência completa. Nos planos reais, a publicação definitiva continua passando pela revisão do ADM.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void downloadFullReportPdf(report)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#cdbc91] bg-white/70 px-5 py-3 font-semibold text-[#53675b] transition hover:bg-white"
          >
            <Download className="h-4 w-4" /> Baixar relatório completo
          </button>
        </div>
      </div>

      <FullReportApprovedView report={report} />
    </section>
  );
}
