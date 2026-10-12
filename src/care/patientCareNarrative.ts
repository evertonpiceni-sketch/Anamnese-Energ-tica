import type { EixoId } from '../types';
import type { collectAnswerEvidence } from '../result/answerEvidence';

type Evidence = ReturnType<typeof collectAnswerEvidence>[number];

/** Invitations are tied to reported experiences, never predictions of symptoms or recovery. */
export const CARE_INTENTIONS: Record<EixoId, string> = {
  seguranca: 'Encontrar um lugar de segurança e descanso', corpo: 'Voltar a escutar seu corpo com gentileza',
  emocional: 'Acolher sentimentos que pedem espaço', mente: 'Abrir espaço para respirar entre os pensamentos',
  autovalor: 'Reconhecer esforços e aliviar a cobrança', movimento: 'Dar um passo que caiba no seu momento',
  vitalidade: 'Respeitar sua energia e reencontrar disposição', receber: 'Abrir espaço para receber cuidado',
  integracao: 'Reconhecer o caminho vivido e o que ainda pede cuidado', protecao: 'Preservar seu espaço e seus limites',
  recomeco: 'Se aproximar de um novo começo, sem pressa', proposito: 'Reencontrar o que dá sentido ao caminho',
  prazer: 'Reencontrar pequenas experiências de prazer e descanso', criatividade: 'Dar espaço à sua expressão',
  limpeza: 'Abrir espaço para o que você deseja deixar mais leve', padroes: 'Olhar com carinho para o que se repete',
  prosperidade: 'Acolher suas preocupações e organizar um passo possível', poder_pessoal: 'Reconhecer sua voz e suas escolhas',
  espiritualidade: 'Se aproximar das suas próprias fontes de amparo', relacionamentos: 'Encontrar cuidado e respeito nas relações',
};

export const CARE_PURPOSES: Record<EixoId, string> = {
  seguranca: 'dar lugar à segurança antes de pedir qualquer mudança; uma pausa também pode ser um lugar de amparo',
  corpo: 'aproximar o cuidado das sensações do seu corpo, deixando espaço para conforto e descanso',
  emocional: 'acolher sentimentos que têm ficado sem espaço, sem precisar explicá-los ou transformá-los imediatamente',
  mente: 'abrir intervalos entre os pensamentos e acolher uma preocupação de cada vez, sem exigir silêncio da sua mente',
  autovalor: 'reconhecer seus esforços e cuidar do diálogo consigo quando algo parece difícil',
  movimento: 'apoiar um movimento pequeno e possível, respeitando a energia disponível hoje',
  vitalidade: 'acompanhar sua disposição com delicadeza, começando pelo descanso em vez de exigir mais esforço',
  receber: 'criar espaço para aceitar apoio e carinho, com lugar para descansar e receber cuidado',
  integracao: 'reunir as intenções deste percurso e escutar o que trouxe conforto e o que ainda precisa de atenção',
  protecao: 'respeitar seus limites e o tempo necessário para se recompor depois das trocas',
  recomeco: 'acolher seu desejo de mudança e aproximá-lo de um primeiro passo sem acrescentar sobrecarga',
  proposito: 'abrir espaço para reconhecer o que tem valor na sua vida, sem exigir respostas prontas sobre o futuro',
  prazer: 'retomar o contato com algo agradável, sem transformar alegria, prazer ou relaxamento em obrigação',
  criatividade: 'dar liberdade à sua expressão, para que uma ideia possa existir antes de precisar estar perfeita',
  limpeza: 'acolher o que pesa e respeitar seu tempo de soltar, sem forçar despedidas',
  padroes: 'olhar para uma situação que se repete e experimentar uma resposta diferente, com menos julgamento',
  prosperidade: 'acompanhar suas preocupações materiais com presença e um próximo passo concreto, sem prometer resultados financeiros',
  poder_pessoal: 'fortalecer a intenção de reconhecer suas necessidades e fazer uma escolha própria, sem precisar provar seu valor',
  espiritualidade: 'acolher sua busca de sentido e amparo dentro das crenças e referências que tenham significado pessoal',
  relacionamentos: 'dar espaço aos sentimentos que surgem nas relações e às necessidades que gostaria de comunicar',
};

const PRACTICES: Record<string, string> = {
  q1_procrastinacao_inicio: 'Escolha uma tarefa pequena e faça apenas o primeiro movimento: abrir o documento, separar um objeto ou escrever uma linha. É possível parar aí; começar não precisa significar dar conta de tudo.',
  q2_mente_acelerada: 'Se os pensamentos estiverem ocupando muito espaço, escreva uma preocupação e um único próximo passo. O que não precisa ser resolvido hoje pode ficar para outro momento.',
  q3_sensacao_ameaca_inseguranca: 'Acomode-se onde se sinta mais seguro, com os pés apoiados e os olhos abertos se preferir. Observe três coisas ao seu redor e permita que a respiração siga seu ritmo natural. Se houver desconforto, interrompa.',
  q4_cansaco_esgotamento: 'Escolha uma demanda que possa esperar e reserve uma pausa confortável. Ao terminar, perceba se precisa continuar descansando ou pedir ajuda; essa necessidade também merece ser respeitada.',
  q5_autocobranca_insuficiencia: 'Lembre de um esforço que fez hoje, mesmo pequeno. Experimente falar consigo como falaria com alguém querido: reconhecer esse esforço não exige que tudo esteja resolvido.',
  q6_engolir_emocoes: 'Se fizer sentido, complete em uma folha: “Hoje estou sentindo…” e “Agora preciso de…”. É possível guardar isso para si ou compartilhar com alguém de confiança; não precisa justificar sua emoção.',
  q7_dificuldade_dizer_nao: 'Pense em um limite pequeno que protegeria seu descanso. Experimente ensaiar uma frase simples, como “Hoje não consigo; preciso de um tempo”, antes de decidir se deseja comunicá-la.',
  q8_dificuldade_receber: 'Pense em uma ajuda concreta que seria confortável aceitar: uma conversa, companhia ou apoio em uma tarefa. Receber um pouco de cuidado também pode ser um primeiro passo.',
  q9_sensibilidade_ambientes: 'Depois de um encontro que exija muita energia, reserve alguns minutos em um lugar mais tranquilo. Perceba se silêncio, distância ou companhia ajudam; não é preciso atribuir o desgaste a outra pessoa.',
  q10_repeticao_ciclos: 'Escolha uma situação que se repete e anote o que acontece antes e como costuma responder. Experimente imaginar uma alternativa pequena; perceber o ciclo já oferece um ponto de partida.',
  q11_desconexao_corpo_prazer: 'Escolha algo simples e confortável: sentir o apoio da cadeira, ouvir uma música querida ou descansar perto de uma janela. Observe a experiência sem exigir prazer ou entusiasmo; estar presente já pode bastar hoje.',
  q12_trava_expressao_criatividade: 'Dê dois minutos a uma ideia, desenho ou frase, sem corrigir o resultado. Essa expressão pode ficar em particular; não precisa ser bonita ou útil para ter espaço.',
  q13_inseguranca_material_prosperidade: 'Escolha uma preocupação prática e separe o que está ao seu alcance do que precisa de apoio. Um passo possível pode ser organizar uma informação ou pedir orientação, em vez de resolver tudo hoje.',
  q14_falta_direcao_proposito: 'Pergunte a si: “O que faria este dia um pouco mais próximo do que importa para mim?”. Escolha uma ação pequena, sem precisar decidir agora todo o seu futuro.',
  q15_desconexao_espiritual: 'Se desejar, se aproxime de uma referência que já tenha significado para você: uma oração, a natureza, o silêncio ou uma pessoa querida. Não é preciso forçar fé ou uma sensação de conexão.',
  q16_dificuldade_desapegar: 'Escreva o que gostaria de deixar mais leve e o que ainda precisa ser acolhido antes disso. Não é necessário tomar uma decisão ou encerrar uma relação durante esta pausa.',
  q17_desejo_recomeco: 'Imagine um começo pequeno o suficiente para caber nesta semana. Anote qual apoio ajudaria a se aproximar dele; um novo ciclo pode começar com preparação, não com uma grande virada.',
  q18_sensacao_fragmentacao: 'Pergunte com calma: “O que estou pensando? O que estou sentindo? Do que meu corpo precisa agora?”. Escolha um gesto que respeite essas respostas, sem exigir que tudo se alinhe de imediato.',
  q19_tensao_corporal_cronica: 'Ajuste sua posição para buscar conforto, sem forçar alongamentos. Perceba onde a tensão está e se o apoio da cadeira ou de uma almofada ajuda. Se houver dor persistente, procure avaliação para esse cuidado.',
  q20_conflitos_relacionamento: 'Pense em uma conversa que gostaria de ter e escreva primeiro o que sente e precisa. Você pode escolher quando conversar e com quem se sente seguro; não precisa resolver o conflito hoje.',
};

export function dailyInvitation(related: Evidence[], axis: EixoId, finalDay: boolean) {
  if (finalDay) return 'Hoje, olhe com carinho para os dias vividos: o que trouxe algum conforto, o que permaneceu difícil e que apoio gostaria de continuar recebendo? Se quiser, anote uma percepção para compartilhar com Everton. Não é preciso terminar a jornada se sentindo de uma maneira determinada.';
  return (related[0] && PRACTICES[related[0].questionId]) || `Reserve uma pausa para ${CARE_PURPOSES[axis]}. Ao terminar, perceba do que precisa agora, sem avaliar esta experiência como sucesso ou fracasso.`;
}

const DAY_CONTEXT: Record<string, string> = {
  q1_procrastinacao_inicio: 'Quando começar pesa, uma tarefa pequena já pode ser suficiente para este dia. O cuidado acompanha esse primeiro movimento, sem exigir que tudo seja concluído.',
  q2_mente_acelerada: 'Com tantas coisas passando pela mente, até uma pausa pode parecer difícil. Hoje vamos dar lugar a uma preocupação de cada vez, para que o cuidado não se torne mais um assunto a resolver.',
  q3_sensacao_ameaca_inseguranca: 'Hoje começamos pelo amparo. Como o estado de alerta tem ocupado espaço, a intenção é acolher a necessidade de segurança antes de pedir qualquer movimento ou mudança.',
  q4_cansaco_esgotamento: 'Quando a disposição se recupera pouco, até o cotidiano pode pesar. Este dia abre lugar para descanso e sustentação; recuperar o ritmo não precisa começar com mais esforço.',
  q5_autocobranca_insuficiencia: 'O esforço já vivido merece reconhecimento. Hoje, o cuidado se aproxima da cobrança interna para que uma dificuldade não apague tudo o que já foi sustentado.',
  q6_engolir_emocoes: 'Há sentimentos que vêm ficando guardados. Neste dia, o acolhimento ganha espaço, sem obrigação de explicar uma emoção ou encontrar logo uma solução para ela.',
  q7_dificuldade_dizer_nao: 'Cuidar das relações também envolve proteger o próprio descanso. Hoje aproximamos o cuidado dos limites que são difíceis de comunicar, com espaço para ensaiar uma escolha possível.',
  q8_dificuldade_receber: 'Oferecer cuidado parece ser mais fácil do que recebê-lo. Hoje, a intenção é abrir um pequeno espaço nessa troca, sem precisar compensar imediatamente cada gesto de carinho.',
  q9_sensibilidade_ambientes: 'Alguns encontros deixam menos energia para o restante do dia. O cuidado de hoje acompanha a recomposição depois das trocas e o reconhecimento dos próprios limites.',
  q10_repeticao_ciclos: 'Quando uma situação difícil volta, pode surgir a sensação de estar no mesmo lugar. Hoje vamos olhar para esse ciclo com gentileza, buscando um ponto em que uma resposta diferente seja possível.',
  q11_desconexao_corpo_prazer: 'Reencontrar o corpo não precisa começar pela alegria ou pelo entusiasmo. Hoje o convite é perceber uma experiência confortável e deixar que o descanso tenha lugar, sem exigir uma sensação especial.',
  q12_trava_expressao_criatividade: 'Uma ideia pode ter espaço antes de estar pronta. Hoje acompanhamos a expressão com menos pressão, para que experimentar não precise significar acertar.',
  q13_inseguranca_material_prosperidade: 'As preocupações práticas merecem cuidado junto do sentir. Neste dia, a intenção é acolher o peso dessas questões e aproximar um próximo passo que seja viável.',
  q14_falta_direcao_proposito: 'Nem sempre é possível enxergar o caminho inteiro. Hoje abrimos espaço para reconhecer algo que ainda tenha valor e possa orientar uma escolha pequena.',
  q15_desconexao_espiritual: 'A busca de amparo também pode passar por momentos de distância. Hoje respeitamos essa experiência, com lugar para se aproximar das próprias referências sem forçar fé ou conexão.',
  q16_dificuldade_desapegar: 'Uma despedida interna nem sempre acontece de uma vez. O cuidado de hoje acolhe o que ainda pesa, respeitando o tempo necessário antes de soltar.',
  q17_desejo_recomeco: 'Um novo começo pode nascer da preparação. Hoje, o cuidado acompanha esse desejo sem exigir uma grande virada: um apoio ou um primeiro gesto já podem ter valor.',
  q18_sensacao_fragmentacao: 'Mente, sentimentos e corpo parecem pedir coisas diferentes. Hoje vamos abrir uma pausa para ouvir essas necessidades juntas, antes de exigir uma decisão.',
  q19_tensao_corporal_cronica: 'O corpo também precisa encontrar uma pausa. Este dia se aproxima da tensão percebida e do conforto possível, sem forçar movimentos ou sensações.',
  q20_conflitos_relacionamento: 'As relações próximas têm trazido dificuldades. Hoje, o cuidado abre espaço para acolher os sentimentos envolvidos e reconhecer o que precisa de compreensão, comunicação ou limite.',
};

export function contextualWelcome(related: Evidence[], axis: EixoId, finalDay: boolean) {
  if (finalDay) return 'Este dia reúne o percurso vivido. Vale perceber o que trouxe conforto, o que permaneceu difícil e quais cuidados merecem continuidade, sem precisar terminar a jornada de uma maneira determinada.';
  if (!related.length) return `Hoje, o convite é ${CARE_PURPOSES[axis]}. Vamos abrir esse espaço no seu ritmo.`;
  return DAY_CONTEXT[related[0].questionId] || related[0].observation;
}

/** Patient intentions grounded in the documented functions; no clinical promises. */
const ENERGY_CARE: Record<string, string> = {
  'Karuna Ki · Rama': 'Neste dia, Rama traz a intenção de aterramento: encontrar apoio e presença antes de acrescentar novas demandas.',
  'Karuna Ki · Shanti': 'Shanti acompanha uma intenção de tranquilidade e acolhimento, oferecendo espaço para uma pausa sem precisar resolver tudo agora.',
  'Karuna Ki · Harth': 'Harth coloca o acolhimento emocional e o amor-próprio no centro do cuidado: dar lugar aos sentimentos e permitir também receber carinho.',
  'Karuna Ki · Zonar': 'Zonar acompanha o olhar gentil para situações que se repetem, com a intenção de reconhecer um ciclo sem transformar essa percepção em culpa.',
  'Karuna Ki · Halu': 'Halu se aproxima do cuidado com padrões e pensamentos que pesam, abrindo espaço para perceber uma resposta diferente no próprio tempo.',
  'Karuna Ki · Gnosa': 'Gnosa foi escolhido para a intenção de clareza e percepção: escutar o que tem sentido e acolher uma prioridade de cada vez.',
  'Karuna Ki · Kriya': 'Kriya acompanha escolhas e movimento possível, começando por um passo pequeno que respeite a disposição disponível.',
  'Karuna Ki · Iava': 'Iava coloca as próprias necessidades e escolhas em foco, com espaço para reconhecer limites nas relações e agir com menos cobrança.',
  'Anchoring Light': 'Anchoring Light acompanha uma intenção de ancoragem e presença no corpo, começando pelo conforto de ter um apoio para descansar.',
  'Universal Love': 'Universal Love foi escolhido para acolhimento, relações e abertura para receber cuidado, sem precisar compensar imediatamente o carinho recebido.',
  'Divine Blueprint': 'Divine Blueprint acompanha a intenção de sentido e recomeço: reconhecer um caminho possível sem exigir uma grande mudança de uma vez.',
  'Genetic Coding': 'Genetic Coding entra como intenção simbólica de autovalor e integração, mantendo perto aquilo que importa na construção de um caminho próprio.',
  'Escudo Cristalino de Metatron': 'O Escudo Cristalino de Metatron acompanha a intenção de proteção e preservação do próprio espaço, com lugar para reconhecer limites e se recompor depois das trocas.',
  'Cristais Etéricos Quânticos Usui': 'Os Cristais Etéricos Quânticos Usui acompanham a intenção de presença e integração, aproximando o cuidado das sensações do corpo e do espaço necessário para descansar.',
  'Higher Self Will Alignment': 'Higher Self Will Alignment acompanha a intenção de escuta interior e clareza, mantendo perto as próprias referências ao reconhecer uma escolha possível.',
  'Acupuntura Etérica Quântica': 'A Acupuntura Etérica Quântica entra como cuidado simbólico de integração do corpo energético, acompanhando a intenção de conforto e presença no corpo.',
  'The Magic Cosmic Light — Sol a Vana · ANSOM': 'ANSOM acompanha a intenção de harmonização e integração, reunindo o cuidado recebido ao longo do percurso.',
  'Prosonodo Light': 'Prosonodo Light acompanha a intenção de amor, autoaceitação e perdão, oferecendo espaço para acolher sentimentos sem exigir que sejam resolvidos de imediato.',
  'Original Reiki': 'Original Reiki foi selecionado para harmonização e integração neste dia. O foco é reunir as necessidades acolhidas e oferecer uma pausa para receber cuidado.',
  'Original Reiki Cristalino': 'Original Reiki Cristalino aproxima a intenção de harmonização do cuidado com presença, corpo e integração, em uma etapa voltada a acolher a disposição disponível.',
  'Shakti Aura Healing': 'Shakti Aura Healing acompanha a intenção de preservar o próprio espaço e reunir o cuidado recebido, especialmente quando as trocas pedem um intervalo de recomposição.',
  'Shakti Body Purification': 'Shakti Body Purification entra na intenção energética de leveza e integração, respeitando o tempo de reconhecer o que pesa e o que pode ganhar espaço.',
  'Soul Shakti Healing': 'Soul Shakti Healing reúne intenções de acolhimento emocional, presença no corpo e integração, aproximando o cuidado das necessidades do momento.',
  'Soul Regeneration': 'Soul Regeneration acompanha a intenção de recomeço e autovalor: reconstruir um caminho possível sem desconsiderar o esforço já vivido.',
  'Spiritual Alignment Shakti': 'Spiritual Alignment Shakti acompanha a busca de sentido e integração dentro das próprias referências de amparo.',
};

export function energyCarePurpose(name: string, axis: EixoId): string {
  return ENERGY_CARE[name] || `A intenção desta escolha é ${CARE_PURPOSES[axis]}.`;
}
