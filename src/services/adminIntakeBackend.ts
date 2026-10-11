import { supabase } from '../lib/supabase';
import { AnamneseInput } from '../types';

export interface AdminIntakeRecord {
  userId: string;
  intakeId: string;
  intake: AnamneseInput;
  completedAt: string | null;
}

type IntakeRow = {
  id: string;
  user_id: string;
  external_ref: string | null;
  person_name: string | null;
  age_text: string | null;
  contact_text: string | null;
  answers: Record<string, number> | null;
  free_text_need: string | null;
  free_text_challenges: string | null;
  free_text_strengths: string | null;
  body_regions: string[] | null;
  declared_intention: string | null;
  service_preferences: string | null;
  energetic_sensitivity: AnamneseInput['sensibilidadeEnergetica'] | null;
  completed_at: string | null;
};

function rowToIntake(row: IntakeRow): AnamneseInput {
  return {
    id: row.external_ref || row.id,
    data: row.completed_at ? row.completed_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    nomePessoa: row.person_name || '',
    idade: row.age_text || '',
    contato: row.contact_text || '',
    historicoEnergetico: '',
    intencaoDeclarada: row.declared_intention || '',
    respostasObjetivas: row.answers || {},
    relatoLivreNecessidade: row.free_text_need || '',
    relatoLivreDesafios: row.free_text_challenges || '',
    relatoLivrePreservado: row.free_text_strengths || '',
    regioesCorporaisPercebidas: row.body_regions || [],
    preferenciasAtendimento: row.service_preferences || '',
    sensibilidadeEnergetica: row.energetic_sensitivity || 'moderada',
  };
}

/**
 * Fonte segura para o ADM. Não usa localStorage nem dados deixados por outra
 * sessão do navegador. O acesso é deliberadamente submetido às políticas RLS
 * do Supabase; se a conta não for administrativa, a consulta não deve retornar
 * registros de terceiros.
 */
export async function getLatestCompletedIntakeForAdmin(): Promise<AdminIntakeRecord | null> {
  const { data, error } = await supabase
    .from('intake_sessions')
    .select(`
      id,
      user_id,
      external_ref,
      person_name,
      age_text,
      contact_text,
      answers,
      free_text_need,
      free_text_challenges,
      free_text_strengths,
      body_regions,
      declared_intention,
      service_preferences,
      energetic_sensitivity,
      completed_at
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as IntakeRow;
  return {
    userId: row.user_id,
    intakeId: row.id,
    intake: rowToIntake(row),
    completedAt: row.completed_at,
  };
}

export async function listRecentCompletedIntakesForAdmin(limit = 25): Promise<AdminIntakeRecord[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const { data, error } = await supabase
    .from('intake_sessions')
    .select(`
      id,
      user_id,
      external_ref,
      person_name,
      age_text,
      contact_text,
      answers,
      free_text_need,
      free_text_challenges,
      free_text_strengths,
      body_regions,
      declared_intention,
      service_preferences,
      energetic_sensitivity,
      completed_at
    `)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(safeLimit);

  if (error) throw error;

  return ((data || []) as IntakeRow[]).map(row => ({
    userId: row.user_id,
    intakeId: row.id,
    intake: rowToIntake(row),
    completedAt: row.completed_at,
  }));
}
