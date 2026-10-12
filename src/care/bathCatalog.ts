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
 * Banhos de luz retirados da seleção automática por decisão do usuário.
 * Receitas de ervas só serão integradas após leitura do PDF específico,
 * com ingredientes, preparo e cuidados documentados. Preserva-se o histórico.
 * A seleção automática aponta o recurso; preparo detalhado e eventuais
 * ativações permanecem sob validação/orientação do terapeuta.
 */
export const BATH_SUPPORT_CATALOG: BathSupportResource[] = [
  {
    id: 'templo-negro',
    nome: 'Banho do Templo Negro',
    descricaoPublica: 'Escolhido para dar espaço a proteção, limites, aterramento e sensação de segurança.',
    eixos: ['seguranca', 'protecao', 'corpo'],
    chakras: ['Raiz'],
    orientacaoPublica: 'Quando indicado, será apresentado como prática complementar de apoio, seguindo a forma documentada no protocolo e a orientação do terapeuta.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'INATIVO',
  },
  {
    id: 'templo-marrom',
    nome: 'Banho do Templo Marrom',
    descricaoPublica: 'A intenção deste banho é acompanhar o reencontro com o chão, presença e conexão com a terra quando existe sensação de desconexão ou falta de sustentação.',
    eixos: ['seguranca', 'corpo', 'integracao'],
    chakras: ['Raiz'],
    orientacaoPublica: 'Usar somente quando fizer sentido dentro da composição individual e conforme a orientação cadastrada pelo terapeuta.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'INATIVO',
  },
  {
    id: 'templo-azul',
    nome: 'Banho do Templo Azul',
    descricaoPublica: 'Apoio relacionado à expressão, harmonia, perdão e fortalecimento de limites quando a leitura aponta necessidade de dar mais espaço à própria voz.',
    eixos: ['relacionamentos', 'emocional', 'protecao'],
    chakras: ['Laríngeo'],
    orientacaoPublica: 'A prática só é sugerida quando conversa com a leitura atual e não substitui outros cuidados necessários.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'INATIVO',
  },
  {
    id: 'templo-rosa',
    nome: 'Banho do Templo Rosa',
    descricaoPublica: 'Apoio para acolhimento, cuidado emocional, harmonia e autocuidado quando o momento pede mais gentileza consigo.',
    eixos: ['emocional', 'autovalor', 'receber', 'integracao'],
    chakras: ['Cardíaco'],
    orientacaoPublica: 'Quando indicado, entra como parte do mesmo eixo de cuidado emocional, sem ser apresentado como solução isolada.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'INATIVO',
  },
  {
    id: 'templo-laranja',
    nome: 'Banho do Templo Laranja',
    descricaoPublica: 'Escolhido para acompanhar o retorno delicado à criatividade, ao prazer e às pequenas experiências que aproximam você da vida. Alegria não precisa ser exigida: podemos começar pelo que é confortável agora.',
    eixos: ['criatividade', 'prazer', 'vitalidade', 'movimento'],
    chakras: ['Sacral'],
    orientacaoPublica: 'A indicação deve respeitar o momento da pessoa e não é usada quando a prioridade é primeiro estabilizar e descansar.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'INATIVO',
  },
  {
    id: 'templo-vermelho',
    nome: 'Banho do Templo Vermelho',
    descricaoPublica: 'Apoio relacionado a coragem, força interior, iniciativa e presença quando a leitura mostra que o movimento pode ser fortalecido com segurança.',
    eixos: ['poder_pessoal', 'movimento', 'vitalidade', 'seguranca'],
    chakras: ['Raiz'],
    orientacaoPublica: 'Somente sugerir quando houver vitalidade suficiente e quando o cuidado não estiver priorizando desaceleração ou estabilização.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'INATIVO',
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
  axes: Array<{ eixoId: EixoId; percentual: number }>,
  options: { stabilization?: boolean } = {}
): BathSupportResource | null {
  const ranked = BATH_SUPPORT_CATALOG
    .filter(item => item.status === 'ATIVO' && (!options.stabilization || !['templo-laranja', 'templo-vermelho'].includes(item.id)))
    .map(item => ({ item, score: scoreBath(item, axes) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.item || null;
}

/** Source: 12ª Chave Dourada, pp. 30–31. Visualization is a spiritual invitation, not a predicted physical effect. */
export function bathReceivingGuidance(bath: BathSupportResource): string {
  const color = bath.id.replace('templo-', '');
  return `O “banho” é uma prática espiritual de imersão em luz colorida. Acomode-se sentado ou deitado; se fizer sentido para você, imagine uma piscina de luz ${color} envolvendo suavemente seu corpo. Pode ser recebido durante a sessão de escuta; o manual também sugere esse momento antes de dormir. Não é necessário visualizar com nitidez, sentir algo especial ou preparar água e ervas. Se preferir, apenas descanse enquanto recebe o cuidado.`;
}

export function bathProgrammingInstructions(bath: BathSupportResource): string[] {
  const color = bath.id.replace('templo-', '');
  return [
    '12ª Chave Dourada — Banhos de Cores do Templo de Luz Arcturiana, pp. 30–31. Aplicação pelo terapeuta conforme sua formação; convite de visualização opcional para o usuário.',
    `Declaração documentada, com a cor selecionada: “Eu desbloqueio a 12ª Chave Dourada Os Banhos de Cores do Templo de Luz para ser ativada dentro do meu plano de fundo etérico. Eu solicito um banho no Templo de Luz ${color} para que meu corpo espiritual possa absorver as bênçãos. Obrigada”.`,
  ];
}
