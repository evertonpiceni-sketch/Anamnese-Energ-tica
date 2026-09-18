import { EixoId, RelatorioTecnicoEverton } from '../types';
import { SolfeggioFrequency } from '../care/solfeggioCatalog';

export type PersonalizedAudioStatus =
  | 'PLANEJADO'
  | 'AGUARDANDO_GERACAO'
  | 'GERADO'
  | 'INATIVO';

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
}): PersonalizedAudioPlan {
  const { userId, anamneseId, nomePessoa, eixos, relatorio, solfeggio } = params;
  const principais = eixos.slice(0, 5).map(item => item.eixoId);

  const sistemaBase = relatorio.sistemaBase.nome;
  const sistemaPrincipal = relatorio.sistemaPrincipal.nome;
  const sistemasComplementares = relatorio.sistemasComplementares.map(item => item.nome);

  const assinaturaComposicao = [
    anamneseId,
    sistemaBase,
    sistemaPrincipal,
    ...sistemasComplementares,
    ...relatorio.recursosInternos.simbolos,
    ...relatorio.recursosInternos.energias,
    ...relatorio.recursosInternos.frequencias,
    ...relatorio.recursosInternos.cristais,
    ...(solfeggio ? [String(solfeggio.hz)] : []),
  ].join('|');

  const firstName = nomePessoa.trim().split(/\s+/)[0] || 'você';

  return {
    id: `AUDIO-${anamneseId}-${Date.now()}`,
    userId,
    anamneseId,
    titulo: `Sessão personalizada de ${firstName}`,
    subtitulo: 'Criada exclusivamente a partir desta anamnese e desta composição energética.',
    intencao: construirIntencao(relatorio),
    eixos: principais,
    sistemaBase,
    sistemaPrincipal,
    sistemasComplementares,
    recursosEnergeticos: {
      simbolos: [...relatorio.recursosInternos.simbolos],
      energias: [...relatorio.recursosInternos.energias],
      frequencias: [...relatorio.recursosInternos.frequencias],
      cristais: [...relatorio.recursosInternos.cristais],
      chakras: [...relatorio.recursosInternos.chakras],
    },
    solfeggio,
    roteiroBase: construirRoteiroBase(relatorio, solfeggio),
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
