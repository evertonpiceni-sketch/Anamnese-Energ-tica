import { AnamneseInput, EixoResultado } from '../types';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { REGIOES_CORPORAIS } from '../data/regioesCorporais';

export const ANSWER_LABELS = ['Não acontece comigo', 'Acontece um pouco', 'Acontece às vezes', 'Acontece bastante', 'Está muito presente'];

const THEMES: Record<string, { name: string; observation: string; intention: string; chakras: string[] }> = {
  q1_procrastinacao_inicio: { name: 'dificuldade de começar', observation: 'Começar pode estar exigindo mais de você do que gostaria, mesmo quando sabe o que precisa fazer. Podemos abrir espaço para um primeiro passo pequeno, que caiba no seu momento.', intention: 'observar o que torna um primeiro passo possível, sem aumentar a pressão', chakras: ['Plexo Solar'] },
  q2_mente_acelerada: { name: 'mente acelerada', observation: 'Sua mente parece encontrar pouco espaço para descansar entre pensamentos e preocupações. O convite é recuperar pequenas pausas, sem precisar resolver tudo ao mesmo tempo.', intention: 'acompanhar a facilidade de desacelerar e organizar uma prioridade de cada vez', chakras: ['Frontal'] },
  q3_sensacao_ameaca_inseguranca: { name: 'estado de alerta e insegurança', observation: 'A sensação de estar em alerta pode tornar difícil relaxar e confiar no momento presente. Seu cuidado merece começar com calma, acolhendo sua necessidade de segurança.', intention: 'observar em quais momentos a sensação de alerta diminui ou permanece', chakras: ['Raiz'] },
  q4_cansaco_esgotamento: { name: 'cansaço e esgotamento', observation: 'O cansaço que você sente merece ser acolhido. Antes de pedir mais de si, pode ser importante dar lugar ao descanso e perceber o que ajuda a recuperar sua disposição.', intention: 'registrar como você acorda e como sua disposição varia durante o dia', chakras: ['Raiz', 'Sacral'] },
  q5_autocobranca_insuficiencia: { name: 'autocobrança e sensação de insuficiência', observation: 'A cobrança interna parece deixar pouco espaço para reconhecer o que você já faz. Você pode cuidar do que precisa mudar e, ao mesmo tempo, tratar seus próprios esforços com mais gentileza.', intention: 'perceber a cobrança interna e reconhecer um esforço sem exigir perfeição', chakras: ['Plexo Solar'] },
  q6_engolir_emocoes: { name: 'sentimentos guardados', observation: 'Guardar o que sente pode deixar alguns momentos mais pesados. Aqui, suas emoções têm espaço: você pode reconhecê-las e compartilhá-las no seu tempo.', intention: 'nomear o que sente e perceber quando gostaria de compartilhar isso', chakras: ['Cardíaco', 'Laríngeo'] },
  q7_dificuldade_dizer_nao: { name: 'dificuldade de estabelecer limites', observation: 'Colocar limites pode ser delicado para você. Encontrar uma forma de dizer o que precisa também é uma maneira de cuidar das suas relações e de si.', intention: 'identificar um limite que você gostaria de comunicar com clareza', chakras: ['Plexo Solar', 'Laríngeo'] },
  q8_dificuldade_receber: { name: 'dificuldade de receber cuidado', observation: 'Receber ajuda, carinho ou descanso parece ser mais difícil do que oferecer cuidado. Você também pode ter um lugar nessa troca, começando por um apoio que se sinta confortável em aceitar.', intention: 'observar como é aceitar uma ajuda ou um momento de descanso', chakras: ['Cardíaco'] },
  q9_sensibilidade_ambientes: { name: 'desgaste em ambientes e encontros', observation: 'Alguns ambientes e encontros parecem deixar você com menos disposição. Perceber seu próprio ritmo e reservar um tempo para se recompor pode ajudar a cuidar desses momentos.', intention: 'notar quais ambientes exigem mais de você e o que ajuda a recuperar espaço', chakras: ['Raiz'] },
  q10_repeticao_ciclos: { name: 'repetição de situações difíceis', observation: 'Algumas situações difíceis parecem voltar, e isso pode trazer desgaste. Podemos olhar com calma para uma delas e abrir espaço para uma resposta diferente, sem exigir que tudo se transforme de uma vez.', intention: 'registrar uma situação que se repete e a resposta que você gostaria de experimentar', chakras: ['Frontal'] },
  q11_desconexao_corpo_prazer: { name: 'distância do corpo, prazer e descanso', observation: 'Você sente que o corpo, o prazer ou o descanso ficaram mais distantes. Retomar contato com uma sensação agradável ou uma pausa simples pode ser um começo, sem obrigação de sentir algo específico.', intention: 'perceber uma sensação corporal ou um momento de descanso sem transformá-lo em tarefa', chakras: ['Sacral'] },
  q12_trava_expressao_criatividade: { name: 'dificuldade de expressar ideias e criatividade', observation: 'Expressar suas ideias ou deixar a criatividade aparecer pode estar sendo difícil. Há espaço para experimentar uma forma de expressão com menos pressão e mais liberdade.', intention: 'observar uma ideia que você gostaria de expressar com mais liberdade', chakras: ['Laríngeo', 'Sacral'] },
  q13_inseguranca_material_prosperidade: { name: 'preocupações financeiras', observation: 'As preocupações materiais têm ocupado espaço no seu descanso ou nos seus projetos. Elas merecem escuta, junto de pequenos passos possíveis na sua vida prática.', intention: 'observar como as preocupações materiais interferem no descanso e no próximo passo prático', chakras: ['Raiz', 'Plexo Solar'] },
  q14_falta_direcao_proposito: { name: 'falta de direção e sentido', observation: 'A direção da sua vida ou o sentido do que faz parecem estar pedindo um olhar mais próximo. Você pode explorar essa busca aos poucos, respeitando o que tem valor para você.', intention: 'identificar uma escolha pequena que se aproxime do que faz sentido para você', chakras: ['Frontal', 'Coronário'] },
  q15_desconexao_espiritual: { name: 'sensação de desconexão espiritual', observation: 'A conexão com sua fé, intuição ou fonte de amparo parece mais distante neste momento. Podemos acolher essa experiência e cuidar do que ajuda você a se sentir acompanhado, dentro das suas próprias referências.', intention: 'observar o que, nas suas próprias referências, traz sensação de conexão ou amparo', chakras: ['Coronário'] },
  q16_dificuldade_desapegar: { name: 'dificuldade de soltar o que perdeu sentido', observation: 'Soltar o que já pesa pode ser difícil, mesmo quando uma parte sua deseja mais leveza. Esse movimento merece tempo e delicadeza, sem forçar uma despedida.', intention: 'reconhecer o que você gostaria de deixar mais leve, sem forçar uma despedida', chakras: ['Cardíaco'] },
  q17_desejo_recomeco: { name: 'dificuldade de iniciar um novo ciclo', observation: 'Um novo começo parece estar pedindo espaço, mas dar esse passo ainda é difícil. Você pode se aproximar dele aos poucos, sem precisar mudar toda a vida de uma vez.', intention: 'observar o que tornaria um novo começo um pouco mais possível', chakras: ['Plexo Solar'] },
  q18_sensacao_fragmentacao: { name: 'desencontro entre pensamentos, emoções e corpo', observation: 'Pensamentos, emoções e corpo parecem seguir ritmos diferentes. O cuidado pode abrir pequenas pausas para ouvir o que sente e se aproximar de escolhas que façam sentido para você.', intention: 'registrar um momento em que pensamento, sentimento e ação ficaram mais próximos', chakras: [] },
  q19_tensao_corporal_cronica: { name: 'tensão corporal', observation: 'A tensão que você percebe no corpo merece atenção e cuidado. Podemos acompanhar quando ela aparece e o que traz algum conforto, respeitando as sensações que você reconhece.', intention: 'acompanhar onde você percebe tensão e quando ela muda', chakras: [] },
  q20_conflitos_relacionamento: { name: 'dificuldades nas relações próximas', observation: 'As dificuldades nas relações próximas têm pedido atenção. Há espaço para acolher o que você sente e perceber o que gostaria de comunicar ou compreender melhor nessas trocas.', intention: 'observar uma troca concreta e o que você gostaria de comunicar ou compreender melhor', chakras: ['Cardíaco'] },
};

export function collectAnswerEvidence(intake: AnamneseInput, axes: EixoResultado[]) {
  return PERGUNTAS_ANAMNESE.flatMap(question => {
    const level = intake.respostasObjetivas[question.id];
    if (!Number.isInteger(level) || level < 0 || level > 4) return [];
    const theme = THEMES[question.id];
    const relevance = axes.reduce((sum, axis) => sum + (question.pesosEixos[axis.eixoId] || 0) * axis.percentual, 0);
    return [{ questionId: question.id, questionText: question.texto, level, label: ANSWER_LABELS[level], ...theme, relevance }];
  }).sort((a, b) => b.level - a.level || b.relevance - a.relevance || a.questionId.localeCompare(b.questionId));
}

export function buildEvidenceChakras(intake: AnamneseInput, evidence: ReturnType<typeof collectAnswerEvidence>) {
  const body = REGIOES_CORPORAIS.filter(region => intake.regioesCorporaisPercebidas.includes(region.id));
  const canonical = (name: string) => /básico/i.test(name) ? 'Raiz' : /umbilical/i.test(name) ? 'Sacral' : /plexo/i.test(name) ? 'Plexo Solar' : /card/i.test(name) ? 'Cardíaco' : /lar/i.test(name) ? 'Laríngeo' : /frontal/i.test(name) ? 'Frontal' : /coron/i.test(name) ? 'Coronário' : null;
  return ['Raiz', 'Sacral', 'Plexo Solar', 'Cardíaco', 'Laríngeo', 'Frontal', 'Coronário'].map(name => {
    const support = evidence.filter(item => item.level >= 2 && item.chakras.includes(name));
    const regions = body.filter(region => region.chakrasCorrespondentes.some(chakra => canonical(chakra) === name));
    const meanings: Record<string, string> = {
      Raiz: 'a segurança, o descanso e a sensação de ter um chão para se apoiar',
      Sacral: 'o contato com o corpo, a receptividade e o prazer de viver pequenas experiências',
      'Plexo Solar': 'a confiança nas próprias escolhas e a liberdade de agir com menos cobrança',
      Cardíaco: 'o acolhimento emocional e a possibilidade de oferecer e também receber cuidado',
      Laríngeo: 'a expressão do que sente e a comunicação das suas necessidades e limites',
      Frontal: 'a clareza dos pensamentos e a percepção dos caminhos que fazem sentido para você',
      Coronário: 'a conexão com sua própria fonte de amparo, sentido e espiritualidade',
    };
    const themes = support.slice(0, 2).map(item => item.name).join(' e ');
    const bodyReason = regions.length ? ` As sensações que você indicou em ${regions.map(region => region.nome.toLowerCase()).join(' e ')} também fazem parte dessa leitura.` : '';
    const text = themes
      ? `Os relatos de ${themes} orientam o cuidado com ${meanings[name]}.${bodyReason}`
      : `As sensações que você indicou em ${regions.map(region => region.nome.toLowerCase()).join(' e ')} se relacionam, no protocolo, ao chakra ${name}. O cuidado com esse centro tem como intenção apoiar ${meanings[name]}.`;
    return { name, score: support.reduce((total, item) => total + item.level, 0) + regions.length * 4, text };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(({ name, text }) => ({ name, text }));
}

/** Reproducible source fingerprint for traceability, never used for authorization. */
export function narrativeSource(intake: AnamneseInput) {
  const snapshot = JSON.stringify([intake.id, PERGUNTAS_ANAMNESE.map(q => [q.id, intake.respostasObjetivas[q.id] ?? null]), intake.intencaoDeclarada, intake.relatoLivreNecessidade, intake.relatoLivreDesafios, intake.relatoLivrePreservado, [...intake.regioesCorporaisPercebidas].sort(), intake.sensibilidadeEnergetica]);
  let hash = 2166136261;
  for (const character of snapshot) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return { generatorVersion: 'answers-v4' as const, intakeId: intake.id, fingerprint: (hash >>> 0).toString(16) };
}
