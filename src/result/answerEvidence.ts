import { AnamneseInput, EixoResultado } from '../types';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { REGIOES_CORPORAIS } from '../data/regioesCorporais';

export const ANSWER_LABELS = ['Não acontece comigo', 'Acontece um pouco', 'Acontece às vezes', 'Acontece bastante', 'Está muito presente'];

const THEMES: Record<string, { name: string; observation: string; intention: string; chakras: string[] }> = {
  q1_procrastinacao_inicio: { name: 'dificuldade de começar', observation: 'Dar o primeiro passo parece custar mais do que gostaria, mesmo quando o caminho já está claro. Começar por algo pequeno pode aliviar o peso de ter de resolver tudo de uma vez.', intention: 'observar o que torna um primeiro passo possível, sem aumentar a pressão', chakras: ['Plexo Solar'] },
  q2_mente_acelerada: { name: 'mente acelerada', observation: 'Os pensamentos continuam ativos e a mente encontra dificuldade para desacelerar. Quando muitas preocupações disputam atenção, decidir ou descansar pode exigir mais esforço. O cuidado começa por abrir pequenos intervalos e acolher uma prioridade de cada vez, sem exigir que a mente fique vazia.', intention: 'acompanhar a facilidade de desacelerar e organizar uma prioridade de cada vez', chakras: ['Frontal'] },
  q3_sensacao_ameaca_inseguranca: { name: 'estado de alerta e insegurança', observation: 'A sensação de estar em alerta, como se algo ruim pudesse acontecer, tem ocupado espaço no cotidiano. Mesmo em uma pausa, esse receio pode dificultar o descanso e a confiança no momento presente. Antes de pedir qualquer mudança, vamos cuidar da segurança e do conforto necessários para baixar o ritmo, com liberdade para interromper uma prática se houver desconforto.', intention: 'observar em quais momentos a sensação de alerta diminui ou permanece', chakras: ['Raiz'] },
  q4_cansaco_esgotamento: { name: 'cansaço e esgotamento', observation: 'A energia parece se recuperar pouco, inclusive ao acordar, e o esgotamento aparece mesmo sem grande esforço. Isso pode tornar tarefas simples mais difíceis e afastar momentos que antes eram agradáveis. O início do cuidado será abrir lugar para descanso e apoio, respeitando a disposição disponível.', intention: 'registrar como você acorda e como sua disposição varia durante o dia', chakras: ['Raiz', 'Sacral'] },
  q5_autocobranca_insuficiencia: { name: 'autocobrança e sensação de insuficiência', observation: 'A cobrança constante e a sensação de que o que faz nunca é suficiente parecem deixar pouco espaço para reconhecer os próprios esforços. Uma dificuldade cotidiana pode acabar trazendo ainda mais pressão. Vamos acolher o desejo de mudança sem desvalorizar tudo o que já foi sustentado: reconhecer um esforço pequeno e permitir uma pausa também fazem parte desse caminho.', intention: 'perceber a cobrança interna e reconhecer um esforço sem exigir perfeição', chakras: ['Plexo Solar'] },
  q6_engolir_emocoes: { name: 'sentimentos guardados', observation: 'Guardar sentimentos pode tornar alguns momentos mais pesados. Essas emoções merecem espaço e escuta, no tempo em que for confortável reconhecê-las ou compartilhá-las.', intention: 'nomear o que sente e perceber quando gostaria de compartilhar isso', chakras: ['Cardíaco', 'Laríngeo'] },
  q7_dificuldade_dizer_nao: { name: 'dificuldade de estabelecer limites', observation: 'Colocar limites parece ser delicado, especialmente quando há receio de desagradar. Encontrar uma forma de comunicar necessidades pode proteger o descanso e tornar as relações mais respeitosas.', intention: 'identificar um limite que você gostaria de comunicar com clareza', chakras: ['Plexo Solar', 'Laríngeo'] },
  q8_dificuldade_receber: { name: 'dificuldade de receber cuidado', observation: 'Receber ajuda, carinho ou descanso parece ser mais difícil do que oferecer cuidado. Há lugar para experimentar essa troca aos poucos, começando por um apoio que seja confortável aceitar.', intention: 'observar como é aceitar uma ajuda ou um momento de descanso', chakras: ['Cardíaco'] },
  q9_sensibilidade_ambientes: { name: 'desgaste em ambientes e encontros', observation: 'Alguns ambientes e encontros deixam uma sensação de peso e menos energia. Essa percepção merece escuta, sem atribuir o desgaste a outra pessoa. Preservar um intervalo para se recompor e reconhecer quando precisa de silêncio, distância ou companhia pode ajudar a cuidar desses momentos.', intention: 'notar quais ambientes exigem mais de você e o que ajuda a recuperar espaço', chakras: ['Raiz'] },
  q10_repeticao_ciclos: { name: 'repetição de situações difíceis', observation: 'Algumas situações difíceis parecem voltar, trazendo desgaste e a impressão de estar no mesmo lugar. Olhar com calma para uma delas pode revelar um ponto em que seja possível experimentar uma resposta diferente, sem exigir uma grande virada.', intention: 'registrar uma situação que se repete e a resposta que você gostaria de experimentar', chakras: ['Frontal'] },
  q11_desconexao_corpo_prazer: { name: 'distância do corpo, prazer e descanso', observation: 'Viver muito na cabeça parece ter deixado mais distantes as sensações do corpo, do prazer e do descanso. O caminho de volta pode começar pelo apoio confortável de uma cadeira, uma música querida ou uma pausa. Alegria e entusiasmo não serão tarefas: primeiro haverá espaço para perceber o que traz conforto.', intention: 'perceber uma sensação corporal ou um momento de descanso sem transformá-lo em tarefa', chakras: ['Sacral'] },
  q12_trava_expressao_criatividade: { name: 'dificuldade de expressar ideias e criatividade', observation: 'Expressar ideias ou deixar a criatividade aparecer parece estar sendo difícil. Experimentar uma forma de expressão sem precisar acertar pode abrir espaço para mais liberdade e menos pressão.', intention: 'observar uma ideia que você gostaria de expressar com mais liberdade', chakras: ['Laríngeo', 'Sacral'] },
  q13_inseguranca_material_prosperidade: { name: 'preocupações financeiras', observation: 'As preocupações materiais têm ocupado espaço no descanso ou nos projetos. Elas merecem escuta, junto de pequenos passos possíveis na vida prática e apoio para o que não precisa ser enfrentado sozinho.', intention: 'observar como as preocupações materiais interferem no descanso e no próximo passo prático', chakras: ['Raiz', 'Plexo Solar'] },
  q14_falta_direcao_proposito: { name: 'falta de direção e sentido', observation: 'A direção da vida ou o sentido das escolhas parecem pedir um olhar mais próximo. Essa busca pode ser explorada aos poucos, mantendo perto aquilo que tem valor, sem exigir respostas imediatas sobre o futuro.', intention: 'identificar uma escolha pequena que se aproxime do que faz sentido para você', chakras: ['Frontal', 'Coronário'] },
  q15_desconexao_espiritual: { name: 'sensação de desconexão espiritual', observation: 'A fé, a intuição ou a fonte de amparo parecem mais distantes neste momento. Há espaço para acolher essa experiência e se aproximar das próprias referências, sem forçar uma sensação de conexão.', intention: 'observar o que, nas suas próprias referências, traz sensação de conexão ou amparo', chakras: ['Coronário'] },
  q16_dificuldade_desapegar: { name: 'dificuldade de soltar o que perdeu sentido', observation: 'Soltar o que já pesa pode ser difícil, mesmo quando existe desejo de mais leveza. Esse movimento merece tempo e delicadeza, com espaço para acolher o que ainda precisa ser vivido antes de uma despedida.', intention: 'reconhecer o que você gostaria de deixar mais leve, sem forçar uma despedida', chakras: ['Cardíaco'] },
  q17_desejo_recomeco: { name: 'dificuldade de iniciar um novo ciclo', observation: 'Um novo começo parece estar pedindo espaço, mas dar esse passo ainda é difícil. Aproximar-se dele aos poucos, com preparação e apoio, pode ser mais acolhedor do que tentar mudar toda a vida de uma vez.', intention: 'observar o que tornaria um novo começo um pouco mais possível', chakras: ['Plexo Solar'] },
  q18_sensacao_fragmentacao: { name: 'desencontro entre pensamentos, emoções e corpo', observation: 'Pensamentos, emoções e corpo parecem seguir direções diferentes. Esse desencontro pode dificultar reconhecer necessidades e escolher como agir. Vamos reunir essas percepções com delicadeza: escutar o que passa pela mente, dar espaço ao sentir e respeitar a disposição do corpo antes de definir um próximo passo.', intention: 'registrar um momento em que pensamento, sentimento e ação ficaram mais próximos', chakras: [] },
  q19_tensao_corporal_cronica: { name: 'tensão corporal', observation: 'A tensão percebida no corpo merece atenção e cuidado. Acompanhar quando ela aparece e o que traz algum conforto pode ajudar a encontrar pausas mais próximas das necessidades do momento.', intention: 'acompanhar onde você percebe tensão e quando ela muda', chakras: [] },
  q20_conflitos_relacionamento: { name: 'dificuldades nas relações próximas', observation: 'As dificuldades nas relações próximas têm pedido atenção. Há espaço para acolher os sentimentos envolvidos e perceber o que precisa ser comunicado, compreendido ou protegido nessas trocas.', intention: 'observar uma troca concreta e o que você gostaria de comunicar ou compreender melhor', chakras: ['Cardíaco'] },
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
    const bodyReason = regions.length ? ` As sensações percebidas em ${regions.map(region => region.nome.toLowerCase()).join(' e ')} também fazem parte dessa leitura.` : '';
    const text = themes
      ? `Os relatos de ${themes} orientam o cuidado com ${meanings[name]}.${bodyReason}`
      : `As sensações percebidas em ${regions.map(region => region.nome.toLowerCase()).join(' e ')} se relacionam, no protocolo, ao chakra ${name}. O cuidado com esse centro tem como intenção apoiar ${meanings[name]}.`;
    return { name, score: support.reduce((total, item) => total + item.level, 0) + regions.length * 4, text };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(({ name, text }) => ({ name, text }));
}

/** Reproducible source fingerprint for traceability, never used for authorization. */
export function narrativeSource(intake: AnamneseInput) {
  const snapshot = JSON.stringify([intake.id, PERGUNTAS_ANAMNESE.map(q => [q.id, intake.respostasObjetivas[q.id] ?? null]), intake.intencaoDeclarada, intake.relatoLivreNecessidade, intake.relatoLivreDesafios, intake.relatoLivrePreservado, [...intake.regioesCorporaisPercebidas].sort(), intake.sensibilidadeEnergetica]);
  let hash = 2166136261;
  for (const character of snapshot) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return { generatorVersion: 'answers-v6' as const, intakeId: intake.id, fingerprint: (hash >>> 0).toString(16) };
}
