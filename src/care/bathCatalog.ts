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
 * Aqui, “banho” significa uma prática espiritual de imersão/visualização
 * em luz colorida; não é banho físico com água, ervas ou outros produtos.
 */
export const BATH_SUPPORT_CATALOG: BathSupportResource[] = [
  {
    id: 'templo-negro',
    nome: 'Banho de Luz do Templo Negro',
    descricaoPublica: 'Como apoio a este momento, a luz negra é usada simbolicamente para envolver o corpo em uma sensação de proteção, limite e recolhimento. A proposta é favorecer um espaço interno mais protegido, especialmente quando você sente que precisa desacelerar e encontrar segurança.',
    eixos: ['seguranca', 'protecao', 'corpo'],
    chakras: ['Raiz'],
    orientacaoPublica: 'É uma visualização de luz, e não um banho físico. Você pode apenas descansar e imaginar essa luz envolvendo o corpo, sem precisar sentir ou visualizar nada de forma intensa.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-marrom',
    nome: 'Banho de Luz do Templo Marrom',
    descricaoPublica: 'A luz marrom acompanha momentos em que o cuidado pede mais chão, presença e sustentação. Ela entra como uma imagem de apoio para ajudar você a se perceber aqui, no corpo e no momento presente, sem exigir que tudo esteja resolvido.',
    eixos: ['seguranca', 'corpo', 'integracao'],
    chakras: ['Raiz'],
    orientacaoPublica: 'É uma visualização de luz, e não um banho físico. A ideia é imaginar uma luz marrom envolvendo o corpo enquanto você descansa e percebe seus pontos de apoio.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-azul',
    nome: 'Banho de Luz do Templo Azul',
    descricaoPublica: 'A luz azul acompanha momentos em que há algo importante para dizer, organizar ou proteger nas relações. Ela é usada como um convite à calma, à expressão mais serena e ao respeito pelos próprios limites.',
    eixos: ['relacionamentos', 'emocional', 'protecao'],
    chakras: ['Laríngeo'],
    orientacaoPublica: 'É uma visualização de luz, e não um banho físico. Você pode imaginar a luz azul ao redor do corpo e da região da garganta, apenas como uma forma de acompanhar sua respiração e sua expressão.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-rosa',
    nome: 'Banho de Luz do Templo Rosa',
    descricaoPublica: 'A luz rosa entra quando o momento pede mais acolhimento, delicadeza e cuidado consigo. A intenção é criar uma pausa em que você possa se tratar com menos cobrança e permitir que o cuidado também chegue até você.',
    eixos: ['emocional', 'autovalor', 'receber', 'integracao'],
    chakras: ['Cardíaco'],
    orientacaoPublica: 'É uma visualização de luz, e não um banho físico. Você pode imaginar uma luz rosa suave envolvendo o corpo ou simplesmente descansar com a intenção de receber cuidado.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-laranja',
    nome: 'Banho de Luz do Templo Laranja',
    descricaoPublica: 'A luz laranja acompanha um retorno delicado à criatividade, ao prazer e às pequenas experiências que aproximam você da vida. Não existe obrigação de sentir entusiasmo; o convite é apenas abrir espaço para algo um pouco mais vivo e confortável.',
    eixos: ['criatividade', 'prazer', 'vitalidade', 'movimento'],
    chakras: ['Sacral'],
    orientacaoPublica: 'É uma visualização de luz, e não um banho físico. Imagine a luz laranja de forma suave, somente se isso for confortável, sem tentar provocar nenhuma sensação específica.',
    fonteDocumental: 'APOSTILA-CHAVES-ARCTURIANAS-DE-REALINHAMENTO-DE-SINERGIA-DE-CURA.pdf — seção Banhos do Templo.',
    status: 'ATIVO',
  },
  {
    id: 'templo-vermelho',
    nome: 'Banho de Luz do Templo Vermelho',
    descricaoPublica: 'A luz vermelha acompanha momentos em que já existe espaço para fortalecer presença, coragem e iniciativa. Ela entra como um apoio simbólico ao movimento, sem apressar você nem transformar força em cobrança.',
    eixos: ['poder_pessoal', 'movimento', 'vitalidade', 'seguranca'],
    chakras: ['Raiz'],
    orientacaoPublica: 'É uma visualização de luz, e não um banho físico. Você pode imaginar uma luz vermelha suave envolvendo o corpo, sempre respeitando seu conforto e seu ritmo.',
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
  return `Aqui, “banho” não significa água, ervas ou qualquer preparo físico. É uma prática de visualização e recepção simbólica de luz. Escolha uma posição confortável, sentado ou deitado, e imagine uma luz ${color} envolvendo suavemente seu corpo, como um espaço de acolhimento e repouso. Você pode receber esse momento durante a prática do dia ou, se preferir, antes de dormir. Não é necessário visualizar com nitidez nem sentir algo especial; apenas permita-se descansar e acompanhar essa imagem no seu próprio ritmo.`;
}

export function bathProgrammingInstructions(bath: BathSupportResource): string[] {
  const color = bath.id.replace('templo-', '');
  return [
    '12ª Chave Dourada — Banhos de Cores do Templo de Luz Arcturiana, pp. 30–31. Aplicação pelo terapeuta conforme sua formação; convite de visualização opcional para o usuário.',
    `Declaração documentada, com a cor selecionada: “Eu desbloqueio a 12ª Chave Dourada Os Banhos de Cores do Templo de Luz para ser ativada dentro do meu plano de fundo etérico. Eu solicito um banho no Templo de Luz ${color} para que meu corpo espiritual possa absorver as bênçãos. Obrigada”.`,
  ];
}
