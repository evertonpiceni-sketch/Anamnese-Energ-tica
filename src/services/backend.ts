import { supabase } from '../lib/supabase';
import { AnamneseInput } from '../types';

export async function saveIntakeSession(params: {
  userId: string;
  intake: AnamneseInput;
}): Promise<string> {
  const { userId, intake } = params;

  const payload = {
    user_id: userId,
    external_ref: intake.id,
    person_name: intake.nomePessoa || null,
    age_text: intake.idade || null,
    contact_text: intake.contato || null,
    status: 'completed',
    completed_at: new Date().toISOString(),
    answers: intake.respostasObjetivas,
    free_text_need: intake.relatoLivreNecessidade,
    free_text_challenges: intake.relatoLivreDesafios,
    free_text_strengths: intake.relatoLivrePreservado,
    body_regions: intake.regioesCorporaisPercebidas,
    declared_intention: intake.intencaoDeclarada,
    service_preferences: intake.preferenciasAtendimento || null,
    energetic_sensitivity: intake.sensibilidadeEnergetica || null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('intake_sessions')
    .upsert(payload, { onConflict: 'user_id,external_ref' })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function updateOwnProfile(params: {
  displayName?: string;
  consentLgpd?: boolean;
}) {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Usuário não autenticado.');

  const changes: Record<string, unknown> = {};
  if (params.displayName !== undefined) changes.display_name = params.displayName;
  if (params.consentLgpd) changes.consent_lgpd_at = new Date().toISOString();

  if (!Object.keys(changes).length) return;

  const { error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', authData.user.id);

  if (error) throw error;
}
