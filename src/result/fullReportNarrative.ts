import { CareComposition } from '../care/careComposer';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { AnamneseInput } from '../types';

export interface FullReportNarrative {
  nome: string;
  page1: {
    title: string;
    subtitle: string;
    intro: string;
  };
  page2: {
    title: string;
    paragraphs: string[];
    cycle?: string;
  };
  page3: {
    title: string;
    paragraphs: string[];
    preserved: string[];
    chakras: Array<{ name: string; text: string }>;
  };
  page4: {
    title: string;
    paragraphs: string[];
  };
  page5: {
    title: string;
    paragraphs: string[];
    closingTitle: string;
    closing: string[];
  };
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

function chakraText(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes('plexo')) {
    return 'aparece ligado à autocobrança, à confiança nas próprias escolhas e à dificuldade de agir quando existe pressão demais. Quando esse centro pede cuidado, a intenção é favorecer mais firmeza, presença e confiança no próprio movimento.';
  }
  if (normalized.includes('card')) {
    return 'aparece relacionado à forma como você oferece cuidado e à maneira como recebe esse cuidado de volta. Aqui, o convite é permitir que o acolhimento também chegue até você.';
  }
  if (normalized.includes('lar')) {
    return 'surge ligado à expressão das próprias necessidades, à colocação de limites e à possibilidade de dizer o que sente sem precisar se diminuir para preservar o outro.';
  }
  if (normalized.includes('frontal')) {
    return 'aparece associado à atividade mental intensa. Dentro do protocolo, esse centro pede suavização, clareza e mais espaço interno para que pensamento e percepção não precisem permanecer em alerta constante.';
  }
  if (normalized.includes('raiz')) {
    return 'merece atenção quando existe necessidade de mais segurança, aterramento e estabilidade interna. O cuidado aqui busca fortalecer presença, sustentação e sensação de amparo.';
  }
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

  const topAxes = report.eixosOrdenados.slice(0, 4).map(item => item.nome.toLowerCase());
  const preserved = report.analiseContextualAvancada?.fatoresPreservados.recursosInternosPreservados || [];
  const chakrasRaw = [
    ...report.regioesCorporais.chakrasCorrespondentes,
    ...report.recursosInternos.chakras,
  ].filter((value, index, array) => value && array.indexOf(value) === index).slice(0, 5);

  const cycle = report.analiseContextualAvancada?.cadeiasCausais?.[0]?.expressaoFormatada;

  const systemNames = [
    report.sistemaPrincipal.nome,
    ...report.sistemasComplementares.map(item => item.nome),
  ].filter(Boolean).map(friendlyResourceName);

  const crystals = composition?.ethericCrystals.map(item => item.nome) || [];
  const floral = composition?.floral.map(item => item.nome) || [];
  const aroma = composition?.aromatherapy.map(item => item.nome.replace(/\s+—.*/, '')) || [];
  const solfeggio = composition?.solfeggio ? `${composition.solfeggio.hz} Hz` : '';

  const integratedResources: string[] = [];
  if (systemNames.length) integratedResources.push(`energias como ${joinNatural(systemNames.slice(0, 3))}`);
  if (crystals.length) integratedResources.push(`cristais etéricos como ${joinNatural(crystals)}`);
  if (floral.length) integratedResources.push(`o apoio floral de ${joinNatural(floral)}`);
  if (aroma.length) integratedResources.push(`a aromaterapia com ${joinNatural(aroma)}`);
  if (solfeggio) integratedResources.push(`a frequência ${solfeggio}`);

  const careIntegration = integratedResources.length
    ? `Ao longo do cuidado, esses recursos não aparecem como elementos soltos. ${joinNatural(integratedResources)} entram dentro da mesma composição, cada um conversando com um aspecto do que você trouxe e sustentando o processo de forma integrada.`
    : 'Ao longo do cuidado, cada recurso será escolhido para conversar diretamente com aquilo que apareceu em sua anamnese, sem excessos e sem fórmulas prontas.';

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
        `Ao reunirmos tudo o que você respondeu, alguns movimentos aparecem com mais clareza. A intenção desta leitura não é colocar você dentro de um rótulo, mas ajudá-la a compreender o que, neste momento, parece estar pedindo mais atenção, presença e cuidado.`,
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
        'Ao longo desse processo, vamos trabalhar a suavização da sobrecarga interna, a reorganização dos pensamentos, o acolhimento emocional, o fortalecimento da presença e a retomada da confiança no seu próprio movimento.',
        careIntegration,
        crystals.length || floral.length || aroma.length || solfeggio
          ? `Quando a mente pede mais suavidade e clareza, os recursos escolhidos para esse eixo ajudam a criar espaço interno e diminuir o excesso. Quando o coração pede acolhimento, entram apoios voltados à ternura, receptividade e cuidado. E quando o momento pede confiança, aterramento ou retomada de movimento, a composição se ajusta para sustentar exatamente esses pontos — sem separar energia, cristal, floral, aroma ou frequência da história que você contou.`
          : 'Cada recurso será apresentado dentro da própria leitura, no ponto em que fizer sentido para aquilo que você relatou, para que o cuidado tenha nexo, continuidade e verdade.',
        'Nada entra apenas porque “combina”. Cada escolha precisa conversar com o que você trouxe e apoiar, com delicadeza, o seu caminho de volta ao equilíbrio.',
      ],
    },
    page5: {
      title: 'Os próximos 7 ou 21 dias',
      paragraphs: [
        'A partir daqui começa outra parte do processo. Se a sua escolha for a jornada de 7 dias, vamos trabalhar aquilo que hoje aparece como prioridade, criando um período de cuidado mais concentrado, voltado para reorganização, presença e retomada de movimento.',
        'Se a sua escolha for a jornada de 21 dias, teremos mais tempo para acompanhar esse processo em camadas, permitindo que o cuidado atravesse diferentes momentos de percepção, integração e retorno a você mesma.',
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
