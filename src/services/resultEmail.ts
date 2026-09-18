import { supabase } from '../lib/supabase';
import { createUserResultPdfBlob, UserResultPdfData } from '../pdf/userResultPdf';

export type ResultEmailStatus =
  | 'pending'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'provider_not_configured';

export async function requestResultEmail(params: {
  userId: string;
  intakeId: string;
  pdfData: UserResultPdfData;
  requestedBy: 'user' | 'admin';
  recipientEmail?: string;
}): Promise<{ requestId: string; status: ResultEmailStatus; message: string }> {
  const { userId, intakeId, pdfData, requestedBy, recipientEmail } = params;
  const { blob } = createUserResultPdfBlob(pdfData);

  const storagePath = `${userId}/${intakeId}/resultado-anamnese.pdf`;

  const { error: uploadError } = await supabase.storage
    .from('result-pdfs')
    .upload(storagePath, blob, {
      contentType: 'application/pdf',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data: requestRow, error: requestError } = await supabase
    .from('result_email_requests')
    .insert({
      user_id: userId,
      intake_id: intakeId,
      requested_by: requestedBy,
      recipient_email: recipientEmail || null,
      pdf_storage_path: storagePath,
      status: 'pending',
    })
    .select('id,status')
    .single();

  if (requestError) throw requestError;

  const { data: invokeData, error: invokeError } = await supabase.functions.invoke(
    'send-result-email',
    {
      body: { request_id: requestRow.id },
    }
  );

  if (invokeError) {
    const providerNotConfigured = invokeData?.provider_not_configured === true;
    return {
      requestId: requestRow.id as string,
      status: providerNotConfigured ? 'provider_not_configured' : 'failed',
      message: providerNotConfigured
        ? 'Solicitação registrada. O provedor de e-mail ainda precisa ser configurado.'
        : 'A solicitação foi registrada, mas o envio não pôde ser concluído agora.',
    };
  }

  return {
    requestId: requestRow.id as string,
    status: invokeData?.sent ? 'sent' : 'pending',
    message: invokeData?.sent
      ? 'Resultado enviado para seu e-mail.'
      : 'Solicitação de envio registrada.',
  };
}
