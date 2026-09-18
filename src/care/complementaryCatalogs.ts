import { EixoId } from '../types';

export type CatalogStatus = 'ATIVO' | 'PARCIAL' | 'PENDENTE' | 'INATIVO';

export interface FloralResource {
  id: string;
  nome: string;
  sistemaOrigem: string;
  descricao: string;
  eixos: EixoId[];
  formaUso?: string;
  restricoes: string[];
  fonteDocumental?: string;
  status: CatalogStatus;
}

export interface AromatherapyResource {
  id: string;
  nome: string;
  descricao: string;
  eixos: EixoId[];
  formaUsoPermitida?: string;
  restricoes: string[];
  fonteDocumental?: string;
  status: CatalogStatus;
}

export interface EthericCrystalResource {
  id: string;
  nome: string;
  sistemaOrigem: string;
  descricao: string;
  eixos: EixoId[];
  chakras: string[];
  formaAplicacao?: string;
  restricoes: string[];
  fonteDocumental?: string;
  status: CatalogStatus;
}

// As bibliotecas começam vazias por regra: nenhum recurso é inventado.
// O ADM poderá preencher somente a partir de material/documentação confirmada.
export const FLORAL_CATALOG: FloralResource[] = [];

export const AROMATHERAPY_CATALOG: AromatherapyResource[] = [];

export const ETHERIC_CRYSTAL_CATALOG: EthericCrystalResource[] = [];

export interface ComplementaryCareSelection {
  florals: FloralResource[];
  aromatherapy: AromatherapyResource[];
  ethericCrystals: EthericCrystalResource[];
}

function scoreByAxes(resourceAxes: EixoId[], axes: Array<{ eixoId: EixoId; percentual: number }>) {
  return axes.slice(0, 5).reduce((score, axis, index) => {
    if (!resourceAxes.includes(axis.eixoId)) return score;
    const positionWeight = Math.max(1, 5 - index);
    return score + axis.percentual * positionWeight;
  }, 0);
}

export function selectComplementaryCare(
  axes: Array<{ eixoId: EixoId; percentual: number }>
): ComplementaryCareSelection {
  const florals = FLORAL_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({ item, score: scoreByAxes(item.eixos, axes) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(x => x.item);

  const aromatherapy = AROMATHERAPY_CATALOG
    .filter(item => item.status === 'ATIVO' && item.formaUsoPermitida)
    .map(item => ({ item, score: scoreByAxes(item.eixos, axes) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 1)
    .map(x => x.item);

  const ethericCrystals = ETHERIC_CRYSTAL_CATALOG
    .filter(item => item.status === 'ATIVO')
    .map(item => ({ item, score: scoreByAxes(item.eixos, axes) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(x => x.item);

  return { florals, aromatherapy, ethericCrystals };
}
