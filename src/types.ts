/**
 * Anamnese Integrativa — Reintegração da Vida
 * Modelagem de Tipos do Sistema
 */

export type EixoId =
  | 'seguranca'
  | 'emocional'
  | 'autovalor'
  | 'mente'
  | 'movimento'
  | 'vitalidade'
  | 'corpo'
  | 'relacionamentos'
  | 'prazer'
  | 'criatividade'
  | 'limpeza'
  | 'padroes'
  | 'prosperidade'
  | 'poder_pessoal'
  | 'proposito'
  | 'espiritualidade'
  | 'protecao'
  | 'receber'
  | 'recomeco'
  | 'integracao';

export interface EixoDefinition {
  id: EixoId;
  nome: string;
  categoria: 'Fundação' | 'Emocional & Psíquico' | 'Ação & Vitalidade' | 'Relações & Expressão' | 'Espiritual & Integração';
  descricao: string;
  chakrasRelacionados: string[];
}

export type StatusSistema =
  | 'FORMAÇÃO_CONFIRMADA'
  | 'MATERIAL_CONFIRMADO'
  | 'AGUARDANDO_VALIDACAO'
  | 'NAO_UTILIZAR';

export interface RecursoInterno {
  nome: string;
  tipo: 'símbolo' | 'energia' | 'frequência' | 'comando' | 'módulo' | 'técnica';
  descricao: string;
  eixosCompatíveis: EixoId[];
  fonteDocumental?: string;
  pagina?: string;
}

export interface SistemaBiblioteca {
  id: string;
  nome: string;
  curso: string;
  linhagem: string;
  nivel: string;
  modulos: string[];
  simbolos: string[];
  energias: string[];
  frequencias: string[];
  comandos: string[];
  cristais: string[];
  chakras: string[];
  centrosEnergeticos: string[];
  objetivos: string;
  areasAtuacao: string[];
  recursosInternos: RecursoInterno[];
  metodosAtivacao: string[];
  formasAplicacao: string[];
  duracaoSugerida?: string;
  sistemasCompativeis: string[];
  sistemasComplementares: string[];
  restricoes: string[];
  cuidados: string[];
  origemDocumental: {
    idDocumento: string;
    curso: string;
    paginaSecao?: string;
    statusConfirmacao: string;
  };
  status: StatusSistema;
  compatibilidadeEixos: Partial<Record<EixoId, number>>; // 0 a 4
  ehBaseSustentacao?: boolean;
  ehEstimulanteAtivo?: boolean;
  requerEstabilizacaoPrevia?: boolean;
  prioridadePadrao?: number;
}

export interface PerguntaObjetiva {
  id: string;
  texto: string;
  categoria: string;
  pesosEixos: Partial<Record<EixoId, number>>;
  dicaAcolhedora?: string;
}

export interface RegiaoCorporal {
  id: string;
  nome: string;
  descricao: string;
  chakrasCorrespondentes: string[];
  eixosRelacionados: EixoId[];
}

export interface AnamneseInput {
  id: string;
  data: string;
  nomePessoa: string;
  idade?: string;
  contato?: string;
  historicoEnergetico?: string;
  intencaoDeclarada: string;
  respostasObjetivas: Record<string, number>; // Pergunta ID -> 0..4
  relatoLivreNecessidade: string;
  relatoLivreDesafios: string;
  relatoLivrePreservado: string;
  regioesCorporaisPercebidas: string[];
  preferenciasAtendimento?: string;
  sensibilidadeEnergetica?: 'baixa' | 'moderada' | 'alta' | 'muito_alta';
}

export interface EixoResultado {
  eixoId: EixoId;
  nome: string;
  pontuacaoBruta: number;
  pontuacaoMaxima: number;
  percentual: number;
  nivel: 'leve' | 'moderado' | 'elevado' | 'muito_elevado';
}

export interface SistemaNaoPriorizado {
  nome: string;
  compatibilidade: number;
  porQuePontuou: string;
  porQueNaoFoiPriorizado: string;
  quandoPoderaSerReconsiderado: string;
}

export interface EtapaSequencia {
  ordem: number;
  fase:
    | 'Preparação'
    | 'Aterramento'
    | 'Proteção'
    | 'Harmonização'
    | 'Sistema-base'
    | 'Trabalho principal'
    | 'Complementação'
    | 'Integração'
    | 'Fechamento'
    | 'Reavaliação';
  sistemaOuTecnica: string;
  recursoEspecifico?: string;
  objetivo: string;
  sinaisObservar: string;
  duracaoMinutos?: number;
}

export interface ResultadoPessoa {
  seuMomento: string;
  oQueParecePedirCuidado: string;
  propostaEnergetica: {
    base: string;
    principal: string;
    complementar1?: string;
    complementar2?: string;
  };
  porQueEstaComposicao: string;
  intencaoDaPratica: string;
  apoiosSugeridos: {
    cristais: string[];
    respiracao: string;
    meditacao: string;
    praticaComplementar: string;
  };
  mensagemFinal: string;
}

export interface RelatorioTecnicoEverton {
  dadosAnalise: {
    nome: string;
    data: string;
    idInterno: string;
  };
  eixosOrdenados: EixoResultado[];
  eixoEstruturante: string;
  eixosSecundarios: string[];
  relacoesEncontradas: string[];
  respostasDeterminantes: {
    pergunta: string;
    respostaNivel: number;
    eixosAfetados: string;
  }[];
  analiseRelatoLivre: {
    palavrasRecorrentes: string[];
    emocoesMencionadas: string[];
    situacoesRepetidas: string;
    conflitosMedos: string;
    fatoresPreservados: string;
    intencaoDeclarada: string;
  };
  analiseContextualAvancada?: {
    cadeiasCausais: {
      id: string;
      expressaoFormatada: string;
      origemRaiz: string;
      mecanismoIntermediario: string;
      sintomaVisivel: string;
      justificativaClinica: string;
      diretrizComposicao: string;
    }[];
    clustersQualitativos: {
      nomeCluster: string;
      termosEncontrados: string[];
      pesoQualitativoAtribuido: number;
      eixosAfetados: string[];
    }[];
    convergenciasBiblioteca: {
      expressaoRelatada: string;
      recursoSugerido: string;
      cursoOrigem: string;
      motivoConvergencia: string;
    }[];
    fatoresPreservados: {
      descricao: string;
      recursosInternosPreservados: string[];
      potencialExpansao: boolean;
    };
  };
  regioesCorporais: {
    regioes: string[];
    chakrasCorrespondentes: string[];
    leituraEnergetica: string;
  };
  sistemaBase: {
    nome: string;
    justificativa: string;
    origemDoc: string;
  };
  sistemaPrincipal: {
    nome: string;
    cursoOrigem: string;
    recursoEspecifico: string;
    compatibilidade: number;
    justificativa: string;
    origemDoc: string;
  };
  sistemasComplementares: {
    nome: string;
    cursoOrigem: string;
    recursoEspecifico: string;
    funcao: string;
    origemDoc: string;
  }[];
  recursosInternos: {
    simbolos: string[];
    energias: string[];
    frequencias: string[];
    comandos: string[];
    cristais: string[];
    chakras: string[];
  };
  sistemasNaoUtilizados: SistemaNaoPriorizado[];
  composicaoFinalSequencia: EtapaSequencia[];
  oqueObservarPratica: string[];
  oqueReavaliar: string[];
}

export interface EstruturaJsonExport {
  eixos: Record<EixoId, number>;
  eixo_estruturante: string;
  eixos_secundarios: string[];
  necessidade_principal: string;
  necessidades_secundarias: string[];
  sistemas_considerados: { nome: string; score: number }[];
  sistema_base: { nome: string; justificativa: string };
  sistema_principal: { nome: string; recursos: string[]; compatibilidade: number };
  sistemas_complementares: { nome: string; recursos: string[] }[];
  recursos: {
    simbolos: string[];
    energias: string[];
    frequencias: string[];
    cristais: string[];
    chakras: string[];
    praticas: string[];
  };
  sistemas_nao_priorizados: SistemaNaoPriorizado[];
  sequencia: EtapaSequencia[];
  intencao: string;
  cadeias_causais_funcionais?: {
    expressao: string;
    origem_raiz: string;
    mecanismo: string;
    sintoma: string;
    justificativa: string;
  }[];
  clusters_qualitativos?: {
    nome: string;
    peso: number;
    termos: string[];
  }[];
  convergencias_biblioteca?: {
    termo: string;
    recurso: string;
    origem: string;
  }[];
  resultado_pessoa: ResultadoPessoa;
  relatorio_everton: RelatorioTecnicoEverton;
}

export interface VariavelReavaliacao {
  nome: string;
  antes: number; // 0 a 10
  depois: number; // 0 a 10
  variacao: number;
  observacao?: string;
}

export type ClassificacaoReavaliacao =
  | 'MANTER'
  | 'AJUSTAR'
  | 'REDUZIR'
  | 'AMPLIAR'
  | 'TROCAR PRIORIDADE'
  | 'REAVALIAR ANTES DE NOVA APLICAÇÃO';

export interface RegistroReavaliacao {
  id: string;
  data: string;
  anamneseId: string;
  nomePessoa: string;
  variaveis: VariavelReavaliacao[];
  classificacao: ClassificacaoReavaliacao;
  justificativaClinica: string;
  proximaAcaoSugerida: string;
}

export interface ResultadoAnaliseCompleta {
  saidaPessoa: ResultadoPessoa;
  saidaEverton: RelatorioTecnicoEverton;
  estruturaJsonExport: EstruturaJsonExport;
}

