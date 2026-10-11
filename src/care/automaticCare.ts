import type { AnamneseInput, EixoId } from '../types';
import { executarAnaliseIntegrativa } from '../engine/analysisEngine';
import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { collectAnswerEvidence } from '../result/answerEvidence';
import { buildFullReportNarrative } from '../result/fullReportNarrative';
import { selectComplementaryCare } from './complementaryCatalogs';
import { selectSolfeggioFrequency } from './solfeggioCatalog';
import { selectBathSupport } from './bathCatalog';
import { CARE_INTENTIONS, contextualWelcome, dailyInvitation } from './patientCareNarrative';
import { bathReceivingGuidance, bathProgrammingInstructions } from './bathCatalog';
import { proposeDailyEnergySchedule, validateDailyEnergySchedule, documentedEnergyNames, documentedEnergyResource, isDocumentedCareSystem } from './dailyEnergySchedule';

const resourceDescription = (text: string) => text
  .replace(/^Material de formação relaciona \S+ a /, '')
  .replace(/^Material de formação descreve \S+ em contexto de /, '')
  .replace(/ O app limita.*$/, '')
  .replace(/^(Usado|Usada|Aparece) (no bloco inicial de|no bloco de|no bloco final de|em blocos de) /, '')
  .replace(/^Este cristal etérico acompanha /, '')
  .trim();

export interface PatientCareResource {
  id: string;
  category: 'Cristal etérico' | 'Floral' | 'Aromaterapia' | 'Banho energético' | 'Solfeggio';
  name: string;
  explanation: string;
  guidance?: string;
  source: string;
  programmingInstructions?: string[];
}

/** Select existing documented resources; use the therapist’s explicit floral guidance; never invent activation commands or audio files. */
export function buildAutomaticCare(intake: AnamneseInput, days: 7 | 21) {
  if (PERGUNTAS_ANAMNESE.some(question => { const value = intake.respostasObjetivas[question.id]; return !Number.isInteger(value) || value < 0 || value > 4; })) throw new Error('Conclua as respostas da anamnese para preparar seu percurso individual.');
  const analysis = executarAnaliseIntegrativa(intake);
  const axes = analysis.relatorioEverton.eixosOrdenados.filter(axis => axis.percentual > 0);
  const evidence = collectAnswerEvidence(intake, axes);
  const systems = BIBLIOTECA_MESTRA.filter(isDocumentedCareSystem);
  const highSensitivity = intake.sensibilidadeEnergetica === 'alta' || intake.sensibilidadeEnergetica === 'muito_alta';
  const needsCompassionateSupport = evidence.some(item => item.level >= 2 && ['q2_mente_acelerada', 'q3_sensacao_ameaca_inseguranca', 'q6_engolir_emocoes', 'q8_dificuldade_receber', 'q20_conflitos_relacionamento'].includes(item.questionId));
  const proposed = proposeDailyEnergySchedule({ days, systems, axes, highSensitivity, supportiveSystemIds: needsCompassionateSupport ? ['karuna_ki'] : [] });
  const journeyAxes = axes.length ? axes : [{ eixoId: 'integracao' as EixoId, percentual: 100 }];
  const journeySupport = selectComplementaryCare(journeyAxes);
  const frequency = selectSolfeggioFrequency(journeyAxes);
  const journeyReason = (compatibleAxes: EixoId[]) => {
    const related = evidence.filter(item => item.level >= 2 && compatibleAxes.some(axis => (PERGUNTAS_ANAMNESE.find(question => question.id === item.questionId)?.pesosEixos[axis] || 0) > 0)).slice(0, 2);
    return related.length ? `Esse apoio foi incluído porque conversa com o que você contou sobre ${related[0].name}. A intenção é acompanhar o percurso de forma constante e discreta.` : 'Esse apoio acompanha a jornada de forma constante e discreta, respeitando o seu ritmo.';
  };
  const journeyResources: PatientCareResource[] = [
    ...journeySupport.florals.filter(item => item.fonteDocumental).slice(0, 1).map(item => ({ id: item.id, category: 'Floral' as const, name: item.nome, explanation: `${resourceDescription(item.descricao)} ${journeyReason(item.eixos)}`.trim(), guidance: `Ao longo dos ${days} dias, siga a orientação combinada para este floral: 10 gotas, duas vezes ao dia.`, source: item.fonteDocumental || '' })),
    ...journeySupport.aromatherapy.filter(item => item.fonteDocumental).map(item => ({ id: item.id, category: 'Aromaterapia' as const, name: item.nome.replace(/\s+—\s+.*/, ''), explanation: `${resourceDescription(item.descricao)} ${journeyReason(item.eixos)}`.trim(), guidance: `Esse aroma pode acompanhar os ${days} dias por uso olfativo ou ambiental, sempre de forma confortável. Não ingerir nem aplicar diretamente na pele.`, source: item.fonteDocumental || '' })),
    ...(frequency ? [{ id: frequency.id, category: 'Solfeggio' as const, name: `${frequency.hz} Hz`, explanation: `Essa frequência acompanha o áudio como um fundo de apoio para ${frequency.intencaoProjeto.toLowerCase()}.`, guidance: `Ela permanece como frequência-base ao longo dos ${days} dias.`, source: frequency.fonteProjeto }] : []),
  ];
  const resources: PatientCareResource[] = [...journeyResources];
  const dailyEnergySchedule = proposed.map(day => {
    const target = day.focusAxis || 'integracao';
    const dayAxes = [{ eixoId: target, percentual: 100 }, ...axes.filter(axis => axis.eixoId !== target).map(axis => ({ eixoId: axis.eixoId, percentual: axis.percentual / 4 }))];
    const support = selectComplementaryCare(dayAxes);
    const bath = selectBathSupport(dayAxes, { stabilization: day.day <= Math.ceil(days / 3) && (highSensitivity || evidence.some(item => item.level >= 3 && ['q3_sensacao_ameaca_inseguranca', 'q4_cansaco_esgotamento'].includes(item.questionId))) });
    const related = evidence.filter(item => item.level >= 2 && (PERGUNTAS_ANAMNESE.find(question => question.id === item.questionId)?.pesosEixos[target] || 0) > 0).sort((a, b) => ((PERGUNTAS_ANAMNESE.find(question => question.id === b.questionId)?.pesosEixos[target] || 0) * b.level) - ((PERGUNTAS_ANAMNESE.find(question => question.id === a.questionId)?.pesosEixos[target] || 0) * a.level)).slice(0, 2);
    const reason = contextualWelcome(related, target, day.day === days);
    const dayResources: PatientCareResource[] = [
      ...support.ethericCrystals.slice(0, 1).map(item => ({
        id: item.id,
        category: 'Cristal etérico' as const,
        name: item.nome,
        explanation: `${item.nome} entra hoje como uma lembrança de ${CARE_INTENTIONS[target].toLowerCase()}. ${resourceDescription(item.descricao)} Não é preciso ter a pedra física; essa referência já faz parte da composição do cuidado.`.replace(/\.\s*\./g, '.').trim(),
        guidance: 'Apenas deixe essa referência acompanhar a prática, sem precisar fazer nada com ela.',
        source: item.fonteDocumental || ''
      })),
      ...(bath ? [{
        id: bath.id,
        category: 'Banho energético' as const,
        name: bath.nome,
        explanation: `${bath.descricaoPublica} Ele entra como um momento de recolhimento dentro da prática de hoje — sem água, ervas ou qualquer preparo físico.`,
        guidance: bathReceivingGuidance(bath),
        programmingInstructions: bathProgrammingInstructions(bath),
        source: bath.fonteDocumental
      }] : []),
      ...journeyResources,
    ];
    dayResources.forEach(resource => { if (!resources.some(item => item.id === resource.id)) resources.push(resource); });
    const energyDetails = day.energyNames.map(name => {
      const system = systems.find(item => documentedEnergyNames(item).includes(name))!;
      const documented = documentedEnergyResource(system, name);
      const compatibleAxes = documented?.eixosCompatíveis || Object.keys(system.compatibilidadeEixos) as EixoId[];
      const selectedAxis = compatibleAxes.includes(target) ? target : axes.find(axis => compatibleAxes.includes(axis.eixoId))?.eixoId || 'integracao';
      const explanation = name === 'Original Reiki'
        ? 'Hoje, o Original Reiki fica como a base silenciosa deste cuidado. Você não precisa fazer nada para recebê-lo; ele apenas acompanha a sua pausa com suavidade.'
        : `${name} se aproxima deste dia para apoiar ${CARE_INTENTIONS[selectedAxis].toLowerCase()}. Ele entra junto do Reiki como um cuidado complementar, sem pressa e sem cobrança.`;
      return { name, explanation, source: documented?.fonteDocumental || system.origemDocumental.idDocumento };
    });
    return { ...day, intention: CARE_INTENTIONS[target], reason, invitation: dailyInvitation(related, target, day.day === days), resources: dayResources, energyDetails };
  });
  const error = validateDailyEnergySchedule(dailyEnergySchedule, days, systems.flatMap(documentedEnergyNames));
  if (error) throw new Error(`Não foi possível compor o percurso individual: ${error}`);
  const report = buildFullReportNarrative({ intake, analysis, composition: null, journeyDays: days, dailyEnergySchedule });
  const labels = { 'Cristal etérico': 'Cristais etéricos', Floral: 'Florais', Aromaterapia: 'Aromaterapia', 'Banho energético': 'Banho de luz', Solfeggio: 'Frequência de apoio' };
  const resourceParagraphs = [...new Set(resources.map(item => item.category))].map(category => {
    const items = resources.filter(item => item.category === category);
    return `${labels[category]} — ${items.map(item => item.name).join(', ')}: ${items[0].explanation}`;
  });
  return { analysis, resources, report: { ...report, page4: { ...report.page4, paragraphs: [...report.page4.paragraphs, ...resourceParagraphs] }, deliveryMode: 'automatic' as const, careResources: resources, journeyResources } };
}
