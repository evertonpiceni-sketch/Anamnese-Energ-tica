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
  if (!clean.length) return '';
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} e ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')} e ${clean[clean.length - 1]}`;
}

function unique(values: string[]) {
  return values.filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
}

function friendlyResourceName(value: string) {
  return value.replace(/\s+—\s+.*/, '').trim();
}

const AXIS_CARE_COPY: Record<EixoId, { reading: string; care: string; meaning: string }> = {
  seguranca: {
    reading: 'uma necessidade maior de chão, amparo e estabilidade',
    care: 'fortalecer presença, segurança interna e sustentação antes de exigir movimento',
    meaning: 'Quando essa área pesa, decisões simples podem parecer maiores, porque uma parte de você ainda tenta encontrar segurança suficiente para seguir.',
  },
  emocional: {
    reading: 'uma sensibilidade emocional que pode estar acumulando mais do que consegue processar com leveza',
    care: 'acolher o que está sendo sentido e abrir espaço para reorganização emocional sem pressa',
    meaning: 'Isso pode aparecer como cansaço emocional, oscilação, vontade de se recolher ou sensação de sustentar coisas demais ao mesmo tempo.',
  },
  autovalor: {
    reading: 'uma cobrança interna que dificulta reconhecer o próprio valor com a mesma facilidade com que você percebe o que ainda falta',
    care: 'reaproximar você da confiança, dignidade e capacidade de receber cuidado sem precisar merecê-lo pelo esforço',
    meaning: 'Quando a autocobrança cresce, conquistas podem parecer pequenas e dificuldades podem ocupar espaço demais.',
  },
  mente: {
    reading: 'uma mente muito ativa, tentando antecipar, organizar ou sustentar muitas coisas ao mesmo tempo',
    care: 'criar mais espaço interno, clareza e descanso para que os pensamentos não precisem permanecer em alerta constante',
    meaning: 'Nessa dinâmica, parar fisicamente nem sempre significa descansar: o corpo pode desacelerar enquanto a mente continua trabalhando.',
  },
  movimento: {
    reading: 'uma distância entre perceber o que precisa ser feito e conseguir transformar essa percepção em movimento sem aumentar a pressão',
    care: 'favorecer uma retomada gradual e possível, diminuindo a cobrança em torno de cada passo',
    meaning: 'Isso não aponta falta de vontade. Quando a sobrecarga cresce, começar também pode passar a parecer mais uma exigência.',
  },
  vitalidade: {
    reading: 'um cansaço que pede mais respeito ao ritmo do corpo antes de novas exigências',
    care: 'sustentar recuperação de energia, presença corporal e disposição sem forçar produtividade',
    meaning: 'O foco não é fazer mais, mas permitir que exista energia disponível para voltar a escolher e se movimentar com presença.',
  },
  corpo: {
    reading: 'uma necessidade de voltar a perceber o corpo como lugar de presença, e não apenas como lugar onde a tensão aparece',
    care: 'aproximar você do próprio corpo com mais escuta, suavidade e sensação de amparo',
    meaning: 'Quando a atenção fica concentrada em pensamentos e demandas, sinais corporais podem ser percebidos apenas quando já estão intensos.',
  },
  relacionamentos: {
    reading: 'questões de troca, limite e reciprocidade que estão pedindo mais espaço',
    care: 'fortalecer limites, clareza e espaço para que você também exista dentro das relações',
    meaning: 'Aqui observamos se existe espaço suficiente para reconhecer e comunicar suas próprias necessidades nas trocas.',
  },
  prazer: {
    reading: 'uma necessidade de recuperar descanso, prazer simples e contato com aquilo que faz bem',
    care: 'reabrir espaço para sentir, receber e estar presente sem transformar tudo em obrigação',
    meaning: 'Quando a vida fica tomada por deveres, o prazer pode ser adiado tantas vezes que deixa de parecer parte legítima do cuidado.',
  },
  criatividade: {
    reading: 'uma parte criativa que pede mais liberdade e menos autocensura',
    care: 'favorecer expressão, espontaneidade e confiança no que nasce de você',
    meaning: 'Criatividade também fala da liberdade de experimentar novas respostas para a própria vida.',
  },
  limpeza: {
    reading: 'a sensação de carregar pesos que já podem estar ocupando espaço demais',
    care: 'apoiar soltura, reorganização e abertura para que o presente tenha mais espaço',
    meaning: 'O movimento não é apagar o que aconteceu, mas diminuir o quanto certas cargas continuam organizando o presente.',
  },
  padroes: {
    reading: 'repetições que ficam mais visíveis quando suas respostas são observadas em conjunto',
    care: 'ampliar consciência sem julgamento para que novas respostas possam surgir com mais liberdade',
    meaning: 'Reconhecer um padrão não é se reduzir a ele; é perceber onde algo tende a se repetir para que exista mais escolha.',
  },
  prosperidade: {
    reading: 'questões de segurança e movimento ligadas à vida prática e material',
    care: 'fortalecer presença, direção e confiança para lidar com o concreto sem ampliar a pressão',
    meaning: 'Decisões materiais podem carregar medo, urgência ou sensação de incapacidade; o cuidado busca separar pressão de direção.',
  },
  poder_pessoal: {
    reading: 'uma necessidade de confiar mais nas próprias escolhas e sustentar o que é importante para você',
    care: 'fortalecer firmeza, autonomia e confiança no próprio movimento',
    meaning: 'Aqui olhamos para a possibilidade de escolher sem precisar de certeza absoluta e permanecer em contato com o que faz sentido.',
  },
  proposito: {
    reading: 'uma busca por direção e por um próximo passo que faça sentido de verdade',
    care: 'favorecer clareza, presença e conexão com aquilo que hoje tem significado para você',
    meaning: 'Nem sempre falta uma grande resposta; às vezes o momento pede recuperar contato com um próximo passo coerente.',
  },
  espiritualidade: {
    reading: 'uma busca de conexão, sentido e presença que ultrapassa apenas o racional',
    care: 'sustentar essa dimensão de forma serena, integrada e respeitosa ao seu momento',
    meaning: 'Essa dimensão entra como fonte de sentido e presença, nunca como explicação única para o que você vive.',
  },
  protecao: {
    reading: 'uma necessidade maior de preservar sua energia e reconhecer melhor os próprios limites',
    care: 'favorecer sensação de resguardo, firmeza e proteção sem transformar o cuidado em medo',
    meaning: 'Proteção também significa perceber o que é seu, o que é do outro e até onde você deseja permitir que algo chegue.',
  },
  receber: {
    reading: 'uma dificuldade de receber cuidado, apoio ou descanso com a mesma naturalidade com que você pode oferecer aos outros',
    care: 'abrir espaço para acolhimento, descanso e receptividade sem culpa',
    meaning: 'Receber também é uma forma de participação no vínculo; apoio não precisa ser imediatamente compensado ou justificado.',
  },
  recomeco: {
    reading: 'um desejo de começar de outro jeito, mesmo que nem tudo esteja resolvido',
    care: 'dar sustentação ao recomeço sem exigir respostas definitivas ou mudanças bruscas',
    meaning: 'Um recomeço possível pode começar em pequenas escolhas repetidas com mais presença.',
  },
  integracao: {
    reading: 'uma necessidade de reunir pensamento, emoção, corpo e presença em uma experiência mais inteira',
    care: 'favorecer coerência, assimilação e uma sensação maior de estar novamente consigo',
    meaning: 'Quando muitas áreas são vividas separadamente, pode surgir fragmentação; integrar é permitir que essas partes voltem a conversar.',
  },
};

function chakraText(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('plexo')) return 'aparece ligado à autocobrança, à confiança nas próprias escolhas e à dificuldade de agir quando existe pressão demais. A intenção é favorecer firmeza sem rigidez e confiança no próprio movimento.';
  if (normalized.includes('card')) return 'aparece relacionado à forma como você oferece e recebe cuidado. O convite é permitir que acolhimento, ternura e reciprocidade também encontrem espaço em você.';
  if (normalized.includes('lar')) return 'surge ligado à expressão das próprias necessidades, à colocação de limites e à possibilidade de dizer o que sente sem precisar se diminuir para preservar o outro.';
  if (normalized.includes('frontal')) return 'aparece associado à atividade mental intensa. Dentro do protocolo, pede suavização, clareza e espaço interno para que pensamento e percepção não precisem permanecer em alerta constante.';
  if (normalized.includes('raiz')) return 'merece atenção quando existe necessidade de mais segurança, aterramento e estabilidade interna. O cuidado busca fortalecer presença, sustentação e sensação de amparo.';
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
        ? 'Ao mesmo tempo, outro conjunto de respostas mostra'
        : 'Em uma terceira camada da leitura, aparece';
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
  const chakrasRaw = unique([
    ...report.regioesCorporais.chakrasCorrespondentes,
    ...report.recursosInternos.chakras,
  ]).slice(0, 5);
  const causalChains = report.analiseContextualAvancada?.cadeiasCausais || [];
  const cycle = causalChains[0]?.expressaoFormatada;
  const bath = selectBathSupport(report.eixosOrdenados);

  const systems = unique([
    report.sistemaPrincipal.nome,
    ...report.sistemasComplementares.map(item => item.nome),
  ]).map(friendlyResourceName);
  const energies = unique(report.recursosInternos.energias || []).map(friendlyResourceName);
  const crystals = composition?.ethericCrystals || [];
  const florals = composition?.floral || [];
  const aromas = composition?.aromatherapy || [];
  const determinants = report.respostasDeterminantes || [];

  const responseReading = buildResponseReading(topAxisResults);
  const determinantParagraphs = determinants.slice(0, 3).map((item, index) => {
    const level = item.respostaNivel >= 4 ? 'com intensidade importante' : 'de forma consistente';
    const prefix = index === 0 ? 'Uma das respostas que ajuda a compreender esse quadro' : 'Outra resposta que reforça essa leitura';
    return `${prefix} foi a que aborda “${item.pergunta}”. Você marcou esse ponto ${level}, e ele se conecta principalmente a ${item.eixosAfetados.toLowerCase()}. Isso é relevante porque não aparece isolado: conversa com os demais sinais e ajuda a explicar por que certos movimentos podem estar se repetindo.`;
  });

  const causalParagraphs = causalChains.slice(0, 2).map(chain =>
    `Quando cruzamos essas respostas, aparece uma relação importante: ${chain.expressaoFormatada}. Em vez de tratar cada sinal como um problema separado, a leitura considera essa sequência como um mesmo movimento que precisa ser acolhido desde a origem.`
  );

  const careParagraphs = topAxisResults.slice(0, 3).map((axisResult, index) => {
    const axis = axisResult.eixoId;
    const copy = AXIS_CARE_COPY[axis];
    const system = systems[index] || (index === 0 ? systems[0] : '');
    const energy = energies[index] || (index === 0 ? energies[0] : '');
    const crystal = crystals.find(item => item.eixos.includes(axis));
    const floral = florals.find(item => item.eixos.includes(axis));
    const aroma = aromas.find(item => item.eixos.includes(axis));
    const bathForAxis = bath?.eixos.includes(axis) ? bath : null;
    const resources: string[] = [];

    if (energy) resources.push(`a energia ${energy}`);
    if (system && !energy.toLowerCase().includes(system.toLowerCase())) resources.push(system);
    if (crystal) resources.push(crystal.nome);
    if (floral) resources.push(`o floral ${floral.nome}`);
    if (aroma) resources.push(aroma.nome.replace(/\s+—.*/, ''));
    if (bathForAxis) resources.push(bathForAxis.nome);
    if (index === 0 && composition?.solfeggio) resources.push(`a frequência ${composition.solfeggio.hz} Hz`);

    const resourceText = resources.length
      ? `Para acompanhar esse movimento, foram selecionados ${joinNatural(resources)}. Eles não entram como uma lista solta: cada um foi aproximado porque conversa com esse ponto específico da sua leitura.`
      : 'Para acompanhar esse movimento, os recursos serão escolhidos de forma integrada a partir do que apareceu nas suas respostas.';

    return `Quando olhamos especificamente para ${axisResult.nome.toLowerCase()}, a intenção é ${copy.care}. ${resourceText}`;
  });

  if (bath && !careParagraphs.some(paragraph => paragraph.includes(bath.nome))) {
    careParagraphs.push(`${bath.nome} também pode acompanhar este percurso como apoio relacionado a ${bath.descricaoPublica.toLowerCase()}, sempre integrado ao restante da composição e nunca como receita isolada.`);
  }

  const energyParagraph = energies.length
    ? `Energia que será trabalhada: ${joinNatural(energies.slice(0, 3))}. ${report.sistemaPrincipal.justificativa || 'A escolha foi feita a partir da convergência entre as respostas, os eixos prioritários e os recursos documentados na Biblioteca-Mestra.'}`
    : `Sistema energético principal: ${friendlyResourceName(report.sistemaPrincipal.nome)}. ${report.sistemaPrincipal.justificativa || 'A escolha foi feita a partir da convergência entre as respostas e os eixos prioritários.'}`;

  const freeNarrative = intake.relatoLivreNecessidade?.trim();
  const challengeNarrative = intake.relatoLivreDesafios?.trim();
  const preservedNarrative = intake.relatoLivrePreservado?.trim();

  return {
    nome,
    page1: {
      title: 'Relatório Completo — Leitura do Seu Momento',
      subtitle: 'Uma devolutiva construída a partir das suas respostas, dos padrões percebidos e dos recursos escolhidos para acompanhar o seu momento.',
      intro: `${nome}, este relatório foi preparado a partir da sua anamnese para acolher o que suas respostas revelam neste momento e mostrar, com delicadeza e profundidade, o que parece estar acontecendo e como o seu cuidado poderá ser conduzido.`,
    },
    page2: {
      title: 'Diagnóstico da Anamnese',
      paragraphs: [
        `${nome}, suas respostas não foram lidas como itens separados. Elas foram cruzadas para compreender o que se repete, o que se reforça e o que pode estar por trás da sensação que você vive hoje. A intenção não é colocar você em um rótulo, mas devolver uma leitura que faça sentido para aquilo que você realmente respondeu.`,
        `No conjunto, os temas de maior intensidade estão ligados a ${joinNatural(topAxes)}. O mais importante, porém, não é a lista desses temas: é a maneira como eles se relacionam e formam um movimento único no seu momento atual.`,
        ...responseReading,
        ...determinantParagraphs,
        ...causalParagraphs,
        ...(freeNarrative ? [`No seu relato livre, você escreveu: “${freeNarrative}”. Isso foi considerado como contexto da leitura e ajuda a aproximar os padrões encontrados daquilo que você reconhece como necessidade agora.`] : []),
        ...(challengeNarrative ? [`Você também trouxe como desafio: “${challengeNarrative}”. Esse relato reforça a leitura sem ser transformado em diagnóstico ou identidade.`] : []),
        person.seuMomento,
        'Por isso, a prioridade não é cobrar uma mudança rápida. É cuidar do ponto que sustenta o ciclo, reduzir a pressão que o alimenta e criar condições para que clareza, presença e movimento possam voltar a aparecer de forma mais natural.',
      ],
      cycle,
    },
    page3: {
      title: 'O que suas respostas contam sobre você',
      paragraphs: [
        `Quando observamos suas respostas em conjunto, fica mais claro que o cuidado precisa olhar para a relação entre ${joinNatural(topAxes.slice(0, 3))}, e não apenas para cada tema isoladamente. É nessa combinação que aparecem os movimentos que hoje pedem mais atenção.`,
        'A leitura também procura reconhecer o que continua disponível em você. O protocolo não parte apenas do que pesa: ele se apoia nas forças preservadas para que o cuidado não seja mais uma experiência de falta ou cobrança.',
        ...(preservedNarrative ? [`Você reconheceu que continua vivo em você: “${preservedNarrative}”. Isso entra como recurso real do processo e participa da forma como o cuidado será conduzido.`] : []),
      ],
      preserved: preserved.length ? preserved : ['percepção do próprio momento', 'desejo verdadeiro de mudança', 'capacidade de se observar', 'abertura para receber cuidado'],
      chakras: chakrasRaw.map(name => ({ name, text: chakraText(name) })),
    },
    page4: {
      title: 'O que vamos trabalhar com você',
      paragraphs: [
        'A partir dessa leitura, o cuidado não será construído para “consertar” você. Ele será organizado para acompanhar você de volta para si, trabalhando primeiro aquilo que aparece como base do momento atual.',
        energyParagraph,
        `O sistema principal selecionado para conduzir esse trabalho é ${friendlyResourceName(report.sistemaPrincipal.nome)}${report.sistemaPrincipal.recursoEspecifico ? `, com ${report.sistemaPrincipal.recursoEspecifico}` : ''}. Essa escolha nasce do cruzamento entre o que você respondeu, os eixos que ganharam maior intensidade e a compatibilidade documentada dos recursos da Biblioteca-Mestra.`,
        ...careParagraphs,
        'Os cristais etéricos, quando escolhidos, são referências energéticas da composição e não exigem que você possua uma pedra física. Florais, aromaterapia, frequência e banho só aparecem quando houver correspondência documentada com o movimento identificado.',
        'Nada foi incluído apenas porque “combina”. Cada energia e cada recurso precisam conversar com o que você trouxe na anamnese e ter uma função clara dentro do cuidado.',
      ],
    },
    page5: {
      title: 'Seu próximo percurso',
      paragraphs: [
        'A partir daqui começa outra parte do processo. O relatório mostra o que apareceu na sua anamnese e quais recursos foram selecionados; a duração do percurso é escolhida na etapa seguinte, sem alterar a leitura que você recebeu.',
        'Na jornada de 7 dias, o cuidado se concentra nas prioridades que apareceram agora, criando um período mais compacto de reorganização, presença e retomada de movimento.',
        'Na jornada de 21 dias, o mesmo cuidado pode ser acompanhado em mais camadas, com tempo maior para integração, observação e reavaliação ao longo do percurso.',
        'Em qualquer escolha, você não precisa mudar tudo de uma vez. O cuidado será acompanhado e poderá ser revisto porque o seu momento pode mudar — e a composição precisa poder mudar junto com você.',
      ],
      closingTitle: `Uma última coisa, ${nome}`,
      closing: [
        'Suas respostas não mostram apenas aquilo que está pesado. Elas também mostram alguém que continua percebendo, buscando e tentando encontrar uma forma mais leve de seguir.',
        'Por isso, este processo não começa com cobrança. Começa com um convite: voltar a se ouvir, voltar a se perceber e voltar a se incluir na própria vida.',
        'O restante será construído passo a passo. Seu ritmo será respeitado. Este pode ser um novo começo — sem pressa, mas com presença.',
      ],
    },
  };
}
