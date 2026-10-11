import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { EixoId } from '../types';

export interface BasicUserResult {
  headline: string;
  intro: string;
  priorities: string[];
  intention: string;
  closing: string;
}

const FRIENDLY_AXIS_COPY: Record<EixoId, string> = {
  seguranca: 'encontrar mais chão, segurança e estabilidade para seguir no seu ritmo',
  emocional: 'acolher o que está sendo sentido sem precisar carregar tudo sem apoio',
  autovalor: 'reconhecer seu próprio valor com mais gentileza e menos cobrança',
  mente: 'criar mais espaço interno, clareza e descanso para a mente',
  movimento: 'retomar movimento aos poucos, sem transformar cada passo em cobrança',
  vitalidade: 'recuperar energia e respeitar o ritmo do corpo antes de exigir mais de si',
  corpo: 'voltar a perceber o corpo como lugar de presença, cuidado e escuta',
  relacionamentos: 'cuidar das trocas, dos limites e da forma como você se encontra com o outro',
  prazer: 'reabrir espaço para descanso, prazer e contato com as próprias sensações',
  criatividade: 'dar mais espaço à sua expressão, ideias e espontaneidade',
  limpeza: 'soltar pesos que já não precisam ocupar tanto espaço agora',
  padroes: 'perceber repetições com mais clareza para abrir novas possibilidades de resposta',
  prosperidade: 'fortalecer segurança e movimento em relação à vida prática e material',
  poder_pessoal: 'fortalecer limites, escolhas e confiança para sustentar o que é importante para você',
  proposito: 'reencontrar direção e um próximo passo que faça sentido',
  espiritualidade: 'reaproximar-se daquilo que traz conexão, sentido e presença',
  protecao: 'preservar melhor sua energia e criar mais sensação de limite e resguardo',
  receber: 'permitir-se receber cuidado, apoio e descanso sem precisar compensar imediatamente',
  recomeco: 'abrir espaço para um novo começo sem exigir que tudo esteja resolvido primeiro',
  integracao: 'reunir corpo, emoções e pensamentos em uma experiência mais inteira e coerente',
};

export function buildBasicUserResult(
  analysis: AnaliseCompletaResultado,
  nome: string
): BasicUserResult {
  const topAxes = analysis.relatorioEverton.eixosOrdenados.slice(0, 3);
  const priorities = topAxes.map(eixo => FRIENDLY_AXIS_COPY[eixo.eixoId]);
  const firstName = nome.trim().split(/\s+/)[0];

  return {
    headline: firstName
      ? `${firstName}, seu cuidado pode começar por aqui.`
      : 'Seu cuidado pode começar por aqui.',
    intro:
      'Neste momento, algumas áreas parecem pedir mais presença. Isso não define quem você é; é apenas uma leitura do que aparece com mais força agora.',
    priorities,
    intention: priorities[0]
      ? `Dar atenção, com gentileza, a ${priorities[0]}, respeitando seu ritmo e escolhendo um próximo passo possível.`
      : 'Seguir com gentileza, respeitando seu ritmo e escolhendo um próximo passo possível.',
    closing:
      'Esta leitura é complementar e serve para orientar as práticas do protocolo. Ela não substitui avaliação ou tratamento médico ou psicológico quando necessários.',
  };
}
