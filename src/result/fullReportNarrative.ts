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

const AXIS_CARE_COPY: Record<EixoId, { reading: string; care: string }> = {
  seguranca: { reading: 'a necessidade de se sentir mais segura, amparada e com mais chão', care: 'fortalecer presença, estabilidade e sensação de sustentação, sem exigir movimento antes da hora' },
  emocional: { reading: 'uma sensibilidade emocional que pode acabar acumulando mais do que precisa', care: 'acolher o que está sendo sentido e abrir espaço para leveza, sem apressar o que ainda precisa ser escutado' },
  autovalor: { reading: 'a tendência de se cobrar e de nem sempre reconhecer com a mesma facilidade o próprio valor', care: 'reaproximar você da sua própria dignidade, confiança e capacidade de receber cuidado' },
  mente: { reading: 'uma mente muito ativa, tentando antecipar, organizar ou sustentar muitas coisas ao mesmo tempo', care: 'criar mais espaço interno, clareza e descanso para que os pensamentos não precisem permanecer em alerta constante' },
  movimento: { reading: 'a dificuldade de transformar percepção em movimento quando a pressão interna fica grande demais', care: 'favorecer retomada gradual, respeitando o seu ritmo e diminuindo a sensação de cobrança em torno de cada passo' },
  vitalidade: { reading: 'um cansaço que pede mais respeito ao ritmo do corpo antes de novas exigências', care: 'sustentar recuperação de energia, presença corporal e disposição sem forçar produtividade' },
  corpo: { reading: 'a necessidade de voltar a perceber o corpo como lugar de presença e não apenas como lugar de tensão', care: 'aproximar você do próprio corpo com mais escuta, suavidade e sensação de amparo' },
  relacionamentos: { reading: 'uma forma muito disponível de se relacionar que, em alguns momentos, pode deixar suas próprias necessidades para depois', care: 'fortalecer limites, reciprocidade e espaço para que você também possa ser cuidada nas relações' },
  prazer: { reading: 'uma necessidade de recuperar descanso, prazer simples e contato com o que faz bem', care: 'reabrir espaço para receber, sentir e estar presente sem transformar tudo em obrigação' },
  criatividade: { reading: 'uma parte criativa que pode estar pedindo mais liberdade e menos autocensura', care: 'favorecer expressão, espontaneidade e confiança no que nasce de você' },
  limpeza: { reading: 'a sensação de carregar pesos que já podem estar ocupando espaço demais', care: 'apoiar soltura, reorganização e abertura para que o presente tenha mais espaço' },
  padroes: { reading: 'repetições que começam a ficar mais visíveis quando suas respostas são observadas em conjunto', care: 'ampliar consciência sem julgamento, para que novas respostas possam surgir com mais liberdade' },
  prosperidade: { reading: 'questões de segurança e movimento ligadas à vida prática e material', care: 'fortalecer presença, direção e confiança para lidar com o concreto sem ampliar a pressão' },
  poder_pessoal: { reading: 'a necessidade de confiar mais nas próprias escolhas e sustentar o que é importante para você', care: 'fortalecer firmeza, autonomia e confiança no próprio movimento' },
  proposito: { reading: 'uma busca por direção e por um próximo passo que faça sentido de verdade', care: 'favorecer clareza, presença e conexão com aquilo que hoje tem significado para você' },
  espiritualidade: { reading: 'uma busca de conexão, sentido e presença que ultrapassa apenas o que é racional', care: 'sustentar essa dimensão de forma serena, integrada e respeitosa ao seu momento' },
  protecao: { reading: 'uma necessidade maior de preservar sua energia e reconhecer melhor os próprios limites', care: 'favorecer sensação de resguardo, firmeza e proteção sem transformar o cuidado em medo' },
  receber: { reading: 'a dificuldade de receber cuidado com a mesma naturalidade com que você oferece aos outros', care: 'abrir espaço para acolhimento, descanso e receptividade sem culpa' },
  recomeco: { reading: 'um desejo de começar de outro jeito, mesmo que nem tudo esteja resolvido', care: 'dar sustentação ao recomeço sem exigir respostas definitivas ou mudanças bruscas' },
  integracao: { reading: 'a necessidade de reunir pensamento, emoção, corpo e presença em uma experiência mais inteira', care: 'favorecer coerência, assimilação e uma sensação maior de estar novamente consigo' },
};

function chakraText(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('plexo')) return 'aparece ligado à autocobrança, à confiança nas próprias escolhas e à dificuldade de agir quando existe pressão demais. Quando esse centro pede cuidado, a intenção é favorecer mais firmeza, presença e confiança no próprio movimento.';
  if (normalized.includes('card')) return 'aparece relacionado à forma como você oferece cuidado e à maneira como recebe esse cuidado de volta. Aqui, o convite é permitir que o acolhimento também chegue até você.';
  if (normalized.includes('lar')) return 'surge ligado à expressão das próprias necessidades, à colocação de limites e à possibilidade de dizer o que sente sem precisar se diminuir para preservar o outro.';
  if (normalized.includes('frontal')) return 'aparece associado à atividade mental intensa. Dentro do protocolo, esse centro pede suavização, clareza e mais espaço interno para que pensamento e percepção não precisem permanecer em alerta constante.';
  if (normalized.includes('raiz')) return 'merece atenção quando existe necessidade de mais segurança, aterramento e estabilidade interna. O cuidado aqui busca fortalecer presença, sustentação e sensação de amparo.';
  return 'aparece como um centro que pode se beneficiar de mais presença, harmonização e cuidado neste momento.';
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
      ? `Para acompanhar esse movimento, ${joinNatural(resources)} entram juntos como parte do mesmo cuidado — não como itens separados, mas como apoios escolhidos para conversar entre si e com aquilo que você relatou.`
      : 'Para acompanhar esse movimento, os recursos do protocolo serão escolhidos de forma integrada, sempre a partir do que apareceu em suas respostas.';

    return `Quando suas respostas mostram ${copy.reading}, o cuidado se volta para ${copy.care}. ${resourceText}`;
  });

  if (bath && !careParagraphs.some(paragraph => paragraph.includes(bath.nome))) {
    careParagraphs.push(`Dentro desse mesmo cuidado, ${bath.nome} pode aparecer como prática complementar quando o seu momento pedir ${bath.descricaoPublica.toLowerCase()}. Ele não entra como uma receita solta: será apresentado somente quando conversar com a leitura e com a orientação do protocolo.`);
  }

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
        `Em suas respostas aparecem com mais força aspectos ligados a ${joinNatural(topAxes)}. Isso não fala de falta de vontade. Pelo contrário: sua leitura mostra consciência do que está acontecendo, desejo de mudança e uma parte sua que continua procurando uma forma mais leve de viver.`,
        person.seuMomento,
        'Quando existe muita pressão interna, a própria tentativa de mudar pode se transformar em mais uma obrigação. Por isso, antes de exigir movimento, o cuidado precisa oferecer sustentação, espaço e segurança para que o próximo passo possa nascer sem cobrança.',
      ],
      cycle,
    },
    page3: {
      title: 'O que suas respostas contam sobre você',
      paragraphs: [
        'Outro aspecto importante é a forma como você se coloca nas próprias escolhas. Quando existe grande disponibilidade para acolher, sustentar e perceber os outros, as próprias necessidades podem acabar ficando para depois. Isso é uma qualidade bonita, mas também pode trazer cansaço quando não existe o mesmo espaço para você.',
        'Há ainda uma sensibilidade emocional presente. Dentro da leitura do protocolo, essa sensibilidade não é vista como fraqueza. Ela pode ser uma capacidade de percepção — desde que exista espaço para distinguir aquilo que pertence a você daquilo que você acaba carregando dos outros.',
        'E, mesmo entre os pontos que hoje pedem atenção, suas respostas também mostram recursos importantes que permanecem vivos em você. É essa parte que queremos fortalecer.',
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
        'Nada foi incluído por acaso. Energia, cristal, floral, aromaterapia, frequência e banho só entram quando fazem sentido para o mesmo movimento que apareceu em sua leitura. O objetivo é que você compreenda não apenas o que será utilizado, mas por que aquilo foi escolhido para acompanhar você neste momento.',
      ],
    },
    page5: {
      title: 'Os próximos 7 ou 21 dias',
      paragraphs: [
        'A partir daqui começa outra parte do processo. Se a sua escolha for a jornada de 7 dias, vamos trabalhar aquilo que hoje aparece como prioridade, criando um período de cuidado mais concentrado, voltado para reorganização, presença e retomada de movimento.',
        'Se a sua escolha for a jornada de 21 dias, teremos mais tempo para acompanhar esse processo em camadas, permitindo que o cuidado atravesse diferentes momentos de percepção, integração e retorno a você.',
        'Em qualquer uma das escolhas, a proposta permanece a mesma: você não precisa mudar tudo de uma vez. Durante esse período, vamos auxiliar o seu processo com a composição preparada a partir da sua leitura, respeitando o seu ritmo e aquilo que aparecer ao longo do caminho.',
        'No final do período, a leitura poderá ser revisitada. Porque você não é estática — e o cuidado também não deveria ser.',
      ],
      closingTitle: `Uma última coisa, ${nome}`,
      closing: [
        'Talvez você tenha chegado até aqui procurando uma resposta sobre o que precisa mudar. Mas o que suas respostas mostram não é apenas aquilo que está pesado. Elas também mostram alguém que continua tentando e que ainda consegue perceber que merece viver de outra forma.',
        'Por isso, este processo não começa com uma cobrança. Começa com um convite: voltar a se ouvir, voltar a se perceber e voltar a se incluir na própria vida.',
        'O restante nós vamos construindo com você, passo a passo. Você não precisa carregar tudo sozinha. Seu ritmo será respeitado. E este pode ser um novo começo — sem pressa, mas com presença.',
      ],
    },
  };
}
