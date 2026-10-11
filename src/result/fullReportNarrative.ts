import type { DailyEnergyPlan } from '../care/dailyEnergySchedule';
import { applyConfirmedJourney } from './confirmedJourney';
import { CareComposition } from '../care/careComposer';
import { selectBathSupport } from '../care/bathCatalog';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { REGIOES_CORPORAIS } from '../data/regioesCorporais';
import { AnamneseInput } from '../types';
import { collectAnswerEvidence, buildEvidenceChakras, narrativeSource } from './answerEvidence';

export interface FullReportNarrative {
  nome: string;
  journeyDays?: 7 | 21;
  dailyEnergySchedule?: DailyEnergyPlan[];
  energyNames?: string[];
  source?: ReturnType<typeof narrativeSource>;
  answerEvidence?: Array<{ questionId: string; questionText: string; level: number; label: string; theme: string }>;
  page1: { title: string; subtitle: string; intro: string };
  page2: { title: string; paragraphs: string[]; cycle?: string };
  page3: { title: string; paragraphs: string[]; preserved: string[]; chakras: Array<{ name: string; text: string }> };
  page4: { title: string; paragraphs: string[] };
  page5: { title: string; paragraphs: string[]; closingTitle: string; closing: string[] };
}

const join = (values: string[]) => values.length < 2 ? (values[0] || '') : `${values.slice(0, -1).join(', ')} e ${values.at(-1)}`;
const clean = (value: string) => value.replace(/\s+—\s+.*/, '').trim();

export function buildFullReportNarrative({ intake, analysis, composition, journeyDays, dailyEnergySchedule }: {
  intake: AnamneseInput; analysis: AnaliseCompletaResultado; composition: CareComposition | null; journeyDays?: 7 | 21; dailyEnergySchedule?: DailyEnergyPlan[];
}): FullReportNarrative {
  const nome = intake.nomePessoa.trim().split(/\s+/)[0] || 'Você';
  const evidence = collectAnswerEvidence(intake, analysis.relatorioEverton.eixosOrdenados);
  const present = evidence.filter(item => item.level >= 2);
  const leading = present.slice(0, 5);
  const remaining = present.slice(5);
  const lessPresent = evidence.filter(item => item.level <= 1);
  const high = evidence.filter(item => item.level >= 3);
  const level = (id: string) => evidence.find(item => item.questionId === id)?.level;
  const need = intake.relatoLivreNecessidade?.trim();
  const challenge = intake.relatoLivreDesafios?.trim();
  const strength = intake.relatoLivrePreservado?.trim();
  const intention = intake.intencaoDeclarada?.trim();
  const regions = REGIOES_CORPORAIS.filter(region => intake.regioesCorporaisPercebidas.includes(region.id));
  const summary = present.length
    ? `Os temas mais presentes nas suas respostas são ${join(leading.slice(0, 3).map(item => item.name))}. ${high.length} de ${evidence.length} respostas foram marcadas como “Acontece bastante” ou “Está muito presente”; essa amplitude será considerada sem reduzir sua leitura a um único tema.`
    : evidence.length ? 'Nas respostas objetivas disponíveis, nenhum tema foi marcado como “Acontece às vezes”, “Acontece bastante” ou “Está muito presente”. A leitura não deve atribuir sobrecargas que você não relatou.' : 'Ainda não há respostas objetivas válidas para sustentar uma leitura dos seus padrões.';

  const diagnosis = [
    `${nome}, esta leitura considera ${evidence.length} de ${PERGUNTAS_ANAMNESE.length} respostas objetivas. ${summary}`,
    ...leading.map(item => `Sobre ${item.name}, você marcou “${item.label}”. ${item.observation}`),
    ...(remaining.length ? [`Também aparecem ${join(remaining.map(item => `${item.name} (“${item.label}”)`))}. Esses temas fazem parte da sua leitura, ainda que não sejam os primeiros a acompanhar.`] : []),
    ...(lessPresent.length ? [`Em contraste, ${join(lessPresent.slice(0, 4).map(item => `${item.name} (“${item.label}”)`))} ${lessPresent.length === 1 ? 'não aparece' : 'não aparecem'} com intensidade alta. Não vou apresentar esses pontos como dificuldades centrais.`] : []),
    ...(need ? [`No seu pedido de cuidado, você escreveu: “${need}”. Esse pedido orienta o que deve ser acompanhado; sua pontuação não substitui o que você escolheu contar.`] : []),
    ...(challenge ? [`Você descreveu como desafio: “${challenge}”. Na revisão, esse relato deve ser considerado junto das respostas objetivas, preservando suas palavras e sem atribuir uma causa que você não informou.`] : []),
    ...(evidence.length < PERGUNTAS_ANAMNESE.length ? ['Há perguntas sem resposta válida. Ausência de resposta não será interpretada como ausência de dificuldade.'] : []),
  ];

  const interactions: string[] = [];
  if ((level('q2_mente_acelerada') ?? 0) >= 3 && (level('q1_procrastinacao_inicio') ?? 0) >= 3) interactions.push('Você marcou mente acelerada e dificuldade de começar como bastante ou muito presentes. Esses dois relatos podem se reforçar: muitos pensamentos podem tornar o início mais difícil. Suas respostas mostram a coexistência desses pontos, mas não estabelecem uma causa única.');
  if ((level('q4_cansaco_esgotamento') ?? 0) >= 3 && (level('q5_autocobranca_insuficiencia') ?? 0) >= 3) interactions.push('Cansaço e autocobrança também receberam marcações altas. Essa combinação pede observar se a exigência que você coloca sobre si cabe na energia disponível, antes de transformar o cuidado em mais uma obrigação.');
  if ((level('q7_dificuldade_dizer_nao') ?? 0) >= 3 && (level('q8_dificuldade_receber') ?? 0) >= 3) interactions.push('Colocar limites e receber cuidado aparecem juntos com intensidade alta. Vale acompanhar uma troca concreta: o que você consegue oferecer, o que gostaria de recusar e que apoio consegue aceitar.');

  const preserved = [
    ...(strength ? [`Você reconheceu como força: “${strength}”.`] : []),
    ...lessPresent.slice(0, 3).map(item => `Você marcou “${item.label}” para ${item.name}; esse tema aparece menos intenso neste momento.`),
  ];
  if (!preserved.length) preserved.push('Você não descreveu forças no campo aberto nem marcou temas objetivos com intensidade baixa. Isso não significa ausência de recursos; significa que eles ainda precisam ser reconhecidos com você, sem inventar qualidades a partir do formulário.');

  const needsStabilization = (level('q3_sensacao_ameaca_inseguranca') ?? 0) >= 3 || (level('q4_cansaco_esgotamento') ?? 0) >= 3;
  const direction = leading.length
    ? `Direção do cuidado: os primeiros pontos a acompanhar são ${join(leading.slice(0, 3).map(item => item.name))}. ${needsStabilization ? 'Como você marcou alerta ou cansaço com intensidade alta, a proposta deve respeitar a necessidade de segurança e recuperação antes de ampliar as demandas.' : `O foco é ${join(leading.slice(0, 2).map(item => item.intention))}.`}`
    : 'As respostas disponíveis não sustentam uma prioridade intensa. O direcionamento deve partir do seu pedido e da revisão do terapeuta, sem impor um percurso de sobrecarga ou recuperação.';
  const care = [direction];
  if (intention) care.push(`Sua intenção declarada — “${intention}” — é o ponto de referência para avaliar se esse cuidado se aproxima do que você veio buscar.`);
  if (intake.sensibilidadeEnergetica === 'alta' || intake.sensibilidadeEnergetica === 'muito_alta') care.push(`Você informou sensibilidade energética ${intake.sensibilidadeEnergetica === 'alta' ? 'alta' : 'muito alta'}. A intensidade e o ritmo da composição precisam considerar essa informação na revisão.`);
  if (composition?.solfeggio) care.push(`Frequência de apoio — ${composition.solfeggio.hz} Hz: a composição inclui este recurso com a intenção de ${composition.solfeggio.intencaoProjeto.toLowerCase()}.`);
  if (composition?.ethericCrystals.length) care.push(`Cristais etéricos — ${join(composition.ethericCrystals.map(item => item.nome))}: recursos da composição revisada, sem necessidade de adquirir pedras físicas.`);
  if (composition?.floral.length) care.push(`Florais — ${join(composition.floral.map(item => item.nome))}: recursos selecionados na composição revisada para acompanhar a intenção do cuidado.`);
  if (composition?.aromatherapy.length) care.push(`Aromaterapia — ${join(composition.aromatherapy.map(item => clean(item.nome)))}: apoio sensorial selecionado na composição revisada, a ser usado conforme a orientação recebida.`);
  const bath = composition?.audio ? selectBathSupport(analysis.relatorioEverton.eixosOrdenados) : null;
  if (bath) care.push(`Banho de apoio — ${bath.nome}: proposta complementar para revisão junto do restante do cuidado, conforme a orientação prevista para esse recurso.`);

  const energyNames = Array.from(new Set(dailyEnergySchedule?.length ? dailyEnergySchedule.flatMap(day => day.energyNames) : composition?.audio?.recursosEnergeticos.energias || []));
  const narrative: FullReportNarrative = {
    nome, energyNames, dailyEnergySchedule, source: narrativeSource(intake),
    answerEvidence: evidence.map(item => ({ questionId: item.questionId, questionText: item.questionText, level: item.level, label: item.label, theme: item.name })),
    page1: { title: 'Relatório Completo — Leitura do Seu Momento', subtitle: 'Uma leitura das suas respostas, do que você contou e dos pontos que merecem acompanhamento.', intro: `${nome}, ${summary}${intention ? ` Você veio buscar: “${intention}”.` : need ? ` Seu pedido foi: “${need}”.` : ''}` },
    page2: { title: 'Diagnóstico da Anamnese', paragraphs: diagnosis, ...((level('q1_procrastinacao_inicio') ?? 0) >= 3 && (level('q5_autocobranca_insuficiencia') ?? 0) >= 3 ? { cycle: 'Pontos que podem se relacionar: autocobrança relatada ↔ dificuldade de começar. A sequência e as causas precisam ser reconhecidas com você.' } : {}) },
    page3: { title: 'O que suas respostas contam sobre você', paragraphs: [
      ...(interactions.length ? interactions : ['As respostas disponíveis não sustentam os cruzamentos de intensidade alta previstos nesta leitura. Os temas serão acompanhados individualmente, sem construir um ciclo que você não relatou.']),
      ...(regions.length ? [`Você indicou percepção corporal em ${join(regions.map(region => region.nome.toLowerCase()))}. Essas são as regiões que você informou; a leitura não acrescenta localizações por conta própria.`] : ['Você não selecionou regiões corporais específicas. Por isso, a leitura não atribui suas sensações a uma parte do corpo que você não indicou.']),
      'Os chakras abaixo são associações energéticas do protocolo aos temas relatados, não uma medição desses centros. Cada descrição mostra sua base nas respostas: 0 significa “Não acontece comigo” e 4 significa “Está muito presente”.',
    ], preserved, chakras: buildEvidenceChakras(intake, evidence) },
    page4: { title: 'O que vamos trabalhar com você', paragraphs: care },
    page5: { title: 'Seu percurso de cuidado', paragraphs: [
      'A duração e as energias de cada dia seguem o plano confirmado e a composição aprovada.',
      ...leading.slice(0, 3).map(item => `Para ${item.name}, o ponto de acompanhamento será ${item.intention}. Compare essa percepção com sua marcação inicial de “${item.label}”, sem exigir que ela mude imediatamente.`),
      ...(need ? [`Ao final do percurso, retome seu pedido — “${need}” — e registre o que mudou ou ainda pede atenção.`] : []),
      ...(challenge ? [`Observe também como você vive agora o desafio que descreveu: “${challenge}”. Essa comparação ajuda a ajustar o cuidado ao que aconteceu de fato.`] : []),
      'A reavaliação deve comparar essas mesmas respostas e seus relatos atuais. A continuidade será ajustada ao que você observar, sem prometer uma mudança específica.',
    ], closingTitle: `Um convite para você, ${nome}`, closing: [intention ? `Seu cuidado tem como referência o que você pediu: “${intention}”.` : need ? `Seu pedido continua no centro deste percurso: “${need}”.` : 'Seu próprio relato é a referência para acompanhar este percurso.', strength ? `A força que você reconheceu — “${strength}” — também faz parte desse caminho.` : 'Ao longo do cuidado, podemos reconhecer juntos os recursos que não apareceram no formulário.'] },
  };
  return journeyDays ? applyConfirmedJourney(narrative, journeyDays) : narrative;
}

/** Refresh the reading only; approval of energies and daily programming is preserved. */
export function refreshReportReading(stored: FullReportNarrative, intake: AnamneseInput, analysis: AnaliseCompletaResultado): FullReportNarrative {
  const fresh = buildFullReportNarrative({ intake, analysis, composition: null, journeyDays: stored.journeyDays, dailyEnergySchedule: stored.dailyEnergySchedule });
  return {
    ...fresh,
    energyNames: stored.energyNames,
    dailyEnergySchedule: stored.dailyEnergySchedule,
    page4: { ...fresh.page4, paragraphs: [...fresh.page4.paragraphs, ...stored.page4.paragraphs.filter(text => /^(Frequência de apoio|Cristais etéricos|Florais|Aromaterapia|Banho de apoio)/.test(text))] },
  };
}
