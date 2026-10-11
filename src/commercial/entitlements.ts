export type CommercialProductCode = 'CARE_7_BASIC' | 'CARE_7_GUIDED' | 'CARE_21';

export interface CommercialEntitlement {
  productCode: CommercialProductCode;
  paidAmountCents: number;
  days: 7 | 21;
  guidedMeditation: boolean;
  fullReportIncluded: boolean;
  fullReportAddonPaid: boolean;
  preparatoryAudioEligible: boolean;
  personalizedAudioEligible: boolean;
}

export const COMMERCIAL_PRODUCTS: Record<CommercialProductCode, Omit<CommercialEntitlement, 'fullReportAddonPaid'>> = {
  CARE_7_BASIC: {
    productCode: 'CARE_7_BASIC',
    paidAmountCents: 5000,
    days: 7,
    guidedMeditation: false,
    fullReportIncluded: false,
    preparatoryAudioEligible: true,
    personalizedAudioEligible: true,
  },
  CARE_7_GUIDED: {
    productCode: 'CARE_7_GUIDED',
    paidAmountCents: 10000,
    days: 7,
    guidedMeditation: true,
    fullReportIncluded: true,
    preparatoryAudioEligible: true,
    personalizedAudioEligible: true,
  },
  CARE_21: {
    productCode: 'CARE_21',
    paidAmountCents: 18000,
    days: 21,
    guidedMeditation: true,
    fullReportIncluded: true,
    preparatoryAudioEligible: true,
    personalizedAudioEligible: true,
  },
};

export const FULL_REPORT_ADDON_CENTS = 1500;

export function canAccessFullReport(entitlement: CommercialEntitlement | null | undefined): boolean {
  if (!entitlement) return false;
  return entitlement.fullReportIncluded || entitlement.fullReportAddonPaid;
}

export function canAccessPersonalizedAudio(entitlement: CommercialEntitlement | null | undefined): boolean {
  return Boolean(entitlement?.personalizedAudioEligible);
}

export function canAccessPreparatoryAudio(entitlement: CommercialEntitlement | null | undefined): boolean {
  return Boolean(entitlement?.preparatoryAudioEligible);
}

/**
 * Segurança comercial: ausência de entitlement confirmado nunca concede acesso.
 * A camada de pagamento/backend deve fornecer o entitlement real posteriormente.
 */
export const NO_CONFIRMED_ENTITLEMENT: CommercialEntitlement | null = null;
