import { supabase } from '../lib/supabase';
import type { PersonalizedAudioPlan } from '../audio/audioCatalog';
import type { CommercialEntitlement } from '../commercial/entitlements';
import { getCurrentUserEntitlementForIntake } from './entitlementBackend';

export interface UserMomentData {
  intake: {
    id: string;
    personName: string | null;
    completedAt: string | null;
    declaredIntention: string;
    answers: Record<string, number>;
    freeTextNeed: string;
    freeTextChallenges: string;
    freeTextStrengths: string;
    energeticSensitivity: string;
  } | null;
  entitlement: CommercialEntitlement | null;
  result: {
    headline: string;
    intro: string;
    priorities: string[];
    intention: string;
    closing: string;
    solfeggio: any;
    floral: any[];
    aromatherapy: any[];
    ethericCrystals: any[];
    journeyMode: string;
    publishedAt: string | null;
  } | null;
  carePlan: {
    id: string;
    audioPlanId: string;
    audioTitle: string | null;
    audioStatus: string;
    audioDurationSeconds: number | null;
    solfeggio: any;
    floral: any[];
    aromatherapy: any[];
    ethericCrystals: any[];
    journeyMode: string;
    publishedAt: string | null;
  } | null;
  audio: PersonalizedAudioPlan | null;
  automaticReport?: import('../result/fullReportNarrative').FullReportNarrative;
}

export async function loadUserMoment(): Promise<UserMomentData> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Usuário não autenticado.');

  const { data: intake, error: intakeError } = await supabase
    .from('intake_sessions')
    .select('id,external_ref,person_name,completed_at,declared_intention,answers,free_text_need,free_text_challenges,free_text_strengths,body_regions,energetic_sensitivity')
    .eq('user_id', authData.user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (intakeError) throw intakeError;

  const mapIntake = (row: any) => ({
    id: row.id,
    personName: row.person_name,
    completedAt: row.completed_at,
    declaredIntention: row.declared_intention || '',
    answers: row.answers && typeof row.answers === 'object' ? row.answers : {},
    freeTextNeed: row.free_text_need || '',
    freeTextChallenges: row.free_text_challenges || '',
    freeTextStrengths: row.free_text_strengths || '',
    energeticSensitivity: row.energetic_sensitivity || 'moderada',
  });

  if (!intake) {
    return {
      intake: null,
      entitlement: null,
      result: null,
      carePlan: null,
      audio: null,
    };
  }

  const entitlement = await getCurrentUserEntitlementForIntake(intake.id);

  if (!entitlement) {
    return {
      intake: mapIntake(intake),
      entitlement: null,
      result: null,
      carePlan: null,
      audio: null,
    };
  }

  const [{ data: result, error: resultError }, { data: carePlan, error: planError }] =
    await Promise.all([
      supabase
        .from('user_results')
        .select(
          'headline,intro,priorities,intention,closing,solfeggio,floral,aromatherapy,etheric_crystals,journey_mode,published_at'
        )
        .eq('intake_id', intake.id)
        .maybeSingle(),
      supabase
        .from('care_plans')
        .select(
          'id,audio_plan_id,audio_title,audio_status,audio_duration_seconds,solfeggio,floral,aromatherapy,etheric_crystals,journey_mode,published_at'
        )
        .eq('intake_id', intake.id)
        .neq('status', 'superseded')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (resultError) throw resultError;
  if (planError) throw planError;

  const mappedResult = result
    ? {
        headline: result.headline,
        intro: result.intro,
        priorities: Array.isArray(result.priorities) ? result.priorities : [],
        intention: result.intention,
        closing: result.closing,
        solfeggio: result.solfeggio,
        floral: Array.isArray(result.floral) ? result.floral : [],
        aromatherapy: Array.isArray(result.aromatherapy)
          ? result.aromatherapy
          : [],
        ethericCrystals: Array.isArray(result.etheric_crystals)
          ? result.etheric_crystals
          : [],
        journeyMode: result.journey_mode,
        publishedAt: result.published_at,
      }
    : null;

  const mappedPlan = carePlan
    ? {
        id: carePlan.id,
        audioPlanId: carePlan.audio_plan_id,
        audioTitle: carePlan.audio_title,
        audioStatus: carePlan.audio_status,
        audioDurationSeconds: carePlan.audio_duration_seconds,
        solfeggio: carePlan.solfeggio,
        floral: Array.isArray(carePlan.floral) ? carePlan.floral : [],
        aromatherapy: Array.isArray(carePlan.aromatherapy)
          ? carePlan.aromatherapy
          : [],
        ethericCrystals: Array.isArray(carePlan.etheric_crystals)
          ? carePlan.etheric_crystals
          : [],
        journeyMode: carePlan.journey_mode,
        publishedAt: carePlan.published_at,
      }
    : null;

  const audio: PersonalizedAudioPlan | null = mappedPlan
    ? {
        id: mappedPlan.audioPlanId,
        userId: authData.user.id,
        anamneseId: intake.id,
        titulo: mappedPlan.audioTitle || 'Sua sessão exclusiva',
        subtitulo: 'Criada exclusivamente para esta anamnese.',
        intencao:
          mappedResult?.intention ||
          intake.declared_intention ||
          'Um cuidado preparado para o seu momento atual.',
        eixos: [],
        sistemaBase: '',
        sistemaPrincipal: '',
        sistemasComplementares: [],
        recursosEnergeticos: {
          simbolos: [],
          energias: [],
          frequencias: [],
          cristais: [],
          chakras: [],
        },
        solfeggio: mappedPlan.solfeggio
          ? {
              id: `user-${mappedPlan.audioPlanId}-solfeggio`,
              hz: mappedPlan.solfeggio.hz,
              titulo: `${mappedPlan.solfeggio.hz} Hz`,
              chakraProjeto: mappedPlan.solfeggio.chakraProjeto || '',
              eixos: [],
              intencaoProjeto: mappedPlan.solfeggio.intencaoProjeto || '',
              status: 'ATIVO',
              fonteProjeto: 'Plano aprovado',
            }
          : null,
        roteiroBase: [],
        duracaoMinutos: mappedPlan.audioDurationSeconds
          ? Math.max(1, Math.round(mappedPlan.audioDurationSeconds / 60))
          : undefined,
        status:
          mappedPlan.audioStatus === 'published'
            ? 'GERADO'
            : 'AGUARDANDO_GERACAO',
        assinaturaComposicao: mappedPlan.audioPlanId,
      }
    : null;

  const { buildAutomaticCare } = await import('../care/automaticCare');
  const { buildBasicUserResult } = await import('../result/basicUserResult');
  const input = { id: intake.external_ref || intake.id, data: '', nomePessoa: intake.person_name || '', respostasObjetivas: intake.answers || {}, intencaoDeclarada: intake.declared_intention || '', relatoLivreNecessidade: intake.free_text_need || '', relatoLivreDesafios: intake.free_text_challenges || '', relatoLivrePreservado: intake.free_text_strengths || '', regioesCorporaisPercebidas: intake.body_regions || [], sensibilidadeEnergetica: intake.energetic_sensitivity || 'moderada' };
  const automatic = buildAutomaticCare(input, entitlement.days);
  const { selectComplementaryCare } = await import('../care/complementaryCatalogs');
  const { selectSolfeggioFrequency } = await import('../care/solfeggioCatalog');
  const complementary = selectComplementaryCare(automatic.analysis.relatorioEverton.eixosOrdenados);
  return {
    automaticReport: automatic.report,
    intake: mapIntake(intake),
    entitlement,
    result: { ...buildBasicUserResult(automatic.analysis, input), solfeggio: selectSolfeggioFrequency(automatic.analysis.relatorioEverton.eixosOrdenados), floral: complementary.florals, aromatherapy: complementary.aromatherapy, ethericCrystals: complementary.ethericCrystals, journeyMode: 'AUTOMATIC', publishedAt: mappedResult?.publishedAt || null },
    carePlan: mappedPlan,
    audio,
  };
}
