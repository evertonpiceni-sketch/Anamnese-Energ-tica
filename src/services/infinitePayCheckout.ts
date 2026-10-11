import { supabase } from '../lib/supabase';

export type InfinitePayAmountCents = 100 | 1500 | 5000 | 6500 | 10000 | 18000;

export interface InfinitePayCheckoutResult {
  orderNsu: string;
  checkoutUrl: string;
}

function providerMessage(payload: any): string {
  const details = payload?.details;
  return String(
    details?.message ||
      details?.error ||
      details?.detail ||
      payload?.message ||
      payload?.error ||
      ''
  ).trim();
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

  if (error) {
    let payload: any = null;
    const context = (error as any)?.context;

    try {
      if (context && typeof context.json === 'function') {
        payload = await context.json();
      }
    } catch {
      // Se o corpo não puder ser lido, preservamos a mensagem original do erro.
    }

    const exact = providerMessage(payload);
    throw new Error(
      exact
        ? `A InfinitePay recusou a criação do pagamento: ${exact}`
        : `Não foi possível criar o pagamento na InfinitePay: ${error.message}`
    );
  }

  const checkoutUrl = String(data?.checkout_url || '').trim();
  const orderNsu = String(data?.order_nsu || '').trim();

  if (!checkoutUrl || !orderNsu) {
    const exact = providerMessage(data);
    throw new Error(
      exact
        ? `A InfinitePay não gerou o link: ${exact}`
        : 'A InfinitePay não devolveu um link de pagamento válido.'
    );
  }

  return { orderNsu, checkoutUrl };
}
