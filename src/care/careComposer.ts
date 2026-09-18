import { ProgrammedAudio } from '../audio/audioCatalog';
import {
  AromatherapyResource,
  ComplementaryCareSelection,
  EthericCrystalResource,
  FloralResource,
} from './complementaryCatalogs';

export interface CareComposition {
  audio: ProgrammedAudio | null;
  floral: FloralResource[];
  aromatherapy: AromatherapyResource[];
  ethericCrystals: EthericCrystalResource[];
  journey21Mode: 'NAO_INDICADO' | 'PREPARACAO' | 'ENTRADA_DIRETA' | 'APOIO_PARALELO';
}

export function buildCareComposition(
  audio: ProgrammedAudio | null,
  complementary: ComplementaryCareSelection,
  options?: { journey21Mode?: CareComposition['journey21Mode'] }
): CareComposition {
  return {
    audio,
    floral: complementary.florals,
    aromatherapy: complementary.aromatherapy,
    ethericCrystals: complementary.ethericCrystals,
    journey21Mode: options?.journey21Mode || 'NAO_INDICADO',
  };
}
