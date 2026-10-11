import type { AnamneseInput, EixoId } from '../types';
import { executarAnaliseIntegrativa } from '../engine/analysisEngine';
import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { collectAnswerEvidence } from '../result/answerEvidence';
import { buildFullReportNarrative } from '../result/fullReportNarrative';
import { selectComplementaryCare } from './complementaryCatalogs';
import { selectSolfeggioFrequency } from './solfeggioCatalog';
import { selectBathSupport } from './bathCatalog';
import { proposeDailyEnergySchedule, validateDailyEnergySchedule, documentedEnergyNames } from './dailyEnergySchedule';

export interface PatientCareResource {
  id: string;
  category: 'Cristal etérico' | 'Floral' | 'Aromaterapia' | 'Banho energético' | 'Solfeggio';
  name: string;
  explanation: string;
  guidance?: string;
  source: string;
}

/** Select existing documented resources; never invent dosages, activation commands or audio files. */
export function buildAutomaticCare(intake: AnamneseInput, days: 7 | 21) {
  if (PERGUNTAS_ANAMNESE.some(question => { const value = intake.respostasObjetivas[question.id]; return !Number.isInteger(value) || value < 0 || value > 4; })) throw new Error('Conclua as respostas da anamnese para preparar seu percurso individual.');
  const analysis = executarAnaliseIntegrativa(intake);
  const axes = analysis.relatorioEverton.eixosOrdenados.filter(axis => axis.percentual > 0);
  const evidence = collectAnswerEvidence(intake, axes);
  const systems = BIBLIOTECA_MESTRA.filter(system => system.status !== 'NAO_UTILIZAR' && system.catalogacaoTecnica === 'COMPLETA' && system.origemDocumental?.idDocumento);
  const highSensitivity = intake.sensibilidadeEnergetica === 'alta' || intake.sensibilidadeEnergetica === 'muito_alta';
  const proposed = proposeDailyEnergySchedule({ days, systems, axes, highSensitivity });
  const resources: PatientCareResource[] = [];
  const dailyEnergySchedule = proposed.map(day => {
    const target = day.focusAxis || 'integracao';
    const dayAxes = [{ eixoId: target, percentual: 100 }, ...axes.filter(axis => axis.eixoId !== target).map(axis => ({ eixoId: axis.eixoId, percentual: axis.percentual / 4 }))];
    const support = selectComplementaryCare(dayAxes);
    const frequency = selectSolfeggioFrequency(dayAxes);
    const bath = selectBathSupport(dayAxes);
    const related = evidence.filter(item => item.level >= 2 && (PERGUNTAS_ANAMNESE.find(question => question.id === item.questionId)?.pesosEixos[target] || 0) > 0).slice(0, 2);
    const reason = related.length ? `A escolha deste dia considera ${related.map(item => item.name).join(' e ')}, presentes no que você compartilhou.` : target === 'integracao' ? 'Este dia reúne as intenções dos dias anteriores e abre espaço para perceber como você está.' : 'Este dia prepara um espaço tranquilo para receber o cuidado e acompanhar suas próprias percepções.';
    const purpose = (resourceAxes: EixoId[]) => {
      const matching = evidence.filter(item => item.level >= 2 && resourceAxes.some(axis => (PERGUNTAS_ANAMNESE.find(question => question.id === item.questionId)?.pesosEixos[axis] || 0) > 0)).slice(0, 2);
      return matching.length ? `Na sua leitura, esse apoio conversa com ${matching.map(item => item.name).join(' e ')}.` : 'Esse apoio acompanha a integração e a intenção de cuidado deste dia.';
    };
    const dayResources: PatientCareResource[] = [
      ...support.ethericCrystals.slice(0, 1).map(item => ({ id: item.id, category: 'Cristal etérico' as const, name: item.nome, explanation: `${item.descricao} ${purpose(item.eixos)}`, guidance: 'Referência energética utilizada na composição; você não precisa adquirir pedras físicas.', source: item.fonteDocumental || '' })),
      ...support.florals.filter(item => item.fonteDocumental).slice(0, 1).map(item => ({ id: item.id, category: 'Floral' as const, name: item.nome, explanation: `${item.descricao.replace(/^Material de formação (relaciona|descreve) /, '')} ${purpose(item.eixos)}`, guidance: 'Referência floral do percurso. Esta programação não prescreve dose nem ingestão.', source: item.fonteDocumental || '' })),
      ...support.aromatherapy.filter(item => item.fonteDocumental).map(item => ({ id: item.id, category: 'Aromaterapia' as const, name: item.nome.replace(/\s+—\s+.*/, ''), explanation: `${item.descricao.replace(/^Material de formação descreve /, '')} ${purpose(item.eixos)}`, guidance: 'Apoio opcional por aroma ambiente, se confortável para você. Não ingerir nem aplicar na pele a partir desta programação.', source: item.fonteDocumental || '' })),
      ...(bath ? [{ id: bath.id, category: 'Banho energético' as const, name: bath.nome, explanation: `${bath.descricaoPublica} ${purpose(bath.eixos)}`, guidance: 'Banho energético do protocolo. Esta leitura não indica misturas de ervas, produtos ou preparo de banho físico.', source: bath.fonteDocumental }] : []),
      ...(frequency ? [{ id: frequency.id, category: 'Solfeggio' as const, name: `${frequency.hz} Hz`, explanation: frequency.intencaoProjeto, guidance: 'Referência sonora da composição, para escuta em volume confortável quando o áudio estiver disponível.', source: frequency.fonteProjeto }] : []),
    ];
    dayResources.forEach(resource => { if (!resources.some(item => item.id === resource.id)) resources.push(resource); });
    const energyDetails = day.energyNames.map(name => {
      const system = systems.find(item => documentedEnergyNames(item).includes(name))!;
      const documented = system.recursosInternos.find(item => item.tipo === 'energia' && item.nome === name);
      return { name, explanation: documented?.descricao || system.objetivos, source: documented?.fonteDocumental || system.origemDocumental.idDocumento };
    });
    return { ...day, reason, resources: dayResources, energyDetails };
  });
  const error = validateDailyEnergySchedule(dailyEnergySchedule, days, systems.flatMap(documentedEnergyNames));
  if (error) throw new Error(`Não foi possível compor o percurso individual: ${error}`);
  const report = buildFullReportNarrative({ intake, analysis, composition: null, journeyDays: days, dailyEnergySchedule });
  const labels = { 'Cristal etérico': 'Cristais etéricos', Floral: 'Florais', Aromaterapia: 'Aromaterapia', 'Banho energético': 'Banho de apoio', Solfeggio: 'Frequência de apoio' };
  const resourceParagraphs = [...new Set(resources.map(item => item.category))].map(category => {
    const items = resources.filter(item => item.category === category);
    return `${labels[category]} — ${items.map(item => item.name).join(', ')}: ${items[0].explanation}`;
  });
  return { analysis, resources, report: { ...report, page4: { ...report.page4, paragraphs: [...report.page4.paragraphs, ...resourceParagraphs] }, deliveryMode: 'automatic' as const, careResources: resources } };
}
