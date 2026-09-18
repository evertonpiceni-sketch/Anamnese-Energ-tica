import { EixoId, RelatorioTecnicoEverton } from '../types';
import { SolfeggioFrequency } from '../care/solfeggioCatalog';

export type PersonalizedAudioStatus =
  | 'PLANEJADO'
  | 'AGUARDANDO_GERACAO'
  | 'GERADO'
  | 'INATIVO';

export interface PersonalizedAudioOverride {
  sistemaBase?: string;
  sistemaPrincipal?: string;
  sistemasComplementares?: string[];
  recursosEnergeticos?: Partial<PersonalizedAudioPlan['recursosEnergeticos']>;
  intencao?: string;
  roteiroBase?: string[];
  assinaturaExtras?: string[];
}

export interface PersonalizedAudioPlan {
  id: string;
  userId: string;
  anamneseId: string;
  titulo: string;
  subtitulo: string;
  intencao: string;
  eixos: EixoId[];
  sistemaBase: string;
  sistemaPrincipal: string;
  sistemasComplementares: string[];
  recursosEnergeticos: {
    simbolos: string[];
    energias: string[];
    frequencias: string[];
    cristais: string[];
    chakras: string[];
  };
  solfeggio: SolfeggioFrequency | null;
  roteiroBase: string[];
  duracaoMinutos?: number;
  arquivoUrl?: string;
  status: PersonalizedAudioStatus;
  assinaturaComposicao: string;
}

/**
 * REGRA CENTRAL:
 * O áudio é criado para uma única pessoa e uma única anamnese.
 * Não existe catálogo de áudios reutilizáveis como tratamento final.
 * O catálogo do sistema contém apenas componentes, regras e recursos.
 */
export function criarPlanoAudioPersonalizado(params: {
  userId: string;
  anamneseId: string;
  nomePessoa: string;
  eixos: Array<{ eixoId: EixoId; percentual: number }>;
  relatorio: RelatorioTecnicoEverton;
  solfeggio: SolfeggioFrequency | null;
  override?: PersonalizedAudioOverride;
}): PersonalizedAudioPlan {
  const { userId, anamneseId, nomePessoa, eixos, relatorio, solfeggio, override } = params;
  const principais = eixos.slice(0, 5).map(item => item.eixoId);

  const sistemaBase = override?.sistemaBase || relatorio.sistemaBase.nome;
  const sistemaPrincipal = override?.sistemaPrincipal || relatorio.sistemaPrincipal.nome;
  const sistemasComplementares =
    override?.sistemasComplementares || relatorio.sistemasComplementares.map(item => item.nome);

  const recursosEnergeticos = {
    simbolos: override?.recursosEnergeticos?.simbolos || [...relatorio.recursosInternos.simbolos],
    energias: override?.recursosEnergeticos?.energias || [...relatorio.recursosInternos.energias],
    frequencias: override?.recursosEnergeticos?.frequencias || [...relatorio.recursosInternos.frequencias],
    cristais: override?.recursosEnergeticos?.cristais || [...relatorio.recursosInternos.cristais],
    chakras: override?.recursosEnergeticos?.chakras || [...relatorio.recursosInternos.chakras],
  };

  const assinaturaComposicao = [
    anamneseId,
    sistemaBase,
    sistemaPrincipal,
    ...sistemasComplementares,
    ...recursosEnergeticos.simbolos,
    ...recursosEnergeticos.energias,
    ...recursosEnergeticos.frequencias,
    ...recursosEnergeticos.cristais,
    ...(override?.roteiroBase || []),
    ...(override?.intencao ? [override.intencao] : []),
    ...(override?.assinaturaExtras || []),
    ...(solfeggio ? [String(solfeggio.hz)] : []),
  ].join('|');

  const firstName = nomePessoa.trim().split(/\s+/)[0] || 'você';

  return {
    id: `AUDIO-${anamneseId}-${hashString(assinaturaComposicao)}`,
    userId,
    anamneseId,
    titulo: `Sessão personalizada de ${firstName}`,
    subtitulo: 'Criada exclusivamente a partir desta anamnese e desta composição energética.',
    intencao: override?.intencao || construirIntencao(relatorio),
    eixos: principais,
    sistemaBase,
    sistemaPrincipal,
    sistemasComplementares,
    recursosEnergeticos,
    solfeggio,
    roteiroBase: override?.roteiroBase || construirRoteiroBase(relatorio, solfeggio),
    status: 'AGUARDANDO_GERACAO',
    assinaturaComposicao,
  };
}

function construirIntencao(relatorio: RelatorioTecnicoEverton): string {
  const eixo = relatorio.eixoEstruturante;
  return `Esta sessão foi composta para acolher a prioridade atual em ${eixo}, utilizando exclusivamente os sistemas e recursos selecionados para esta anamnese.`;
}

function construirRoteiroBase(
  relatorio: RelatorioTecnicoEverton,
  solfeggio: SolfeggioFrequency | null
): string[] {
  const etapas = relatorio.composicaoFinalSequencia.map(
    etapa => `${etapa.fase}: ${etapa.sistemaOuTecnica}${etapa.recursoEspecifico ? ` — ${etapa.recursoEspecifico}` : ''}`
  );

  if (solfeggio) {
    etapas.push(`Trilha sonora da sessão: ${solfeggio.hz} Hz — ${solfeggio.intencaoProjeto}`);
  }

  return etapas;
}


function hashString(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}
