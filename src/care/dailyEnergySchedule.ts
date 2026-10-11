export interface DailyEnergyPlan {
  day: number;
  energyNames: string[];
  intention: string;
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

/** A draft for ADM review; never automatically publishes or invents energy names. */
export function proposeDailyEnergySchedule(params: {
  days: 7 | 21;
  systems: SistemaBiblioteca[];
  axes: Array<{ eixoId: EixoId; percentual: number }>;
  highSensitivity?: boolean;
}): DailyEnergyPlan[] {
  const systems = params.systems.filter(system => system.status !== 'NAO_UTILIZAR' && system.catalogacaoTecnica === 'COMPLETA' && system.origemDocumental?.idDocumento);
  const base = systems.find(system => system.ehBaseSustentacao && !system.ehEstimulanteAtivo);
  const baseNames = base?.energias.slice(0, 1) || [];
  const priorities = params.axes.filter(axis => axis.percentual > 0).map(axis => axis.eixoId);
  const focusAxes: EixoId[] = ['seguranca', 'protecao', ...priorities.filter(axis => !['seguranca', 'protecao', 'integracao'].includes(axis)), 'integracao'];
  const used = new Set<string>();
  const result: DailyEnergyPlan[] = [];
  for (let day = 1; day <= params.days; day++) {
    const first = day === 1;
    const target = first ? 'seguranca' : focusAxes[Math.min(day - 1, focusAxes.length - 1)];
    const candidates = systems.flatMap(system => system.energias.map(name => {
      const resource = system.recursosInternos.find(item => item.tipo === 'energia' && item.nome === name);
      const compatible = resource?.eixosCompatíveis.includes(target) || (system.compatibilidadeEixos[target] || 0) > 0;
      const score = (system.compatibilidadeEixos[target] || 0) * 100 + params.axes.reduce((sum, axis) => sum + (system.compatibilidadeEixos[axis.eixoId] || 0) * axis.percentual, 0);
      return { name, score, compatible, system };
    })).filter(item => item.compatible && !baseNames.includes(item.name) && !(item.system.ehEstimulanteAtivo && (params.highSensitivity || day <= Math.ceil(params.days / 3))));
    candidates.sort((a, b) => Number(used.has(a.name)) - Number(used.has(b.name)) || b.score - a.score || a.name.localeCompare(b.name));
    const selected = first && baseNames.length ? undefined : candidates.find(item => item.name !== result.at(-1)?.energyNames.at(-1)) || candidates[0];
    if (selected) used.add(selected.name);
    const energyNames = [...new Set([...baseNames, ...(selected ? [selected.name] : [])])];
    result.push({ day, energyNames, intention: `Acompanhar ${EIXOS_DEFINITIONS[target].nome.toLowerCase()} com presença, respeitando seu ritmo neste dia.` });
  }
  return result;
}
