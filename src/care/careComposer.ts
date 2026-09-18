import { PersonalizedAudioPlan } from '../audio/audioCatalog';
import {
  AromatherapyResource,
  ComplementaryCareSelection,
  EthericCrystalResource,
  FloralResource,
} from './complementaryCatalogs';
import { SolfeggioFrequency } from './solfeggioCatalog';

export interface CareComposition {
  audio: PersonalizedAudioPlan | null;
  floral: FloralResource[];
  aromatherapy: AromatherapyResource[];
  ethericCrystals: EthericCrystalResource[];
  solfeggio: SolfeggioFrequency | null;
  journey21Mode: 'NAO_INDICADO' | 'PREPARACAO' | 'ENTRADA_DIRETA' | 'APOIO_PARALELO';
}

export function buildCareComposition(
  audio: PersonalizedAudioPlan | null,
  complementary: ComplementaryCareSelection,
  solfeggio: SolfeggioFrequency | null,
  options?: { journey21Mode?: CareComposition['journey21Mode'] }
): CareComposition {
  return {
    audio,
    floral: complementary.florals,
    aromatherapy: complementary.aromatherapy,
    ethericCrystals: complementary.ethericCrystals,
    solfeggio,
    journey21Mode: options?.journey21Mode || 'NAO_INDICADO',
  };
}
