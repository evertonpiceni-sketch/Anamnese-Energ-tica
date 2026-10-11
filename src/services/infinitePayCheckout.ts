import { supabase } from '../lib/supabase';

export type InfinitePayAmountCents = 1500 | 5000 | 6500 | 10000 | 18000;

export interface InfinitePayCheckoutResult {
  orderNsu: string;
  checkoutUrl: string;
}

export async function createInfinitePayCheckout(params: {
  intakeId: string;
  amountCents: InfinitePayAmountCents;
}): Promise<InfinitePayCheckoutResult> {
  const { data, error } = await supabase.functions.invoke('create-infinitepay-checkout', {
    body: {
      intake_id: params.intakeId,
      amount_cents: params.amountCents,
    },
  });

  if (error) throw error;

  const checkoutUrl = String(data?.checkout_url || '').trim();
  const orderNsu = String(data?.order_nsu || '').trim();

  if (!checkoutUrl || !orderNsu) {
    throw new Error('A InfinitePay não devolveu um link de pagamento válido.');
  }

  return { orderNsu, checkoutUrl };
}
