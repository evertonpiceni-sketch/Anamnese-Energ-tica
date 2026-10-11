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
  q1_procrastinacao_inicio: 'Escolha algo pequeno que esteja esperando por você. Faça apenas o começo — abrir, separar, escrever uma linha. Depois disso, você pode parar. Hoje, começar já é suficiente.',
  q2_mente_acelerada: 'Pegue uma folha e escreva apenas uma preocupação que esteja ocupando muito espaço. Ao lado, anote um único passo possível. O restante pode esperar; você não precisa resolver tudo hoje.',
  q3_sensacao_ameaca_inseguranca: 'Procure um lugar em que seu corpo consiga descansar um pouco. Apoie os pés ou as costas, mantenha os olhos abertos se isso trouxer mais conforto e perceba três coisas ao seu redor. Deixe a respiração acontecer sozinha. Por alguns minutos, você não precisa antecipar nada.',
  q4_cansaco_esgotamento: 'Escolha uma coisa que possa esperar e ofereça esse tempo ao seu descanso. Ao terminar, pergunte apenas: “o que meu corpo precisa agora?”. Continuar parado, beber água, pedir ajuda ou seguir devagar também são respostas válidas.',
  q5_autocobranca_insuficiencia: 'Lembre de algo que você conseguiu sustentar hoje, mesmo que pareça pequeno. Fale consigo com a mesma gentileza que teria com alguém querido. Seu esforço também merece ser visto.',
  q6_engolir_emocoes: 'Complete, sem se corrigir: “Hoje eu estou sentindo...” e “Neste momento, eu preciso de...”. Você pode guardar isso para si. Dar nome ao que sente já pode ser uma forma de se acompanhar.',
  q7_dificuldade_dizer_nao: 'Pense em um limite pequeno que protegeria um pouco mais seu espaço. Experimente dizer em voz baixa: “Hoje eu preciso de um tempo”. Não é preciso tomar nenhuma decisão agora; apenas reconheça que essa necessidade existe.',
  q8_dificuldade_receber: 'Pense em um cuidado pequeno que seria confortável receber hoje: companhia, silêncio, ajuda em uma tarefa ou uma mensagem. Permitir que algo chegue até você também faz parte do cuidado.',
  q9_sensibilidade_ambientes: 'Depois de um encontro ou ambiente que tenha exigido muito de você, escolha alguns minutos de recomposição. Observe se seu corpo pede silêncio, distância, água, descanso ou companhia. Apenas escute essa necessidade.',
  q10_repeticao_ciclos: 'Escolha uma situação que costuma se repetir. Em vez de procurar uma solução completa, pergunte: “o que eu gostaria de fazer um pouco diferente da próxima vez?”. Uma pequena mudança já abre espaço para outra experiência.',
  q11_desconexao_corpo_prazer: 'Escolha uma sensação simples e confortável: o apoio da cadeira, a temperatura do ar, uma música querida ou alguns minutos perto de uma janela. Não procure sentir prazer. Apenas permita que o corpo volte a participar do momento.',
  q12_trava_expressao_criatividade: 'Dê dois minutos a uma ideia sem tentar deixá-la bonita, certa ou útil. Pode ser uma frase, um desenho ou uma palavra. Hoje, sua expressão não precisa chegar a lugar nenhum.',
  q13_inseguranca_material_prosperidade: 'Escolha uma preocupação prática e separe duas coisas: o que depende de você agora e o que precisa de tempo ou apoio. Faça apenas o próximo passo possível. O restante não precisa caber todo neste dia.',
  q14_falta_direcao_proposito: 'Pergunte a si mesmo: “o que deixaria este dia um pouco mais próximo do que importa para mim?”. Escolha uma ação pequena. Você não precisa encontrar hoje uma resposta para toda a sua vida.',
  q15_desconexao_espiritual: 'Aproxime-se de algo que já tenha sido fonte de amparo para você: uma oração, a natureza, o silêncio, uma lembrança ou uma presença querida. Não tente sentir fé. Apenas permita esse encontro.',
  q16_dificuldade_desapegar: 'Escreva duas frases: “o que está pesado para mim” e “o que ainda precisa ser acolhido antes de eu soltar”. Não é necessário encerrar nada hoje. Às vezes, compreender vem antes de deixar ir.',
  q17_desejo_recomeco: 'Imagine um começo pequeno o suficiente para caber nesta semana. Em vez de pensar na mudança inteira, escolha apenas aquilo que prepararia o primeiro passo.',
  q18_sensacao_fragmentacao: 'Pergunte com calma: “o que estou pensando?”, “o que estou sentindo?” e “do que meu corpo precisa agora?”. Não tente fazer as três respostas coincidirem. Apenas reconheça cada uma delas.',
  q19_tensao_corporal_cronica: 'Ajuste sua posição até encontrar um pouco mais de conforto. Observe onde seu corpo está apoiado e permita que essa região receba o peso por você. Não force alongamentos. Se houver dor persistente, procure avaliação adequada.',
  q20_conflitos_relacionamento: 'Antes de pensar no que precisa resolver com alguém, escreva o que você sente e o que gostaria de preservar em si nessa relação. A conversa pode esperar até que você se sinta mais preparado.',
};

export function dailyInvitation(related: Evidence[], axis: EixoId, finalDay: boolean) {
  if (finalDay) return 'Hoje, apenas olhe para o caminho vivido. O que trouxe algum conforto? O que ainda ficou difícil? O que você gostaria de continuar recebendo como cuidado? Não é preciso terminar a jornada de uma determinada forma.';
  return (related[0] && PRACTICES[related[0].questionId]) || `Reserve alguns minutos para ${CARE_PURPOSES[axis]}. Depois, apenas perceba como você está e do que precisa agora. Não existe certo ou errado nesta pausa.`;
}

export function contextualWelcome(related: Evidence[], axis: EixoId, finalDay: boolean) {
  if (finalDay) return 'Hoje não é um dia de concluir ou medir resultados. É um espaço para olhar com carinho para o caminho vivido e perceber o que você deseja levar adiante.';
  if (!related.length) return `Hoje vamos abrir um espaço para ${CARE_PURPOSES[axis]}. Sem pressa, sem cobrança e do jeito que for possível para você.`;
  const item = related[0];
  const additional = related[1];
  const first = item.name === 'estado de alerta e insegurança'
    ? 'Você contou que, em alguns momentos, parece difícil relaxar por completo e confiar que pode simplesmente descansar.'
    : item.name === 'mente acelerada'
      ? 'Você contou que sua mente continua trabalhando mesmo quando uma parte sua já gostaria de descansar.'
      : item.name === 'cansaço e esgotamento'
        ? 'Você contou que o cansaço tem ocupado mais espaço do que gostaria e que nem sempre uma pausa parece suficiente para recuperar sua energia.'
        : item.name === 'autocobrança e sensação de insuficiência'
          ? 'Você contou que, muitas vezes, aquilo que faz parece não ser suficiente aos seus próprios olhos.'
          : `Você trouxe algo importante sobre ${item.name}. Hoje não vamos tentar resolver isso de uma vez; vamos apenas oferecer um pouco mais de espaço e cuidado para esse movimento.`;
  const second = additional ? ` Também apareceu ${additional.name}, e por isso este dia foi pensado para acolher essas duas experiências sem transformar nenhuma delas em cobrança.` : '';
  return `${first}${second} Antes de qualquer mudança, a proposta de hoje é que você possa se sentir um pouco mais acompanhado dentro do que está vivendo.`;
}
