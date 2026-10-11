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
  if (has('q4_cansaco_esgotamento') && (has('q1_procrastinacao_inicio') || has('q2_mente_acelerada'))) parts.push('O cansaço também muda a leitura: antes de pedir movimento, o cuidado precisa considerar a energia disponível e criar mais espaço para estabilização e descanso interno.');
  if (has('q7_dificuldade_dizer_nao') && has('q8_dificuldade_receber')) parts.push('Sua disponibilidade para os outros aparece junto da dificuldade de receber. Isso pode deixar suas próprias necessidades para depois e tornar limites, reciprocidade e acolhimento partes importantes do cuidado.');
  if (has('q6_engolir_emocoes') && has('q20_conflitos_relacionamento')) parts.push('O que fica guardado emocionalmente aparece junto das relações. A leitura pede espaço para expressão, limites e uma forma mais segura de reconhecer o que é seu antes de sustentar o que pertence aos outros.');
  if (has('q14_falta_direcao_proposito') && has('q17_desejo_recomeco')) parts.push('O desejo de recomeçar aparece junto da busca por direção. Há movimento interno, mas ele precisa de sustentação para ganhar forma sem virar mais uma obrigação.');
  return parts.slice(0, 4);
}

function chakraText(name: string, active: ObservedAnswer[]) {
  const ids = new Set(active.filter(x => x.level >= 3).map(x => x.id)); const n = name.toLowerCase();
  if (n.includes('frontal')) return ids.has('q2_mente_acelerada') ? 'O Frontal aparece relacionado ao excesso de pensamentos e antecipação. Dentro do cuidado, ele pede menos ruído e mais espaço para clareza, percepção e presença.' : 'O Frontal entra como eixo de clareza, percepção e espaço interno.';
  if (n.includes('plexo')) return ids.has('q5_autocobranca_insuficiencia') || ids.has('q1_procrastinacao_inicio') ? 'O Plexo Solar conversa com autocobrança, confiança nas próprias escolhas e ação. Aqui, o trabalho é favorecer movimento sem transformar mudança em pressão.' : 'O Plexo Solar entra ligado à autonomia, confiança e escolhas.';
  if (n.includes('card')) return ids.has('q8_dificuldade_receber') || ids.has('q6_engolir_emocoes') ? 'O Cardíaco aparece na forma como você oferece cuidado e na necessidade de também receber. O foco é acolhimento, reciprocidade e espaço para si.' : 'O Cardíaco entra ligado ao acolhimento e à possibilidade de receber cuidado.';
  if (n.includes('lar')) return ids.has('q7_dificuldade_dizer_nao') || ids.has('q12_trava_expressao_criatividade') ? 'O Laríngeo conversa com limites, expressão das necessidades e voz própria. O foco é permitir que aquilo que você sente encontre uma forma mais presente de ser comunicado.' : 'O Laríngeo entra relacionado à expressão e aos limites.';
  if (n.includes('bás') || n.includes('raiz') || n.includes('muladh')) return 'O Raiz pede segurança, aterramento e estabilidade. Ele entra primeiro quando é necessário criar chão antes de estimular novos movimentos.';
  if (n.includes('sacral') || n.includes('umbilical')) return 'O Sacral participa do cuidado ligado ao sentir, à criatividade, ao prazer e à fluidez.';
  return 'Este centro participa da leitura energética em diálogo com aquilo que suas respostas mostram e será acompanhado dentro do percurso.';
}

function careStrategy(active: ObservedAnswer[], chakraNames: string[], topAxes: string[]) {
  const has = (id: string) => active.some(x => x.id === id && x.level >= 3);
  const chakras = chakraNames.map(x => x.toLowerCase());
  const stages: string[] = [];
  if (chakras.some(x => x.includes('raiz') || x.includes('bás')) || has('q4_cansaco_esgotamento')) stages.push('Primeiro, estabilizar: criar mais sensação de chão, sustentação e espaço interno antes de exigir qualquer mudança.');
  if (chakras.some(x => x.includes('frontal')) || has('q2_mente_acelerada')) stages.push('Depois, aliviar a sobrecarga mental: reduzir o excesso de estímulo interno para favorecer clareza e presença.');
  if (chakras.some(x => x.includes('card')) || has('q8_dificuldade_receber') || has('q6_engolir_emocoes')) stages.push('Em seguida, acolher o campo emocional: abrir espaço para receber cuidado, reconhecer necessidades e diminuir a pressão de sustentar tudo sozinho.');
  if (chakras.some(x => x.includes('plexo')) || has('q5_autocobranca_insuficiencia') || has('q1_procrastinacao_inicio')) stages.push('Com mais sustentação, fortalecer confiança e movimento: trabalhar escolhas e ação possível sem transformar o processo em nova cobrança.');
  if (chakras.some(x => x.includes('lar')) || has('q7_dificuldade_dizer_nao')) stages.push('Também será trabalhada a expressão: favorecer limites, voz própria e comunicação mais coerente com o que você sente e precisa.');
  if (!stages.length) stages.push(`O cuidado será organizado a partir dos eixos que mais apareceram agora — ${joinNatural(topAxes)} — começando por estabilização e seguindo para integração e movimento possível.`);
  return stages.slice(0, 5);
}

function resourceReason(kind: string, names: string, priorities: string[], chakras: string[]) {
  const target = joinNatural(priorities.slice(0, 3));
  const centers = joinNatural(chakras.slice(0, 3));
  const centerText = centers ? ` e aos centros ${centers}` : '';
  return `${kind}: ${names}. Este recurso foi selecionado para acompanhar especificamente os pontos de ${target}${centerText}, dentro da sequência de cuidado definida para este momento.`;
}

export function buildFullReportNarrative({ intake, analysis, composition }: { intake: AnamneseInput; analysis: AnaliseCompletaResultado; composition: CareComposition | null }): FullReportNarrative {
  const nome = firstName(intake.nomePessoa); const report = analysis.relatorioEverton; const answers = observedAnswers(intake); const active = answers.filter(x => x.level >= 2); const relationships = relationshipReading(active);
  const rankedAxes = report.eixosOrdenados; const topAxes = rankedAxes.slice(0, 4).map(x => x.nome.toLowerCase()); const preserved = report.analiseContextualAvancada?.fatoresPreservados.recursosInternosPreservados || []; const chakras = unique([...report.regioesCorporais.chakrasCorrespondentes, ...report.recursosInternos.chakras]).slice(0, 5);
  const automaticComplementary = selectComplementaryCare(rankedAxes); const solfeggio = composition?.solfeggio || selectSolfeggioFrequency(rankedAxes); const crystals = composition?.ethericCrystals?.length ? composition.ethericCrystals : automaticComplementary.ethericCrystals; const florals = composition?.floral?.length ? composition.floral : automaticComplementary.florals; const aromas = composition?.aromatherapy?.length ? composition.aromatherapy : automaticComplementary.aromatherapy;
  const energies = unique([...(composition?.audio?.recursosEnergeticos.energias || []), ...(report.recursosInternos.energias || [])]).map(friendlyResourceName).slice(0, 6);
  const audioSystems = unique([composition?.audio?.sistemaBase || report.sistemaBase?.nome || '', composition?.audio?.sistemaPrincipal || report.sistemaPrincipal?.nome || '', ...(composition?.audio?.sistemasComplementares || report.sistemasComplementares?.map(x => x.nome) || [])]).filter(Boolean).slice(0, 6); const bath = selectBathSupport(rankedAxes);
  const strategy = careStrategy(active, chakras, topAxes);
  const freeText = [intake.relatoLivreNecessidade?.trim() ? `Quando você diz “${intake.relatoLivreNecessidade.trim()}”, essa fala entra na leitura como uma necessidade concreta e ajuda a definir a prioridade do cuidado.` : '', intake.relatoLivreDesafios?.trim() ? `Você também reconhece como desafio “${intake.relatoLivreDesafios.trim()}”. Esse ponto será observado ao longo do percurso para perceber o que muda quando a pressão diminui e existe mais sustentação.` : ''].filter(Boolean);
  const resources: string[] = [];
  if (energies.length) resources.push(resourceReason('Energias empregadas no áudio personalizado', joinNatural(energies), topAxes, chakras));
  if (audioSystems.length) resources.push(`A composição será conduzida por ${joinNatural(audioSystems)}. Esses recursos não entram como uma lista de técnicas: serão organizados na ordem do cuidado — estabilizar, aliviar o que está em excesso, fortalecer os centros que pedem sustentação e então favorecer integração e movimento.`);
  if (solfeggio) resources.push(`Frequência de apoio: ${solfeggio.hz} Hz. Nesta composição, ela acompanha ${solfeggio.intencaoProjeto.toLowerCase()} e será usada em coerência com as prioridades encontradas na anamnese.`);
  if (crystals.length) resources.push(resourceReason('Cristais etéricos', joinNatural(crystals.map(x => x.nome)), topAxes, chakras));
  if (florals.length) resources.push(resourceReason('Florais', joinNatural(florals.map(x => x.nome)), topAxes, chakras));
  if (aromas.length) resources.push(resourceReason('Aromaterapia', joinNatural(aromas.map(x => x.nome.replace(/\s+—.*/, ''))), topAxes, chakras));
  if (bath) resources.push(`Banho de apoio: ${bath.nome}. Ele entra como recurso complementar do percurso, seguindo a orientação prevista para esse recurso e sem substituir os demais cuidados.`);
  const cycle = relationships.length >= 2 ? 'muitas demandas → sobrecarga → dificuldade de decidir ou começar → adiamento → pequeno alívio momentâneo → cobrança → cansaço → nova tentativa.' : undefined;

  return { nome,
    page1: { title: 'Relatório Completo — Leitura do Seu Momento', subtitle: 'Uma devolutiva construída a partir das suas respostas, dos pontos que pedem cuidado e dos recursos escolhidos para acompanhar o seu percurso.', intro: `${nome}, suas respostas foram recebidas com cuidado. O que você trouxe aqui não é apenas um formulário: é um retrato do seu momento, com sentimentos, desafios, recursos e também possibilidades de movimento.` },
    page2: { title: 'Diagnóstico da Anamnese', paragraphs: [`${nome}, ao reunirmos tudo o que você respondeu, os pontos que mais pedem atenção agora se concentram em ${joinNatural(topAxes)}. A leitura não usa isso para definir quem você é; usa para entender onde o peso está maior e por onde o cuidado precisa começar.`, ...relationships, ...freeText, 'O ponto central não é falta de vontade. Suas respostas mostram percepção do que precisa mudar, mas também indicam que pressão, cansaço ou excesso de pensamentos podem transformar até uma mudança desejada em mais uma exigência. Por isso, o cuidado não começará cobrando ação: começará criando sustentação.', 'A partir daí, o percurso passa a ter uma direção: diminuir o que hoje pesa demais, fortalecer os centros que pedem apoio e só então favorecer clareza, confiança e movimento possível.'], cycle },
    page3: { title: 'O que suas respostas contam sobre você', paragraphs: ['Mesmo entre os pontos que hoje pedem atenção, suas respostas mostram recursos que permanecem vivos. Eles importam porque o cuidado não será construído apenas em torno do que está difícil, mas também a partir do que em você já consegue perceber, desejar e sustentar.', intake.relatoLivrePreservado?.trim() ? `Você mesmo reconheceu algo que permanece vivo: “${intake.relatoLivrePreservado.trim()}”. Isso também fará parte do percurso.` : 'A própria decisão de olhar para o seu momento mostra uma parte sua que ainda busca equilíbrio e possibilidade de mudança.'], preserved: preserved.length ? preserved : ['percepção do próprio momento', 'desejo verdadeiro de mudança', 'sensibilidade', 'capacidade de se observar', 'abertura para receber cuidado'], chakras: chakras.map(name => ({ name, text: chakraText(name, active) })) },
    page4: { title: 'O que vamos trabalhar com você', paragraphs: ['O cuidado foi organizado em uma sequência, porque não faz sentido estimular movimento quando o que aparece primeiro é necessidade de sustentação. A direção para este momento será:', ...strategy, 'Para acompanhar essa direção, a composição personalizada reúne os recursos abaixo. Cada escolha está vinculada às prioridades encontradas na sua anamnese e aos centros energéticos que apareceram na leitura:', ...resources, 'A intenção é que esses recursos trabalhem como uma composição integrada: primeiro oferecendo sustentação, depois ajudando a reduzir o que está em excesso e, por fim, favorecendo integração, confiança e um movimento que seja possível para você agora.'] },
    page5: { title: 'Seu percurso a partir daqui', paragraphs: ['Depois desta leitura, você escolhe entre o percurso de 7 ou de 21 dias. Antes do início, há um dia de acolhimento para entrar na experiência sem transformar o cuidado em mais uma cobrança.', 'Na opção de 7 dias, o percurso condensa as prioridades identificadas na anamnese. Na opção de 21 dias, há mais espaço para acompanhar diferentes camadas, observar respostas e realizar reavaliações.', `Nos primeiros momentos, observe especialmente o que acontece com ${joinNatural(topAxes.slice(0, 3))}. Não procure uma mudança perfeita: perceba pequenas diferenças na forma como você pensa, sente, reage, descansa, escolhe ou consegue iniciar um movimento.`, 'Ao longo do percurso, o que responder bem será mantido; o que continuar pesando será reavaliado. O cuidado deve se ajustar ao seu momento — não obrigar você a caber em um roteiro.'], closingTitle: `Uma última coisa, ${nome}`, closing: ['Você não é a soma das respostas que marcou. Elas mostram onde determinadas experiências estão pesando agora.', 'O caminho proposto tem uma ordem: sustentar primeiro, aliviar o excesso, fortalecer o que pede cuidado e então favorecer movimento.', 'Seu próximo passo não precisa resolver tudo. Precisa ser possível, coerente e respeitoso com você.'] }
  };
}
