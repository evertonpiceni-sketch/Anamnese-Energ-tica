import { CareComposition } from '../care/careComposer';
import { selectBathSupport } from '../care/bathCatalog';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { AnamneseInput, EixoId } from '../types';

export interface FullReportNarrative {
  nome: string;
  page1: { title: string; subtitle: string; intro: string };
  page2: { title: string; paragraphs: string[]; cycle?: string };
  page3: {
    title: string;
    paragraphs: string[];
    preserved: string[];
    chakras: Array<{ name: string; text: string }>;
  };
  page4: { title: string; paragraphs: string[] };
  page5: { title: string; paragraphs: string[]; closingTitle: string; closing: string[] };
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || 'você';
}

function joinNatural(values: string[]) {
  const clean = values.filter(Boolean);
  if (clean.length <= 1) return clean[0] || '';
  if (clean.length === 2) return `${clean[0]} e ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')} e ${clean.at(-1)}`;
}

function friendlyResourceName(value: string) {
  return value.replace(/\s+—\s+.*/, '').trim();
}

const AXIS_CARE_COPY: Record<EixoId, { reading: string; care: string; meaning: string }> = {
  seguranca: {
    reading: 'uma necessidade maior de se sentir com chão, amparo e estabilidade',
    care: 'fortalecer presença, segurança interna e sustentação, sem exigir movimento antes da hora',
    meaning: 'Quando essa área pesa, até decisões simples podem parecer maiores do que são, porque uma parte de você ainda está tentando primeiro encontrar segurança para seguir.',
  },
  emocional: {
    reading: 'uma sensibilidade emocional que pode estar recebendo ou acumulando mais do que consegue processar com leveza',
    care: 'acolher o que está sendo sentido e abrir espaço para reorganização emocional sem pressa',
    meaning: 'Isso pode aparecer como cansaço emocional, oscilação, vontade de se recolher ou sensação de estar sustentando coisas demais ao mesmo tempo.',
  },
  autovalor: {
    reading: 'uma cobrança interna que pode tornar mais difícil reconhecer o próprio valor com a mesma facilidade com que você percebe o que ainda falta',
    care: 'reaproximar você da sua dignidade, confiança e capacidade de receber cuidado sem precisar merecê-lo pelo esforço',
    meaning: 'Quando a autocobrança cresce, conquistas podem parecer pequenas e erros podem ocupar espaço demais. O cuidado busca devolver proporção e gentileza a essa percepção.',
  },
  mente: {
    reading: 'uma mente muito ativa, tentando antecipar, organizar, compreender ou sustentar muitas coisas ao mesmo tempo',
    care: 'criar mais espaço interno, clareza e descanso para que os pensamentos não precisem permanecer em alerta constante',
    meaning: 'Nessa dinâmica, parar fisicamente nem sempre significa descansar. O corpo pode desacelerar enquanto a mente continua trabalhando.',
  },
  movimento: {
    reading: 'uma distância entre perceber o que precisa ser feito e conseguir transformar essa percepção em movimento sem aumentar a pressão',
    care: 'favorecer uma retomada gradual, possível e sustentada, diminuindo a cobrança em torno de cada passo',
    meaning: 'Isso não aponta falta de vontade. Muitas vezes, quando a sobrecarga cresce, começar também passa a parecer mais uma exigência.',
  },
  vitalidade: {
    reading: 'um cansaço que pede mais respeito ao ritmo do corpo antes de novas exigências',
    care: 'sustentar recuperação de energia, presença corporal e disposição sem forçar produtividade',
    meaning: 'O foco aqui não é fazer mais, mas permitir que exista energia disponível para voltar a escolher e se movimentar com mais presença.',
  },
  corpo: {
    reading: 'uma necessidade de voltar a perceber o corpo como lugar de presença e não apenas como lugar onde a tensão aparece',
    care: 'aproximar você do próprio corpo com mais escuta, suavidade e sensação de amparo',
    meaning: 'Quando a atenção fica quase toda voltada para pensamentos ou demandas, sinais do corpo podem ser percebidos apenas quando já estão intensos.',
  },
  relacionamentos: {
    reading: 'questões de troca, limite e reciprocidade que podem estar pedindo mais espaço',
    care: 'fortalecer limites, clareza e espaço para que você também exista dentro das relações',
    meaning: 'O cuidado aqui observa como você se posiciona nas trocas e se existe espaço suficiente para reconhecer e comunicar suas próprias necessidades.',
  },
  prazer: {
    reading: 'uma necessidade de recuperar descanso, prazer simples e contato com aquilo que faz bem',
    care: 'reabrir espaço para sentir, receber e estar presente sem transformar tudo em obrigação',
    meaning: 'Quando a vida fica tomada por deveres, o prazer pode ser adiado tantas vezes que deixa de parecer parte legítima do cuidado.',
  },
  criatividade: {
    reading: 'uma parte criativa que pode estar pedindo mais liberdade e menos autocensura',
    care: 'favorecer expressão, espontaneidade e confiança no que nasce de você',
    meaning: 'Criatividade, aqui, não significa apenas produzir algo artístico; também fala da liberdade de experimentar novas respostas para a própria vida.',
  },
  limpeza: {
    reading: 'a sensação de carregar pesos que já podem estar ocupando espaço demais',
    care: 'apoiar soltura, reorganização e abertura para que o presente tenha mais espaço',
    meaning: 'O movimento não é apagar o que aconteceu, mas diminuir o quanto certas cargas continuam organizando o seu presente.',
  },
  padroes: {
    reading: 'repetições que começam a ficar mais visíveis quando suas respostas são observadas em conjunto',
    care: 'ampliar consciência sem julgamento, para que novas respostas possam surgir com mais liberdade',
    meaning: 'Reconhecer um padrão não é se reduzir a ele. É perceber onde algo tende a se repetir para que exista mais escolha na próxima vez.',
  },
  prosperidade: {
    reading: 'questões de segurança e movimento ligadas à vida prática e material',
    care: 'fortalecer presença, direção e confiança para lidar com o concreto sem ampliar a pressão',
    meaning: 'Quando essa área pesa, decisões materiais podem carregar também medo, urgência ou sensação de incapacidade. O cuidado busca separar pressão de direção.',
  },
  poder_pessoal: {
    reading: 'uma necessidade de confiar mais nas próprias escolhas e sustentar o que é importante para você',
    care: 'fortalecer firmeza, autonomia e confiança no próprio movimento',
    meaning: 'Aqui olhamos para a possibilidade de escolher sem precisar de certeza absoluta e de permanecer em contato com o que faz sentido para você.',
  },
  proposito: {
    reading: 'uma busca por direção e por um próximo passo que faça sentido de verdade',
    care: 'favorecer clareza, presença e conexão com aquilo que hoje tem significado para você',
    meaning: 'Nem sempre o que falta é uma grande resposta. Às vezes, o que o momento pede é apenas recuperar contato com um próximo passo coerente.',
  },
  espiritualidade: {
    reading: 'uma busca de conexão, sentido e presença que ultrapassa apenas o que é racional',
    care: 'sustentar essa dimensão de forma serena, integrada e respeitosa ao seu momento',
    meaning: 'Essa dimensão entra como fonte de sentido e presença, nunca como explicação única para o que você vive.',
  },
  protecao: {
    reading: 'uma necessidade maior de preservar sua energia e reconhecer melhor os próprios limites',
    care: 'favorecer sensação de resguardo, firmeza e proteção sem transformar o cuidado em medo',
    meaning: 'Proteção, dentro do protocolo, também significa perceber o que é seu, o que é do outro e até onde você deseja permitir que algo chegue.',
  },
  receber: {
    reading: 'uma dificuldade de receber cuidado, apoio ou descanso com a mesma naturalidade com que você pode oferecer aos outros',
    care: 'abrir espaço para acolhimento, descanso e receptividade sem culpa',
    meaning: 'Receber também é uma forma de participação no vínculo. O cuidado trabalha para que apoio não precise ser imediatamente compensado ou justificado.',
  },
  recomeco: {
    reading: 'um desejo de começar de outro jeito, mesmo que nem tudo esteja resolvido',
    care: 'dar sustentação ao recomeço sem exigir respostas definitivas ou mudanças bruscas',
    meaning: 'Um recomeço possível não precisa nascer de uma ruptura completa. Pode começar em pequenas escolhas repetidas com mais presença.',
  },
  integracao: {
    reading: 'uma necessidade de reunir pensamento, emoção, corpo e presença em uma experiência mais inteira',
    care: 'favorecer coerência, assimilação e uma sensação maior de estar novamente consigo',
    meaning: 'Quando muitas áreas são vividas separadamente, pode surgir sensação de fragmentação. Integrar é permitir que essas partes voltem a conversar entre si.',
  },
};

function chakraText(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('plexo')) return 'aparece ligado à autocobrança, à confiança nas próprias escolhas e à dificuldade de agir quando existe pressão demais. Quando esse centro pede cuidado, a intenção é favorecer mais firmeza, presença e confiança no próprio movimento.';
  if (normalized.includes('card')) return 'aparece relacionado à forma como você oferece e recebe cuidado. Aqui, o convite é permitir que acolhimento, ternura e reciprocidade também encontrem espaço em você.';
  if (normalized.includes('lar')) return 'surge ligado à expressão das próprias necessidades, à colocação de limites e à possibilidade de dizer o que sente sem precisar se diminuir para preservar o outro.';
  if (normalized.includes('frontal')) return 'aparece associado à atividade mental intensa. Dentro do protocolo, esse centro pede suavização, clareza e mais espaço interno para que pensamento e percepção não precisem permanecer em alerta constante.';
  if (normalized.includes('raiz')) return 'merece atenção quando existe necessidade de mais segurança, aterramento e estabilidade interna. O cuidado aqui busca fortalecer presença, sustentação e sensação de amparo.';
  if (normalized.includes('sacral')) return 'aparece relacionado ao sentir, à criatividade, ao prazer e à capacidade de permanecer em contato com o que desperta vida e movimento.';
  if (normalized.includes('coron')) return 'aparece relacionado à integração, sentido e conexão espiritual. O cuidado busca manter essa dimensão ligada à presença e à realidade do momento.';
  return 'aparece como um centro que pode se beneficiar de mais presença, harmonização e cuidado neste momento.';
}

function buildResponseReading(topAxisResults: Array<{ eixoId: EixoId }>) {
  return topAxisResults.slice(0, 3).map((axisResult, index) => {
    const copy = AXIS_CARE_COPY[axisResult.eixoId];
    const opening = index === 0
      ? 'O movimento que aparece com mais força em suas respostas aponta para'
      : index === 1
        ? 'Junto a isso, também aparece'
        : 'Em outra camada da sua leitura, percebemos';
    return `${opening} ${copy.reading}. ${copy.meaning}`;
  });
}

export function buildFullReportNarrative(params: {
  intake: AnamneseInput;
  analysis: AnaliseCompletaResultado;
  composition: CareComposition | null;
}): FullReportNarrative {
  const { intake, analysis, composition } = params;
  const nome = firstName(intake.nomePessoa);
  const report = analysis.relatorioEverton;
  const person = analysis.resultadoPessoa;

  const topAxisResults = report.eixosOrdenados.slice(0, 4);
  const topAxes = topAxisResults.map(item => item.nome.toLowerCase());
  const preserved = report.analiseContextualAvancada?.fatoresPreservados.recursosInternosPreservados || [];
  const chakrasRaw = [...report.regioesCorporais.chakrasCorrespondentes, ...report.recursosInternos.chakras]
    .filter((value, index, array) => value && array.indexOf(value) === index)
    .slice(0, 5);
  const cycle = report.analiseContextualAvancada?.cadeiasCausais?.[0]?.expressaoFormatada;
  const bath = selectBathSupport(report.eixosOrdenados);

  const systems = [report.sistemaPrincipal.nome, ...report.sistemasComplementares.map(item => item.nome)]
    .filter(Boolean)
    .map(friendlyResourceName);
  const crystals = composition?.ethericCrystals || [];
  const florals = composition?.floral || [];
  const aromas = composition?.aromatherapy || [];

  const responseReading = buildResponseReading(topAxisResults);

  const careParagraphs = topAxisResults.slice(0, 3).map((axisResult, index) => {
    const axis = axisResult.eixoId;
    const copy = AXIS_CARE_COPY[axis];
    const system = systems[index] || (index === 0 ? systems[0] : '');
    const crystal = crystals.find(item => item.eixos.includes(axis));
    const floral = florals.find(item => item.eixos.includes(axis));
    const aroma = aromas.find(item => item.eixos.includes(axis));
    const bathForAxis = bath?.eixos.includes(axis) ? bath : null;
    const resources: string[] = [];

    if (system) resources.push(system);
    if (crystal) resources.push(crystal.nome);
    if (floral) resources.push(`o floral ${floral.nome}`);
    if (aroma) resources.push(aroma.nome.replace(/\s+—.*/, ''));
    if (bathForAxis) resources.push(bathForAxis.nome);
    if (index === 0 && composition?.solfeggio) resources.push(`a frequência ${composition.solfeggio.hz} Hz`);

    const resourceText = resources.length
      ? `Para acompanhar esse movimento, ${joinNatural(resources)} entram no mesmo fio de cuidado. Cada recurso tem uma função diferente, mas todos foram aproximados porque conversam com esse ponto da sua leitura.`
      : 'Para acompanhar esse movimento, os recursos do protocolo serão escolhidos de forma integrada, sempre a partir do que apareceu em suas respostas.';

    return `Quando olhamos especificamente para ${axisResult.nome.toLowerCase()}, a intenção é ${copy.care}. ${resourceText}`;
  });

  if (bath && !careParagraphs.some(paragraph => paragraph.includes(bath.nome))) {
    careParagraphs.push(`${bath.nome} também pode acompanhar este percurso quando fizer sentido para o seu momento. Dentro do protocolo, ele é usado como apoio relacionado a ${bath.descricaoPublica.toLowerCase()}, sempre integrado ao restante da composição e nunca como uma receita isolada.`);
  }

  const freeNarrative = intake.relatoLivreNecessidade?.trim();
  const challengeNarrative = intake.relatoLivreDesafios?.trim();
  const preservedNarrative = intake.relatoLivrePreservado?.trim();

  return {
    nome,
    page1: {
      title: 'Relatório Completo — Leitura do Seu Momento',
      subtitle: 'Uma leitura acolhedora do seu momento, dos padrões percebidos e do caminho de cuidado para os próximos 7 ou 21 dias.',
      intro: `${nome}, este relatório foi preparado com cuidado para acolher o que suas respostas revelam neste momento e mostrar, com delicadeza e profundidade, como o seu cuidado poderá ser conduzido.`,
    },
    page2: {
      title: 'Diagnóstico da Anamnese',
      paragraphs: [
        `${nome}, antes de qualquer coisa, quero que você saiba que suas respostas foram recebidas com cuidado. O que você contou não é apenas um conjunto de respostas em um formulário. Há uma história por trás delas, um momento que você está vivendo e uma forma muito particular de sentir, reagir, se proteger e tentar seguir em frente.`,
        'Ao reunirmos tudo o que você respondeu, alguns movimentos aparecem com mais clareza. A intenção desta leitura não é colocar você dentro de um rótulo, mas ajudar você a compreender o que, neste momento, parece estar pedindo mais atenção, presença e cuidado.',
        `No conjunto das respostas, os temas que aparecem com maior intensidade estão ligados a ${joinNatural(topAxes)}. Eles não funcionam como compartimentos separados: um pode aumentar ou suavizar o outro, e é justamente essa relação que orienta o cuidado.`,
        ...responseReading,
        ...(freeNarrative ? [`Quando você escreve que “${freeNarrative}”, esse relato também é considerado na leitura. Ele não fica à margem do questionário: ajuda a dar contexto ao que os padrões objetivos mostram e aproxima o cuidado daquilo que você reconhece como importante agora.`] : []),
        ...(challengeNarrative ? [`Você também relatou como desafio: “${challengeNarrative}”. Isso é acolhido como parte do contexto, sem transformar a sua fala em rótulo ou conclusão fechada.`] : []),
        person.seuMomento,
        'Quando existe muita pressão interna, a própria tentativa de mudar pode se transformar em mais uma obrigação. Por isso, antes de exigir movimento, o cuidado precisa oferecer sustentação, espaço e segurança para que o próximo passo possa nascer sem cobrança.',
      ],
      cycle,
    },
    page3: {
      title: 'O que suas respostas contam sobre você',
      paragraphs: [
        `Quando observamos suas respostas em conjunto, fica mais claro que o cuidado precisa olhar para a relação entre ${joinNatural(topAxes.slice(0, 3))}, e não apenas para cada tema isoladamente. É nessa combinação que aparecem os movimentos que hoje pedem mais atenção.`,
        'Essa leitura procura reconhecer tanto o que está exigindo esforço quanto aquilo que continua disponível em você. O objetivo não é destacar apenas o peso, mas perceber também quais recursos internos podem participar do retorno ao equilíbrio.',
        ...(preservedNarrative ? [`Quando você diz que continua vivo e forte em você “${preservedNarrative}”, isso entra como um recurso importante. O protocolo não trabalha apenas a partir do que falta: ele também se apoia naquilo que você já reconhece como força.`] : []),
      ],
      preserved: preserved.length ? preserved : ['percepção do próprio momento', 'desejo verdadeiro de mudança', 'capacidade de se observar', 'abertura para receber cuidado'],
      chakras: chakrasRaw.map(name => ({ name, text: chakraText(name) })),
    },
    page4: {
      title: 'O que vamos trabalhar com você',
      paragraphs: [
        'A partir dessa leitura, o nosso cuidado não será construído para “consertar” você. Será construído para acompanhar você de volta para si, com mais presença, leveza e sustentação.',
        'Ao longo desse processo, não vamos separar o que você sente de um lado e os recursos do outro. Cada escolha entra dentro da própria história que suas respostas contaram, para que o cuidado tenha sentido e continuidade.',
        ...careParagraphs,
        'Os cristais etéricos, quando escolhidos, não significam que você precise possuir uma pedra física. Dentro do protocolo, eles entram como referências energéticas da composição, selecionadas de acordo com a intenção daquele eixo de cuidado.',
        'Nada foi incluído por acaso. Energia, cristal, floral, aromaterapia, frequência e banho só entram quando fazem sentido para o mesmo movimento que apareceu em sua leitura. O objetivo é que você compreenda não apenas o que será utilizado, mas por que aquilo foi escolhido para acompanhar você neste momento.',
      ],
    },
    page5: {
      title: 'Os próximos 7 ou 21 dias',
      paragraphs: [
        'A partir daqui começa outra parte do processo. Se a sua escolha for a jornada de 7 dias, vamos trabalhar aquilo que hoje aparece como prioridade, criando um período de cuidado mais concentrado, voltado para reorganização, presença e retomada de movimento.',
        'Se a sua escolha for a jornada de 21 dias, teremos mais tempo para acompanhar esse processo em camadas, permitindo que o cuidado atravesse diferentes momentos de percepção, integração e retorno a você.',
        'Em qualquer uma das escolhas, a proposta permanece a mesma: você não precisa mudar tudo de uma vez. Durante esse período, vamos auxiliar o seu processo com a composição preparada a partir da sua leitura, respeitando o seu ritmo e aquilo que aparecer ao longo do caminho.',
        'No final do período, a leitura poderá ser revisitada. Porque o seu momento pode mudar — e o cuidado também precisa poder mudar junto com você.',
      ],
      closingTitle: `Uma última coisa, ${nome}`,
      closing: [
        'Talvez você tenha chegado até aqui procurando uma resposta sobre o que precisa mudar. Mas o que suas respostas mostram não é apenas aquilo que está pesado. Elas também mostram alguém que continua tentando e que ainda consegue perceber que merece viver de outra forma.',
        'Por isso, este processo não começa com uma cobrança. Começa com um convite: voltar a se ouvir, voltar a se perceber e voltar a se incluir na própria vida.',
        'O restante nós vamos construindo com você, passo a passo. Você não precisa carregar tudo sem apoio. Seu ritmo será respeitado. E este pode ser um novo começo — sem pressa, mas com presença.',
      ],
    },
  };
}
