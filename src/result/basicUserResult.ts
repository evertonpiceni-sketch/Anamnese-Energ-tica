import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { AnamneseInput } from '../types';
import { collectAnswerEvidence } from './answerEvidence';

export interface BasicUserResult {
  headline: string;
  intro: string;
  priorities: string[];
  intention: string;
  closing: string;
}

export function buildBasicUserResult(analysis: AnaliseCompletaResultado, intake: AnamneseInput): BasicUserResult {
  const evidence = collectAnswerEvidence(intake, analysis.relatorioEverton.eixosOrdenados);
  const present = evidence.filter(item => item.level >= 2).slice(0, 3);
  const firstName = intake.nomePessoa.trim().split(/\s+/)[0] || 'Você';
  const request = intake.relatoLivreNecessidade.trim() || intake.intencaoDeclarada.trim();
  return {
    headline: present.length ? `${firstName}, sua leitura destaca ${present.map(item => item.name).join(', ')}.` : `${firstName}, a leitura acompanha o que você contou.`,
    intro: `${present.length ? present.map(item => `Você marcou “${item.label}” para ${item.name}.`).join(' ') : evidence.length ? 'Suas respostas objetivas não apresentam temas com intensidade moderada ou alta; não vou atribuir uma sobrecarga que você não relatou.' : 'Ainda faltam respostas objetivas para sustentar a leitura.'}${request ? ` Seu pedido foi: “${request}”.` : ''}${intake.relatoLivreDesafios.trim() ? ` Você descreveu como desafio: “${intake.relatoLivreDesafios.trim()}”.` : ''}`,
    priorities: present.map(item => item.intention),
    intention: intake.intencaoDeclarada.trim() ? `Acompanhar sua intenção: “${intake.intencaoDeclarada.trim()}”.${present.length ? ` O primeiro ponto será ${present[0].intention}.` : ''}` : present.length ? `O primeiro ponto será ${present[0].intention}.` : 'O direcionamento será definido com você na revisão do seu pedido.',
    closing: intake.relatoLivrePreservado.trim() ? `Você reconheceu como força: “${intake.relatoLivrePreservado.trim()}”. Essa referência também fará parte do acompanhamento.` : 'A reavaliação compara suas respostas iniciais com o que você percebe ao longo do cuidado.',
  };
}
