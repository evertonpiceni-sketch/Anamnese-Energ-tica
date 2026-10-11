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
  journeyResources?: import('../care/automaticCare').PatientCareResource[];
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
  const strengthIsLoss = !!strength && /(?:não|nao|sem|perdi)\s+(?:tenho\s+|sinto\s+|minha?\s+)?(?:fé|fe|força|forca|esperança|esperanca|vontade|criatividade|energia|amor|clareza)/i.test(strength);
  const regions = REGIOES_CORPORAIS.filter(region => intake.regioesCorporaisPercebidas.includes(region.id));
  const wish = intention ? (/^cura[.!\s]*$/i.test(intention) ? 'Seu desejo de se sentir melhor merece ser recebido com cuidado, sem pressa e sem transformar esse desejo em mais uma cobrança.' : `A intenção que você trouxe — “${intention}” — permanece como uma referência importante para que este percurso continue próximo do que realmente importa para você.`) : '';

  const diagnosis = [
    ...leading.map(item => item.level === 2 ? `Em alguns momentos, ${item.observation.charAt(0).toLowerCase()}${item.observation.slice(1)}` : item.observation),
    ...(need ? [`Você também nos contou algo importante: “${need}”. Esse pedido não fica à margem do relatório; ele ajuda a orientar o cuidado e merece ser acolhido no seu próprio tempo.`] : []),
    ...(challenge ? [`Ao compartilhar “${challenge}”, você nos permite chegar mais perto daquilo que tem sido difícil. Não precisamos transformar esse relato em um rótulo: ele entra aqui como parte da sua história e como um convite para cuidar com mais delicadeza.`] : []),
    ...(strengthIsLoss ? [`Você também escreveu: “${strength}”. Quando algo que antes sustentava você parece distante, não é preciso forçar uma recuperação imediata. Podemos começar apenas reconhecendo essa ausência e percebendo que tipo de apoio faria sentido agora.`] : []),
    ...(!present.length ? [`${nome}, suas respostas não precisam apontar um grande problema para que seu cuidado seja legítimo. Podemos partir daquilo que você deseja preservar, fortalecer ou simplesmente compreender melhor neste momento.`] : []),
  ];

  const interactions: string[] = [];
  if ((level('q3_sensacao_ameaca_inseguranca') ?? 0) >= 3 && (level('q4_cansaco_esgotamento') ?? 0) >= 3) interactions.push('O estado de alerta e o esgotamento aparecem juntos nas suas respostas. Quando isso acontece, até descansar pode parecer difícil. Por isso, o cuidado começa por sustentação, segurança e espaço para respirar, antes de qualquer convite para produzir, mudar ou avançar. Você não precisa transformar esta jornada em mais uma obrigação.');
  if ((level('q2_mente_acelerada') ?? 0) >= 3 && (level('q1_procrastinacao_inicio') ?? 0) >= 3) interactions.push('Quando a mente permanece muito ocupada, começar algo pode exigir uma energia que já está comprometida. Em vez de tratar isso como falta de força de vontade, vamos acolher os dois movimentos juntos: diminuir o excesso e tornar o primeiro passo menor, mais claro e possível.');
  if ((level('q4_cansaco_esgotamento') ?? 0) >= 3 && (level('q5_autocobranca_insuficiencia') ?? 0) >= 3) interactions.push('O cansaço e a cobrança interna também parecem se encontrar no seu relato. Talvez uma parte sua peça descanso enquanto outra insiste que ainda deveria fazer mais. Aqui, não vamos escolher a cobrança. O cuidado começa reconhecendo a energia que você realmente tem e permitindo que o descanso também seja parte do caminho.');
  if ((level('q7_dificuldade_dizer_nao') ?? 0) >= 3 && (level('q8_dificuldade_receber') ?? 0) >= 3) interactions.push('Colocar limites e, ao mesmo tempo, permitir-se receber cuidado podem ser movimentos delicados. Isso pode deixar você oferecendo muito e ocupando pouco espaço nas próprias relações. Ao longo do percurso, vamos abrir lugar para reconhecer o que você consegue oferecer, o que precisa preservar e que tipo de apoio gostaria de aceitar.');

  const preserved = strength && !strengthIsLoss
    ? [/^f[ée][.!\s]*$/i.test(strength) ? `A fé que você reconhece em si pode continuar sendo um ponto de apoio${(level('q15_desconexao_espiritual') ?? 0) >= 2 ? ', inclusive nos dias em que essa conexão parece mais silenciosa ou distante' : ''}. Não é preciso provar essa fé; basta permitir que ela exista do modo como for possível hoje.` : `Você trouxe algo que ainda reconhece em si e deseja preservar: “${strength}”. Isso também importa. Seu cuidado não parte apenas do que está difícil, mas também daquilo que continua vivo, disponível ou precioso para você.`]
    : ['Nem tudo precisa estar claro agora. Ao longo deste caminho, também vamos prestar atenção ao que traz algum apoio, conforto, sentido ou sensação de continuidade para você — mesmo que seja algo pequeno.'];

  const needsStabilization = (level('q3_sensacao_ameaca_inseguranca') ?? 0) >= 3 || (level('q4_cansaco_esgotamento') ?? 0) >= 3;
  const direction = leading.length
    ? `O cuidado começa por ${join(leading.slice(0, 2).map(item => item.intention))}. ${needsStabilization ? 'Antes de acrescentar novas propostas, vamos priorizar segurança, descanso e sustentação. O ritmo pode ser gentil.' : 'Não é necessário resolver tudo de uma vez; cada movimento pode ser pequeno e respeitar o que cabe no seu dia.'}`
    : 'Vamos construir este percurso a partir do que você deseja cuidar e daquilo que, aos poucos, for fazendo sentido para você.';

  const care = [
    direction,
    leading.length ? 'Em cada dia, as práticas são apresentadas como convites, nunca como tarefas obrigatórias. Você pode adaptar a posição do corpo, manter os olhos abertos, fazer uma pausa, interromper ou simplesmente descansar. Depois de cada encontro, a pergunta mais importante não é “funcionou?”, mas “do que eu preciso agora?”.' : 'Você pode começar escolhendo uma pausa confortável e percebendo o que precisa ser acolhido primeiro. O cuidado se ajusta ao que você vive; não é você que precisa se encaixar no cuidado.',
  ];
  if (wish) care.push(wish);
  if (need && /depress[aã]o|ansiedade/i.test(need) && !/(não|nao|sem)\s+(tenho\s+|sinto\s+)?(depress[aã]o|ansiedade)/i.test(need)) care.push('Se o sofrimento que você descreve estiver afetando de forma importante seu sono, sua rotina, seus vínculos ou sua vontade de viver o dia, este cuidado integrativo não precisa ocupar esse lugar sozinho. Apoio psicológico e médico podem caminhar junto, e contar a alguém de confiança como você está também pode ser uma forma concreta de cuidado.');
  if (intake.sensibilidadeEnergetica === 'alta' || intake.sensibilidadeEnergetica === 'muito_alta') care.push('Você contou que percebe sua sensibilidade de forma intensa. Por isso, o percurso deve respeitar pausas, intensidade e conforto. Não há benefício em ultrapassar seus limites para “sentir mais”.');
  if (composition?.solfeggio) care.push(`A frequência de ${composition.solfeggio.hz} Hz entra como um apoio sonoro ao percurso, acompanhando a intenção de ${composition.solfeggio.intencaoProjeto.toLowerCase()}, sem exigir que você perceba um efeito específico.`);
  if (composition?.ethericCrystals.length) care.push(`Os cristais etéricos ${join(composition.ethericCrystals.map(item => item.nome))} entram como referências energéticas dentro da composição. Você não precisa adquirir pedras físicas; a intenção é apenas que esse recurso acompanhe o cuidado já construído a partir das suas respostas.`);
  if (composition?.floral.length) care.push(`O floral ${join(composition.floral.map(item => item.nome))} foi incluído como apoio complementar ao mesmo eixo de cuidado, seguindo a orientação definida para este percurso.`);
  if (composition?.aromatherapy.length) care.push(`A aromaterapia com ${join(composition.aromatherapy.map(item => clean(item.nome)))} acompanha o percurso como apoio sensorial, sempre respeitando conforto, preferência e a orientação recebida.`);
  const bath = composition?.audio ? selectBathSupport(analysis.relatorioEverton.eixosOrdenados) : null;
  if (bath) care.push(`${bath.nome} entra como uma prática simbólica de luz ligada ao que está sendo cuidado neste momento. Não é banho físico com água ou ervas; é um convite de visualização e repouso, usado somente como apoio dentro da composição.`);

  const energyNames = Array.from(new Set(dailyEnergySchedule?.length ? dailyEnergySchedule.flatMap(day => day.energyNames) : composition?.audio?.recursosEnergeticos.energias || []));
  const narrative: FullReportNarrative = {
    nome, energyNames, dailyEnergySchedule, source: narrativeSource(intake),
    answerEvidence: evidence.map(item => ({ questionId: item.questionId, questionText: item.questionText, level: item.level, label: item.label, theme: item.name })),
    page1: {
      title: 'Relatório Completo — Leitura do Seu Momento',
      subtitle: 'Um espaço para compreender o que você está vivendo e organizar um cuidado que faça sentido para você.',
      intro: leading.length
        ? `${nome}, este relatório começa pelo que você contou — não por um diagnóstico pronto. Suas respostas apontam principalmente para ${join(leading.slice(0, 2).map(item => item.name))}, e é a partir daí que vamos compreender o restante do seu momento e construir os próximos passos.`
        : `${nome}, este relatório nasce do que você compartilhou. Ele não procura encaixar você em uma definição, mas organizar com delicadeza aquilo que hoje merece atenção, aquilo que ainda sustenta você e os caminhos possíveis de cuidado.`,
    },
    page2: {
      title: 'Leitura do seu momento',
      paragraphs: diagnosis,
      ...((level('q1_procrastinacao_inicio') ?? 0) >= 3 && (level('q5_autocobranca_insuficiencia') ?? 0) >= 3 ? { cycle: 'Quando começar fica difícil e a cobrança aumenta, é comum que uma coisa alimente a outra. Em vez de exigir uma grande virada, podemos cuidar desse ciclo diminuindo o tamanho do primeiro passo e reconhecendo o esforço que já existe.' } : {}),
    },
    page3: {
      title: 'O que suas respostas contam sobre você',
      paragraphs: [
        ...(interactions.length ? interactions : ['As experiências que você compartilhou não aparecem isoladas. Algumas se encontram, outras se compensam, e todas merecem ser compreendidas dentro da sua história. Este relatório organiza esses movimentos sem reduzir você a eles.']),
        ...(regions.length ? [`Você também percebe sensações em ${join(regions.map(region => region.nome.toLowerCase()))}. O corpo participa dessa leitura como um lugar de escuta: não para transformar toda sensação em significado, mas para perceber onde conforto, descanso e apoio podem ser necessários.`] : []),
        'Dentro deste protocolo, os chakras funcionam como uma linguagem simbólica para organizar intenções de cuidado. Eles não são apresentados como diagnóstico nem como medição do corpo; servem apenas para aproximar aquilo que você relatou de um eixo de atenção dentro da proposta integrativa.',
      ],
      preserved,
      chakras: buildEvidenceChakras(intake, evidence),
    },
    page4: { title: 'Como vamos cuidar disso com você', paragraphs: care },
    page5: {
      title: 'Seu percurso, no seu ritmo',
      paragraphs: [
        'A duração deste percurso segue o plano que você confirmou. A programação diária é organizada a partir das suas respostas e revisada para que cada dia tenha uma intenção clara, sem transformar o processo em uma sequência automática de técnicas.',
        ...leading.slice(0, 3).map(item => `Ao longo dos dias, um dos convites será ${item.intention}. Você não precisa perceber mudança imediata; basta observar, com curiosidade e sem cobrança, como esse tema aparece para você.`),
        ...(need ? [`O pedido que você trouxe — “${need}” — continua presente como referência. Ele não precisa ser resolvido de uma vez; vamos usá-lo para perceber o que aproxima você de mais cuidado e o que ainda pede atenção.`] : []),
        'Você pode registrar pequenas percepções, inclusive quando nada parecer ter mudado. Cansaço, resistência, vontade de pausar, conforto, incômodo ou silêncio também são informações importantes para ajustar o percurso.',
        'Não existe um jeito certo de viver esta jornada. O cuidado não será medido pela velocidade das mudanças, mas pela possibilidade de você se sentir acompanhado e respeitado enquanto atravessa este momento.',
      ],
      closingTitle: `Para você, ${nome}`,
      closing: [
        wish || 'Que este percurso seja um espaço em que você possa se escutar com um pouco mais de gentileza e encontrar apoio sem precisar dar conta de tudo sozinho.',
        'Você não precisa chegar a lugar nenhum hoje. Pode apenas estar aqui, receber o que fizer sentido e seguir um passo de cada vez.',
      ],
    },
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
    page4: { ...fresh.page4, paragraphs: [...fresh.page4.paragraphs, ...stored.page4.paragraphs.filter(text => /^(Frequência de apoio|Cristais etéricos|Florais|Aromaterapia|Banho de apoio|Banho de luz)/.test(text))] },
  };
}
