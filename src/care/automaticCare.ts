import type { AnamneseInput, EixoId } from '../types';
import { executarAnaliseIntegrativa } from '../engine/analysisEngine';
import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { EIXOS_DEFINITIONS } from '../data/axes';
import { PERGUNTAS_ANAMNESE } from '../data/questions';
import { collectAnswerEvidence } from '../result/answerEvidence';
import { buildFullReportNarrative } from '../result/fullReportNarrative';
import { selectComplementaryCare } from './complementaryCatalogs';
import { selectSolfeggioFrequency } from './solfeggioCatalog';
import { selectBathSupport } from './bathCatalog';
import { proposeDailyEnergySchedule, validateDailyEnergySchedule, documentedEnergyNames } from './dailyEnergySchedule';

const resourceDescription = (text: string) => text
  .replace(/^Material de formação relaciona \S+ a /, 'Escolhido como apoio para ')
  .replace(/^Material de formação descreve \S+ em contexto de /, 'Aroma de apoio para ')
  .replace(/ O app limita.*$/, '')
  .replace(/^(Usado|Usada|Aparece) (no bloco inicial de|no bloco de|no bloco final de|em blocos de) /, 'Referência energética para ');
const careAim: Partial<Record<EixoId, string>> = {
  seguranca: 'Encontrar segurança e chão', corpo: 'Retomar contato com o corpo', emocional: 'Dar espaço ao que você sente',
  mente: 'Abrir espaço para clareza', autovalor: 'Reconhecer seu valor', movimento: 'Encontrar um primeiro passo possível',
  vitalidade: 'Acolher sua disposição', receber: 'Permitir-se receber cuidado', integracao: 'Reunir o cuidado e perceber seu momento',
  protecao: 'Cuidar dos seus limites', recomeco: 'Abrir espaço para recomeçar', proposito: 'Escutar o que faz sentido para você',
};

export interface PatientCareResource {
  id: string;
  category: 'Cristal etérico' | 'Floral' | 'Aromaterapia' | 'Banho energético' | 'Solfeggio';
  name: string;
  explanation: string;
  guidance?: string;
  source: string;
}

/** Select existing documented resources; use the therapist’s explicit floral guidance; never invent activation commands or audio files. */
export function buildAutomaticCare(intake: AnamneseInput, days: 7 | 21) {
  if (PERGUNTAS_ANAMNESE.some(question => { const value = intake.respostasObjetivas[question.id]; return !Number.isInteger(value) || value < 0 || value > 4; })) throw new Error('Conclua as respostas da anamnese para preparar seu percurso individual.');
  const analysis = executarAnaliseIntegrativa(intake);
  const axes = analysis.relatorioEverton.eixosOrdenados.filter(axis => axis.percentual > 0);
  const evidence = collectAnswerEvidence(intake, axes);
  const systems = BIBLIOTECA_MESTRA.filter(system => system.status !== 'NAO_UTILIZAR' && system.catalogacaoTecnica === 'COMPLETA' && system.origemDocumental?.idDocumento);
  const highSensitivity = intake.sensibilidadeEnergetica === 'alta' || intake.sensibilidadeEnergetica === 'muito_alta';
  const proposed = proposeDailyEnergySchedule({ days, systems, axes, highSensitivity });
  const journeyAxes = axes.length ? axes : [{ eixoId: 'integracao' as EixoId, percentual: 100 }];
  const journeySupport = selectComplementaryCare(journeyAxes);
  const frequency = selectSolfeggioFrequency(journeyAxes);
  const journeyReason = (compatibleAxes: EixoId[]) => {
    const related = evidence.filter(item => item.level >= 2 && compatibleAxes.some(axis => (PERGUNTAS_ANAMNESE.find(question => question.id === item.questionId)?.pesosEixos[axis] || 0) > 0)).slice(0, 2);
    return related.length ? `A escolha considera ${related.map(item => item.name).join(' e ')}, que apareceram nas suas respostas.` : 'A escolha acompanha a intenção de integração do seu percurso.';
  };
  const journeyResources: PatientCareResource[] = [
    ...journeySupport.florals.filter(item => item.fonteDocumental).slice(0, 1).map(item => ({ id: item.id, category: 'Floral' as const, name: item.nome, explanation: `${resourceDescription(item.descricao)} ${journeyReason(item.eixos)}`, guidance: `Orientação de Everton Piceni para o floral deste percurso: 10 gotas, duas vezes ao dia, durante os ${days} dias.`, source: item.fonteDocumental || '' })),
    ...journeySupport.aromatherapy.filter(item => item.fonteDocumental).map(item => ({ id: item.id, category: 'Aromaterapia' as const, name: item.nome.replace(/\s+—\s+.*/, ''), explanation: `${resourceDescription(item.descricao)} ${journeyReason(item.eixos)}`, guidance: `O mesmo aroma acompanha os ${days} dias, por uso olfativo ou ambiental, se confortável para você. Não ingerir nem aplicar diretamente na pele.`, source: item.fonteDocumental || '' })),
    ...(frequency ? [{ id: frequency.id, category: 'Solfeggio' as const, name: `${frequency.hz} Hz`, explanation: `${frequency.intencaoProjeto} ${journeyReason(frequency.eixos)}`, guidance: `Esta é a única frequência-base escolhida para a programação de toda a jornada de ${days} dias. Ela acompanhará o áudio do tratamento.`, source: frequency.fonteProjeto }] : []),
  ];
  const resources: PatientCareResource[] = [...journeyResources];
  const dailyEnergySchedule = proposed.map(day => {
    const target = day.focusAxis || 'integracao';
    const dayAxes = [{ eixoId: target, percentual: 100 }, ...axes.filter(axis => axis.eixoId !== target).map(axis => ({ eixoId: axis.eixoId, percentual: axis.percentual / 4 }))];
    const support = selectComplementaryCare(dayAxes);
    const bath = selectBathSupport(dayAxes);
    const related = evidence.filter(item => item.level >= 2 && (PERGUNTAS_ANAMNESE.find(question => question.id === item.questionId)?.pesosEixos[target] || 0) > 0).slice(0, 2);
    const reason = related.length ? `A escolha deste dia considera ${related.map(item => item.name).join(' e ')}, presentes no que você compartilhou.` : target === 'integracao' ? 'Este dia reúne as intenções dos dias anteriores e abre espaço para perceber como você está.' : 'Este dia prepara um espaço tranquilo para receber o cuidado e acompanhar suas próprias percepções.';
    const dayResources: PatientCareResource[] = [
      ...support.ethericCrystals.slice(0, 1).map(item => ({ id: item.id, category: 'Cristal etérico' as const, name: item.nome, explanation: resourceDescription(item.descricao), guidance: 'Referência energética utilizada na composição; você não precisa adquirir pedras físicas.', source: item.fonteDocumental || '' })),
      ...(bath ? [{ id: bath.id, category: 'Banho energético' as const, name: bath.nome, explanation: bath.descricaoPublica, guidance: 'O Banho do Templo será integrado à programação energética feita pelo terapeuta e recebido durante a sessão de escuta. Não exige banho de água nem preparo de ervas.', source: bath.fonteDocumental }] : []),
      ...journeyResources,
    ];
    dayResources.forEach(resource => { if (!resources.some(item => item.id === resource.id)) resources.push(resource); });
    const energyDetails = day.energyNames.map(name => {
      const system = systems.find(item => documentedEnergyNames(item).includes(name))!;
      const documented = system.recursosInternos.find(item => item.tipo === 'energia' && item.nome === name);
      const compatibleAxes = documented?.eixosCompatíveis || Object.keys(system.compatibilidadeEixos) as EixoId[];
      const selectedAxis = compatibleAxes.includes(target) ? target : axes.find(axis => compatibleAxes.includes(axis.eixoId))?.eixoId || 'integracao';
      const aim = EIXOS_DEFINITIONS[selectedAxis]?.nome.toLowerCase() || 'integração';
      const explanation = name === 'Original Reiki' ? 'É a base de sustentação do percurso, escolhida para acompanhar os outros recursos com presença e integração.' : `Entra neste dia como apoio energético para ${aim}, uma intenção relacionada ao que suas respostas mostram. Pertence ao sistema ${system.nome}.`;
      return { name, explanation, source: documented?.fonteDocumental || system.origemDocumental.idDocumento };
    });
    return { ...day, intention: careAim[target] || EIXOS_DEFINITIONS[target].nome, reason, resources: dayResources, energyDetails };
  });
  const error = validateDailyEnergySchedule(dailyEnergySchedule, days, systems.flatMap(documentedEnergyNames));
  if (error) throw new Error(`Não foi possível compor o percurso individual: ${error}`);
  const report = buildFullReportNarrative({ intake, analysis, composition: null, journeyDays: days, dailyEnergySchedule });
  const labels = { 'Cristal etérico': 'Cristais etéricos', Floral: 'Florais', Aromaterapia: 'Aromaterapia', 'Banho energético': 'Banho de apoio', Solfeggio: 'Frequência de apoio' };
  const resourceParagraphs = [...new Set(resources.map(item => item.category))].map(category => {
    const items = resources.filter(item => item.category === category);
    return `${labels[category]} — ${items.map(item => item.name).join(', ')}: ${items[0].explanation}`;
  });
  return { analysis, resources, report: { ...report, page4: { ...report.page4, paragraphs: [...report.page4.paragraphs, ...resourceParagraphs] }, deliveryMode: 'automatic' as const, careResources: resources, journeyResources } };
}
