import type { DailyEnergyPlan } from '../care/dailyEnergySchedule';
import { applyConfirmedJourney } from './confirmedJourney';
import { CareComposition } from '../care/careComposer';
import { selectBathSupport } from '../care/bathCatalog';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { REGIOES_CORPORAIS } from '../data/regioesCorporais';
import { AnamneseInput } from '../types';
import { collectAnswerEvidence, buildEvidenceChakras, narrativeSource } from './answerEvidence';

export interface FullReportNarrative {
  nome: string;
  deliveryMode?: 'automatic';
  careResources?: import('../care/automaticCare').PatientCareResource[];
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
  const level = (id: string) => evidence.find(item => item.questionId === id)?.level;
  const need = intake.relatoLivreNecessidade?.trim();
  const challenge = intake.relatoLivreDesafios?.trim();
  const strength = intake.relatoLivrePreservado?.trim();
  const intention = intake.intencaoDeclarada?.trim();
  const regions = REGIOES_CORPORAIS.filter(region => intake.regioesCorporaisPercebidas.includes(region.id));
  const opening = `${nome}, suas respostas foram recebidas com cuidado. O que você compartilhou tem lugar aqui, e seu percurso pode começar respeitando o ritmo que você consegue viver agora.`;
  const wish = intention ? (/^cura[.!\s]*$/i.test(intention) ? 'Seu desejo de se sentir melhor merece acolhimento e um cuidado atento ao que você está vivendo.' : `A intenção que você trouxe — “${intention}” — nos ajuda a manter perto aquilo que importa para você.`) : '';
  const diagnosis = [
    opening,
    ...leading.map(item => item.level === 2 ? `Em alguns momentos, ${item.observation.charAt(0).toLowerCase()}${item.observation.slice(1)}` : item.observation),
    ...(need ? [`Você trouxe um pedido importante: “${need}”. Vamos acolhê-lo como parte do seu caminho, com atenção ao que você precisa e ao que é possível agora.`] : []),
    ...(challenge ? [`Ao compartilhar “${challenge}”, você nos permite olhar mais de perto para o que está vivendo. Esse relato merece escuta e cuidado, no seu tempo.`] : []),
    ...(!present.length ? ['Seu cuidado pode partir do que você deseja cultivar no cotidiano. Há espaço para conversar sobre suas necessidades e encontrar um caminho que faça sentido para você.'] : []),
  ];
  const interactions: string[] = [];
  if ((level('q2_mente_acelerada') ?? 0) >= 3 && (level('q1_procrastinacao_inicio') ?? 0) >= 3) interactions.push('Quando a mente fica muito ocupada, dar o primeiro passo pode parecer ainda mais difícil. Esses dois movimentos aparecem no que você contou. Podemos cuidar deles juntos, criando espaço para uma prioridade de cada vez.');
  if ((level('q4_cansaco_esgotamento') ?? 0) >= 3 && (level('q5_autocobranca_insuficiencia') ?? 0) >= 3) interactions.push('O cansaço e a cobrança interna também se encontram no seu relato. Talvez seja delicado permitir uma pausa quando sente que ainda precisa fazer mais. O cuidado pode começar justamente aí: respeitar sua energia disponível e tornar o descanso um espaço de acolhimento.');
  if ((level('q7_dificuldade_dizer_nao') ?? 0) >= 3 && (level('q8_dificuldade_receber') ?? 0) >= 3) interactions.push('Colocar limites e permitir-se receber cuidado parecem ser movimentos delicados para você. Podemos abrir espaço para reconhecer o que consegue oferecer e o apoio que gostaria de aceitar, sem culpa ou pressa.');
  const preserved = strength
    ? [/^f[ée][.!\s]*$/i.test(strength) ? `A fé que você reconhece em si pode ser um ponto de apoio${(level('q15_desconexao_espiritual') ?? 0) >= 2 ? ', mesmo nos dias em que a conexão espiritual parece mais distante' : ''}. Há espaço para cuidar dessa relação com delicadeza, dentro do que faz sentido para você.` : `Você trouxe algo que deseja preservar: “${strength}”. Essa referência também merece espaço no cuidado, junto do que hoje pede atenção.`]
    : ['Ao longo deste caminho, há espaço para reconhecer o que traz apoio, conforto e sentido para você. Podemos descobrir essas referências juntos, sem pressa.'];

  const needsStabilization = (level('q3_sensacao_ameaca_inseguranca') ?? 0) >= 3 || (level('q4_cansaco_esgotamento') ?? 0) >= 3;
  const direction = leading.length
    ? `Vamos começar por ${join(leading.slice(0, 2).map(item => item.intention))}. ${needsStabilization ? 'O ritmo será gentil, dando lugar à segurança e ao descanso antes de acrescentar novas demandas.' : 'Cada movimento pode ser pequeno e respeitar o que você consegue viver agora.'}`
    : 'Vamos encontrar com você uma direção que se aproxime do seu pedido e do que deseja cultivar no cotidiano.';
  const care = [direction];
  if (wish) care.push(wish);
  if (intake.sensibilidadeEnergetica === 'alta' || intake.sensibilidadeEnergetica === 'muito_alta') care.push('A sensibilidade que você compartilhou será respeitada. O cuidado será conduzido com atenção ao seu conforto e ao ritmo que você precisa.');
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
    page1: { title: 'Relatório Completo — Leitura do Seu Momento', subtitle: 'Uma leitura acolhedora do seu momento e dos caminhos possíveis de cuidado.', intro: `${opening} ${leading.slice(0, 2).map(item => item.observation).join(' ')} ${wish}`.trim() },
    page2: { title: 'Diagnóstico da Anamnese', paragraphs: diagnosis, ...((level('q1_procrastinacao_inicio') ?? 0) >= 3 && (level('q5_autocobranca_insuficiencia') ?? 0) >= 3 ? { cycle: 'Quando começar parece difícil e a cobrança aumenta, um passo pequeno pode ser mais acolhedor do que exigir uma grande mudança. Você pode experimentar esse movimento no seu tempo.' } : {}) },
    page3: { title: 'O que suas respostas contam sobre você', paragraphs: [
      ...(interactions.length ? interactions : ['Cada experiência que você compartilhou merece ser acolhida no seu próprio contexto. Vamos construir esse cuidado com espaço para escutar você, além do que aparece nesta leitura.']),
      ...(regions.length ? [`Você também percebe sensações em ${join(regions.map(region => region.nome.toLowerCase()))}. Podemos acolher esses sinais do corpo e observar o que ajuda você a encontrar conforto.`] : []),
      'No nosso protocolo, os chakras ajudam a organizar as intenções de cuidado relacionadas ao que você contou. Essa leitura simbólica acompanha suas experiências e não representa uma medição do seu corpo.',
    ], preserved, chakras: buildEvidenceChakras(intake, evidence) },
    page4: { title: 'O que vamos trabalhar com você', paragraphs: care },
    page5: { title: 'Seu percurso de cuidado', paragraphs: [
      'A duração e as energias de cada dia seguem o plano confirmado e a composição aprovada.',
      ...leading.slice(0, 3).map(item => `Um convite possível é ${item.intention}. Perceba como isso se apresenta ao longo dos dias, sem transformar a observação em uma cobrança.`),
      ...(need ? [`Seu pedido — “${need}” — continua no centro desse percurso. Ao longo dos dias, você pode notar o que se aproxima dele e o que ainda precisa de cuidado.`] : []),
      'Reserve um momento tranquilo para receber o cuidado e siga as orientações que acompanham cada dia. Você pode registrar pequenas percepções e compartilhar o que precisar ser ajustado.',
      'Não é preciso medir seu caminho pela rapidez das mudanças. O que você sente e o que consegue viver nos ajuda a cuidar dos próximos passos com você.',
    ], closingTitle: `Um convite para você, ${nome}`, closing: [wish || 'Que este percurso seja um espaço de escuta e cuidado, respeitando o que importa para você.', 'Você não precisa dar conta de tudo para merecer cuidado. Há espaço para pausar, receber apoio e seguir um passo de cada vez.'] },
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
