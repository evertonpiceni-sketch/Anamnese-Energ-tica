import { CareComposition } from '../care/careComposer';
import { selectBathSupport } from '../care/bathCatalog';
import { selectComplementaryCare } from '../care/complementaryCatalogs';
import { selectSolfeggioFrequency } from '../care/solfeggioCatalog';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { AnamneseInput } from '../types';

export interface FullReportNarrative {
  nome: string;
  page1: { title: string; subtitle: string; intro: string };
  page2: { title: string; paragraphs: string[]; cycle?: string };
  page3: { title: string; paragraphs: string[]; preserved: string[]; chakras: Array<{ name: string; text: string }> };
  page4: { title: string; paragraphs: string[] };
  page5: { title: string; paragraphs: string[]; closingTitle: string; closing: string[] };
}

type ObservedAnswer = { id: string; text: string; category: string; level: number };

const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'você';
const unique = (values: string[]) => values.filter((v, i, a) => Boolean(v) && a.indexOf(v) === i);
function joinNatural(values: string[]) { const clean = values.filter(Boolean); if (!clean.length) return ''; if (clean.length === 1) return clean[0]; if (clean.length === 2) return `${clean[0]} e ${clean[1]}`; return `${clean.slice(0, -1).join(', ')} e ${clean[clean.length - 1]}`; }
const friendlyResourceName = (value: string) => value.replace(/\s+—\s+.*/, '').trim();
const intensity = (level: number) => level >= 4 ? 'está muito presente' : level === 3 ? 'acontece bastante' : level === 2 ? 'aparece às vezes' : 'aparece pouco';

function observedAnswers(input: AnamneseInput): ObservedAnswer[] {
  return PERGUNTAS_ANAMNESE.map(q => ({ id: q.id, text: q.text, category: q.categoria, level: input.respostasObjetivas[q.id] ?? 0 })).sort((a, b) => b.level - a.level);
}

function directReading(item: ObservedAnswer) {
  return `Na sua resposta sobre ${item.category.toLowerCase()}, você indicou que “${item.text}” ${intensity(item.level)} para você hoje. Isso ajuda a mostrar onde o cuidado precisa começar agora, sem transformar seu momento em um rótulo.`;
}

function relationshipReading(active: ObservedAnswer[]) {
  const has = (id: string) => active.some(x => x.id === id && x.level >= 3);
  const parts: string[] = [];
  if (has('q2_mente_acelerada') && has('q1_procrastinacao_inicio')) parts.push('A mente acelerada e a dificuldade de começar aparecem juntas. Quanto mais espaço interno é ocupado pela antecipação, mais importante se torna reduzir pressão antes de pedir ação.');
  if (has('q5_autocobranca_insuficiencia') && has('q1_procrastinacao_inicio')) parts.push('A autocobrança aparece ao lado da dificuldade de começar. O adiamento, aqui, pede atenção para o peso da exigência sobre o primeiro passo.');
  if (has('q4_cansaco_esgotamento') && (has('q1_procrastinacao_inicio') || has('q2_mente_acelerada'))) parts.push('O cansaço muda a leitura do restante: antes de exigir aceleração, é preciso considerar a energia disponível para sustentar o movimento.');
  if (has('q7_dificuldade_dizer_nao') && has('q8_dificuldade_receber')) parts.push('Limites e receber cuidado aparecem conectados: suas respostas mostram a importância de abrir espaço para apoio, descanso e reciprocidade.');
  if (has('q6_engolir_emocoes') && has('q20_conflitos_relacionamento')) parts.push('O que você guarda emocionalmente aparece junto de dificuldades nas relações, pedindo cuidado com expressão, limite e espaço para dizer o que sente.');
  if (has('q14_falta_direcao_proposito') && has('q17_desejo_recomeco')) parts.push('O desejo de recomeçar aparece junto da busca por direção. O novo já é percebido, mas precisa de sustentação para ganhar forma sem a obrigação de ter todas as respostas agora.');
  if (has('q11_desconexao_corpo_prazer') && has('q19_tensao_corporal_cronica')) parts.push('O corpo aparece tanto pela dificuldade de presença nas sensações agradáveis quanto pela tensão. Ele precisa entrar no percurso como lugar de escuta, presença e integração.');
  return parts.slice(0, 3);
}

function chakraText(name: string, active: ObservedAnswer[]) {
  const ids = new Set(active.filter(x => x.level >= 3).map(x => x.id));
  const n = name.toLowerCase();
  if (n.includes('frontal')) return ids.has('q2_mente_acelerada') ? 'O Frontal entra porque atividade mental e antecipação ganharam intensidade. O foco é favorecer clareza e espaço interno.' : 'O Frontal aparece como convite a clareza, percepção e espaço interno.';
  if (n.includes('plexo')) return ids.has('q5_autocobranca_insuficiencia') || ids.has('q1_procrastinacao_inicio') ? 'O Plexo Solar conversa com cobrança, confiança e movimento. O cuidado busca firmeza sem aumentar a exigência.' : 'O Plexo Solar aparece ligado à autonomia, confiança e escolhas.';
  if (n.includes('card')) return ids.has('q8_dificuldade_receber') || ids.has('q6_engolir_emocoes') ? 'O Cardíaco aparece porque receber, sentir e acolher ganharam relevância. A intenção é ampliar espaço para cuidado e reciprocidade.' : 'O Cardíaco aparece ligado ao acolhimento e à possibilidade de receber cuidado.';
  if (n.includes('lar')) return ids.has('q7_dificuldade_dizer_nao') || ids.has('q12_trava_expressao_criatividade') ? 'O Laríngeo conversa com limites, expressão e voz própria. O foco é comunicar necessidades com mais presença.' : 'O Laríngeo aparece relacionado à expressão.';
  if (n.includes('bás') || n.includes('raiz') || n.includes('muladh')) return 'O centro Básico aparece ligado à sustentação, presença, segurança e sensação de chão.';
  if (n.includes('sacral') || n.includes('umbilical')) return 'O Sacral aparece ligado ao sentir, à criatividade, ao prazer e à fluidez.';
  return 'Este centro participa da leitura energética do seu momento sem substituir aquilo que suas próprias respostas mostram.';
}

export function buildFullReportNarrative({ intake, analysis, composition }: { intake: AnamneseInput; analysis: AnaliseCompletaResultado; composition: CareComposition | null }): FullReportNarrative {
  const nome = firstName(intake.nomePessoa);
  const report = analysis.relatorioEverton;
  const answers = observedAnswers(intake);
  const active = answers.filter(x => x.level >= 2);
  const strongest = active.slice(0, 5);
  const quieter = answers.filter(x => x.level <= 1).slice(0, 2);
  const relationships = relationshipReading(active);
  const rankedAxes = report.eixosOrdenados;
  const topAxes = rankedAxes.slice(0, 4).map(x => x.nome.toLowerCase());
  const preserved = report.analiseContextualAvancada?.fatoresPreservados.recursosInternosPreservados || [];
  const chakras = unique([...report.regioesCorporais.chakrasCorrespondentes, ...report.recursosInternos.chakras]).slice(0, 5);

  // O relatório deve sair completo no primeiro resultado. Quando a composição ainda
  // não foi persistida pelo ADM, os recursos documentados são selecionados agora
  // pelos mesmos eixos da análise, em vez de exibir um relatório incompleto.
  const automaticComplementary = selectComplementaryCare(rankedAxes);
  const solfeggio = composition?.solfeggio || selectSolfeggioFrequency(rankedAxes);
  const crystals = composition?.ethericCrystals?.length ? composition.ethericCrystals : automaticComplementary.ethericCrystals;
  const florals = composition?.floral?.length ? composition.floral : automaticComplementary.florals;
  const aromas = composition?.aromatherapy?.length ? composition.aromatherapy : automaticComplementary.aromatherapy;
  const energies = unique([
    ...(composition?.audio?.recursosEnergeticos.energias || []),
    ...(report.recursosInternos.energias || []),
  ]).map(friendlyResourceName).slice(0, 6);
  const audioSystems = unique([
    composition?.audio?.sistemaBase || report.sistemaBase?.nome || '',
    composition?.audio?.sistemaPrincipal || report.sistemaPrincipal?.nome || '',
    ...(composition?.audio?.sistemasComplementares || report.sistemasComplementares?.map(x => x.nome) || []),
  ]).filter(Boolean).slice(0, 6);
  const bath = selectBathSupport(rankedAxes);

  const responseParagraphs = strongest.map(directReading);
  const contrast = quieter.length ? `Também é importante olhar para o que não ganhou a mesma intensidade. Em ${joinNatural(quieter.map(x => x.category.toLowerCase()))}, suas respostas foram mais leves. Isso ajuda a concentrar o cuidado onde ele é realmente necessário agora.` : '';
  const freeText = [
    intake.relatoLivreNecessidade?.trim() ? `Quando você escreveu “${intake.relatoLivreNecessidade.trim()}”, acrescentou uma camada importante ao seu momento e ela participa diretamente desta leitura.` : '',
    intake.relatoLivreDesafios?.trim() ? `Você também apontou como desafio: “${intake.relatoLivreDesafios.trim()}”. Esse trecho é considerado junto das respostas objetivas.` : '',
  ].filter(Boolean);

  const resources: string[] = [];
  if (energies.length) resources.push(`ENERGIAS DO SEU ÁUDIO — ${joinNatural(energies)}. Elas foram selecionadas a partir das prioridades que apareceram na sua anamnese e formarão a base energética da sessão personalizada.`);
  if (audioSystems.length) resources.push(`COMPOSIÇÃO ENERGÉTICA — ${joinNatural(audioSystems)}. Esses recursos serão articulados no áudio como uma sequência única de cuidado, e não como técnicas soltas.`);
  if (solfeggio) resources.push(`FREQUÊNCIA DO ÁUDIO — ${solfeggio.hz} Hz. Dentro desta composição, ela será utilizada como apoio para ${solfeggio.intencaoProjeto.toLowerCase()}`);
  if (crystals.length) resources.push(`CRISTAIS ETÉRICOS — ${joinNatural(crystals.map(x => x.nome))}. Entram como apoio energético coerente com os pontos priorizados na leitura; não é necessário possuir as pedras fisicamente.`);
  if (florals.length) resources.push(`FLORAIS — ${joinNatural(florals.map(x => x.nome))}. Foram relacionados às prioridades encontradas e aparecem como apoio complementar do percurso.`);
  if (aromas.length) resources.push(`AROMATERAPIA — ${joinNatural(aromas.map(x => x.nome.replace(/\s+—.*/, '')))}. A indicação permanece restrita à forma de uso segura cadastrada no projeto e funciona como apoio complementar.`);
  if (bath) resources.push(`BANHO DE APOIO — ${bath.nome}. Ele aparece como possibilidade complementar por sua relação documentada com os pontos que ganharam prioridade nesta leitura.`);

  return {
    nome,
    page1: {
      title: 'Relatório Completo — Leitura do Seu Momento',
      subtitle: 'Uma devolutiva construída a partir do que você respondeu, do que escreveu com suas próprias palavras e das relações que aparecem nesta anamnese.',
      intro: `${nome}, esta leitura parte de você. Ela destaca o que ganhou intensidade, o que permaneceu mais leve e onde diferentes aspectos do seu momento se encontram.`,
    },
    page2: {
      title: 'Diagnóstico da Anamnese',
      paragraphs: [
        `${nome}, os pontos que mais pedem atenção hoje se concentram em ${joinNatural(topAxes)}. A leitura abaixo mostra como isso apareceu nas suas respostas e como esses pontos se conectam.`,
        ...responseParagraphs,
        ...relationships,
        contrast,
        ...freeText,
        'O conjunto não define quem você é. Ele mostra o que está mais presente agora e orienta por onde o cuidado pode começar.',
      ].filter(Boolean),
    },
    page3: {
      title: 'O que suas respostas contam sobre você',
      paragraphs: [
        'A leitura não olha apenas para o que pesa. Ela também procura aquilo que continua disponível em você e pode sustentar o percurso.',
        intake.relatoLivrePreservado?.trim() ? `Você reconheceu como algo ainda vivo em você: “${intake.relatoLivrePreservado.trim()}”. Isso também participa da condução do cuidado.` : 'Sua participação na anamnese já mostra capacidade de observar o próprio momento e buscar uma forma de cuidado.',
      ],
      preserved: preserved.length ? preserved : ['capacidade de perceber o próprio momento', 'disposição para olhar para si', 'possibilidade de construir um próximo passo'],
      chakras: chakras.map(name => ({ name, text: chakraText(name, active) })),
    },
    page4: {
      title: 'O que vamos trabalhar com você',
      paragraphs: [
        'A composição abaixo nasce das prioridades encontradas na sua anamnese. Estes são os recursos que orientarão a construção do seu áudio e os apoios complementares do percurso.',
        ...resources,
        'O áudio será individual: as energias e os recursos acima serão organizados de acordo com o seu momento, preservando uma condução coerente do início à integração final.',
      ],
    },
    page5: {
      title: 'Os próximos 7 ou 21 dias',
      paragraphs: [
        'Depois desta leitura, você escolhe a duração do percurso. Há um dia de acolhimento antes do início da opção escolhida.',
        'Em 7 dias, o percurso é uma adaptação condensada das prioridades encontradas agora — não apenas os sete primeiros dias de uma jornada maior.',
        'Em 21 dias, existe mais espaço para acompanhar as diferentes camadas, observar o percurso e realizar reavaliações.',
        'A leitura descreve o seu momento atual. Se o momento muda, a condução também pode ser revista.',
      ],
      closingTitle: `Uma última coisa, ${nome}`,
      closing: [
        'Você não é a soma das respostas que marcou. Elas são um retrato de como determinadas experiências estão aparecendo agora.',
        'A proposta é usar esse retrato para escolher um cuidado mais coerente, respeitando tanto o que pede atenção quanto aquilo que continua vivo em você.',
        'O próximo passo não precisa resolver tudo. Precisa fazer sentido para o momento em que você está.',
      ],
    },
  };
}
