import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { documentedEnergyNames, isDocumentedCareSystem, type DailyEnergyPlan } from './dailyEnergySchedule';

/** ADM-only preparation notes, using the same daily composition as the patient report. */
export function buildEnergyProgrammingScript(personName: string, schedule: DailyEnergyPlan[]) {
  return schedule.map(day => {
    const lines = [`Destinatário: ${personName}`, `Dia ${day.day}: ${day.intention}`, `Intenção contextual: ${day.reason || day.intention}`];
    day.energyNames.forEach((name, index) => {
      const system = BIBLIOTECA_MESTRA.find(item => isDocumentedCareSystem(item) && documentedEnergyNames(item).includes(name));
      if (!system) throw new Error(`Energia sem documentação: ${name}`);
      lines.push(`${index + 1}. Energia: ${name} — Sistema: ${system.nome}`);
      const detail = day.energyDetails?.find(item => item.name === name);
      lines.push(`Finalidade: ${detail?.explanation || system.objetivos}`);
      if (detail?.questionIds?.length) lines.push(`Respostas que sustentam esta escolha: ${detail.questionIds.join(', ')}`);
      if (detail?.matchedAxes?.length) lines.push(`Correspondências documentadas no perfil: ${detail.matchedAxes.join(', ')}`);
      lines.push(...system.metodosAtivacao.map(method => `Ativação documentada: ${method}`), ...system.formasAplicacao.map(method => `Aplicação documentada: ${method}`));
      if (!system.metodosAtivacao.length && !system.formasAplicacao.length) lines.push('Consultar o método no material de formação; o cadastro não contém instruções de ativação.');
      lines.push(...system.cuidados.map(care => `Cuidado: ${care}`), ...system.restricoes.map(restriction => `Restrição: ${restriction}`), `Fonte: ${system.origemDocumental.idDocumento}`);
    });
    day.resources?.forEach(resource => lines.push(`${resource.category}: ${resource.name} — ${resource.explanation}`, ...(resource.guidance ? [resource.guidance] : []), ...(resource.programmingInstructions || []).map(instruction => `Programação documentada do banho: ${instruction}`), `Fonte: ${resource.source}`));
    return { ...day, lines };
  });
}
