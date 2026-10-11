import { EixoId } from '../types';

export interface BathSupportResource {
  id: string;
  nome: string;
  descricaoPublica: string;
  eixos: EixoId[];
  chakras: string[];
  orientacaoPublica: string;
  fonteDocumental: string;
  status: 'ATIVO' | 'PENDENTE' | 'INATIVO';
}

/**
 * Banhos incluídos somente quando há material documental no acervo.
 * A seleção automática aponta o recurso; preparo detalhado e eventuais
 * ativações permanecem sob validação/orientação do terapeuta.
 */
export const BATH_SUPPORT_CATALOG: BathSupportResource[] = [
  {
    id: 'templo-negro',
    nome: 'Banho do Templo Negro',
    descricaoPublica: 'Recurso de apoio para momentos em que a leitura pede mais proteção, limites, aterramento e sensação de segurança.',
    eixos: ['seguranca', 'protecao', 'corpo'],
    chakras: ['Raiz'],
    orientacaoPublica: 'Quando indicado, será apresentado como prática complementar de apoio, seguindo a forma documentada no protocolo e a orientação do terapeuta.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-marrom',
    nome: 'Banho do Templo Marrom',
    descricaoPublica: 'Recurso voltado ao reencontro com o chão, presença e conexão com a terra quando existe sensação de desconexão ou falta de sustentação.',
    eixos: ['seguranca', 'corpo', 'integracao'],
    chakras: ['Raiz'],
    orientacaoPublica: 'Usar somente quando fizer sentido dentro da composição individual e conforme a orientação cadastrada pelo terapeuta.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-azul',
    nome: 'Banho do Templo Azul',
    descricaoPublica: 'Apoio relacionado à expressão, harmonia, perdão e fortalecimento de limites quando a leitura aponta necessidade de dar mais espaço à própria voz.',
    eixos: ['relacionamentos', 'emocional', 'protecao'],
    chakras: ['Laríngeo'],
    orientacaoPublica: 'A prática só é sugerida quando conversa com a leitura atual e não substitui outros cuidados necessários.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-rosa',
    nome: 'Banho do Templo Rosa',
    descricaoPublica: 'Apoio para acolhimento, cuidado emocional, harmonia e autocuidado quando o momento pede mais gentileza consigo.',
    eixos: ['emocional', 'autovalor', 'receber', 'integracao'],
    chakras: ['Cardíaco'],
    orientacaoPublica: 'Quando indicado, entra como parte do mesmo eixo de cuidado emocional, sem ser apresentado como solução isolada.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-laranja',
    nome: 'Banho do Templo Laranja',
    descricaoPublica: 'Recurso de apoio para criatividade, prazer, vitalidade e retomada do contato com aquilo que desperta vida e movimento.',
    eixos: ['criatividade', 'prazer', 'vitalidade', 'movimento'],
    chakras: ['Sacral'],
    orientacaoPublica: 'A indicação deve respeitar o momento da pessoa e não é usada quando a prioridade é primeiro estabilizar e descansar.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-vermelho',
    nome: 'Banho do Templo Vermelho',
    descricaoPublica: 'Apoio relacionado a coragem, força interior, iniciativa e presença quando a leitura mostra que o movimento pode ser fortalecido com segurança.',
    eixos: ['poder_pessoal', 'movimento', 'vitalidade', 'seguranca'],
    chakras: ['Raiz'],
    orientacaoPublica: 'Somente sugerir quando houver vitalidade suficiente e quando o cuidado não estiver priorizando desaceleração ou estabilização.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
];

function scoreBath(resource: BathSupportResource, axes: Array<{ eixoId: EixoId; percentual: number }>) {
  return axes.slice(0, 5).reduce((score, axis, index) => {
    if (!resource.eixos.includes(axis.eixoId)) return score;
    const positionWeight = Math.max(1, 5 - index);
    return score + axis.percentual * positionWeight;
  }, 0);
}

export function selectBathSupport(
  axes: Array<{ eixoId: EixoId; percentual: number }>
): BathSupportResource | null {
  const ranked = BATH_SUPPORT_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({ item, score: scoreBath(item, axes) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item || null;
}
