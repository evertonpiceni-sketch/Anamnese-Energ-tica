import { AnaliseCompletaResultado } from '../engine/analysisEngine';
import { AnamneseInput } from '../types';
import { collectAnswerEvidence } from './answerEvidence';
import { buildFullReportNarrative } from './fullReportNarrative';

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
  const full = buildFullReportNarrative({ intake, analysis, composition: null });
  return {
    headline: present.length ? `${firstName}, vamos acolher o que você vive em relação a ${present[0].name}.` : `${firstName}, há espaço para acolher o seu momento.`,
    intro: full.page1.intro,
    priorities: present.map(item => item.intention),
    intention: full.page4.paragraphs.join(' '),
    closing: full.page3.preserved.join(' '),
  };
}
