import { supabase } from '../lib/supabase';
import {
  CommercialEntitlement,
  CommercialProductCode,
} from '../commercial/entitlements';

type EntitlementRow = {
  product_code: CommercialProductCode;
  paid_amount_cents: number;
  full_report_addon_paid: boolean;
  status: string;
};

function mapEntitlement(row: EntitlementRow): CommercialEntitlement | null {
  if (row.status !== 'active') return null;

  switch (row.product_code) {
    case 'CARE_7_BASIC':
      return {
        productCode: row.product_code,
        paidAmountCents: row.paid_amount_cents,
        days: 7,
        guidedMeditation: false,
        fullReportIncluded: false,
        fullReportAddonPaid: Boolean(row.full_report_addon_paid),
        preparatoryAudioEligible: true,
        personalizedAudioEligible: true,
      };
    case 'CARE_7_GUIDED':
      return {
        productCode: row.product_code,
        paidAmountCents: row.paid_amount_cents,
        days: 7,
        guidedMeditation: true,
        fullReportIncluded: true,
        fullReportAddonPaid: Boolean(row.full_report_addon_paid),
        preparatoryAudioEligible: true,
        personalizedAudioEligible: true,
      };
    case 'CARE_21':
      return {
        productCode: row.product_code,
        paidAmountCents: row.paid_amount_cents,
        days: 21,
        guidedMeditation: true,
        fullReportIncluded: true,
        fullReportAddonPaid: Boolean(row.full_report_addon_paid),
        preparatoryAudioEligible: true,
        personalizedAudioEligible: true,
      };
    default:
      return null;
  }
}

export async function getCurrentUserEntitlementForIntake(
  intakeId: string
): Promise<CommercialEntitlement | null> {
  const { data, error } = await supabase
    .from('commercial_entitlements')
    .select('product_code,paid_amount_cents,full_report_addon_paid,status')
    .eq('intake_id', intakeId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapEntitlement(data as EntitlementRow);
}

export async function getAdminEntitlementForIntake(
  intakeId: string
): Promise<CommercialEntitlement | null> {
  return getCurrentUserEntitlementForIntake(intakeId);
}
