export interface DailyEnergyPlan {
  day: number;
  energyNames: string[];
  intention: string;
  focusAxis?: EixoId;
  reason?: string;
  invitation?: string;
  resources?: import('./automaticCare').PatientCareResource[];
  energyDetails?: Array<{ name: string; explanation: string; source: string }>;
}

export function validateDailyEnergySchedule(schedule: DailyEnergyPlan[], days: 7 | 21, _allowedEnergies: string[]): string | null {
  if (schedule.length !== days) return `Preencha a composição de todos os ${days} dias.`;
  for (let day = 1; day <= days; day++) {
    const entries = schedule.filter(item => item.day === day);
    if (entries.length !== 1 || !entries[0].energyNames.length) return `Selecione as energias do dia ${day}.`;
    if (entries[0].energyNames.some(name => !name.trim())) return `Revise as energias do dia ${day}.`;
    if (!entries[0].intention.trim()) return `Defina a intenção do dia ${day}.`;
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
}): DailyEnergyPlan[] {
  const systems = params.systems.filter(isDocumentedCareSystem);
  const base = systems.find(system => system.ehBaseSustentacao && !system.ehEstimulanteAtivo && system.energias.length > 0);
  const baseNames = base ? documentedEnergyNames(base).slice(0, 1) : [];
  const priorities = params.axes.filter(axis => axis.percentual > 0).map(axis => axis.eixoId);
  const needsGrounding = priorities.includes('seguranca') || priorities.includes('corpo');
  const focusAxes: EixoId[] = [...(needsGrounding ? ['seguranca' as EixoId] : []), ...priorities.filter(axis => axis !== 'integracao' && (!needsGrounding || axis !== 'seguranca')), 'integracao'];
  const used = new Set<string>();
  const result: DailyEnergyPlan[] = [];
  for (let day = 1; day <= params.days; day++) {
    const first = day === 1;
    const target = day === params.days ? 'integracao' : focusAxes[Math.min(Math.floor((day - 1) * (focusAxes.length - 1) / (params.days - 1)), focusAxes.length - 1)] || 'integracao';
    const candidates = systems.flatMap(system => documentedEnergyNames(system).map(name => {
      const resource = documentedEnergyResource(system, name);
      const compatible = resource ? resource.eixosCompatíveis.includes(target) : (system.compatibilidadeEixos[target] || 0) > 0;
      const score = (system.compatibilidadeEixos[target] || 0) * 100 + params.axes.reduce((sum, axis) => sum + (system.compatibilidadeEixos[axis.eixoId] || 0) * axis.percentual, 0);
      const supportsProfile = params.axes.some(axis => axis.percentual > 0 && (resource ? resource.eixosCompatíveis.includes(axis.eixoId) : (system.compatibilidadeEixos[axis.eixoId] || 0) > 0));
      return { name, score, compatible, supportsProfile, system };
    })).filter(item => (item.compatible || item.supportsProfile) && !baseNames.includes(item.name) && !(item.system.ehEstimulanteAtivo && (params.highSensitivity || day <= Math.ceil(params.days / 3))));
    candidates.sort((a, b) => Number(b.compatible) - Number(a.compatible) || Number(used.has(a.name)) - Number(used.has(b.name)) || b.score - a.score || a.name.localeCompare(b.name));
    const selected = first && baseNames.length ? undefined : candidates.find(item => item.name !== result.at(-1)?.energyNames.at(-1));
    if (selected) used.add(selected.name);
    const energyNames = [...new Set([...baseNames, ...(selected ? [selected.name] : [])])];
    // Documented compassionate support may accompany the base and the day's main energy.
    const compassionate = candidates.find(item => params.supportiveSystemIds?.includes(item.system.id) && item.compatible && !energyNames.includes(item.name));
    if (compassionate) { energyNames.push(compassionate.name); used.add(compassionate.name); }
    const signature = (names: string[]) => [...names].sort().join('|');
    if (result.some(entry => signature(entry.energyNames) === signature(energyNames))) {
      const addition = candidates.find(item => !energyNames.includes(item.name) && !result.some(entry => signature(entry.energyNames) === signature([...energyNames, item.name])));
      if (addition) { energyNames.push(addition.name); used.add(addition.name); }
      else if (energyNames.length > 1 && result.at(-1)?.energyNames.join('|') === energyNames.join('|')) energyNames.splice(1);
    }
    result.push({ day, energyNames, focusAxis: target, intention: `Acompanhar ${EIXOS_DEFINITIONS[target].nome.toLowerCase()} com presença, respeitando seu ritmo neste dia.` });
  }
  return result;
}
