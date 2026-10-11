import { CareComposition } from '../care/careComposer';
import { selectBathSupport } from '../care/bathCatalog';
import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { AnamneseInput } from '../types';

export interface FullReportNarrative {
  nome: string;
  page1: { title: string; subtitle: string; intro: string };
  page2: { title: string; paragraphs: string[]; cycle?: string };
  page3: { title: string; paragraphs: string[]; preserved: string[]; chakras: Array<{ name: string; text: string }> };
  page4: { title: string; paragraphs: string[] };
  page5: { title: string; paragraphs: string[]; closingTitle: string; closing: string[] };
}

type ObservedAnswer = { id: string; text: string; category: string; level: number };

function firstName(name: string) { return name.trim().split(/\s+/)[0] || 'você'; }
function unique(values: string[]) { return values.filter((v, i, a) => Boolean(v) && a.indexOf(v) === i); }
function joinNatural(values: string[]) { const clean = values.filter(Boolean); if (!clean.length) return ''; if (clean.length === 1) return clean[0]; if (clean.length === 2) return `${clean[0]} e ${clean[1]}`; return `${clean.slice(0, -1).join(', ')} e ${clean[clean.length - 1]}`; }
function friendlyResourceName(value: string) { return value.replace(/\s+—\s+.*/, '').trim(); }
function intensity(level: number) { return level >= 4 ? 'está muito presente' : level === 3 ? 'acontece bastante' : level === 2 ? 'aparece às vezes' : 'aparece pouco'; }

function observedAnswers(input: AnamneseInput): ObservedAnswer[] {
  return PERGUNTAS_ANAMNESE.map(q => ({ id: q.id, text: q.text, category: q.categoria, level: input.respostasObjetivas[q.id] ?? 0 }))
    .sort((a, b) => b.level - a.level);
}

function directReading(item: ObservedAnswer) {
  return `Na sua resposta sobre ${item.category.toLowerCase()}, você indicou que “${item.text}” ${intensity(item.level)} para você hoje. Essa resposta entra na leitura exatamente com essa intensidade, sem ser transformada em um rótulo sobre quem você é.`;
}

function relationshipReading(active: ObservedAnswer[]) {
  const has = (id: string) => active.some(x => x.id === id && x.level >= 3);
  const parts: string[] = [];
  if (has('q2_mente_acelerada') && has('q1_procrastinacao_inicio')) parts.push('A mente acelerada e a dificuldade de começar aparecem juntas nas suas respostas. Isso sugere que, neste momento, pensar muito e conseguir iniciar não estão funcionando como movimentos separados: quanto mais espaço interno é ocupado pela antecipação, mais importante se torna reduzir pressão antes de pedir ação.');
  if (has('q5_autocobranca_insuficiencia') && has('q1_procrastinacao_inicio')) parts.push('A autocobrança também aparece ao lado da dificuldade de começar. Em vez de interpretar o adiamento como falta de vontade, a sua combinação de respostas pede atenção para o peso que a exigência pode colocar sobre o primeiro passo.');
  if (has('q4_cansaco_esgotamento') && (has('q1_procrastinacao_inicio') || has('q2_mente_acelerada'))) parts.push('O cansaço que você marcou muda a leitura do restante: antes de exigir produtividade ou aceleração, é preciso considerar que sua energia disponível pode não estar acompanhando o volume de pensamento ou de cobrança.');
  if (has('q7_dificuldade_dizer_nao') && has('q8_dificuldade_receber')) parts.push('Limites e receber cuidado aparecem conectados: suas respostas mostram maior facilidade em sustentar demandas do que em abrir espaço para apoio, descanso ou reciprocidade.');
  if (has('q6_engolir_emocoes') && has('q20_conflitos_relacionamento')) parts.push('O que você guarda emocionalmente aparece junto de dificuldades nas relações. A leitura não presume uma causa única, mas essa coexistência pede cuidado com expressão, limite e espaço para dizer o que sente.');
  if (has('q13_inseguranca_material_prosperidade') && has('q3_sensacao_ameaca_inseguranca')) parts.push('As preocupações materiais aparecem junto de uma sensação mais ampla de alerta. Isso torna importante separar o que é uma demanda concreta do que é tensão antecipatória, para que o cuidado não trate tudo como se tivesse a mesma origem.');
  if (has('q14_falta_direcao_proposito') && has('q17_desejo_recomeco')) parts.push('O desejo de recomeçar aparece junto da busca por direção. Suas respostas sugerem que o novo já é percebido, mas ainda precisa de sustentação para ganhar forma sem a obrigação de ter todas as respostas agora.');
  if (has('q11_desconexao_corpo_prazer') && has('q19_tensao_corporal_cronica')) parts.push('Seu corpo aparece de duas formas na anamnese: pela dificuldade de estar presente nas sensações agradáveis e pela percepção de tensão. Isso pede que o corpo seja incluído como lugar de escuta e presença, não apenas como lugar onde o desconforto aparece.');
  if (has('q12_trava_expressao_criatividade') && has('q7_dificuldade_dizer_nao')) parts.push('Expressão e limites também se encontram nas suas respostas. Dar espaço à própria voz pode ser tão importante quanto recuperar criatividade, porque ambos pedem permissão para ocupar o próprio lugar.');
  return parts.slice(0, 3);
}

function chakraText(name: string, active: ObservedAnswer[]) {
  const ids = new Set(active.filter(x => x.level >= 3).map(x => x.id));
  const n = name.toLowerCase();
  if (n.includes('frontal')) return ids.has('q2_mente_acelerada') ? 'O Frontal entra na leitura porque você marcou atividade mental e antecipação com intensidade. Aqui, a intenção é favorecer espaço interno e clareza, sem transformar pensamento em inimigo.' : 'O Frontal aparece como convite a mais clareza, percepção e espaço interno.';
  if (n.includes('plexo')) return ids.has('q5_autocobranca_insuficiencia') || ids.has('q1_procrastinacao_inicio') ? 'O Plexo Solar conversa com as respostas em que cobrança, confiança e movimento aparecem próximos. O cuidado busca firmeza sem aumentar a exigência.' : 'O Plexo Solar aparece ligado à autonomia, confiança e capacidade de sustentar escolhas.';
  if (n.includes('card')) return ids.has('q8_dificuldade_receber') || ids.has('q6_engolir_emocoes') ? 'O Cardíaco aparece porque receber, sentir e acolher ganharam relevância nas suas respostas. A intenção é ampliar espaço para cuidado e reciprocidade.' : 'O Cardíaco aparece ligado ao acolhimento, às trocas e à possibilidade de receber cuidado.';
  if (n.includes('lar')) return ids.has('q7_dificuldade_dizer_nao') || ids.has('q12_trava_expressao_criatividade') ? 'O Laríngeo conversa com as respostas sobre limites, expressão e voz própria. O foco é criar espaço para comunicar necessidades com mais presença.' : 'O Laríngeo aparece relacionado à expressão e à possibilidade de comunicar o que é importante.';
  if (n.includes('bás') || n.includes('raiz') || n.includes('muladh')) return ids.has('q3_sensacao_ameaca_inseguranca') || ids.has('q13_inseguranca_material_prosperidade') ? 'O centro Básico entra na leitura porque segurança e sustentação apareceram nas suas respostas. A prioridade é presença e chão antes de aceleração.' : 'O centro Básico aparece ligado à sustentação, presença e sensação de chão.';
  if (n.includes('sacral') || n.includes('umbilical')) return ids.has('q11_desconexao_corpo_prazer') || ids.has('q12_trava_expressao_criatividade') ? 'O Sacral conversa diretamente com o que você respondeu sobre prazer, corpo e criatividade. O convite é recuperar contato com o que produz vida e fluidez.' : 'O Sacral aparece ligado ao sentir, à criatividade e à fluidez.';
  return 'Este centro aparece como parte da leitura energética do seu momento e será considerado sem substituir aquilo que suas próprias respostas mostram.';
}

export function buildFullReportNarrative({ intake, analysis, composition }: { intake: AnamneseInput; analysis: AnaliseCompletaResultado; composition: CareComposition | null }): FullReportNarrative {
  const nome = firstName(intake.nomePessoa);
  const report = analysis.relatorioEverton;
  const answers = observedAnswers(intake);
  const active = answers.filter(x => x.level >= 2);
  const strongest = active.slice(0, 5);
  const quieter = answers.filter(x => x.level <= 1).slice(0, 2);
  const relationships = relationshipReading(active);
  const topAxes = report.eixosOrdenados.slice(0, 4).map(x => x.nome.toLowerCase());
  const preserved = report.analiseContextualAvancada?.fatoresPreservados.recursosInternosPreservados || [];
  const chakras = unique([...report.regioesCorporais.chakrasCorrespondentes, ...report.recursosInternos.chakras]).slice(0, 5);
  const energies = unique(report.recursosInternos.energias || []).map(friendlyResourceName).slice(0, 3);
  const bath = selectBathSupport(report.eixosOrdenados);
  const crystals = composition?.ethericCrystals || [];
  const florals = composition?.floral || [];
  const aromas = composition?.aromatherapy || [];
  const responseParagraphs = strongest.map(directReading);
  const contrast = quieter.length ? `Também é importante olhar para o que não ganhou a mesma intensidade. Em ${joinNatural(quieter.map(x => x.category.toLowerCase()))}, suas respostas foram mais leves. Isso impede que a leitura trate todas as áreas como igualmente carregadas e ajuda a concentrar o cuidado onde ele é realmente necessário agora.` : '';
  const freeText = [
    intake.relatoLivreNecessidade?.trim() ? `Quando você escreveu “${intake.relatoLivreNecessidade.trim()}”, acrescentou uma camada que as alternativas sozinhas não mostrariam. Esse relato participa da leitura como contexto do seu momento.` : '',
    intake.relatoLivreDesafios?.trim() ? `Você também apontou como desafio: “${intake.relatoLivreDesafios.trim()}”. Esse trecho é considerado junto das respostas objetivas, sem ser usado para definir você.` : '',
  ].filter(Boolean);
  const resources: string[] = [];
  if (energies.length) resources.push(`Como base energética, a composição aponta ${joinNatural(energies)}. Esses nomes aparecem aqui apenas como recursos que acompanharão os pontos já descritos — não como explicação para o que você sente.`);
  if (composition?.solfeggio) resources.push(`A frequência selecionada é ${composition.solfeggio.hz} Hz e entra como apoio da sessão, vinculada à composição atual.`);
  if (crystals.length) resources.push(`Os cristais etéricos selecionados são ${joinNatural(crystals.map(x => x.nome))}. Eles são referências energéticas da composição e não exigem que você possua pedras físicas.`);
  if (florals.length) resources.push(`Na composição complementar, ${joinNatural(florals.map(x => x.nome))} ${florals.length === 1 ? 'foi selecionado' : 'foram selecionados'} para acompanhar o mesmo fio de cuidado, sem funcionar como uma lista separada do diagnóstico.`);
  if (aromas.length) resources.push(`Na aromaterapia, ${joinNatural(aromas.map(x => x.nome.replace(/\s+—.*/, '')))} ${aromas.length === 1 ? 'entra' : 'entram'} como apoio complementar dentro dessa mesma intenção.`);
  if (bath) resources.push(`${bath.nome} aparece como possibilidade de apoio porque o catálogo documentado o relaciona aos pontos que ganharam prioridade nesta leitura. A orientação detalhada permanece vinculada ao protocolo e à revisão do cuidado.`);
  if (!composition) resources.push('Os recursos complementares que dependem da composição final — floral, aromaterapia, cristais etéricos e frequência — só serão apresentados quando estiverem efetivamente definidos e publicados. Nada será preenchido por suposição.');

  return {
    nome,
    page1: {
      title: 'Relatório Completo — Leitura do Seu Momento',
      subtitle: 'Uma devolutiva construída a partir do que você respondeu, do que escreveu com suas próprias palavras e das relações que realmente aparecem nesta anamnese.',
      intro: `${nome}, esta leitura parte de você. Em vez de encaixar suas respostas em um texto pronto, ela destaca o que ganhou intensidade, o que permaneceu mais leve e onde dois ou mais pontos realmente se encontram neste momento.`,
    },
    page2: {
      title: 'Diagnóstico da Anamnese',
      paragraphs: [
        `${nome}, o primeiro passo foi olhar para suas respostas concretas. Os pontos que mais pedem atenção hoje estão concentrados em ${joinNatural(topAxes)}, mas esses nomes servem apenas para organizar a leitura internamente. O que importa para você é como isso apareceu nas respostas abaixo.`,
        ...responseParagraphs,
        ...relationships,
        contrast,
        ...freeText,
        `O conjunto não autoriza afirmar uma causa única para o que você vive. O que ele permite dizer é que existem pontos que aparecem ao mesmo tempo e, por isso, merecem ser cuidados em conjunto. A prioridade é começar pelo que está mais presente sem transformar seu momento em identidade.`,
      ].filter(Boolean),
    },
    page3: {
      title: 'O que suas respostas contam sobre você',
      paragraphs: [
        `A leitura não olha apenas para o que pesa. Ela também procura aquilo que continua disponível em você e pode servir de apoio para o percurso.`,
        intake.relatoLivrePreservado?.trim() ? `Você próprio reconheceu como algo ainda vivo em você: “${intake.relatoLivrePreservado.trim()}”. Isso tem valor na condução do cuidado porque mostra de onde também é possível partir.` : 'Mesmo sem um relato livre sobre forças preservadas, sua participação na anamnese já mostra capacidade de observar o próprio momento e buscar uma forma de cuidado.',
      ],
      preserved: preserved.length ? preserved : ['capacidade de perceber o próprio momento', 'disposição para olhar para si', 'possibilidade de construir um próximo passo'],
      chakras: chakras.map(name => ({ name, text: chakraText(name, active) })),
    },
    page4: {
      title: 'O que vamos trabalhar com você',
      paragraphs: [
        `O cuidado parte dos pontos que você realmente marcou com maior intensidade e das relações descritas nas páginas anteriores. O objetivo não é acrescentar recursos porque “combinam”, mas fazer cada escolha conversar com uma necessidade que apareceu na sua anamnese.`,
        ...resources,
        `Quando a composição individual estiver completa, energia, frequência, floral, aromaterapia, cristais etéricos e demais apoios aparecerão dentro deste mesmo fio narrativo, com a função de cada escolha explicada de forma clara.`,
      ],
    },
    page5: {
      title: 'Os próximos 7 ou 21 dias',
      paragraphs: [
        'A duração do percurso é escolhida na etapa seguinte. O relatório não presume automaticamente 7 nem 21 dias.',
        'Em 7 dias, o percurso é uma adaptação condensada das prioridades encontradas agora — não simplesmente os sete primeiros dias de uma jornada maior.',
        'Em 21 dias, existe mais tempo para acompanhar camadas, observar respostas ao cuidado e realizar reavaliações ao longo do processo.',
        'Em qualquer escolha, o cuidado pode ser revisto porque uma anamnese descreve um momento. Se o momento muda, a condução também precisa poder mudar.',
      ],
      closingTitle: `Uma última coisa, ${nome}`,
      closing: [
        'Você não é a soma das respostas que marcou. Elas são um retrato de como determinadas experiências estão aparecendo agora.',
        'A proposta deste percurso é usar esse retrato para escolher um cuidado mais coerente, respeitando tanto o que pede atenção quanto aquilo que continua vivo em você.',
        'O próximo passo não precisa resolver tudo. Precisa apenas ser verdadeiro para o momento em que você está.',
      ],
    },
  };
}
