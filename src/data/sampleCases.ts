import { AnamneseInput } from '../types';

export interface CasoTeste {
  id: string;
  titulo: string;
  subtitulo: string;
  descricaoCaso: string;
  distincaoClinica: string;
  dados: AnamneseInput;
}

export const CASOS_DE_TESTE: CasoTeste[] = [
  {
    id: 'caso_a_tensao_vitalidade_alta',
    titulo: 'Caso A: Alta Tensão e Medo com Boa Vitalidade',
    subtitulo: 'Regra 7 & 26 — Vitalidade preservada, mas ação bloqueada por antecipação',
    descricaoCaso: 'Pessoa com alto ímpeto de realização e boa reserva vital, porém paralisada por ansiedade, medo de errar e mente hiperativa.',
    distincaoClinica: 'Não há falta de energia ou cansaço fisiológico. A trava para agir decorre prioritariamente da tensão antecipatória e medo. A estabilização e acolhimento (Karuna Ki Shanti/Halu) devem preceder qualquer ativação de movimento.',
    dados: {
      id: 'ANAM-2026-CASO-A',
      data: '2026-09-18',
      nomePessoa: 'Mariana Silveira',
      idade: '34 anos',
      contato: 'mariana.silveira@exemplo.com',
      historicoEnergetico: 'Já fez 2 sessões de Reiki Tradicional no ano passado; sente facilidade em perceber calor nas mãos.',
      intencaoDeclarada: 'Quero conseguir tirar meus projetos do papel sem sentir que meu coração vai explodir de ansiedade a cada decisão.',
      respostasObjetivas: {
        q1_procrastinacao_inicio: 3, // adia o começo
        q2_mente_acelerada: 4, // mente a mil
        q3_sensacao_ameaca_inseguranca: 3, // medo/alerta
        q4_cansaco_esgotamento: 1, // vitalidade boa!
        q5_autocobranca_insuficiencia: 4, // altíssima autocobrança
        q6_engolir_emocoes: 2,
        q7_dificuldade_dizer_nao: 2,
        q8_dificuldade_receber: 2,
        q9_sensibilidade_ambientes: 2,
        q10_repeticao_ciclos: 2,
        q11_desconexao_corpo_prazer: 3,
        q12_trava_expressao_criatividade: 2,
        q13_inseguranca_material_prosperidade: 1,
        q14_falta_direcao_proposito: 1,
        q15_desconexao_espiritual: 1,
        q16_dificuldade_desapegar: 1,
        q17_desejo_recomeco: 3,
        q18_sensacao_fragmentacao: 3,
        q19_tensao_corporal_cronica: 4, // tensão muscular alta
        q20_conflitos_relacionamento: 1,
      },
      relatoLivreNecessidade: 'Sinto que preciso aprender a respirar e desacelerar o controle. Tenho muitas ideias e vontade de fazer acontecer, mas o medo de falhar me deixa com os ombros duros como pedra.',
      relatoLivreDesafios: 'Antecipação constante de cenários negativos e aperto no peito sempre que preciso apresentar meus trabalhos.',
      relatoLivrePreservado: 'Ainda sinto paixão pelo que faço, amo criar e sinto que tenho muita energia viva, só não consigo direcioná-la com calma.',
      regioesCorporaisPercebidas: ['peito_coracao', 'costas_ombros_trapezio', 'cabeca_temporas'],
      preferenciasAtendimento: 'Prefere toques suaves ou campo sutil; não gosta de sons estridentes.',
      sensibilidadeEnergetica: 'alta',
    },
  },
  {
    id: 'caso_b_exaustao_baixa_vitalidade',
    titulo: 'Caso B: Alta Exaustão e Medo com Baixa Vitalidade',
    subtitulo: 'Regra 7 & 15 — Esgotamento basal e necessidade urgente de sustentação',
    descricaoCaso: 'Pessoa em estado de burnout com esgotamento físico, sensação de vazio, insegurança e sem fôlego vital para dar qualquer passo.',
    distincaoClinica: 'Diferente do Caso A, aqui a paralisia decorre de falta de sustentação e esgotamento da bateria biológica/sutil. Sistemas estimulantes são contraindicados. Requer Sistema-Base neutro e sustentado (Original Reiki Platinum + Quartzo Fumê) com acolhimento compassivo.',
    dados: {
      id: 'ANAM-2026-CASO-B',
      data: '2026-09-18',
      nomePessoa: 'Rodrigo Medeiros',
      idade: '41 anos',
      contato: 'rodrigo.medeiros@exemplo.com',
      historicoEnergetico: 'Primeiro contato com terapias energéticas integrativas.',
      intencaoDeclarada: 'Recuperar o mínimo de energia e paz para conseguir levantar da cama sem sentir que estou arrastando uma tonelada.',
      respostasObjetivas: {
        q1_procrastinacao_inicio: 4, // trava total
        q2_mente_acelerada: 2,
        q3_sensacao_ameaca_inseguranca: 3, // medo e vulnerabilidade
        q4_cansaco_esgotamento: 4, // esgotamento máximo
        q5_autocobranca_insuficiencia: 3,
        q6_engolir_emocoes: 3,
        q7_dificuldade_dizer_nao: 3,
        q8_dificuldade_receber: 4, // não consegue receber apoio
        q9_sensibilidade_ambientes: 3,
        q10_repeticao_ciclos: 2,
        q11_desconexao_corpo_prazer: 4,
        q12_trava_expressao_criatividade: 3,
        q13_inseguranca_material_prosperidade: 2,
        q14_falta_direcao_proposito: 3,
        q15_desconexao_espiritual: 2,
        q16_dificuldade_desapegar: 2,
        q17_desejo_recomeco: 2,
        q18_sensacao_fragmentacao: 3,
        q19_tensao_corporal_cronica: 3,
        q20_conflitos_relacionamento: 2,
      },
      relatoLivreNecessidade: 'Preciso de colo, repouso e reabastecimento. Não tenho força para nada ativo no momento.',
      relatoLivreDesafios: 'Cansaço crônico nos olhos e pernas, sensação de que minha bateria interna está em 2%. Culpado por não produzir.',
      relatoLivrePreservado: 'Ainda tenho esperança de recuperar minha saúde e voltar a sentir alegria nas pequenas coisas da vida.',
      regioesCorporaisPercebidas: ['pernas_joelhos_pes', 'baixo_ventre_lombar', 'costas_ombros_trapezio'],
      preferenciasAtendimento: 'Sessão calma, aquecimento suave, silêncio e acolhimento.',
      sensibilidadeEnergetica: 'muito_alta',
    },
  },
  {
    id: 'caso_c_procrastinacao_inseguranca',
    titulo: 'Caso C: Procrastinação por Autocobrança e Insegurança',
    subtitulo: 'Regra 8 — Análise de Causa Funcional: INSEGURANÇA → PROCRASTINAÇÃO',
    descricaoCaso: 'Pessoa com boa capacidade intelectual e clareza de metas, mas que paralisa na entrega por medo de julgamento e perfeccionismo punitivo.',
    distincaoClinica: 'Cadeia funcional identificada: AUTOBRANÇA → MEDO DE REJEIÇÃO → PARALISAÇÃO. O motor deve focar em Soul Shakti (Soul Healing + Mind Empowerment) complementado por Karuna Ki Harth/Halu para curar a autoestima ferida.',
    dados: {
      id: 'ANAM-2026-CASO-C',
      data: '2026-09-18',
      nomePessoa: 'Juliana Castro',
      idade: '29 anos',
      contato: 'juliana.castro@exemplo.com',
      historicoEnergetico: 'Pratica meditação esporádica.',
      intencaoDeclarada: 'Quero destravar a minha confiança e parar de me esconder por achar que não sou boa o suficiente.',
      respostasObjetivas: {
        q1_procrastinacao_inicio: 4, // máxima procrastinação
        q2_mente_acelerada: 3,
        q3_sensacao_ameaca_inseguranca: 2,
        q4_cansaco_esgotamento: 2,
        q5_autocobranca_insuficiencia: 4, // máxima autocobrança
        q6_engolir_emocoes: 2,
        q7_dificuldade_dizer_nao: 3,
        q8_dificuldade_receber: 3,
        q9_sensibilidade_ambientes: 2,
        q10_repeticao_ciclos: 3,
        q11_desconexao_corpo_prazer: 2,
        q12_trava_expressao_criatividade: 4, // trava criativa
        q13_inseguranca_material_prosperidade: 3,
        q14_falta_direcao_proposito: 2,
        q15_desconexao_espiritual: 1,
        q16_dificuldade_desapegar: 2,
        q17_desejo_recomeco: 3,
        q18_sensacao_fragmentacao: 2,
        q19_tensao_corporal_cronica: 3,
        q20_conflitos_relacionamento: 1,
      },
      relatoLivreNecessidade: 'Preciso acreditar no meu próprio valor. Fico lapidando o mesmo trabalho semanas com medo do julgamento dos outros.',
      relatoLivreDesafios: 'Voz interna crítica implacável que diz que nada está à altura; trava na garganta na hora de falar.',
      relatoLivrePreservado: 'Minha criatividade é genuína, tenho amor pelos meus estudos e desejo imenso de contribuir com o mundo.',
      regioesCorporaisPercebidas: ['garganta_pescoco', 'plexo_estomago'],
      preferenciasAtendimento: 'Gosta de alinhamento com cristais e comandos afirmativos suaves.',
      sensibilidadeEnergetica: 'moderada',
    },
  },
  {
    id: 'caso_d_limpeza_padroes_relacionamentos',
    titulo: 'Caso D: Repetição de Padrões e Sobrecarga por Falta de Limites',
    subtitulo: 'Regra 8 — Causa Funcional: FALTA DE LIMITES → DIFICULDADE DE RECEBER → ESGOTAMENTO',
    descricaoCaso: 'Pessoa que se anula para cuidar de todos, assume pesos emocionais da família e do parceiro, sentindo-se esvaziada e ressentida.',
    distincaoClinica: 'Cadeia funcional: FALTA DE LIMITES → ABSORÇÃO DE AMBIENTES → SOBRECARGA EMOCIONAL. Requer Usui Sei He Ki + Karuna Ki Harth e proteção de malha cristalina para reorganizar o espaço áurico.',
    dados: {
      id: 'ANAM-2026-CASO-D',
      data: '2026-09-18',
      nomePessoa: 'Cláudia Fontes',
      idade: '48 anos',
      contato: 'claudia.fontes@exemplo.com',
      historicoEnergetico: 'Recebeu Reiki Usui há 5 anos, teve sensações muito agradáveis de leveza.',
      intencaoDeclarada: 'Aprender a colocar limites com amor, limpar mágoas antigas acumuladas e conseguir receber cuidado sem me sentir culpada.',
      respostasObjetivas: {
        q1_procrastinacao_inicio: 2,
        q2_mente_acelerada: 3,
        q3_sensacao_ameaca_inseguranca: 2,
        q4_cansaco_esgotamento: 3,
        q5_autocobranca_insuficiencia: 3,
        q6_engolir_emocoes: 4, // engole mágoas
        q7_dificuldade_dizer_nao: 4, // não consegue dizer não
        q8_dificuldade_receber: 4, // não recebe nada
        q9_sensibilidade_ambientes: 4, // absorve tudo
        q10_repeticao_ciclos: 4, // repete padrão
        q11_desconexao_corpo_prazer: 3,
        q12_trava_expressao_criatividade: 2,
        q13_inseguranca_material_prosperidade: 1,
        q14_falta_direcao_proposito: 2,
        q15_desconexao_espiritual: 1,
        q16_dificuldade_desapegar: 4, // apego a mágoas
        q17_desejo_recomeco: 3,
        q18_sensacao_fragmentacao: 3,
        q19_tensao_corporal_cronica: 4,
        q20_conflitos_relacionamento: 4, // conflito relacional
      },
      relatoLivreNecessidade: 'Preciso soltar o peso que não é meu. Sempre fui a forte que carrega a família inteira nas costas e agora sinto que cheguei ao meu limite físico e emocional.',
      relatoLivreDesafios: 'Dificuldade imensa de dizer não, sensação de culpa ao descansar e mágoa profunda de ingratidão.',
      relatoLivrePreservado: 'Minha generosidade e minha capacidade de amar são verdadeiras; quero mantê-las, mas sem me destruir no processo.',
      regioesCorporaisPercebidas: ['costas_ombros_trapezio', 'peito_coracao', 'garganta_pescoco'],
      preferenciasAtendimento: 'Sessão profunda e desintoxicante, acolhimento sem cobranças.',
      sensibilidadeEnergetica: 'alta',
    },
  },
];
