import { AnamneseInput, EixoResultado } from '../types';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { REGIOES_CORPORAIS } from '../data/regioesCorporais';

export const ANSWER_LABELS = ['Não acontece comigo', 'Acontece um pouco', 'Acontece às vezes', 'Acontece bastante', 'Está muito presente'];

const THEMES: Record<string, { name: string; observation: string; intention: string; chakras: string[] }> = {
  q1_procrastinacao_inicio: { name: 'dificuldade de começar', observation: 'Você percebe uma distância entre saber o que precisa fazer e conseguir iniciar. A leitura se concentra nessa trava, sem atribuí-la a falta de vontade.', intention: 'observar o que torna um primeiro passo possível, sem aumentar a pressão', chakras: ['Plexo Solar'] },
  q2_mente_acelerada: { name: 'mente acelerada', observation: 'Pensar em várias coisas e antecipar cenários ocupa seu espaço interno. O ponto a acompanhar é se você consegue encontrar intervalos de descanso mental.', intention: 'acompanhar a facilidade de desacelerar e organizar uma prioridade de cada vez', chakras: ['Frontal'] },
  q3_sensacao_ameaca_inseguranca: { name: 'estado de alerta e insegurança', observation: 'Você reconhece a expectativa de que algo ruim possa acontecer. Isso pede atenção à sensação de segurança, sem concluir qual é a origem desse alerta.', intention: 'observar em quais momentos a sensação de alerta diminui ou permanece', chakras: ['Raiz'] },
  q4_cansaco_esgotamento: { name: 'cansaço e esgotamento', observation: 'Você relata pouca recuperação de energia ou esgotamento mesmo sem esforço exagerado. Descanso e disposição precisam ser acompanhados antes de exigir mais atividade.', intention: 'registrar como você acorda e como sua disposição varia durante o dia', chakras: ['Raiz', 'Sacral'] },
  q5_autocobranca_insuficiencia: { name: 'autocobrança e sensação de insuficiência', observation: 'A sensação de que o que você faz não é suficiente aparece na sua resposta. O cuidado deve observar como essa exigência interfere nas escolhas e no reconhecimento do que já foi feito.', intention: 'perceber a cobrança interna e reconhecer um esforço sem exigir perfeição', chakras: ['Plexo Solar'] },
  q6_engolir_emocoes: { name: 'sentimentos guardados', observation: 'Você identifica sentimentos que guarda para si, angústia ou choro quando está sem companhia. A resposta pede espaço para reconhecer o que sente; ela não informa, sozinha, a causa ou a emoção específica.', intention: 'nomear o que sente e perceber quando gostaria de compartilhar isso', chakras: ['Cardíaco', 'Laríngeo'] },
  q7_dificuldade_dizer_nao: { name: 'dificuldade de estabelecer limites', observation: 'Você reconhece dificuldade para colocar limites ou assumir responsabilidades alheias. Vale observar uma situação concreta em que gostaria de delimitar melhor o que pode oferecer.', intention: 'identificar um limite que você gostaria de comunicar com clareza', chakras: ['Plexo Solar', 'Laríngeo'] },
  q8_dificuldade_receber: { name: 'dificuldade de receber cuidado', observation: 'Você percebe que cuidar dos outros é mais fácil do que aceitar ajuda, descanso ou carinho. Isso aponta para a forma de receber apoio, sem presumir que você precise cuidar menos dos outros.', intention: 'observar como é aceitar uma ajuda ou um momento de descanso', chakras: ['Cardíaco'] },
  q9_sensibilidade_ambientes: { name: 'desgaste em ambientes e encontros', observation: 'Você associa ambientes ou contato com pessoas a uma sensação de peso ou de energia drenada. A leitura acompanha essa percepção, sem afirmar que outras pessoas sejam a causa do desgaste.', intention: 'notar quais ambientes exigem mais de você e o que ajuda a recuperar espaço', chakras: ['Raiz'] },
  q10_repeticao_ciclos: { name: 'repetição de situações difíceis', observation: 'Você identifica situações desafiadoras que parecem se repetir. Para acompanhar isso, é mais útil reconhecer um exemplo real do que atribuir uma causa que não foi informada.', intention: 'registrar uma situação que se repete e a resposta que você gostaria de experimentar', chakras: ['Frontal'] },
  q11_desconexao_corpo_prazer: { name: 'distância do corpo, prazer e descanso', observation: 'Você percebe distância das sensações do corpo, do prazer ou do descanso. O cuidado pode acompanhar o espaço que essas experiências têm no seu cotidiano, sem exigir uma forma certa de senti-las.', intention: 'perceber uma sensação corporal ou um momento de descanso sem transformá-lo em tarefa', chakras: ['Sacral'] },
  q12_trava_expressao_criatividade: { name: 'dificuldade de expressar ideias e criatividade', observation: 'Você reconhece uma trava na criatividade ou receio de expor ideias. A resposta pede atenção à expressão; não permite concluir que sua capacidade criativa esteja ausente.', intention: 'observar uma ideia que você gostaria de expressar com mais liberdade', chakras: ['Laríngeo', 'Sacral'] },
  q13_inseguranca_material_prosperidade: { name: 'preocupações financeiras', observation: 'Você relata que preocupações materiais afetam o sono ou a realização de projetos. Esse é um tema da vida prática que merece ser reconhecido sem prometer resultados financeiros por meio do cuidado energético.', intention: 'observar como as preocupações materiais interferem no descanso e no próximo passo prático', chakras: ['Raiz', 'Plexo Solar'] },
  q14_falta_direcao_proposito: { name: 'falta de direção e sentido', observation: 'Você questiona a direção ou o sentido do que está fazendo. O cuidado acompanha essa busca sem impor uma vocação ou uma resposta pronta para sua vida.', intention: 'identificar uma escolha pequena que se aproxime do que faz sentido para você', chakras: ['Frontal', 'Coronário'] },
  q15_desconexao_espiritual: { name: 'sensação de desconexão espiritual', observation: 'Você reconhece distância de uma fé, intuição ou fonte de amparo. Essa percepção será acolhida dentro das suas próprias referências, sem pressupor uma crença específica.', intention: 'observar o que, nas suas próprias referências, traz sensação de conexão ou amparo', chakras: ['Coronário'] },
  q16_dificuldade_desapegar: { name: 'dificuldade de soltar o que perdeu sentido', observation: 'Você percebe dificuldade de soltar mágoas, ressentimentos ou coisas materiais. A resposta não identifica qual dessas experiências predomina; seu relato livre pode ajudar a diferenciá-las.', intention: 'reconhecer o que você gostaria de deixar mais leve, sem forçar uma despedida', chakras: ['Cardíaco'] },
  q17_desejo_recomeco: { name: 'dificuldade de iniciar um novo ciclo', observation: 'Você reconhece o fechamento de um ciclo e dificuldade de começar o seguinte. O foco é encontrar condições para um primeiro movimento, sem exigir uma mudança completa de uma vez.', intention: 'observar o que tornaria um novo começo um pouco mais possível', chakras: ['Plexo Solar'] },
  q18_sensacao_fragmentacao: { name: 'desencontro entre pensamentos, emoções e corpo', observation: 'Você percebe pensamentos, emoções e corpo em ritmos diferentes. O acompanhamento pode observar onde há mais coerência entre o que você pensa, sente e consegue fazer.', intention: 'registrar um momento em que pensamento, sentimento e ação ficaram mais próximos', chakras: [] },
  q19_tensao_corporal_cronica: { name: 'tensão corporal', observation: 'Você reconhece tensão muscular recorrente. Como a pergunta oferece vários exemplos, ela não permite afirmar uma localização específica sem sua indicação de regiões corporais.', intention: 'acompanhar onde você percebe tensão e quando ela muda', chakras: [] },
  q20_conflitos_relacionamento: { name: 'dificuldades nas relações próximas', observation: 'Você relata atritos, mal-entendidos ou distanciamento nas relações. A leitura acompanha a experiência relatada sem atribuir responsabilidade a você ou a outra pessoa.', intention: 'observar uma troca concreta e o que você gostaria de comunicar ou compreender melhor', chakras: ['Cardíaco'] },
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
    const reasons = support.map(item => `${item.name} (${item.level}/4)`);
    if (regions.length) reasons.push(`sua indicação de ${regions.map(region => region.nome.toLowerCase()).join(' e ')}`);
    return { name, score: support.reduce((total, item) => total + item.level, 0) + regions.length * 4, text: `Base nas suas respostas: ${reasons.join('; ')}.` };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(({ name, text }) => ({ name, text }));
}

/** Reproducible source fingerprint for traceability, never used for authorization. */
export function narrativeSource(intake: AnamneseInput) {
  const snapshot = JSON.stringify([intake.id, PERGUNTAS_ANAMNESE.map(q => [q.id, intake.respostasObjetivas[q.id] ?? null]), intake.intencaoDeclarada, intake.relatoLivreNecessidade, intake.relatoLivreDesafios, intake.relatoLivrePreservado, [...intake.regioesCorporaisPercebidas].sort(), intake.sensibilidadeEnergetica]);
  let hash = 2166136261;
  for (const character of snapshot) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return { generatorVersion: 'answers-v2' as const, intakeId: intake.id, fingerprint: (hash >>> 0).toString(16) };
}
