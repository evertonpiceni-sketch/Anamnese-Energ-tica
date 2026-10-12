export interface DailyEnergyPlan {
  day: number;
  energyNames: string[];
  intention: string;
  focusAxis?: EixoId;
  reason?: string;
  invitation?: string;
  resources?: import('./automaticCare').PatientCareResource[];
  energyDetails?: Array<{ name: string; explanation: string; source: string; questionIds?: string[]; matchedAxes?: EixoId[] }>;
}

export function validateDailyEnergySchedule(schedule: DailyEnergyPlan[], days: 7 | 21, allowedEnergies: string[]): string | null {
  if (schedule.length !== days) return `Preencha a composição de todos os ${days} dias.`;
  for (let day = 1; day <= days; day++) {
    const entries = schedule.filter(item => item.day === day);
    if (entries.length !== 1 || !entries[0].energyNames.length) return `Selecione as energias do dia ${day}.`;
    if (!entries[0].intention.trim()) return `Defina a intenção do dia ${day}.`;
    if (entries[0].energyNames.some(name => !allowedEnergies.includes(name))) return `O dia ${day} contém uma energia fora da composição selecionada.`;
  }
  const compositions = schedule.map(item => [...new Set(item.energyNames)].sort().join('|'));
  if (compositions.some((composition, index) => index > 0 && composition === compositions[index - 1])) return 'Revise a programação: dois dias consecutivos não podem ter a mesma composição energética.';
  return null;
}

import type { EixoId, SistemaBiblioteca } from '../types';
import { EIXOS_DEFINITIONS } from '../data/axes';

/** A partially catalogued system contributes only individually sourced energies/symbols, never its unverified remainder. */
export const isDocumentedCareSystem = (system: SistemaBiblioteca) => system.status !== 'NAO_UTILIZAR' && !!system.origemDocumental?.idDocumento && (system.catalogacaoTecnica === 'COMPLETA' || (system.catalogacaoTecnica === 'PARCIAL' && system.recursosInternos.some(resource => (resource.tipo === 'energia' || resource.tipo === 'símbolo') && resource.fonteDocumental && resource.eixosCompatíveis.length)));

export const documentedEnergyNames = (system: SistemaBiblioteca): string[] => {
  const resources = system.recursosInternos.filter(resource => (resource.tipo === 'energia' || resource.tipo === 'símbolo') && (system.catalogacaoTecnica === 'COMPLETA' || (resource.fonteDocumental && resource.eixosCompatíveis.length)));
  const names = Array.from(new Set([...(system.catalogacaoTecnica === 'COMPLETA' ? system.energias : []), ...resources.map(resource => resource.tipo === 'símbolo' ? `${system.nome} · ${resource.nome}` : resource.nome)]));
  return names.length ? names : system.catalogacaoTecnica === 'COMPLETA' ? [system.nome] : [];
};

export const documentedEnergyResource = (system: SistemaBiblioteca, name: string) => system.recursosInternos.find(resource => resource.nome === name || `${system.nome} · ${resource.nome}` === name);

/** Documented daily composition; ADM edits remain optional. */
export function proposeDailyEnergySchedule(params: {
  days: 7 | 21;
  systems: SistemaBiblioteca[];
  axes: Array<{ eixoId: EixoId; percentual: number }>;
  highSensitivity?: boolean;
  supportiveSystemIds?: string[];
  restorativeProfile?: boolean;
}): DailyEnergyPlan[] {
  const systems = params.systems.filter(isDocumentedCareSystem);
  // These functions are autonomous in the source or are attunements, not day-by-day activations.
  const unscheduledFunctions = new Set(['Soul Awakening', 'Soul Fire', 'Mind Shakti Empowerment', 'Soul Regeneration', 'Spiritual Individuality Attunement']);
  const priorities = params.axes.filter(axis => axis.percentual > 0).map(axis => axis.eixoId);
  const phases: EixoId[][] = [
    ['seguranca', 'corpo', 'vitalidade'], ['emocional', 'mente'],
    ['autovalor', 'receber', 'protecao', 'relacionamentos', 'padroes', 'limpeza', 'poder_pessoal'],
    ['proposito', 'recomeco', 'criatividade', 'prazer', 'espiritualidade', 'prosperidade', 'movimento'],
  ];
  const selectedPhases = phases.map((group, index) => (index === 0 && priorities.includes('seguranca') ? ['seguranca' as EixoId, ...priorities.filter(axis => group.includes(axis) && axis !== 'seguranca')] : priorities.filter(axis => group.includes(axis))).slice(0, index < 2 ? 2 : 1));
  const focusAxes: EixoId[] = [...selectedPhases.flat(), 'integracao'];
  const bridgeAxes: Partial<Record<EixoId, EixoId[]>> = { prazer: ['corpo'], vitalidade: ['corpo'], recomeco: ['integracao'], prosperidade: ['poder_pessoal'] };
  const usage = new Map<string, number>();
  const result: DailyEnergyPlan[] = [];
  for (let day = 1; day <= params.days; day++) {
    const target = day === params.days ? 'integracao' : focusAxes[Math.min(Math.floor((day - 1) * (focusAxes.length - 1) / (params.days - 1)), focusAxes.length - 1)] || 'integracao';
    const candidates = systems.flatMap(system => documentedEnergyNames(system).map(name => {
      const resource = documentedEnergyResource(system, name);
      const compatibleAxes = resource?.eixosCompatíveis || Object.keys(system.compatibilidadeEixos) as EixoId[];
      const compatible = compatibleAxes.includes(target) || (bridgeAxes[target] || []).some(axis => compatibleAxes.includes(axis));
      // Score the documented function, not unrelated properties of its parent system.
      const primaryFunctionBonus = resource && resource.eixosCompatíveis[0] === target ? 25 : 0;
      const score = compatible ? primaryFunctionBonus + (compatibleAxes.includes(target) ? (system.compatibilidadeEixos[target] || 1) * 100 : 100) + params.axes.reduce((sum, axis) => sum + (compatibleAxes.includes(axis.eixoId) ? (system.compatibilidadeEixos[axis.eixoId] || 1) * axis.percentual : 0), 0) / Math.max(1, compatibleAxes.length) / 10 : 0;
      return { name, score, compatible, compatibleAxes, system };
    })).filter(item => !unscheduledFunctions.has(item.name) && item.compatible && !(item.system.ehEstimulanteAtivo && (params.highSensitivity || params.restorativeProfile || day <= Math.ceil(params.days / 3))));
    // No daily default: even a sustaining Reiki must be justified by this day's focus.
    const ranked = [...candidates].sort((a, b) => (b.score - (usage.get(b.name) || 0) * 140) - (a.score - (usage.get(a.name) || 0) * 140) || a.name.localeCompare(b.name));
    const main = ranked[0];
    if (!main) throw new Error(`Não há energia documentada para o foco do dia ${day}.`);
    const energyNames = [main.name];
    // A second energy is useful only when it covers an additional reported need.
    const secondary = ranked.find(item => item.name !== main.name && item.compatibleAxes.some(axis => priorities.includes(axis) && !main.compatibleAxes.includes(axis)));
    if (secondary) energyNames.push(secondary.name);
    const compassionate = ranked.find(item => params.supportiveSystemIds?.includes(item.system.id) && !energyNames.includes(item.name) && item.compatibleAxes.some(axis => priorities.includes(axis) && ![main, secondary].filter(Boolean).some(selected => selected!.compatibleAxes.includes(axis))));
    if (compassionate) energyNames.push(compassionate.name);
    // Vary comparable, relevant choices; never add an unrelated energy merely to make a day look different.
    const signature = (names: string[]) => [...names].sort().join('|');
    if (result.at(-1) && signature(result.at(-1)!.energyNames) === signature(energyNames)) {
      const alternative = ranked.find(item => !energyNames.includes(item.name));
      if (alternative) energyNames[0] = alternative.name;
      else if (energyNames.length > 1) energyNames.pop();
    }
    energyNames.forEach(name => usage.set(name, (usage.get(name) || 0) + 1));
    result.push({ day, energyNames, focusAxis: target, intention: `Acompanhar ${EIXOS_DEFINITIONS[target].nome.toLowerCase()} com presença, respeitando seu ritmo neste dia.` });
  }
  return result;
}
