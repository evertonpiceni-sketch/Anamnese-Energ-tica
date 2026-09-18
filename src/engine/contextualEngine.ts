import { AnamneseInput, EixoId, EixoResultado, SistemaBiblioteca } from '../types';
import { EIXOS_DEFINITIONS } from '../data/axes';

/**
 * Estrutura de Cadeia Causal Funcional detalhada (Regras 7 e 8)
 */
export interface CadeiaCausalFuncional {
  id: string;
  origemRaiz: string;
  mecanismoIntermediario: string;
  sintomaVisivel: string;
  expressaoFormatada: string;
  eixoEstruturante: EixoId;
  eixosEnvolvidos: EixoId[];
  grauEvidencia: 'alto' | 'moderado' | 'sutil';
  justificativaClinica: string;
  diretrizComposicao: string;
  recursosBibliotecaRecomendados: {
    sistemaId: string;
    recursoNome: string;
    motivoConvergencia: string;
  }[];
}

/**
 * Análise Qualitativa de Alta Resolução do Relato Livre (Regra 9)
 */
export interface AnaliseQualitativaProfunda {
  palavrasRecorrentes: string[];
  emocoesMencionadas: string[];
  clustersSemanticos: {
    nomeCluster: string;
    termosEncontrados: string[];
    pesoQualitativoAtribuido: number;
    eixosAfetados: EixoId[];
  }[];
  modulacoesQualitativasEixos: Record<EixoId, number>; // Bônus qualitativo (-10 a +25 pontos)
  fatoresPreservados: {
    descricao: string;
    recursosInternosPreservados: string[];
    potencialExpansao: boolean;
  };
  urgenciaEstabilizacaoQualitativa: boolean;
  convergenciasBiblioteca: {
    expressaoRelatada: string;
    recursoSugerido: string;
    cursoOrigem: string;
    motivoConvergencia: string;
  }[];
}

/**
 * Clusters Semânticos para Análise Qualitativa das Respostas Abertas
 */
const CLUSTERS_SEMANTICOS = [
  {
    nome: 'Medo, Ameaça & Hiperalerta',
    termos: [
      'medo', 'inseguran', 'pânico', 'panico', 'ameaça', 'ameaca', 'alerta', 'perigo',
      'aperto', 'apreens', 'trava', 'paralisa', 'paralisia', 'susto', 'sobressalto'
    ],
    eixos: ['seguranca', 'movimento', 'corpo'] as EixoId[],
    pesoBase: 20,
  },
  {
    nome: 'Autocobrança, Perfeccionismo & Culpa',
    termos: [
      'cobrança', 'cobranca', 'perfeccion', 'perfeito', 'insuficien', 'errar', 'falhar',
      'culpa', 'julgamento', 'vergonha', 'crítica', 'critica', 'exigên', 'exigen'
    ],
    eixos: ['autovalor', 'movimento', 'emocional'] as EixoId[],
    pesoBase: 18,
  },
  {
    nome: 'Exaustão, Fadiga & Colapso de Energia',
    termos: [
      'cansaço', 'cansaco', 'esgotamento', 'exaust', 'sem energia', 'fadiga', 'dormir',
      'acabado', 'arrastando', 'pesado', 'sem forças', 'sem forca', 'drenad'
    ],
    eixos: ['vitalidade', 'corpo', 'integracao'] as EixoId[],
    pesoBase: 22,
  },
  {
    nome: 'Falta de Limites & Doação Excessiva',
    termos: [
      'dizer não', 'dizer nao', 'limite', 'carregar', 'assumir', 'responsab', 'outros',
      'peso dos outros', 'ajudar todo mundo', 'não consigo negar', 'dar demais'
    ],
    eixos: ['poder_pessoal', 'receber', 'relacionamentos'] as EixoId[],
    pesoBase: 18,
  },
  {
    nome: 'Ruminação Mental & Hiperatividade Cognitiva',
    termos: [
      'mente a mil', 'não desliga', 'nao desliga', 'pensamento', 'turbilhão', 'turbilhao',
      'foco', 'confusão', 'confusao', 'hiperat', 'overthinking', 'cabeça cheia', 'insônia', 'insonia'
    ],
    eixos: ['mente', 'seguranca', 'movimento'] as EixoId[],
    pesoBase: 16,
  },
  {
    nome: 'Angústia Emocional & Mágoas Engolidas',
    termos: [
      'angústia', 'angustia', 'tristeza', 'choro', 'engolir', 'peito preso', 'garganta',
      'nó na garganta', 'no na garganta', 'mágoa', 'magoa', 'ressent', 'máscara', 'mascara'
    ],
    eixos: ['emocional', 'poder_pessoal', 'corpo'] as EixoId[],
    pesoBase: 18,
  },
  {
    nome: 'Insegurança Material & Ansiedade de Sobrevivência',
    termos: [
      'dinheiro', 'financeir', 'escassez', 'sobreviver', 'pagar contas', 'estabilidade',
      'trabalho instável', 'medo de faltar', 'prosperidade'
    ],
    eixos: ['prosperidade', 'seguranca', 'vitalidade'] as EixoId[],
    pesoBase: 15,
  },
  {
    nome: 'Desconexão Espiritual & Crise de Sentido',
    termos: [
      'sentido', 'propósito', 'proposito', 'vazio', 'desconectad', 'sem rumo',
      'perdido', 'fé', 'espiritual', 'crise existencial', 'alma'
    ],
    eixos: ['proposito', 'espiritualidade', 'integracao'] as EixoId[],
    pesoBase: 16,
  },
];

/**
 * Analisa as respostas abertas com extração semântica e peso qualitativo
 */
export function executarAnaliseQualitativaProfunda(input: AnamneseInput): AnaliseQualitativaProfunda {
  const textoNecessidade = (input.relatoLivreNecessidade || '').toLowerCase();
  const textoDesafios = (input.relatoLivreDesafios || '').toLowerCase();
  const textoPreservado = (input.relatoLivrePreservado || '').toLowerCase();
  const textoIntencao = (input.intencaoDeclarada || '').toLowerCase();

  const textoCompletoProblemas = `${textoNecessidade} ${textoDesafios} ${textoIntencao}`;

  // 1. Identificar Clusters Semânticos Ativos
  const clustersAtivos: AnaliseQualitativaProfunda['clustersSemanticos'] = [];
  const modulacoesQualitativasEixos: Record<EixoId, number> = {
    seguranca: 0,
    emocional: 0,
    autovalor: 0,
    mente: 0,
    movimento: 0,
    vitalidade: 0,
    corpo: 0,
    relacionamentos: 0,
    prazer: 0,
    criatividade: 0,
    limpeza: 0,
    padroes: 0,
    prosperidade: 0,
    poder_pessoal: 0,
    proposito: 0,
    espiritualidade: 0,
    protecao: 0,
    receber: 0,
    recomeco: 0,
    integracao: 0,
  };

  const palavrasRecorrentesSet = new Set<string>();
  const emocoesSet = new Set<string>();

  CLUSTERS_SEMANTICOS.forEach((cluster) => {
    const termosAchados = cluster.termos.filter((t) => textoCompletoProblemas.includes(t));
    if (termosAchados.length > 0) {
      termosAchados.forEach((t) => palavrasRecorrentesSet.add(t));

      // Calcula peso qualitativo proporcional à frequência e intensidade dos termos
      const pesoAtribuido = Math.min(25, cluster.pesoBase + (termosAchados.length - 1) * 3);

      clustersAtivos.push({
        nomeCluster: cluster.nome,
        termosEncontrados: termosAchados,
        pesoQualitativoAtribuido: pesoAtribuido,
        eixosAfetados: cluster.eixos,
      });

      // Aplica bônus qualitativo aos eixos afetados
      cluster.eixos.forEach((eixoId) => {
        modulacoesQualitativasEixos[eixoId] = Math.min(
          25,
          modulacoesQualitativasEixos[eixoId] + Math.round(pesoAtribuido * 0.5)
        );
      });
    }
  });

  // Identificação de emoções declaradas
  if (textoCompletoProblemas.includes('medo') || textoCompletoProblemas.includes('pavor') || textoCompletoProblemas.includes('alerta')) {
    emocoesSet.add('Medo Agudo / Sensação de Alerta');
  }
  if (textoCompletoProblemas.includes('ansiedade') || textoCompletoProblemas.includes('aperto')) {
    emocoesSet.add('Ansiedade Antecipatória');
  }
  if (textoCompletoProblemas.includes('angústia') || textoCompletoProblemas.includes('tristeza') || textoCompletoProblemas.includes('choro')) {
    emocoesSet.add('Tristeza & Sobrecarga Emocional');
  }
  if (textoCompletoProblemas.includes('culpa') || textoCompletoProblemas.includes('insuficien') || textoCompletoProblemas.includes('vergonha')) {
    emocoesSet.add('Culpa & Autocrítica Punitiva');
  }
  if (textoCompletoProblemas.includes('raiva') || textoCompletoProblemas.includes('revolta') || textoCompletoProblemas.includes('ressent')) {
    emocoesSet.add('Irritabilidade / Ressentimento Contido');
  }

  // 2. Análise dos Fatores Preservados (Potencial de Proteção e Expansão)
  const termosPreservadosPositivos = [
    'criatividade', 'vontade', 'sonho', 'amor', 'esperança', 'paixão', 'energia viva',
    'aprender', 'cuidar', 'família', 'fé', 'força', 'dedicação', 'inteligência', 'clareza'
  ];
  const recursosPreservadosEncontrados = termosPreservadosPositivos.filter((tp) =>
    textoPreservado.includes(tp)
  );

  const potencialExpansao =
    recursosPreservadosEncontrados.length >= 2 ||
    textoPreservado.includes('energia') ||
    textoPreservado.includes('vontade');

  const fatoresPreservados = {
    descricao: input.relatoLivrePreservado || 'Não detalhado formalmente pelo interagente.',
    recursosInternosPreservados:
      recursosPreservadosEncontrados.length > 0
        ? recursosPreservadosEncontrados
        : ['Sensibilidade perceptiva ativa', 'Busca espontânea por autocuidado'],
    potencialExpansao,
  };

  // 3. Sinais de Urgência de Estabilização Qualitativa
  const urgenciaEstabilizacaoQualitativa =
    textoCompletoProblemas.includes('pânico') ||
    textoCompletoProblemas.includes('desespero') ||
    textoCompletoProblemas.includes('não aguento mais') ||
    textoCompletoProblemas.includes('esgotamento total') ||
    textoCompletoProblemas.includes('crise');

  // 4. Convergências Diretas com a Biblioteca-Mestra (Regra 12)
  const convergenciasBiblioteca: AnaliseQualitativaProfunda['convergenciasBiblioteca'] = [];

  if (textoCompletoProblemas.includes('aperto no peito') || textoCompletoProblemas.includes('coração acelerado') || textoCompletoProblemas.includes('medo de falhar')) {
    convergenciasBiblioteca.push({
      expressaoRelatada: 'Aperto no peito / Medo de falhar',
      recursoSugerido: 'Símbolo Shanti (Karuna Ki) + Quartzo Verde',
      cursoOrigem: 'Karuna Ki Praticante / Mestrado',
      motivoConvergencia:
        'Shanti atua dissolvendo o medo visceral e a ansiedade antecipatória no Chakra Cardíaco, restabelecendo a confiança serena.',
    });
  }

  if (textoCompletoProblemas.includes('cobrança') || textoCompletoProblemas.includes('perfeccion') || textoCompletoProblemas.includes('errar')) {
    convergenciasBiblioteca.push({
      expressaoRelatada: 'Autocobrança excessiva / Perfeccionismo',
      recursoSugerido: 'Símbolo Halu (Karuna Ki) + Ametista',
      cursoOrigem: 'Karuna Ki Praticante / Mestrado',
      motivoConvergencia:
        'Halu opera dissolvendo ilusões cognitivas, padrões de autossabotagem e a voz autocrítica que bloqueia o valor pessoal.',
    });
  }

  if (textoCompletoProblemas.includes('dizer não') || textoCompletoProblemas.includes('limite') || textoCompletoProblemas.includes('carregar os outros')) {
    convergenciasBiblioteca.push({
      expressaoRelatada: 'Dificuldade de dizer não / Limites frouxos',
      recursoSugerido: 'Símbolo Kriya (Karuna Ki) + Hematita',
      cursoOrigem: 'Karuna Ki Praticante / Mestrado',
      motivoConvergencia:
        'Kriya promove aterramento de prioridades legítimas e manifestação clara no plano físico, fortalecendo a firmeza de limites.',
    });
  }

  if (textoCompletoProblemas.includes('mente a mil') || textoCompletoProblemas.includes('não desliga') || textoCompletoProblemas.includes('cabeça cheia')) {
    convergenciasBiblioteca.push({
      expressaoRelatada: 'Mente hiperativa / Ruminação cognitiva',
      recursoSugerido: 'Original Reiki Platinum (Ancoragem) + Turmalina Negra',
      cursoOrigem: 'Formação Mestrado Reiki Platinum Integrado',
      motivoConvergencia:
        'Aterramento neutro que drena o excesso de energia acumulado na cabeça para a terra, sem forçar contração mental.',
    });
  }

  if (textoCompletoProblemas.includes('esgotamento') || textoCompletoProblemas.includes('sem energia') || textoCompletoProblemas.includes('fadiga')) {
    convergenciasBiblioteca.push({
      expressaoRelatada: 'Esgotamento vital profundo',
      recursoSugerido: 'Sustentação Platinum Base + Selenita / Cristal Transparente',
      cursoOrigem: 'Formação Mestrado Reiki Platinum Integrado',
      motivoConvergencia:
        'Matriz de nutrição celular contínua; veta estimulantes ativos até que a reserva basal se estabilize.',
    });
  }

  return {
    palavrasRecorrentes: Array.from(palavrasRecorrentesSet),
    emocoesMencionadas: Array.from(emocoesSet),
    clustersSemanticos: clustersAtivos,
    modulacoesQualitativasEixos,
    fatoresPreservados,
    urgenciaEstabilizacaoQualitativa,
    convergenciasBiblioteca,
  };
}

/**
 * Motor Central de Causalidade Funcional entre Eixos (Regras 7, 8 e 26)
 * Prioriza o entendimento do encadeamento causal sobre a pontuação numérica simples.
 */
export function determinarCadeiasCausaisFuncionais(
  eixosPontuados: EixoResultado[],
  analiseQualitativa: AnaliseQualitativaProfunda,
  input: AnamneseInput
): {
  cadeiasCausais: CadeiaCausalFuncional[];
  eixoEstruturante: EixoId;
  eixosSecundarios: EixoId[];
  diagnosticoSintese: string;
  eixosComQualitativo: EixoResultado[];
} {
  // 1. Integrar pesos qualitativos das respostas abertas aos percentuais dos eixos
  const eixosComQualitativo: EixoResultado[] = eixosPontuados.map((eixo) => {
    const bonus = analiseQualitativa.modulacoesQualitativasEixos[eixo.eixoId] || 0;
    const novoPercentual = Math.min(100, Math.round(eixo.percentual + bonus * 0.4));
    let nivel = eixo.nivel;
    if (novoPercentual >= 75) nivel = 'muito_elevado';
    else if (novoPercentual >= 50) nivel = 'elevado';
    else if (novoPercentual >= 30) nivel = 'moderado';
    else nivel = 'leve';

    return {
      ...eixo,
      percentual: novoPercentual,
      nivel,
    };
  });

  const getEixo = (id: EixoId) => eixosComQualitativo.find((e) => e.eixoId === id)!;

  const seguranca = getEixo('seguranca');
  const movimento = getEixo('movimento');
  const vitalidade = getEixo('vitalidade');
  const mente = getEixo('mente');
  const autovalor = getEixo('autovalor');
  const poderPessoal = getEixo('poder_pessoal');
  const emocional = getEixo('emocional');
  const receber = getEixo('receber');
  const relacionamentos = getEixo('relacionamentos');
  const padroes = getEixo('padroes');
  const prosperidade = getEixo('prosperidade');
  const proposito = getEixo('proposito');
  const espiritualidade = getEixo('espiritualidade');
  const corpo = getEixo('corpo');

  const cadeiasCausais: CadeiaCausalFuncional[] = [];

  // Avaliação do Cansaço (Pergunta Q4 alimenta vitalidade; pontuação alta = falta de vitalidade)
  const temFaltaVitalidade = vitalidade.percentual >= 60;
  const temVitalidadePreservada = vitalidade.percentual <= 45;

  // PADRÃO 1: MEDO / INSEGURANÇA → ANTECIPAÇÃO → PARALISAÇÃO / PROCRASTINAÇÃO (Regra 7 Clássica)
  if (
    (movimento.percentual >= 55 || input.respostasObjetivas['q1_procrastinacao_inicio'] >= 2) &&
    (seguranca.percentual >= 50 || analiseQualitativa.clustersSemanticos.some((c) => c.nomeCluster.includes('Medo'))) &&
    temVitalidadePreservada
  ) {
    cadeiasCausais.push({
      id: 'causa_medo_paralisia_com_vitalidade',
      origemRaiz: 'Insegurança Basal & Medo de Errar / Falhar',
      mecanismoIntermediario: 'Antecipação Mental Catastrófica e Hipervigilância',
      sintomaVisivel: 'Paralisação da Ação / Procrastinação no Início de Tarefas',
      expressaoFormatada: 'MEDO / INSEGURANÇA → ANTECIPAÇÃO MENTAL → PARALISAÇÃO / PROCRASTINAÇÃO',
      eixoEstruturante: 'seguranca',
      eixosEnvolvidos: ['seguranca', 'mente', 'movimento'],
      grauEvidencia: 'alto',
      justificativaClinica:
        'A procrastinação e o adiamento de decisões NÃO decorrem de preguiça, desmotivação ou falta de energia vital. A pessoa possui vitalidade disponível, porém o centro de ação é bloqueado pelo reflexo de alerta do sistema límbico e medo de julgamento. Tratar com estimulantes aumentaria a ansiedade. A prioridade é desarmar o medo com Karuna Ki Shanti antes de qualquer movimento.',
      diretrizComposicao:
        'Estabilização primária com Karuna Ki (Shanti/Halu) + Sustentação neutra Platinum. Veto estrito a sistemas estimulantes ativos no início.',
      recursosBibliotecaRecomendados: [
        {
          sistemaId: 'karuna_ki',
          recursoNome: 'Símbolo Shanti',
          motivoConvergencia: 'Dissolução do medo antecipatório e paz no chakra cardíaco.',
        },
        {
          sistemaId: 'karuna_ki',
          recursoNome: 'Símbolo Halu',
          motivoConvergencia: 'Rompimento de ilusões de inadequação e clareza mental.',
        },
      ],
    });
  }

  // PADRÃO 2: ESGOTAMENTO DE VITALIDADE → FALTA DE COMBUSTÍVEL → PROCRASTINAÇÃO / INAÇÃO
  if (
    (movimento.percentual >= 55 || input.respostasObjetivas['q1_procrastinacao_inicio'] >= 2) &&
    temFaltaVitalidade
  ) {
    cadeiasCausais.push({
      id: 'causa_esgotamento_combustivel',
      origemRaiz: 'Esgotamento Fisiológico & Desabastecimento Vital Basal',
      mecanismoIntermediario: 'Colapso da Bateria Energética e Perda de Sustentação Física',
      sintomaVisivel: 'Incapacidade Somática de Agir / Sensação de Arrasto',
      expressaoFormatada: 'EXAUSTÃO VITAL → DESABASTECIMENTO ENERGÉTICO → INAÇÃO / PARALISIA',
      eixoEstruturante: 'vitalidade',
      eixosEnvolvidos: ['vitalidade', 'corpo', 'movimento'],
      grauEvidencia: 'alto',
      justificativaClinica:
        'A dificuldade em agir tem natureza de esgotamento de combustível. Exigir foco, produtividade ou aplicar energias ativadoras elétricas seria iatrogênico e acentuaria a queima das reservas adrenais. O campo celular necessita de preenchimento neutro e repouso restaurador.',
      diretrizComposicao:
        'Prioridade absoluta para Original Reiki Platinum em modo de nutrição celular profunda. Descarte de sistemas estimulantes ativos até a recuperação dos níveis de vitalidade.',
      recursosBibliotecaRecomendados: [
        {
          sistemaId: 'original_reiki_platinum',
          recursoNome: 'Sustentação Platinum Base',
          motivoConvergencia: 'Nutrição contínua sem aceleração forçada.',
        },
      ],
    });
  }

  // PADRÃO 3: AUTOCOBRANÇA PUNITIVA → INSUFICIÊNCIA → TRAVA DE ENTREGA (Perfeccionismo)
  if (
    autovalor.percentual >= 60 ||
    analiseQualitativa.clustersSemanticos.some((c) => c.nomeCluster.includes('Autocobrança'))
  ) {
    cadeiasCausais.push({
      id: 'causa_autocobranca_insuficiencia',
      origemRaiz: 'Crítica Interna Severa & Sentimento de Insuficiência',
      mecanismoIntermediario: 'Medo de Exposição e Ansiedade de Ser Desaprovado',
      sintomaVisivel: 'Retenção de Entregas, Perfeccionismo Paralisante e Rigidez',
      expressaoFormatada: 'AUTOCOBRANÇA PUNITIVA → MEDO DE FALHAR → TRAVA DE FINALIZAÇÃO',
      eixoEstruturante: 'autovalor',
      eixosEnvolvidos: ['autovalor', 'movimento', 'emocional'],
      grauEvidencia: autovalor.percentual >= 70 ? 'alto' : 'moderado',
      justificativaClinica:
        'A pessoa mantém padrão de padrão excessivamente elevado para si mesma. Adia a conclusão de tarefas porque qualquer imperfeição é sentida como confirmação de inadequação íntima. O trabalho energético precisa acolher a autoimagem e amaciar o plexo solar.',
      diretrizComposicao:
        'Karuna Ki com Halu e Zonar (cura de registros de desvalorização) associado a Quartzo Rosa no chakra cardíaco.',
      recursosBibliotecaRecomendados: [
        {
          sistemaId: 'karuna_ki',
          recursoNome: 'Símbolos Halu + Zonar',
          motivoConvergencia: 'Limpeza de crenças de desvalorização e acolhimento da imperfeição.',
        },
      ],
    });
  }

  // PADRÃO 4: HIPER-RESPONSABILIDADE & FALTA DE LIMITES → COLAPSO POR SOBRECARGA
  if (
    (poderPessoal.percentual >= 55 || receber.percentual >= 55) &&
    (analiseQualitativa.clustersSemanticos.some((c) => c.nomeCluster.includes('Limites')) ||
      input.respostasObjetivas['q7_dificuldade_dizer_nao'] >= 3)
  ) {
    cadeiasCausais.push({
      id: 'causa_falta_limites_sobrecarga',
      origemRaiz: 'Fronteiras Pessoais Fragilizadas & Dificuldade de Dizer Não',
      mecanismoIntermediario: 'Assunção de Demandas Alheias e Culpa em Descansar',
      sintomaVisivel: 'Sobrecarga Crônica nos Ombros/Trapézio e Dreno Energético',
      expressaoFormatada: 'FRAGILIDADE DE LIMITES → DOAÇÃO COMPULSIVA → SOBRECARGA & DRENO',
      eixoEstruturante: 'poder_pessoal',
      eixosEnvolvidos: ['poder_pessoal', 'receber', 'corpo', 'vitalidade'],
      grauEvidencia: 'alto',
      justificativaClinica:
        'A queixa de peso corporal e cansaço é reflexo direto da incapacidade de impor limites nas relações. A pessoa não se permite receber nem descansar sem culpa. O foco terapêutico reside no fortalecimento do Plexo Solar e no aterramento da autonomia de escolha.',
      diretrizComposicao:
        'Karuna Ki com Kriya (aterramento e limites de ação) + Cristaloterapia com Hematita / Turmalina Negra.',
      recursosBibliotecaRecomendados: [
        {
          sistemaId: 'karuna_ki',
          recursoNome: 'Símbolo Kriya',
          motivoConvergencia: 'Manifestação de limites sadios e ancoragem no plano físico.',
        },
        {
          sistemaId: 'cristaloterapia_integrativa',
          recursoNome: 'Hematita / Ametista',
          motivoConvergencia: 'Proteção contra contaminação por demandas externas.',
        },
      ],
    });
  }

  // PADRÃO 5: RUMINAÇÃO MENTAL & TURBILHÃO COGNITIVO → DESCONEXÃO DA TERRA
  if (
    mente.percentual >= 65 &&
    (analiseQualitativa.clustersSemanticos.some((c) => c.nomeCluster.includes('Ruminação')) ||
      input.respostasObjetivas['q2_mente_acelerada'] >= 3)
  ) {
    cadeiasCausais.push({
      id: 'causa_ruminacao_mente_terra',
      origemRaiz: 'Hiperatividade Intelectual & Ansiedade Cognitiva',
      mecanismoIntermediario: 'Ascensão de Prana para os Chakras Superiores e Desancoragem',
      sintomaVisivel: 'Confusão de Prioridades, Insônia e Sensação de Cabeça Pesada',
      expressaoFormatada: 'TURBILHÃO MENTAL → DESANCORAGEM DA TERRA → CONFUSÃO DE PRIORIDADES',
      eixoEstruturante: 'mente',
      eixosEnvolvidos: ['mente', 'seguranca', 'corpo'],
      grauEvidencia: 'alto',
      justificativaClinica:
        'O excesso de processamento cerebral retira a pessoa do momento presente. Faltam raízes sutis na base do corpo, gerando vertigem decisória e sensação de estar flutuando nas próprias preocupações.',
      diretrizComposicao:
        'Técnicas de aterramento Usui (Kenyoku Ho, Joshin Kokyu Ho) + ancoragem Original Reiki Platinum.',
      recursosBibliotecaRecomendados: [
        {
          sistemaId: 'gendai_reiki_ho',
          recursoNome: 'Kenyoku Ho + Joshin Kokyu Ho',
          motivoConvergencia: 'Purificação áurica rápida e descida da respiração para o Tantien.',
        },
      ],
    });
  }

  // PADRÃO 6: EMOÇÕES ENGOLIDAS → CONSTRIÇÃO CARDÍACA / LARÍNGEA
  if (
    (emocional.percentual >= 60 || poderPessoal.percentual >= 60) &&
    (input.respostasObjetivas['q6_engolir_emocoes'] >= 3 ||
      input.regioesCorporaisPercebidas.some((r) => r.includes('peito') || r.includes('garganta')))
  ) {
    cadeiasCausais.push({
      id: 'causa_emocoes_engolidas_garganta',
      origemRaiz: 'Contenção de Emoções Autênticas e Repressão de Descontentamento',
      mecanismoIntermediario: 'Bloqueio do Fluxo entre Coração (Sentir) e Garganta (Expressar)',
      sintomaVisivel: 'Sensação de Nó na Garganta, Aperto no Peito e Dificuldade de Autoexpressão',
      expressaoFormatada: 'EMOÇÕES ENGOLIDAS → CONSTRIÇÃO PEITO/GARGANTA → ESTAGNAÇÃO VITAL',
      eixoEstruturante: 'emocional',
      eixosEnvolvidos: ['emocional', 'poder_pessoal', 'corpo'],
      grauEvidencia: 'alto',
      justificativaClinica:
        'A contenção habitual de mágoas e descontentamentos gera espasmo sutil nas fáscias torácicas e laríngeas. O campo gasta imensa energia para manter a censura interna ativa. A intervenção deve prover acolhimento sem forçar catarse violenta.',
      diretrizComposicao:
        'Usui Tradicional com Sei He Ki (harmonização emocional profunda) + Karuna Ki Harth (cura do coração).',
      recursosBibliotecaRecomendados: [
        {
          sistemaId: 'reiki_usui_shiki_ryoho',
          recursoNome: 'Símbolo Sei He Ki',
          motivoConvergencia: 'Harmonização do corpo emocional e liberação suave de sentimentos represados.',
        },
        {
          sistemaId: 'karuna_ki',
          recursoNome: 'Símbolo Harth',
          motivoConvergencia: 'Acolhimento da dor do abandono e restauração do amor próprio.',
        },
      ],
    });
  }

  // 2. Determinação do Eixo Estruturante Baseado nas Cadeias Encontradas
  let eixoEstruturante: EixoId = 'seguranca';
  let diagnosticoSintese = '';

  if (cadeiasCausais.length > 0) {
    // A primeira cadeia identificada de maior evidência define o eixo estruturante
    const cadeiaPrioritaria = cadeiasCausais[0];
    eixoEstruturante = cadeiaPrioritaria.eixoEstruturante;
    diagnosticoSintese = `${cadeiaPrioritaria.expressaoFormatada}. ${cadeiaPrioritaria.justificativaClinica}`;
  } else {
    // Se nenhuma cadeia composta específica for disparada, seleciona o eixo com maior pontuação combinada
    const ordenados = [...eixosComQualitativo].sort((a, b) => b.percentual - a.percentual);
    eixoEstruturante = ordenados[0].eixoId;
    diagnosticoSintese = `Análise fundamentada no eixo de maior tensão relativa: ${EIXOS_DEFINITIONS[eixoEstruturante].nome}.`;
  }

  // 3. Identificação de Eixos Secundários Relevantes
  const eixosSecundarios = eixosComQualitativo
    .filter((e) => e.eixoId !== eixoEstruturante && e.percentual >= 50)
    .sort((a, b) => b.percentual - a.percentual)
    .map((e) => e.eixoId);

  return {
    cadeiasCausais,
    eixoEstruturante,
    eixosSecundarios,
    diagnosticoSintese,
    eixosComQualitativo,
  };
}
