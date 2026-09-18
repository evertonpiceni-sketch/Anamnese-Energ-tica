import { EixoId } from '../types';

export interface SolfeggioFrequency {
  id: string;
  hz: number;
  titulo: string;
  chakraProjeto: string;
  eixos: EixoId[];
  intencaoProjeto: string;
  status: 'ATIVO' | 'INATIVO';
  fonteProjeto: string;
}

export const SOLFEGGIO_CATALOG: SolfeggioFrequency[] = [
  {
    id: 'solfeggio-396',
    hz: 396,
    titulo: '396 Hz',
    chakraProjeto: 'Básico',
    eixos: ['seguranca', 'corpo', 'protecao'],
    intencaoProjeto: 'Aterramento, segurança e estabilidade.',
    status: 'ATIVO',
    fonteProjeto: 'Mockups aprovados do Protocolo da Transformação.',
  },
  {
    id: 'solfeggio-417',
    hz: 417,
    titulo: '417 Hz',
    chakraProjeto: 'Sacral',
    eixos: ['recomeco', 'criatividade', 'prazer', 'limpeza'],
    intencaoProjeto: 'Fluxo, criatividade, liberação e abertura para mudança.',
    status: 'ATIVO',
    fonteProjeto: 'Mockups aprovados do Protocolo da Transformação.',
  },
  {
    id: 'solfeggio-528',
    hz: 528,
    titulo: '528 Hz',
    chakraProjeto: 'Plexo Solar',
    eixos: ['autovalor', 'poder_pessoal', 'movimento', 'vitalidade'],
    intencaoProjeto: 'Autoconfiança, poder pessoal e transformação.',
    status: 'ATIVO',
    fonteProjeto: 'Mockups aprovados do Protocolo da Transformação.',
  },
  {
    id: 'solfeggio-639',
    hz: 639,
    titulo: '639 Hz',
    chakraProjeto: 'Cardíaco',
    eixos: ['emocional', 'relacionamentos', 'receber', 'autovalor'],
    intencaoProjeto: 'Afeto, relações, acolhimento e integração emocional.',
    status: 'ATIVO',
    fonteProjeto: 'Mockups aprovados do Protocolo da Transformação.',
  },
  {
    id: 'solfeggio-741',
    hz: 741,
    titulo: '741 Hz',
    chakraProjeto: 'Laríngeo',
    eixos: ['criatividade', 'poder_pessoal', 'relacionamentos', 'mente'],
    intencaoProjeto: 'Expressão, comunicação e clareza para dizer o que precisa ser dito.',
    status: 'ATIVO',
    fonteProjeto: 'Mockups aprovados do Protocolo da Transformação.',
  },
  {
    id: 'solfeggio-852',
    hz: 852,
    titulo: '852 Hz',
    chakraProjeto: 'Frontal',
    eixos: ['mente', 'proposito', 'espiritualidade', 'padroes'],
    intencaoProjeto: 'Clareza, percepção, discernimento e direção.',
    status: 'ATIVO',
    fonteProjeto: 'Mockups aprovados do Protocolo da Transformação.',
  },
  {
    id: 'solfeggio-963',
    hz: 963,
    titulo: '963 Hz',
    chakraProjeto: 'Coronário',
    eixos: ['espiritualidade', 'integracao', 'proposito'],
    intencaoProjeto: 'Conexão, consciência e integração.',
    status: 'ATIVO',
    fonteProjeto: 'Mockups aprovados do Protocolo da Transformação.',
  },
];

export function selectSolfeggioFrequency(
  axes: Array<{ eixoId: EixoId; percentual: number }>
): SolfeggioFrequency | null {
  if (!axes.length) return null;

  const ranked = SOLFEGGIO_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => {
      const score = axes.slice(0, 5).reduce((total, axis, index) => {
        if (!item.eixos.includes(axis.eixoId)) return total;
        const positionWeight = Math.max(1, 5 - index);
        return total + axis.percentual * positionWeight;
      }, 0);
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item || null;
}
