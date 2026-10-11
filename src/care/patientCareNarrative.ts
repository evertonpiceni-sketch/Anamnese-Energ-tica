import type { EixoId } from '../types';
import type { collectAnswerEvidence } from '../result/answerEvidence';

type Evidence = ReturnType<typeof collectAnswerEvidence>[number];

/** Invitations are tied to reported experiences, never predictions of symptoms or recovery. */
export const CARE_INTENTIONS: Record<EixoId, string> = {
  seguranca: 'Encontrar um lugar de segurança e descanso', corpo: 'Voltar a escutar seu corpo com gentileza',
  emocional: 'Dar acolhimento ao que você sente', mente: 'Abrir espaço para respirar entre os pensamentos',
  autovalor: 'Cuidar de você com menos cobrança', movimento: 'Dar um passo que caiba no seu momento',
  vitalidade: 'Respeitar sua energia e reencontrar disposição', receber: 'Deixar o cuidado chegar até você',
  integracao: 'Reconhecer o caminho vivido e o que ainda pede cuidado', protecao: 'Preservar seu espaço e seus limites',
  recomeco: 'Se aproximar de um novo começo, sem pressa', proposito: 'Escutar o que tem sentido para você',
  prazer: 'Reencontrar pequenas experiências de prazer e descanso', criatividade: 'Dar espaço à sua expressão',
  limpeza: 'Abrir espaço para o que você deseja deixar mais leve', padroes: 'Olhar com carinho para o que se repete',
  prosperidade: 'Acolher suas preocupações e organizar um passo possível', poder_pessoal: 'Reconhecer sua voz e suas escolhas',
  espiritualidade: 'Se aproximar das suas próprias fontes de amparo', relacionamentos: 'Cuidar de você nas suas relações',
};

export const CARE_PURPOSES: Record<EixoId, string> = {
  seguranca: 'dar lugar à segurança antes de pedir qualquer mudança; você merece uma pausa em que não precise antecipar tudo',
  corpo: 'aproximar o cuidado das sensações do seu corpo, deixando espaço para conforto e descanso',
  emocional: 'acolher sentimentos que têm ficado sem espaço, sem exigir que você os explique ou transforme imediatamente',
  mente: 'abrir intervalos entre os pensamentos e acolher uma preocupação de cada vez, sem exigir silêncio da sua mente',
  autovalor: 'reconhecer seus esforços e cuidar da maneira como você se trata quando algo parece difícil',
  movimento: 'apoiar um movimento pequeno e possível, respeitando a energia que você tem hoje',
  vitalidade: 'acompanhar sua disposição com delicadeza, começando pelo descanso em vez de exigir mais esforço',
  receber: 'criar espaço para aceitar apoio e carinho, lembrando que você também merece ser cuidado',
  integracao: 'reunir as intenções deste percurso e escutar o que trouxe conforto e o que ainda precisa de atenção',
  protecao: 'respeitar seus limites e o tempo de que você precisa para se recompor depois das trocas',
  recomeco: 'acolher seu desejo de mudança e aproximá-lo de um primeiro passo que não sobrecarregue você',
  proposito: 'abrir espaço para reconhecer o que tem valor na sua vida, sem exigir respostas prontas sobre o futuro',
  prazer: 'retomar o contato com algo agradável, sem transformar alegria, prazer ou relaxamento em obrigação',
  criatividade: 'dar liberdade à sua expressão, para que uma ideia possa existir antes de precisar estar perfeita',
  limpeza: 'acolher o que pesa e respeitar seu tempo de soltar, sem forçar despedidas',
  padroes: 'olhar para uma situação que se repete e experimentar uma resposta diferente, com menos julgamento',
  prosperidade: 'acompanhar suas preocupações materiais com presença e um próximo passo concreto, sem prometer resultados financeiros',
  poder_pessoal: 'fortalecer a intenção de reconhecer suas necessidades e fazer uma escolha própria, sem precisar provar seu valor',
  espiritualidade: 'acolher sua busca de sentido e amparo dentro das crenças e referências que fazem sentido para você',
  relacionamentos: 'dar espaço ao que você sente nas suas relações e às necessidades que gostaria de comunicar',
};

const PRACTICES: Record<string, string> = {
  q1_procrastinacao_inicio: 'Escolha uma tarefa pequena e faça apenas o primeiro movimento: abrir o documento, separar um objeto ou escrever uma linha. Você pode parar aí; começar não precisa significar dar conta de tudo.',
  q2_mente_acelerada: 'Se os pensamentos estiverem ocupando muito espaço, escreva uma preocupação e um único próximo passo. O que não precisa ser resolvido hoje pode ficar para outro momento.',
  q3_sensacao_ameaca_inseguranca: 'Acomode-se onde se sinta mais seguro, com os pés apoiados e os olhos abertos se preferir. Observe três coisas ao seu redor e permita que a respiração siga seu ritmo natural. Você pode interromper se ficar desconfortável.',
  q4_cansaco_esgotamento: 'Escolha uma demanda que possa esperar e reserve uma pausa confortável. Ao terminar, perceba se precisa continuar descansando ou pedir ajuda; essa necessidade também merece ser respeitada.',
  q5_autocobranca_insuficiencia: 'Lembre de um esforço que fez hoje, mesmo pequeno. Experimente falar consigo como falaria com alguém querido: reconhecer esse esforço não exige que tudo esteja resolvido.',
  q6_engolir_emocoes: 'Se fizer sentido, complete em uma folha: “Hoje estou sentindo…” e “Agora preciso de…”. Você pode guardar isso para si ou compartilhar com alguém de confiança; não precisa justificar sua emoção.',
  q7_dificuldade_dizer_nao: 'Pense em um limite pequeno que protegeria seu descanso. Você pode ensaiar uma frase simples, como “Hoje não consigo; preciso de um tempo”, antes de decidir se deseja comunicá-la.',
  q8_dificuldade_receber: 'Pense em uma ajuda concreta que seria confortável aceitar: uma conversa, companhia ou apoio em uma tarefa. Receber um pouco de cuidado também pode ser um primeiro passo.',
  q9_sensibilidade_ambientes: 'Depois de um encontro que exija muito de você, reserve alguns minutos em um lugar mais tranquilo. Perceba se silêncio, distância ou companhia ajudam; não é preciso atribuir o desgaste a outra pessoa.',
  q10_repeticao_ciclos: 'Escolha uma situação que se repete e anote o que acontece antes e como costuma responder. Experimente imaginar uma alternativa pequena; perceber o ciclo já oferece um ponto de partida.',
  q11_desconexao_corpo_prazer: 'Escolha algo simples e confortável: sentir o apoio da cadeira, ouvir uma música querida ou descansar perto de uma janela. Observe a experiência sem exigir prazer ou entusiasmo; estar presente já pode bastar hoje.',
  q12_trava_expressao_criatividade: 'Dê dois minutos a uma ideia, desenho ou frase, sem corrigir o resultado. Essa expressão pode ficar só com você; não precisa ser bonita ou útil para ter espaço.',
  q13_inseguranca_material_prosperidade: 'Escolha uma preocupação prática e separe o que depende de você do que precisa de apoio. Um passo possível pode ser organizar uma informação ou pedir orientação, em vez de resolver tudo hoje.',
  q14_falta_direcao_proposito: 'Pergunte a si: “O que faria este dia um pouco mais próximo do que importa para mim?”. Escolha uma ação pequena, sem precisar decidir agora todo o seu futuro.',
  q15_desconexao_espiritual: 'Se desejar, se aproxime de uma referência que já tenha significado para você: uma oração, a natureza, o silêncio ou uma pessoa querida. Você não precisa forçar fé ou uma sensação de conexão.',
  q16_dificuldade_desapegar: 'Escreva o que gostaria de deixar mais leve e o que ainda precisa ser acolhido antes disso. Não é necessário tomar uma decisão ou encerrar uma relação durante esta pausa.',
  q17_desejo_recomeco: 'Imagine um começo pequeno o suficiente para caber nesta semana. Anote qual apoio ajudaria você a se aproximar dele; um novo ciclo pode começar com preparação, não com uma grande virada.',
  q18_sensacao_fragmentacao: 'Pergunte com calma: “O que estou pensando? O que estou sentindo? Do que meu corpo precisa agora?”. Escolha um gesto que respeite essas respostas, sem exigir que tudo se alinhe de imediato.',
  q19_tensao_corporal_cronica: 'Ajuste sua posição para buscar conforto, sem forçar alongamentos. Perceba onde a tensão está e se o apoio da cadeira ou de uma almofada ajuda. Se houver dor persistente, procure avaliação para esse cuidado.',
  q20_conflitos_relacionamento: 'Pense em uma conversa que gostaria de ter e escreva primeiro o que sente e precisa. Você pode escolher quando conversar e com quem se sente seguro; não precisa resolver o conflito hoje.',
};

export function dailyInvitation(related: Evidence[], axis: EixoId, finalDay: boolean) {
  if (finalDay) return 'Hoje, olhe com carinho para os dias vividos: o que trouxe algum conforto, o que permaneceu difícil e que apoio você gostaria de continuar recebendo? Se quiser, anote uma percepção para compartilhar com Everton. Você não precisa terminar a jornada se sentindo de uma maneira determinada.';
  return (related[0] && PRACTICES[related[0].questionId]) || `Reserve uma pausa para ${CARE_PURPOSES[axis]}. Ao terminar, perceba do que precisa agora, sem avaliar esta experiência como sucesso ou fracasso.`;
}

export function contextualWelcome(related: Evidence[], axis: EixoId, finalDay: boolean) {
  if (finalDay) return 'Este dia é um espaço para reunir o cuidado recebido e escutar você novamente. As necessidades que trouxe continuam importantes, mesmo quando uma mudança ainda não foi percebida.';
  if (!related.length) return `Hoje, o convite é ${CARE_PURPOSES[axis]}. Vamos abrir esse espaço no seu ritmo.`;
  const item = related[0];
  const experience = item.observation.split('. ')[0].replace(/\.$/, '');
  const additional = related[1]?.observation.split('. ')[0].replace(/\.$/, '');
  return `${item.level === 2 ? 'Em alguns momentos, ' + experience.charAt(0).toLowerCase() + experience.slice(1) : experience}.${additional ? ` Também merece espaço o que contou sobre ${related[1].name}.` : ''}`;
}
