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

function observedAnswers(input: AnamneseInput): ObservedAnswer[] {
  return PERGUNTAS_ANAMNESE.map(q => ({ id: q.id, text: q.text, category: q.categoria, level: input.respostasObjetivas[q.id] ?? 0 })).sort((a, b) => b.level - a.level);
}
function relationshipReading(active: ObservedAnswer[]) {
  const has = (id: string) => active.some(x => x.id === id && x.level >= 3);
  const parts: string[] = [];
  if (has('q2_mente_acelerada') && has('q1_procrastinacao_inicio')) parts.push('A mente acelerada e a dificuldade de começar aparecem juntas. Quando pensamentos, antecipação e responsabilidades ocupam espaço demais, até um primeiro passo simples pode parecer maior do que realmente é.');
  if (has('q5_autocobranca_insuficiencia') && has('q1_procrastinacao_inicio')) parts.push('A autocobrança aparece ao lado da dificuldade de começar. Isso sugere um ciclo em que a pressão interna aumenta o peso da ação; o adiamento traz um alívio curto e depois pode devolver ainda mais cobrança.');
  if (has('q4_cansaco_esgotamento') && (has('q1_procrastinacao_inicio') || has('q2_mente_acelerada'))) parts.push('O cansaço também muda a leitura: não se trata apenas de fazer mais. Antes de pedir movimento, o cuidado precisa considerar a energia disponível e criar mais espaço para estabilização e descanso interno.');
  if (has('q7_dificuldade_dizer_nao') && has('q8_dificuldade_receber')) parts.push('Sua disponibilidade para os outros aparece junto da dificuldade de receber. Isso pode deixar suas próprias necessidades para depois e tornar limites, reciprocidade e acolhimento partes importantes do cuidado.');
  if (has('q6_engolir_emocoes') && has('q20_conflitos_relacionamento')) parts.push('O que fica guardado emocionalmente aparece junto das relações. A leitura pede espaço para expressão, limites e uma forma mais segura de reconhecer o que é seu antes de sustentar o que pertence aos outros.');
  if (has('q14_falta_direcao_proposito') && has('q17_desejo_recomeco')) parts.push('O desejo de recomeçar aparece junto da busca por direção. Há movimento interno, mas ele precisa de sustentação para ganhar forma sem virar mais uma obrigação.');
  return parts.slice(0, 4);
}
function chakraText(name: string, active: ObservedAnswer[]) {
  const ids = new Set(active.filter(x => x.level >= 3).map(x => x.id)); const n = name.toLowerCase();
  if (n.includes('frontal')) return ids.has('q2_mente_acelerada') ? 'O Frontal aparece relacionado ao excesso de pensamentos, antecipação e necessidade de clareza. O cuidado busca suavizar o ruído mental para favorecer percepção e presença.' : 'O Frontal aparece como convite à clareza, percepção e espaço interno.';
  if (n.includes('plexo')) return ids.has('q5_autocobranca_insuficiencia') || ids.has('q1_procrastinacao_inicio') ? 'O Plexo Solar conversa com autocobrança, confiança nas próprias escolhas e capacidade de agir sem transformar movimento em pressão.' : 'O Plexo Solar aparece ligado à autonomia, confiança e escolhas.';
  if (n.includes('card')) return ids.has('q8_dificuldade_receber') || ids.has('q6_engolir_emocoes') ? 'O Cardíaco aparece ligado à forma como você oferece cuidado e à possibilidade de também receber acolhimento, reciprocidade e espaço para si.' : 'O Cardíaco aparece ligado ao acolhimento e à possibilidade de receber cuidado.';
  if (n.includes('lar')) return ids.has('q7_dificuldade_dizer_nao') || ids.has('q12_trava_expressao_criatividade') ? 'O Laríngeo conversa com limites, expressão das necessidades e voz própria. O foco é permitir que aquilo que você sente encontre uma forma mais presente de ser comunicado.' : 'O Laríngeo aparece relacionado à expressão e aos limites.';
  if (n.includes('bás') || n.includes('raiz') || n.includes('muladh')) return 'O centro Raiz aparece ligado à segurança, aterramento, estabilidade e sensação de chão para sustentar os próximos movimentos.';
  if (n.includes('sacral') || n.includes('umbilical')) return 'O Sacral aparece ligado ao sentir, à criatividade, ao prazer e à fluidez.';
  return 'Este centro participa da leitura energética do seu momento em diálogo com aquilo que suas respostas mostram.';
}

export function buildFullReportNarrative({ intake, analysis, composition }: { intake: AnamneseInput; analysis: AnaliseCompletaResultado; composition: CareComposition | null }): FullReportNarrative {
  const nome = firstName(intake.nomePessoa); const report = analysis.relatorioEverton; const answers = observedAnswers(intake); const active = answers.filter(x => x.level >= 2); const relationships = relationshipReading(active);
  const rankedAxes = report.eixosOrdenados; const topAxes = rankedAxes.slice(0, 4).map(x => x.nome.toLowerCase()); const preserved = report.analiseContextualAvancada?.fatoresPreservados.recursosInternosPreservados || []; const chakras = unique([...report.regioesCorporais.chakrasCorrespondentes, ...report.recursosInternos.chakras]).slice(0, 5);
  const automaticComplementary = selectComplementaryCare(rankedAxes); const solfeggio = composition?.solfeggio || selectSolfeggioFrequency(rankedAxes); const crystals = composition?.ethericCrystals?.length ? composition.ethericCrystals : automaticComplementary.ethericCrystals; const florals = composition?.floral?.length ? composition.floral : automaticComplementary.florals; const aromas = composition?.aromatherapy?.length ? composition.aromatherapy : automaticComplementary.aromatherapy;
  const energies = unique([...(composition?.audio?.recursosEnergeticos.energias || []), ...(report.recursosInternos.energias || [])]).map(friendlyResourceName).slice(0, 6);
  const audioSystems = unique([composition?.audio?.sistemaBase || report.sistemaBase?.nome || '', composition?.audio?.sistemaPrincipal || report.sistemaPrincipal?.nome || '', ...(composition?.audio?.sistemasComplementares || report.sistemasComplementares?.map(x => x.nome) || [])]).filter(Boolean).slice(0, 6); const bath = selectBathSupport(rankedAxes);
  const freeText = [intake.relatoLivreNecessidade?.trim() ? `Quando você descreve que “${intake.relatoLivreNecessidade.trim()}”, essa fala reforça a necessidade de que o cuidado parta do que está realmente sendo vivido por você agora.` : '', intake.relatoLivreDesafios?.trim() ? `Você também reconhece como desafio “${intake.relatoLivreDesafios.trim()}”. Isso ajuda a compreender onde o movimento encontra mais resistência neste momento.` : ''].filter(Boolean);
  const resources: string[] = [];
  if (energies.length) resources.push(`Energias que serão utilizadas no áudio: ${joinNatural(energies)}. Elas entram para trabalhar diretamente as prioridades que apareceram na sua leitura e serão organizadas em uma sequência única, respeitando o seu momento.`);
  if (audioSystems.length) resources.push(`Na composição energética, ${joinNatural(audioSystems)} serão articulados como partes do mesmo cuidado. A intenção não é acumular técnicas, mas utilizar cada recurso onde ele tem uma função dentro do percurso.`);
  if (solfeggio) resources.push(`A frequência sonora escolhida é ${solfeggio.hz} Hz, utilizada nesta composição como apoio para ${solfeggio.intencaoProjeto.toLowerCase()}`);
  if (crystals.length) resources.push(`Como apoio com cristais etéricos, entram ${joinNatural(crystals.map(x => x.nome))}. Eles acompanham os pontos priorizados na leitura; não é necessário possuir as pedras fisicamente.`);
  if (florals.length || aromas.length) resources.push(`${florals.length ? `Nos florais, ${joinNatural(florals.map(x => x.nome))} aparecem relacionados às prioridades encontradas.` : ''}${florals.length && aromas.length ? ' ' : ''}${aromas.length ? `Na aromaterapia, ${joinNatural(aromas.map(x => x.nome.replace(/\s+—.*/, '')))} aparece como apoio complementar.` : ''}`);
  if (bath) resources.push(`Como apoio ao percurso, ${bath.nome} também pode ser utilizado de acordo com a orientação prevista para este recurso.`);
  const cycle = relationships.length >= 2 ? 'muitas demandas → sobrecarga → dificuldade de decidir ou começar → adiamento → pequeno alívio momentâneo → cobrança → cansaço → nova tentativa.' : undefined;

  return { nome,
    page1: { title: 'Relatório Completo — Leitura do Seu Momento', subtitle: 'Uma devolutiva acolhedora a partir da sua anamnese, dos padrões percebidos e dos caminhos de cuidado que podem acompanhar o seu percurso.', intro: `${nome}, suas respostas foram recebidas com cuidado. O que você trouxe aqui não é apenas um formulário: é um retrato do seu momento, com sentimentos, desafios, recursos e também esperança.` },
    page2: { title: 'Diagnóstico da Anamnese', paragraphs: [`${nome}, ao reunirmos tudo o que você respondeu, alguns movimentos aparecem com mais clareza. Hoje, os pontos que mais pedem atenção se concentram em ${joinNatural(topAxes)}. Isso não é um rótulo; é uma forma de compreender onde a sua energia e o seu cuidado estão sendo mais exigidos.`, ...relationships, ...freeText, 'Ao olhar o conjunto, o que aparece não é falta de vontade. Há percepção do que precisa mudar e desejo de encontrar uma forma mais leve de viver. O cuidado começa diminuindo a pressão para que clareza, presença e movimento possam voltar a conversar entre si.', 'Esse movimento não define você. Ele apenas nos ajuda a compreender o que pode estar acontecendo neste momento para cuidarmos justamente do ponto onde tudo começa a pesar.'], cycle },
    page3: { title: 'O que suas respostas contam sobre você', paragraphs: ['Mesmo entre os pontos que hoje pedem atenção, suas respostas também mostram recursos importantes que permanecem vivos em você. Há percepção do próprio momento, desejo de mudança e abertura para construir um cuidado mais coerente.', intake.relatoLivrePreservado?.trim() ? `Você mesmo reconheceu algo que permanece vivo: “${intake.relatoLivrePreservado.trim()}”. É essa parte que também queremos fortalecer.` : 'A própria decisão de olhar para o seu momento mostra uma parte sua que ainda busca equilíbrio e possibilidade de mudança.'], preserved: preserved.length ? preserved : ['percepção do próprio momento', 'desejo verdadeiro de mudança', 'sensibilidade', 'capacidade de se observar', 'abertura para receber cuidado'], chakras: chakras.map(name => ({ name, text: chakraText(name, active) })) },
    page4: { title: 'O que vamos trabalhar com você', paragraphs: ['A partir do que apareceu na sua anamnese, o cuidado será organizado para reduzir excesso de pressão, favorecer estabilização e trabalhar os pontos que hoje pedem mais atenção. O áudio personalizado faz parte dessa condução e recebe uma composição própria para o seu momento.', ...resources, 'Esses recursos não aparecem separados do restante da leitura. Eles formam uma composição integrada, escolhida para conversar com os padrões percebidos nas suas respostas e acompanhar o movimento que queremos favorecer ao longo do percurso.'] },
    page5: { title: 'Seu percurso a partir daqui', paragraphs: ['Depois desta leitura, você escolhe entre o percurso de 7 ou de 21 dias. Antes do início, há um dia de acolhimento para que você entre na experiência sem transformar o cuidado em mais uma cobrança.', 'Na opção de 7 dias, o percurso é condensado a partir das prioridades identificadas na sua anamnese. Na opção de 21 dias, existe mais espaço para acompanhar diferentes camadas, observar mudanças e realizar reavaliações.', 'O objetivo não é mudar tudo de uma vez. É criar mais chão, reduzir excesso de pressão e permitir que mente, emoção, corpo e energia voltem a conversar entre si.', 'Ao final, a reavaliação ajuda a reconhecer mudanças, permanências e necessidades novas para que o cuidado continue ajustado ao seu momento.'], closingTitle: `Uma última coisa, ${nome}`, closing: ['Você não é a soma das respostas que marcou. Elas são um retrato de como determinadas experiências aparecem agora.', 'Seu desejo de mudança, sua capacidade de perceber o que vive e aquilo que ainda permanece forte em você também fazem parte desta leitura.', 'O próximo passo não precisa resolver tudo. Precisa apenas ser possível, coerente e respeitoso com você.'] }
  };
}
