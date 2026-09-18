import {
  AnamneseInput,
  EixoId,
  EixoResultado,
  EstruturaJsonExport,
  EtapaSequencia,
  RelatorioTecnicoEverton,
  ResultadoPessoa,
  SistemaBiblioteca,
  SistemaNaoPriorizado,
} from '../types';
import { EIXOS_DEFINITIONS, LISTA_EIXOS_IDS } from '../data/axes';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { REGIOES_CORPORAIS } from '../data/regioesCorporais';
import {
  determinarCadeiasCausaisFuncionais,
  executarAnaliseQualitativaProfunda,
  AnaliseQualitativaProfunda,
  CadeiaCausalFuncional,
} from './contextualEngine';

export interface AnaliseCompletaResultado {
  resultadoPessoa: ResultadoPessoa;
  relatorioEverton: RelatorioTecnicoEverton;
  jsonExport: EstruturaJsonExport;
}

/**
 * Motor Principal de Análise Integrativa
 * Prioriza o Entendimento Contextual e a Causalidade Funcional sobre a pontuação simples
 */
export function executarAnaliseIntegrativa(
  input: AnamneseInput,
  bibliotecaAtiva: SistemaBiblioteca[] = BIBLIOTECA_MESTRA
): AnaliseCompletaResultado {
  // 1. CÁLCULO PONDERADO DOS EIXOS A PARTIR DAS RESPOSTAS OBJETIVAS
  const eixosPontuados = calcularPontuacaoEixos(input.respostasObjetivas);

  // 2. ANÁLISE QUALITATIVA PROFUNDA DAS RESPOSTAS ABERTAS (Regra 9)
  // Extrai clusters semânticos, modulações de peso qualitativo e convergências com a biblioteca
  const analiseQualitativa = executarAnaliseQualitativaProfunda(input);

  // 3. MOTOR DE CAUSALIDADE FUNCIONAL ENTRE EIXOS (Regras 7, 8 e 26)
  // Identifica causa raiz vs. sintoma comportamental (ex: medo gerando procrastinação)
  const {
    cadeiasCausais,
    eixoEstruturante,
    eixosSecundarios: eixosSecundariosIds,
    diagnosticoSintese,
    eixosComQualitativo,
  } = determinarCadeiasCausaisFuncionais(eixosPontuados, analiseQualitativa, input);

  // Ordenar eixos considerando tanto a pontuação objetiva quanto o peso qualitativo das respostas abertas
  const eixosOrdenados = [...eixosComQualitativo].sort((a, b) => b.percentual - a.percentual);

  const eixosSecundarios = eixosSecundariosIds.map((id) => {
    const e = eixosComQualitativo.find((item) => item.eixoId === id)!;
    return `${e.nome} (${e.percentual}%)`;
  });

  const relacoesEncontradas = cadeiasCausais.map((c) => c.expressaoFormatada);

  // 4. ANÁLISE DA PERCEPÇÃO CORPORAL (Regra 10)
  const analiseCorporal = analisarPercepcaoCorporal(input.regioesCorporaisPercebidas);

  // 5. DETERMINAÇÃO DAS REGRAS DE ESTABILIZAÇÃO VS MOVIMENTO (Regras 15 e 16)
  const eixoSeguranca = eixosComQualitativo.find((e) => e.eixoId === 'seguranca')!;
  const eixoMente = eixosComQualitativo.find((e) => e.eixoId === 'mente')!;
  const eixoVitalidade = eixosComQualitativo.find((e) => e.eixoId === 'vitalidade')!;

  const requerEstabilizacaoUrgente =
    eixoSeguranca.percentual >= 60 ||
    eixoMente.percentual >= 75 ||
    analiseQualitativa.urgenciaEstabilizacaoQualitativa ||
    analiseQualitativa.clustersSemanticos.some(
      (c) => c.nomeCluster.includes('Medo') || c.nomeCluster.includes('Exaustão')
    ) ||
    input.sensibilidadeEnergetica === 'muito_alta';

  const vitalidadeSuficienteParaEstímulo =
    eixoVitalidade.percentual <= 65 &&
    eixoSeguranca.percentual < 75 &&
    !analiseQualitativa.clustersSemanticos.some((c) => c.nomeCluster.includes('Exaustão'));

  // 6. MOTOR DE COMPATIBILIDADE DA BIBLIOTECA-MESTRA (Regras 3, 4, 11, 12, 13, 17)
  // Cruza eixos objetivos + modulações qualitativas + convergências diretas da biblioteca
  const sistemasCompativeis = cruzarComBibliotecaMestra(
    bibliotecaAtiva,
    eixosComQualitativo,
    eixoEstruturante,
    requerEstabilizacaoUrgente,
    vitalidadeSuficienteParaEstímulo,
    analiseQualitativa,
    cadeiasCausais
  );

  // 7. SELEÇÃO DA COMPOSIÇÃO: BASE, PRINCIPAL E COMPLEMENTARES
  const {
    sistemaBase,
    sistemaPrincipal,
    sistemasComplementares,
    sistemasNaoUtilizados,
    recursosConsolidados,
  } = selecionarComposicaoFinal(
    sistemasCompativeis,
    eixoEstruturante,
    eixosOrdenados,
    requerEstabilizacaoUrgente,
    vitalidadeSuficienteParaEstímulo,
    analiseCorporal,
    cadeiasCausais,
    analiseQualitativa
  );

  // 8. CONSTRUÇÃO DA SEQUÊNCIA TERAPÊUTICO-ENERGÉTICA (Regra 14)
  const sequenciaTerapeutica = construirSequenciaTerapeutica(
    sistemaBase,
    sistemaPrincipal,
    sistemasComplementares,
    recursosConsolidados,
    requerEstabilizacaoUrgente
  );

  // 9. RESPOSTAS DETERMINANTES
  const respostasDeterminantes = identificarRespostasDeterminantes(input.respostasObjetivas);

  // 10. CONSTRUÇÃO DA INTENÇÃO PERSONALIZADA
  const intencaoDaPratica = construirIntencaoPersonalizada(
    input.nomePessoa,
    eixoEstruturante,
    sistemaPrincipal.nome,
    input.intencaoDeclarada,
    requerEstabilizacaoUrgente
  );

  // 11. GERAÇÃO DA SAÍDA 1: RESULTADO DA PESSOA (Regras 2, 18, 19)
  const resultadoPessoa = gerarResultadoPessoa(
    input,
    eixosOrdenados,
    sistemaBase.nome,
    sistemaPrincipal.nomeComRecursos,
    sistemasComplementares.map((c: { nomeComRecursos: string }) => c.nomeComRecursos),
    intencaoDaPratica,
    recursosConsolidados,
    requerEstabilizacaoUrgente,
    cadeiasCausais,
    analiseQualitativa
  );

  // 12. GERAÇÃO DA SAÍDA 2: RELATÓRIO TÉCNICO DO EVERTON (Regras 20, 23)
  const relatorioEverton = gerarRelatorioTecnicoEverton(
    input,
    eixosOrdenados,
    eixoEstruturante,
    eixosSecundarios,
    relacoesEncontradas,
    respostasDeterminantes,
    analiseQualitativa,
    analiseCorporal,
    sistemaBase,
    sistemaPrincipal,
    sistemasComplementares,
    recursosConsolidados,
    sistemasNaoUtilizados,
    sequenciaTerapeutica,
    diagnosticoSintese,
    cadeiasCausais
  );

  // 13. GERAÇÃO DO JSON ESTRUTURADO (Regra 21)
  const jsonExport = gerarJsonEstruturado(
    eixosComQualitativo,
    eixoEstruturante,
    eixosSecundarios,
    sistemaBase,
    sistemaPrincipal,
    sistemasComplementares,
    recursosConsolidados,
    sistemasNaoUtilizados,
    sequenciaTerapeutica,
    intencaoDaPratica,
    resultadoPessoa,
    relatorioEverton,
    cadeiasCausais,
    analiseQualitativa
  );

  return {
    resultadoPessoa,
    relatorioEverton,
    jsonExport,
  };
}

/**
 * Calcula a pontuação e percentual dos 20 eixos a partir do questionário
 */
function calcularPontuacaoEixos(respostas: Record<string, number>): EixoResultado[] {
  const pontuacoesBrutas: Record<EixoId, number> = {} as Record<EixoId, number>;
  const pontuacoesMaximas: Record<EixoId, number> = {} as Record<EixoId, number>;

  // Inicializa todos os 20 eixos
  LISTA_EIXOS_IDS.forEach((id) => {
    pontuacoesBrutas[id] = 0;
    pontuacoesMaximas[id] = 0;
  });

  // Percorre as perguntas cadastradas e seus pesos
  PERGUNTAS_ANAMNESE.forEach((pergunta) => {
    const respostaValor = respostas[pergunta.id] ?? 0; // 0 a 4

    Object.entries(pergunta.pesosEixos).forEach(([eixoStr, peso]) => {
      const eixoId = eixoStr as EixoId;
      if (pontuacoesBrutas[eixoId] !== undefined && peso !== undefined) {
        pontuacoesBrutas[eixoId] += respostaValor * peso;
        pontuacoesMaximas[eixoId] += 4 * peso; // Resposta máxima é 4
      }
    });
  });

  return LISTA_EIXOS_IDS.map((eixoId) => {
    const def = EIXOS_DEFINITIONS[eixoId];
    const bruta = pontuacoesBrutas[eixoId] || 0;
    const max = pontuacoesMaximas[eixoId] || 1;
    const percentual = Math.round((bruta / max) * 100);

    let nivel: 'leve' | 'moderado' | 'elevado' | 'muito_elevado' = 'leve';
    if (percentual >= 75) nivel = 'muito_elevado';
    else if (percentual >= 50) nivel = 'elevado';
    else if (percentual >= 25) nivel = 'moderado';

    return {
      eixoId,
      nome: def.nome,
      pontuacaoBruta: bruta,
      pontuacaoMaxima: max,
      percentual,
      nivel,
    };
  });
}

/**
 * Análise de percepção corporal (Regra 10)
 */
function analisarPercepcaoCorporal(regioesIds: string[]) {
  const regioesDetalhadas = REGIOES_CORPORAIS.filter((r) => regioesIds.includes(r.id));

  const chakrasSet = new Set<string>();
  const eixosSet = new Set<EixoId>();

  regioesDetalhadas.forEach((r) => {
    r.chakrasCorrespondentes.forEach((c) => chakrasSet.add(c));
    r.eixosRelacionados.forEach((e) => eixosSet.add(e));
  });

  const leituraEnergetica =
    regioesDetalhadas.length > 0
      ? `As sensações percebidas em ${regioesDetalhadas.map((r) => r.nome).join(', ')} ressoam energeticamente com os centros ${Array.from(chakrasSet).join(' e ')}. Essas regiões serão priorizadas na ancoragem e na ordem de aplicação dos recursos vibracionais, sem conotação diagnóstica de doença.`
      : 'Percepção corporal difusa ou sem pontos focais de dor aguda relatados.';

  return {
    regioes: regioesDetalhadas.map((r) => r.nome),
    chakrasCorrespondentes: Array.from(chakrasSet),
    eixosRelacionados: Array.from(eixosSet),
    leituraEnergetica,
  };
}

/**
 * Cruzamento com a Biblioteca-Mestra (Regras 3, 4, 11, 15, 16)
 * Nenhum sistema é ignorado. Filtra NAO_UTILIZAR.
 */
interface SistemaPontuado {
  sistema: SistemaBiblioteca;
  compatibilidadeTotal: number;
  scoreEixoEstruturante: number;
  motivoCompatibilidade: string;
}

function cruzarComBibliotecaMestra(
  biblioteca: SistemaBiblioteca[],
  eixosPontuados: EixoResultado[],
  eixoEstruturante: EixoId,
  requerEstabilizacao: boolean,
  vitalidadeSuficiente: boolean,
  analiseQualitativa: AnaliseQualitativaProfunda,
  cadeiasCausais: CadeiaCausalFuncional[]
): SistemaPontuado[] {
  const sistemasValidos = biblioteca.filter((s) => s.status !== 'NAO_UTILIZAR');

  const mapaEixos = new Map<EixoId, number>();
  eixosPontuados.forEach((e) => mapaEixos.set(e.eixoId, e.percentual));

  return sistemasValidos.map((sistema) => {
    let compatibilidadeTotal = 0;
    const motivos: string[] = [];

    // Cruzar compatibilidade com cada eixo cadastrado
    Object.entries(sistema.compatibilidadeEixos).forEach(([eixoStr, pesoCompativel]) => {
      const eixoId = eixoStr as EixoId;
      const percentualEixo = mapaEixos.get(eixoId) || 0;
      if (pesoCompativel && percentualEixo > 0) {
        const fator = (percentualEixo / 100) * pesoCompativel * 25; // 0 a 100
        compatibilidadeTotal += fator;
        if (percentualEixo >= 50 && pesoCompativel >= 3) {
          motivos.push(`${EIXOS_DEFINITIONS[eixoId]?.nome || eixoId} (afinidade ${pesoCompativel}/4)`);
        }
      }
    });

    const scoreEixoEstruturante = sistema.compatibilidadeEixos[eixoEstruturante] || 0;

    // Regra 15 e 16: penalizar ou bonificar baseado no estado de estabilização
    if (requerEstabilizacao && sistema.ehEstimulanteAtivo) {
      compatibilidadeTotal *= 0.55; // Reduz prioridade temporariamente para respeitar a regra de estabilização
    }
    if (requerEstabilizacao && sistema.ehBaseSustentacao) {
      compatibilidadeTotal *= 1.35; // Bonifica sistemas de aterramento e acolhimento
    }
    if (!vitalidadeSuficiente && sistema.ehEstimulanteAtivo) {
      compatibilidadeTotal *= 0.45; // Não estimular quem não tem energia basal
    }

    // Convergências semânticas identificadas nas respostas abertas (Regra 9 + Regra 12)
    const convergenciasDoSistema = analiseQualitativa.convergenciasBiblioteca.filter(
      (c) => c.cursoOrigem.toLowerCase().includes(sistema.nome.toLowerCase()) ||
             sistema.curso.toLowerCase().includes(c.cursoOrigem.toLowerCase())
    );
    if (convergenciasDoSistema.length > 0) {
      compatibilidadeTotal += 15;
      convergenciasDoSistema.forEach((c) => {
        motivos.push(`Convergência semântica: "${c.expressaoRelatada}"`);
      });
    }

    // Resposta direta à causa funcional identificada (Regra 7)
    if (cadeiasCausais.length > 0) {
      const recomendados = cadeiasCausais[0].recursosBibliotecaRecomendados;
      const ehRecomendado = recomendados.some((r) => r.sistemaId === sistema.id);
      if (ehRecomendado) {
        compatibilidadeTotal += 15;
        motivos.push(`Ação direta na causa raiz: ${cadeiasCausais[0].origemRaiz}`);
      }
    }

    // Sistemas com Formação Confirmada possuem preferência técnica
    if (sistema.status === 'FORMAÇÃO_CONFIRMADA') {
      compatibilidadeTotal += 10;
    } else if (sistema.status === 'AGUARDANDO_VALIDACAO') {
      compatibilidadeTotal *= 0.7; // Reduz para evitar uso automático sem documentação
    }

    return {
      sistema,
      compatibilidadeTotal: Math.round(compatibilidadeTotal),
      scoreEixoEstruturante,
      motivoCompatibilidade: motivos.join(', ') || 'Afinidade geral com os eixos da anamnese.',
    };
  });
}

/**
 * Seleciona a composição final (Regras 12, 13, 17)
 */
function selecionarComposicaoFinal(
  sistemasPontuados: SistemaPontuado[],
  eixoEstruturante: EixoId,
  eixosOrdenados: EixoResultado[],
  requerEstabilizacao: boolean,
  vitalidadeSuficiente: boolean,
  analiseCorporal: { regioes: string[]; chakrasCorrespondentes: string[] },
  cadeiasCausais: CadeiaCausalFuncional[],
  analiseQualitativa: AnaliseQualitativaProfunda
) {
  // Ordenar por compatibilidade decrescente
  const ordenados = [...sistemasPontuados].sort((a, b) => b.compatibilidadeTotal - a.compatibilidadeTotal);

  // 1. SISTEMA-BASE (Sustentação geral)
  const candidatosBase = ordenados.filter((s) => s.sistema.ehBaseSustentacao);
  const selecionadoBase =
    candidatosBase.find((s) => s.sistema.id === 'original_reiki_platinum') ||
    candidatosBase[0] ||
    ordenados[0];

  // 2. SISTEMA PRINCIPAL (Recurso mais diretamente relacionado à necessidade predominante)
  // Não pode ser o mesmo do sistema base, salvo se não houver outro com formação confirmada
  const candidatosPrincipal = ordenados.filter(
    (s) => s.sistema.id !== selecionadoBase.sistema.id && s.sistema.status !== 'AGUARDANDO_VALIDACAO'
  );

  // Se houver recomendação direta da cadeia causal para o sistema principal
  let selecionadoPrincipal = candidatosPrincipal[0];
  if (cadeiasCausais.length > 0) {
    const recomendacaoCadeia = cadeiasCausais[0].recursosBibliotecaRecomendados[0];
    const matchCadeia = candidatosPrincipal.find((s) => s.sistema.id === recomendacaoCadeia?.sistemaId);
    if (matchCadeia) {
      selecionadoPrincipal = matchCadeia;
    }
  }

  // Se requer estabilização urgente, assegura preferência a Karuna Ki ou acolhimento
  if (requerEstabilizacao) {
    const karuna = candidatosPrincipal.find((s) => s.sistema.id === 'karuna_ki');
    if (karuna && karuna.compatibilidadeTotal >= 40) {
      selecionadoPrincipal = karuna;
    }
  }

  // Especificar recursos internos do sistema principal (Regra 12)
  const recursosSugeridosNomes = cadeiasCausais.flatMap((c) =>
    c.recursosBibliotecaRecomendados.map((r) => r.recursoNome)
  );

  const recursosPrincipal = selecionarRecursosEspecificos(
    selecionadoPrincipal.sistema,
    eixoEstruturante,
    recursosSugeridosNomes
  );
  const nomePrincipalFormatado = `${selecionadoPrincipal.sistema.nome} — ${recursosPrincipal.map((r) => r.nome).join(' + ')}`;

  // 3. SISTEMAS COMPLEMENTARES (1 e opcionalmente 2)
  const candidatosComplementares = ordenados.filter(
    (s) =>
      s.sistema.id !== selecionadoBase.sistema.id &&
      s.sistema.id !== selecionadoPrincipal.sistema.id &&
      s.sistema.status !== 'AGUARDANDO_VALIDACAO'
  );

  const complementaresSelecionados: {
    nome: string;
    nomeComRecursos: string;
    cursoOrigem: string;
    recursoEspecifico: string;
    funcao: string;
    origemDoc: string;
    sistema: SistemaBiblioteca;
  }[] = [];

  if (candidatosComplementares.length > 0) {
    const comp1 = candidatosComplementares[0];
    const eixoSecundarioTopo = eixosOrdenados.find(
      (e) => e.eixoId !== eixoEstruturante && comp1.sistema.compatibilidadeEixos[e.eixoId]
    );
    const recursosComp1 = selecionarRecursosEspecificos(
      comp1.sistema,
      eixoSecundarioTopo?.eixoId || eixoEstruturante,
      recursosSugeridosNomes
    );
    const nomeComp1Formatado = `${comp1.sistema.nome} — ${recursosComp1.map((r) => r.nome).join(' + ')}`;

    complementaresSelecionados.push({
      nome: comp1.sistema.nome,
      nomeComRecursos: nomeComp1Formatado,
      cursoOrigem: comp1.sistema.curso,
      recursoEspecifico: recursosComp1.map((r) => r.nome).join('; '),
      funcao: `Atua no eixo ${eixoSecundarioTopo?.nome || 'secundário'} trazendo equilíbrio e descompressão.`,
      origemDoc: `${comp1.sistema.origemDocumental.idDocumento} (${comp1.sistema.origemDocumental.curso})`,
      sistema: comp1.sistema,
    });
  }

  // Complementar 2 somente quando estritamente necessário (Regra 13 & 27 - Princípio de Parcimônia)
  // Exemplo: se houver forte desequilíbrio de proteção áurica e houver Cristaloterapia
  if (
    candidatosComplementares.length > 1 &&
    (eixosOrdenados.some((e) => (e.eixoId === 'protecao' || e.eixoId === 'corpo') && e.percentual >= 60))
  ) {
    const cristal = candidatosComplementares.find((s) => s.sistema.id === 'cristaloterapia_integrativa');
    if (cristal && !complementaresSelecionados.some((c) => c.nome === cristal.sistema.nome)) {
      const recursosCristal = selecionarRecursosEspecificos(cristal.sistema, 'protecao');
      complementaresSelecionados.push({
        nome: cristal.sistema.nome,
        nomeComRecursos: `${cristal.sistema.nome} — ${recursosCristal.map((r) => r.nome).join(' + ')}`,
        cursoOrigem: cristal.sistema.curso,
        recursoEspecifico: recursosCristal.map((r) => r.nome).join('; '),
        funcao: 'Ancoragem física e sustentação passiva das frequências corporais.',
        origemDoc: `${cristal.sistema.origemDocumental.idDocumento} (${cristal.sistema.origemDocumental.curso})`,
        sistema: cristal.sistema,
      });
    }
  }

  // 4. SISTEMAS CONSIDERADOS E NÃO UTILIZADOS (Regra 17)
  const idsUsados = new Set([
    selecionadoBase.sistema.id,
    selecionadoPrincipal.sistema.id,
    ...complementaresSelecionados.map((c) => c.sistema.id),
  ]);

  const sistemasNaoUtilizados: SistemaNaoPriorizado[] = ordenados
    .filter((s) => !idsUsados.has(s.sistema.id))
    .map((s) => {
      let porQueNao = 'Não prioritário na sessão atual pelo princípio de parcimônia.';
      let quandoReconsiderar = 'Em sessões futuras caso a queixa se desloque para seu foco específico.';

      if (s.sistema.status === 'AGUARDANDO_VALIDACAO') {
        porQueNao = 'Sistema com material na biblioteca, porém com pendência documental de validação formal.';
        quandoReconsiderar = 'Após confirmação de formação ou validação documental pelo Everton.';
      } else if (requerEstabilizacao && s.sistema.ehEstimulanteAtivo) {
        porQueNao = 'Possui perfil fortemente estimulante; a pessoa necessita de estabilização e redução do medo antes de receber estímulos de ação.';
        quandoReconsiderar = 'Na fase de movimento ou após estabilização dos eixos de medo e estresse.';
      } else if (!vitalidadeSuficiente && s.sistema.ehEstimulanteAtivo) {
        porQueNao = 'Pessoa apresenta exaustão física/vital; estímulos sem energia de reserva poderiam acentuar a sobrecarga.';
        quandoReconsiderar = 'Após 2 a 3 semanas de reabastecimento basal com Original Reiki Platinum.';
      }

      return {
        nome: s.sistema.nome,
        compatibilidade: s.compatibilidadeTotal,
        porQuePontuou: s.motivoCompatibilidade,
        porQueNaoFoiPriorizado: porQueNao,
        quandoPoderaSerReconsiderado: quandoReconsiderar,
      };
    });

  // 5. RECURSOS INTERNOS CONSOLIDADOS (Símbolos, cristais, frequências, comandos, chakras)
  const recursosConsolidados = {
    simbolos: [
      ...selecionadoBase.sistema.simbolos,
      ...recursosPrincipal.filter((r) => r.tipo === 'símbolo').map((r) => r.nome),
      ...complementaresSelecionados.flatMap((c) => c.sistema.simbolos),
    ].filter((val, i, arr) => arr.indexOf(val) === i && !val.includes('Sem símbolos')),
    energias: [
      ...selecionadoBase.sistema.energias,
      ...selecionadoPrincipal.sistema.energias,
      ...complementaresSelecionados.flatMap((c) => c.sistema.energias),
    ].filter((val, i, arr) => arr.indexOf(val) === i),
    frequencias: [
      ...selecionadoBase.sistema.frequencias,
      ...selecionadoPrincipal.sistema.frequencias,
      ...complementaresSelecionados.flatMap((c) => c.sistema.frequencias),
    ].filter((val, i, arr) => arr.indexOf(val) === i),
    comandos: [
      ...selecionadoBase.sistema.comandos,
      ...selecionadoPrincipal.sistema.comandos,
      ...complementaresSelecionados.flatMap((c) => c.sistema.comandos),
    ].filter((val, i, arr) => arr.indexOf(val) === i),
    cristais: [
      ...selecionadoBase.sistema.cristais,
      ...selecionadoPrincipal.sistema.cristais,
      ...complementaresSelecionados.flatMap((c) => c.sistema.cristais),
    ].filter((val, i, arr) => arr.indexOf(val) === i),
    chakras: [
      ...selecionadoBase.sistema.chakras,
      ...selecionadoPrincipal.sistema.chakras,
      ...analiseCorporal.chakrasCorrespondentes,
    ].filter((val, i, arr) => arr.indexOf(val) === i),
  };

  return {
    sistemaBase: {
      nome: selecionadoBase.sistema.nome,
      justificativa:
        'Fornece matriz de sustentação neutra, evitando quedas energéticas e ancorando o campo antes do trabalho específico.',
      origemDoc: `${selecionadoBase.sistema.origemDocumental.idDocumento} — ${selecionadoBase.sistema.origemDocumental.paginaSecao || 'Manual de Mestrado'}`,
    },
    sistemaPrincipal: {
      nome: selecionadoPrincipal.sistema.nome,
      nomeComRecursos: nomePrincipalFormatado,
      cursoOrigem: selecionadoPrincipal.sistema.curso,
      recursoEspecifico: recursosPrincipal.map((r) => r.nome).join(' + '),
      compatibilidade: selecionadoPrincipal.compatibilidadeTotal,
      justificativa: `Maior compatibilidade funcional com o eixo estruturante (${EIXOS_DEFINITIONS[eixoEstruturante].nome}) e necessidades declaradas.`,
      origemDoc: `${selecionadoPrincipal.sistema.origemDocumental.idDocumento} — ${selecionadoPrincipal.sistema.origemDocumental.paginaSecao || 'Manual Oficial'}`,
    },
    sistemasComplementares: complementaresSelecionados,
    sistemasNaoUtilizados,
    recursosConsolidados,
  };
}

/**
 * Seleciona recursos internos específicos de um sistema baseado no eixo e causalidade funcional (Regra 12)
 */
function selecionarRecursosEspecificos(
  sistema: SistemaBiblioteca,
  eixo: EixoId,
  recursosSugeridos?: string[]
) {
  if (!sistema.recursosInternos || sistema.recursosInternos.length === 0) {
    return [
      {
        nome: `${sistema.nome} (Ativação Geral)`,
        tipo: 'energia' as const,
        descricao: 'Ativação global do sistema sem módulo específico discriminado.',
        eixosCompatíveis: [eixo],
      },
    ];
  }

  // Se houver recursos sugeridos pela análise qualitativa ou causal funcional, prioriza-os
  if (recursosSugeridos && recursosSugeridos.length > 0) {
    const correspondentes = sistema.recursosInternos.filter((r) =>
      recursosSugeridos.some((sug) =>
        r.nome.toLowerCase().includes(sug.toLowerCase()) || sug.toLowerCase().includes(r.nome.toLowerCase())
      )
    );
    if (correspondentes.length > 0) {
      return correspondentes.slice(0, 2);
    }
  }

  // Filtrar recursos que atuam no eixo
  const compativeis = sistema.recursosInternos.filter((r) => r.eixosCompatíveis.includes(eixo));
  if (compativeis.length > 0) {
    return compativeis.slice(0, 2); // máximo 2 recursos específicos para não sobrecarregar
  }

  return sistema.recursosInternos.slice(0, 2);
}

/**
 * Constrói a sequência terapêutico-energética passo a passo (Regra 14)
 */
function construirSequenciaTerapeutica(
  sistemaBase: { nome: string; justificativa: string },
  sistemaPrincipal: { nome: string; nomeComRecursos: string; recursoEspecifico: string },
  sistemasComplementares: { nome: string; nomeComRecursos: string; recursoEspecifico: string }[],
  recursos: { cristais: string[]; simbolos: string[]; comandos: string[] },
  requerEstabilizacao: boolean
): EtapaSequencia[] {
  const sequencia: EtapaSequencia[] = [
    {
      ordem: 1,
      fase: 'Preparação',
      sistemaOuTecnica: 'Abertura do Campo & Respiração Consciente',
      recursoEspecifico: 'Alinhamento em silêncio ou Kotodama de harmonia',
      objetivo: 'Desaceleração sensorial, acolhimento do momento presente e relaxamento da respiração diafragmática.',
      sinaisObservar: 'Respiração tornando-se mais lenta, queda de tensão na mandíbula e relaxamento dos ombros.',
      duracaoMinutos: 5,
    },
    {
      ordem: 2,
      fase: 'Aterramento',
      sistemaOuTecnica: 'Ancoragem Telúrica & Apoio de Cristais',
      recursoEspecifico: recursos.cristais.slice(0, 2).join(' e ') || 'Turmalina Negra e Quartzo Fumê nos pés',
      objetivo: 'Conectar a consciência ao corpo físico, trazendo segurança e sensação de sustentação no chão.',
      sinaisObservar: 'Sensação de calor ou formigamento suave nos pés e pernas.',
      duracaoMinutos: 5,
    },
    {
      ordem: 3,
      fase: 'Proteção',
      sistemaOuTecnica: 'Selamento Áurico & Malha Protetora',
      recursoEspecifico: 'Selamento áurico circular com intenção compassiva',
      objetivo: 'Preservar a intimidade do campo energético durante o processo e filtrar interferências externas.',
      sinaisObservar: 'Sensação de casulo protetor suave, redução de alertas periféricos.',
      duracaoMinutos: 5,
    },
    {
      ordem: 4,
      fase: 'Sistema-base',
      sistemaOuTecnica: sistemaBase.nome,
      recursoEspecifico: 'Sustentação Contínua da Matriz Celular',
      objetivo: 'Fornecer matriz estável e neutra de energia para sustentar as etapas seguintes sem desgaste.',
      sinaisObservar: 'Sensação de peso agradável e alívio do cansaço crônico.',
      duracaoMinutos: 10,
    },
    {
      ordem: 5,
      fase: 'Trabalho principal',
      sistemaOuTecnica: sistemaPrincipal.nome,
      recursoEspecifico: sistemaPrincipal.recursoEspecifico,
      objetivo: `Atuação direta no eixo estruturante prioritário com acolhimento das camadas emocionais profundas.`,
      sinaisObservar: 'Suspiro espontâneo, liberação de nós no peito ou estômago, sensação de espaço interno.',
      duracaoMinutos: 20,
    },
  ];

  let ordemAtual = 6;

  // Complementação se houver
  sistemasComplementares.forEach((comp) => {
    sequencia.push({
      ordem: ordemAtual++,
      fase: 'Complementação',
      sistemaOuTecnica: comp.nome,
      recursoEspecifico: comp.recursoEspecifico,
      objetivo: 'Harmonizar os eixos secundários e consolidar o fluxo energético.',
      sinaisObservar: 'Sensação de fluidez, diminuição de pensamentos recorrentes e clareza serena.',
      duracaoMinutos: 10,
    });
  });

  sequencia.push(
    {
      ordem: ordemAtual++,
      fase: 'Integração',
      sistemaOuTecnica: 'Integração Sutil & Alinhamento dos Chakras',
      recursoEspecifico: 'Varredura áurica suave da cabeça aos pés',
      objetivo: 'Unificar as frequências trabalhadas, garantindo que o corpo assimile a sessão harmonicamente.',
      sinaisObservar: 'Expressão facial serena, sensação de inteireza e harmonia global.',
      duracaoMinutos: 5,
    },
    {
      ordem: ordemAtual++,
      fase: 'Fechamento',
      sistemaOuTecnica: 'Selamento Final & Retorno Suave',
      recursoEspecifico: 'Respiração profunda e retorno gradual dos movimentos',
      objetivo: 'Encerrar o campo com firmeza e ancorar o aprendizado corporal no dia a dia.',
      sinaisObservar: 'Abertura suave dos olhos, presença clara e disposição tranquila.',
      duracaoMinutos: 5,
    },
    {
      ordem: ordemAtual,
      fase: 'Reavaliação',
      sistemaOuTecnica: 'Registro Clínico Pós-Sessão (Módulo de Reavaliação)',
      recursoEspecifico: 'Escuta das percepções corporais e comparação das 9 variáveis',
      objetivo: 'Medir a evolução clínica e verificar necessidade de manter ou ajustar o plano na próxima sessão.',
      sinaisObservar: 'Relato espontâneo da pessoa sobre como se sente no momento presente.',
      duracaoMinutos: 5,
    }
  );

  return sequencia;
}

/**
 * Identifica as perguntas que mais influenciaram a pontuação
 */
function identificarRespostasDeterminantes(respostas: Record<string, number>) {
  const determinantes: { pergunta: string; respostaNivel: number; eixosAfetados: string }[] = [];

  PERGUNTAS_ANAMNESE.forEach((p) => {
    const valor = respostas[p.id] ?? 0;
    if (valor >= 3) {
      const eixosNomes = Object.keys(p.pesosEixos)
        .map((k) => EIXOS_DEFINITIONS[k as EixoId]?.nome || k)
        .join(', ');

      determinantes.push({
        pergunta: p.texto,
        respostaNivel: valor,
        eixosAfetados: eixosNomes,
      });
    }
  });

  return determinantes.slice(0, 5); // top 5 mais determinantes
}

/**
 * Constrói a intenção personalizada da prática
 */
function construirIntencaoPersonalizada(
  nome: string,
  eixoEstruturante: EixoId,
  sistemaPrincipal: string,
  intencaoDeclarada: string,
  requerEstabilizacao: boolean
) {
  if (requerEstabilizacao) {
    return 'Criar um espaço seguro, acolhedor e sustentado para que a tensão diminua, a mente descanse e o movimento possa surgir sem pressão ou medo.';
  }

  if (eixoEstruturante === 'autovalor' || eixoEstruturante === 'poder_pessoal') {
    return 'Reconectar com o valor intrínseco e a força serena do coração, permitindo que as decisões fluam com firmeza, clareza e autoaceitação.';
  }

  if (eixoEstruturante === 'emocional' || eixoEstruturante === 'limpeza') {
    return 'Acolher com gentileza as emoções acumuladas, soltar pesos que não pertencem ao presente e abrir espaço para o recomeço com leveza.';
  }

  return 'Harmonizar os centros vitais e restabelecer a coerência entre mente, coração e corpo para viver o momento presente com paz e clareza.';
}

/**
 * GERA A SAÍDA 1: RESULTADO DA PESSOA (Regras 2, 18, 19)
 */
function gerarResultadoPessoa(
  input: AnamneseInput,
  eixosOrdenados: EixoResultado[],
  nomeBase: string,
  nomePrincipalComRecursos: string,
  nomesComplementares: string[],
  intencao: string,
  recursos: { cristais: string[] },
  requerEstabilizacao: boolean,
  cadeiasCausais: CadeiaCausalFuncional[],
  analiseQualitativa: AnaliseQualitativaProfunda
): ResultadoPessoa {
  const principaisEixos = eixosOrdenados.slice(0, 3);
  const primeiroNome = input.nomePessoa ? input.nomePessoa.split(' ')[0] : 'você';

  // Texto acolhedor de "Seu momento" integrando o entendimento causal humano
  let seuMomento = `Olá, ${primeiroNome}. Suas respostas e relatos indicam que, neste momento, sua energia está pedindo um olhar atencioso de acolhimento e sustentação. `;
  
  if (cadeiasCausais.length > 0) {
    const causa = cadeiasCausais[0];
    seuMomento += `Compreendemos que quando você percebe ${causa.sintomaVisivel.toLowerCase()}, isso não acontece por falta de vontade ou desatenção: o seu organismo está reagindo de forma protetora a uma sensação interna de ${causa.origemRaiz.toLowerCase()}. É natural que o corpo procure desacelerar ou recuar quando sente que precisa de mais segurança. `;
  } else if (requerEstabilizacao) {
    seuMomento += 'Percebemos sinais de que você tem dedicado parte significativa da sua energia para antecipar cenários, sustentar responsabilidades ou manter tudo sob controle. Embora exista um desejo genuíno de realizar e avançar, seu corpo e suas emoções pedem primeiro uma base firme de segurança e descanso interno. ';
  } else {
    seuMomento += 'Suas respostas revelam clareza e disposição para avançar, acompanhadas da necessidade de organizar o fluxo das ideias e alinhar a autoconfiança com o seu ritmo natural, sem sobrecarga. ';
  }

  // Validação dos fatores internos preservados
  if (analiseQualitativa.fatoresPreservados.recursosInternosPreservados.length > 0) {
    const recursosTexto = analiseQualitativa.fatoresPreservados.recursosInternosPreservados.join(', ');
    seuMomento += `Ao mesmo tempo, é muito especial observar que suas forças essenciais continuam ativas (${recursosTexto}). O trabalho que faremos agora visa justamente criar o solo seguro para que esse potencial volte a se expressar sem esforço excessivo.`;
  }

  // "O que parece estar pedindo cuidado"
  const cuidadosLista = principaisEixos.map((e) => e.nome.toLowerCase()).join(', ');
  const oQueParecePedirCuidado = `Há sinais de que as áreas relacionadas a ${cuidadosLista} estão pedindo maior carinho e descompressão. Quando essas áreas recebem o suporte adequado, a sensação de peso diminui naturalmente, abrindo espaço para mais serenidade, confiança e leveza no seu dia a dia.`;

  // Proposta energética
  const propostaEnergetica = {
    base: nomeBase,
    principal: nomePrincipalComRecursos,
    complementar1: nomesComplementares[0],
    complementar2: nomesComplementares[1],
  };

  // Por que esta composição foi escolhida
  const porQueEstaComposicao = `Esta composição foi pensada para respeitar exatamente o seu momento atual. O sistema-base (${nomeBase}) cria uma ancoragem neutra e segura, garantindo que você se sinta apoiado(a) do início ao fim. Em seguida, a prática principal (${nomePrincipalComRecursos}) atua diretamente na raiz do que foi sentido, desarmando o alerta com extremo respeito ao seu tempo. Os apoios complementares ajudam a integrar tudo de forma suave, sem pressa e duradoura.`;

  // Apoios sugeridos
  const apoiosSugeridos = {
    cristais: recursos.cristais.slice(0, 3),
    respiracao:
      'Respiração diafragmática 4-4-6 (inspirar em 4 tempos, reter em 4 tempos e soltar o ar devagar pela boca em 6 tempos, desarmando a tensão nos ombros).',
    meditacao:
      'Pausa de 5 minutos antes de dormir, pousando as mãos sobre o peito e percebendo os pés firmes, sem julgar os pensamentos que passam.',
    praticaComplementar:
      'Escalda-pés morno com sal marinho ou caminhada descalça na grama para renovar o contato com a terra.',
  };

  const mensagemFinal = `Lembre-se de que o cuidado consigo é um processo contínuo e gentil, sem pressa nem exigência de perfeição. Respeitar o seu tempo e acolher o seu ritmo já é o primeiro grande passo de cura e reintegração.`;

  return {
    seuMomento,
    oQueParecePedirCuidado,
    propostaEnergetica,
    porQueEstaComposicao,
    intencaoDaPratica: intencao,
    apoiosSugeridos,
    mensagemFinal,
  };
}

/**
 * GERA A SAÍDA 2: RELATÓRIO TÉCNICO DO EVERTON (Regras 20, 23)
 */
function gerarRelatorioTecnicoEverton(
  input: AnamneseInput,
  eixosOrdenados: EixoResultado[],
  eixoEstruturante: EixoId,
  eixosSecundarios: string[],
  relacoesEncontradas: string[],
  respostasDeterminantes: { pergunta: string; respostaNivel: number; eixosAfetados: string }[],
  analiseQualitativa: AnaliseQualitativaProfunda,
  analiseCorporal: ReturnType<typeof analisarPercepcaoCorporal>,
  sistemaBase: { nome: string; justificativa: string; origemDoc: string },
  sistemaPrincipal: {
    nome: string;
    nomeComRecursos: string;
    cursoOrigem: string;
    recursoEspecifico: string;
    compatibilidade: number;
    justificativa: string;
    origemDoc: string;
  },
  sistemasComplementares: {
    nome: string;
    nomeComRecursos: string;
    cursoOrigem: string;
    recursoEspecifico: string;
    funcao: string;
    origemDoc: string;
  }[],
  recursosConsolidados: {
    simbolos: string[];
    energias: string[];
    frequencias: string[];
    comandos: string[];
    cristais: string[];
    chakras: string[];
  },
  sistemasNaoUtilizados: SistemaNaoPriorizado[],
  sequenciaTerapeutica: EtapaSequencia[],
  diagnosticoSintese: string,
  cadeiasCausais: CadeiaCausalFuncional[]
): RelatorioTecnicoEverton {
  return {
    dadosAnalise: {
      nome: input.nomePessoa || 'Interagente Anônimo',
      data: input.data || new Date().toISOString().split('T')[0],
      idInterno: input.id || `ANAM-${Date.now().toString().slice(-6)}`,
    },
    eixosOrdenados,
    eixoEstruturante: `${EIXOS_DEFINITIONS[eixoEstruturante].nome} (${eixosOrdenados.find((e) => e.eixoId === eixoEstruturante)?.percentual || 0}%) — ${diagnosticoSintese}`,
    eixosSecundarios,
    relacoesEncontradas,
    respostasDeterminantes,
    analiseRelatoLivre: {
      palavrasRecorrentes: analiseQualitativa.palavrasRecorrentes,
      emocoesMencionadas: analiseQualitativa.emocoesMencionadas,
      situacoesRepetidas: input.relatoLivreDesafios || 'Tensão nos momentos de decisão.',
      conflitosMedos: input.relatoLivreDesafios || 'Medo de errar ou de não sustentar as expectativas.',
      fatoresPreservados: analiseQualitativa.fatoresPreservados.descricao,
      intencaoDeclarada: input.intencaoDeclarada || 'Buscar equilíbrio, clareza e reconexão com a própria força.',
    },
    analiseContextualAvancada: {
      cadeiasCausais: cadeiasCausais.map((c) => ({
        id: c.id,
        expressaoFormatada: c.expressaoFormatada,
        origemRaiz: c.origemRaiz,
        mecanismoIntermediario: c.mecanismoIntermediario,
        sintomaVisivel: c.sintomaVisivel,
        justificativaClinica: c.justificativaClinica,
        diretrizComposicao: c.diretrizComposicao,
      })),
      clustersQualitativos: analiseQualitativa.clustersSemanticos.map((cl) => ({
        nomeCluster: cl.nomeCluster,
        termosEncontrados: cl.termosEncontrados,
        pesoQualitativoAtribuido: cl.pesoQualitativoAtribuido,
        eixosAfetados: cl.eixosAfetados.map((e) => EIXOS_DEFINITIONS[e]?.nome || e),
      })),
      convergenciasBiblioteca: analiseQualitativa.convergenciasBiblioteca,
      fatoresPreservados: analiseQualitativa.fatoresPreservados,
    },
    regioesCorporais: {
      regioes: analiseCorporal.regioes,
      chakrasCorrespondentes: analiseCorporal.chakrasCorrespondentes,
      leituraEnergetica: analiseCorporal.leituraEnergetica,
    },
    sistemaBase: {
      nome: sistemaBase.nome,
      justificativa: sistemaBase.justificativa,
      origemDoc: sistemaBase.origemDoc,
    },
    sistemaPrincipal: {
      nome: sistemaPrincipal.nome,
      cursoOrigem: sistemaPrincipal.cursoOrigem,
      recursoEspecifico: sistemaPrincipal.recursoEspecifico,
      compatibilidade: sistemaPrincipal.compatibilidade,
      justificativa: sistemaPrincipal.justificativa,
      origemDoc: sistemaPrincipal.origemDoc,
    },
    sistemasComplementares: sistemasComplementares.map((c) => ({
      nome: c.nome,
      cursoOrigem: c.cursoOrigem,
      recursoEspecifico: c.recursoEspecifico,
      funcao: c.funcao,
      origemDoc: c.origemDoc,
    })),
    recursosInternos: recursosConsolidados,
    sistemasNaoUtilizados,
    composicaoFinalSequencia: sequenciaTerapeutica,
    oqueObservarPratica: [
      'Fluidez respiratória e eventuais suspiros ou bocejos durante o acolhimento do sistema-base.',
      'Mudança na temperatura das extremidades (mãos e pés aquecendo indicam boa ancoragem).',
      'Liberação de tensões na mandíbula, trapézio e plexo solar durante a aplicação do recurso principal.',
      'Sinais subjetivos de pacificação mental ou relatos de calor e acolhimento.',
    ],
    oqueReavaliar: [
      'Sensação de segurança e aterramento básico.',
      'Tranquilidade e alívio do estado de alerta/medo.',
      'Clareza mental e capacidade de focar sem angústia.',
      'Disposição física e vitalidade no retorno às atividades cotidianas.',
      'Percepção de dor ou tensão nas regiões corporais relatadas inicialmente.',
    ],
  };
}

/**
 * GERA O FORMATO ESTRUTURADO JSON (Regra 21)
 */
function gerarJsonEstruturado(
  eixosPontuados: EixoResultado[],
  eixoEstruturante: EixoId,
  eixosSecundarios: string[],
  sistemaBase: { nome: string; justificativa: string },
  sistemaPrincipal: { nome: string; recursoEspecifico: string; compatibilidade: number },
  sistemasComplementares: { nome: string; recursoEspecifico: string }[],
  recursos: RelatorioTecnicoEverton['recursosInternos'],
  sistemasNaoUtilizados: SistemaNaoPriorizado[],
  sequencia: EtapaSequencia[],
  intencao: string,
  resultadoPessoa: ResultadoPessoa,
  relatorioEverton: RelatorioTecnicoEverton,
  cadeiasCausais: CadeiaCausalFuncional[],
  analiseQualitativa: AnaliseQualitativaProfunda
): EstruturaJsonExport {
  const eixosMap: Record<EixoId, number> = {} as Record<EixoId, number>;
  eixosPontuados.forEach((e) => {
    eixosMap[e.eixoId] = e.percentual;
  });

  return {
    eixos: eixosMap,
    eixo_estruturante: EIXOS_DEFINITIONS[eixoEstruturante].nome,
    eixos_secundarios: eixosSecundarios,
    necessidade_principal: `Sustentação e harmonização do eixo ${EIXOS_DEFINITIONS[eixoEstruturante].nome}`,
    necessidades_secundarias: eixosSecundarios,
    sistemas_considerados: [
      { nome: sistemaBase.nome, score: 95 },
      { nome: sistemaPrincipal.nome, score: sistemaPrincipal.compatibilidade },
      ...sistemasComplementares.map((c) => ({ nome: c.nome, score: 80 })),
      ...sistemasNaoUtilizados.map((n) => ({ nome: n.nome, score: n.compatibilidade })),
    ],
    sistema_base: {
      nome: sistemaBase.nome,
      justificativa: sistemaBase.justificativa,
    },
    sistema_principal: {
      nome: sistemaPrincipal.nome,
      recursos: [sistemaPrincipal.recursoEspecifico],
      compatibilidade: sistemaPrincipal.compatibilidade,
    },
    sistemas_complementares: sistemasComplementares.map((c) => ({
      nome: c.nome,
      recursos: [c.recursoEspecifico],
    })),
    recursos: {
      simbolos: recursos.simbolos,
      energias: recursos.energias,
      frequencias: recursos.frequencias,
      cristais: recursos.cristais,
      chakras: recursos.chakras,
      praticas: ['Respiração diafragmática 4-4-6', 'Ancoragem de pés na terra'],
    },
    sistemas_nao_priorizados: sistemasNaoUtilizados,
    sequencia,
    intencao,
    cadeias_causais_funcionais: cadeiasCausais.map((c) => ({
      expressao: c.expressaoFormatada,
      origem_raiz: c.origemRaiz,
      mecanismo: c.mecanismoIntermediario,
      sintoma: c.sintomaVisivel,
      justificativa: c.justificativaClinica,
    })),
    clusters_qualitativos: analiseQualitativa.clustersSemanticos.map((cl) => ({
      nome: cl.nomeCluster,
      peso: cl.pesoQualitativoAtribuido,
      termos: cl.termosEncontrados,
    })),
    convergencias_biblioteca: analiseQualitativa.convergenciasBiblioteca.map((cb) => ({
      termo: cb.expressaoRelatada,
      recurso: cb.recursoSugerido,
      origem: cb.cursoOrigem,
    })),
    resultado_pessoa: resultadoPessoa,
    relatorio_everton: relatorioEverton,
  };
}
