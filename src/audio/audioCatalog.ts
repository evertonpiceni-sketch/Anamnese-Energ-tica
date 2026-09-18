import { EixoId } from '../types';

export type AudioAvailability = 'ATIVO' | 'AGUARDANDO_ARQUIVO' | 'INATIVO';

export interface ProgrammedAudio {
  id: string;
  titulo: string;
  subtitulo: string;
  intencao: string;
  duracaoMinutos?: number;
  eixos: EixoId[];
  prioridade: number;
  arquivoUrl?: string;
  status: AudioAvailability;
}

export const PROGRAMMED_AUDIO_CATALOG: ProgrammedAudio[] = [
  {
    id: 'presenca-chao',
    titulo: 'Presença e chão',
    subtitulo: 'Para desacelerar e recuperar sensação de base.',
    intencao: 'Apoiar presença, segurança, aterramento e retorno gradual ao corpo.',
    eixos: ['seguranca', 'corpo', 'integracao', 'mente'],
    prioridade: 10,
    status: 'AGUARDANDO_ARQUIVO',
  },
  {
    id: 'acolhimento-emocional',
    titulo: 'Acolher o que está sendo sentido',
    subtitulo: 'Um espaço de cuidado para emoções que estão pedindo atenção.',
    intencao: 'Favorecer acolhimento emocional, suavidade e capacidade de receber cuidado.',
    eixos: ['emocional', 'receber', 'autovalor', 'relacionamentos'],
    prioridade: 9,
    status: 'AGUARDANDO_ARQUIVO',
  },
  {
    id: 'clareza-mental',
    titulo: 'Criar espaço por dentro',
    subtitulo: 'Para quando a mente parece cheia demais.',
    intencao: 'Apoiar desaceleração, clareza, organização interna e presença.',
    eixos: ['mente', 'integracao', 'seguranca', 'proposito'],
    prioridade: 9,
    status: 'AGUARDANDO_ARQUIVO',
  },
  {
    id: 'movimento-suave',
    titulo: 'Um pequeno começo',
    subtitulo: 'Para retomar movimento sem transformar o próximo passo em cobrança.',
    intencao: 'Apoiar movimento, coragem, ação possível e retomada gradual.',
    eixos: ['movimento', 'poder_pessoal', 'recomeco', 'vitalidade'],
    prioridade: 8,
    status: 'AGUARDANDO_ARQUIVO',
  },
  {
    id: 'autovalor',
    titulo: 'Reconhecer o próprio valor',
    subtitulo: 'Para suavizar cobrança e reencontrar dignidade interna.',
    intencao: 'Apoiar autovalor, receber, expressão e relação consigo.',
    eixos: ['autovalor', 'receber', 'criatividade', 'relacionamentos'],
    prioridade: 8,
    status: 'AGUARDANDO_ARQUIVO',
  },
  {
    id: 'voltar-corpo',
    titulo: 'Voltar ao corpo',
    subtitulo: 'Para sair do excesso de pensamento e recuperar presença corporal.',
    intencao: 'Apoiar corpo, vitalidade, prazer, presença e descanso.',
    eixos: ['corpo', 'vitalidade', 'prazer', 'integracao'],
    prioridade: 8,
    status: 'AGUARDANDO_ARQUIVO',
  },
  {
    id: 'protecao-limites',
    titulo: 'Preservar sua energia',
    subtitulo: 'Para fortalecer limites e diminuir a sensação de sobrecarga externa.',
    intencao: 'Apoiar proteção, limites, segurança e preservação da própria energia.',
    eixos: ['protecao', 'poder_pessoal', 'seguranca', 'relacionamentos'],
    prioridade: 8,
    status: 'AGUARDANDO_ARQUIVO',
  },
  {
    id: 'recomeco',
    titulo: 'Abrir uma pequena porta',
    subtitulo: 'Para momentos de transição e recomeço.',
    intencao: 'Apoiar recomeço, direção, movimento e confiança no próximo passo.',
    eixos: ['recomeco', 'proposito', 'movimento', 'seguranca'],
    prioridade: 8,
    status: 'AGUARDANDO_ARQUIVO',
  },
];

export function escolherAudioProgramado(eixos: Array<{ eixoId: EixoId; percentual: number }>): ProgrammedAudio | null {
  if (!eixos.length) return null;

  const principais = eixos.slice(0, 5);

  const pontuados = PROGRAMMED_AUDIO_CATALOG
    .filter(audio => audio.status !== 'INATIVO')
    .map(audio => {
      const score = principais.reduce((total, eixo, index) => {
        const afinidade = audio.eixos.includes(eixo.eixoId) ? 1 : 0;
        const pesoPosicao = Math.max(1, 5 - index);
        return total + afinidade * eixo.percentual * pesoPosicao;
      }, 0);

      return {
        audio,
        score: score + audio.prioridade,
      };
    })
    .sort((a, b) => b.score - a.score);

  return pontuados[0]?.audio || null;
}
