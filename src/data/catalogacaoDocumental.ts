import { SistemaBiblioteca } from '../types';

/**
 * Camada documental da Biblioteca-Mestra.
 * Os pesos abaixo são um mapeamento interno do aplicativo (0–4) construído
 * exclusivamente a partir das áreas de uso descritas nos materiais do acervo.
 * Eles não são alegações clínicas nem substituem os manuais de origem.
 */

type OverrideSistema = Partial<SistemaBiblioteca> & { catalogacaoTecnica: 'COMPLETA' | 'PARCIAL' | 'PENDENTE' };

const r = (
  nome: string,
  tipo: 'símbolo' | 'energia' | 'frequência' | 'comando' | 'módulo' | 'técnica',
  eixosCompatíveis: any[],
  fonteDocumental: string,
  descricao = 'Recurso confirmado no material de origem.'
) => ({ nome, tipo, descricao, eixosCompatíveis, fonteDocumental });

export const CATALOGACAO_DOCUMENTAL: Record<string, OverrideSistema> = {
  original_reiki_platinum: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Níveis 1, 2 e 3 — Mestrado',
    comandos: ['ORIGINAL REIKI PLATINUM.'],
    objetivos: 'Formação confirmada em níveis 1, 2 e 3 Mestrado. Nos roteiros aprovados da Reintegração da Vida é utilizado como recurso de sustentação e integração.',
    areasAtuacao: ['sustentação', 'integração', 'presença'],
    origemDocumental: {
      idDocumento: 'Material - Original Reiki Platinum e Original Reiki Healing System.pdf + Reintegracao_a_Vida_Roteiro_1_Programacao_Energetica_FINAL.pdf',
      curso: 'Original Reiki Platinum',
      statusConfirmacao: 'Formação 1, 2 e 3 Mestrado confirmada; aplicação do comando confirmada nos roteiros aprovados.',
    },
    compatibilidadeEixos: { seguranca: 3, integracao: 4, corpo: 2, vitalidade: 2 },
  },

  karuna_ki: {
    catalogacaoTecnica: 'PARCIAL',
    simbolos: ['Zonar', 'Halu', 'Harth', 'Rama', 'Gnosa', 'Kriya', 'Iava', 'Shanti'],
    objetivos: 'Sistema Karuna Ki com símbolos confirmados nos materiais de formação e utilizados nos roteiros aprovados conforme o objetivo de cada etapa.',
    areasAtuacao: ['acolhimento emocional', 'padrões', 'aterramento', 'movimento', 'autovalor', 'clareza'],
    recursosInternos: [
      r('Zonar','símbolo',['padroes','limpeza','emocional'],'Apostila de Karuna Ki / materiais de iniciação'),
      r('Halu','símbolo',['padroes','limpeza','mente'],'Apostila de Karuna Ki / materiais de iniciação'),
      r('Harth','símbolo',['emocional','autovalor','receber','relacionamentos'],'Apostila de Karuna Ki / Reintegração da Vida'),
      r('Rama','símbolo',['seguranca','movimento','corpo'],'Apostila de Karuna Ki / Reintegração da Vida'),
      r('Gnosa','símbolo',['mente','proposito','espiritualidade'],'Apostila de Karuna Ki / Reintegração da Vida'),
      r('Kriya','símbolo',['movimento','poder_pessoal','prosperidade'],'Apostila de Karuna Ki / Reintegração da Vida'),
      r('Iava','símbolo',['poder_pessoal','relacionamentos','movimento'],'Apostila de Karuna Ki / Reintegração da Vida'),
      r('Shanti','símbolo',['seguranca','emocional','mente'],'Apostila de Karuna Ki / Reintegração da Vida'),
    ],
    metodosAtivacao: ['Usar os símbolos e procedimentos conforme a iniciação Karuna Ki recebida e o material de origem.'],
    origemDocumental: {
      idDocumento: 'Apostila de Karuna Ki nível 1 + materiais de iniciação Karuna Ki',
      curso: 'Karuna Ki',
      statusConfirmacao: 'Formação e símbolos confirmados documentalmente.',
    },
    compatibilidadeEixos: { seguranca: 4, emocional: 4, autovalor: 4, mente: 3, movimento: 4, padroes: 4, relacionamentos: 3, receber: 3, limpeza: 3, proposito: 2 },
  },

  soul_shakti: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Soul Shakti I e II — Mestrado',
    modulos: [
      'Physical Body Attunement','Emotional Body Attunement','Mental Body Attunement','Compassionate Body Attunement',
      'Atmic Body Attunement','Monadic Body Attunement','Divine Body Attunement','First Brain Attunement',
      'Second Brain Attunement','Third Brain Attunement','Fourth Brain Attunement','Shakti Chakras Empowerment',
      'Shakti Meridians Empowerment','Shakti Aura Healing','Shakti Aura Shield','Shakti Body Purification',
      'Soul Awakening','Soul Fire','Soul Shakti Healing','Spiritual Individuality Attunement',
      'Personality Shakti Attunement','Mind Shakti Empowerment','Soul Venus Shakti Empowerment','Soul Desires',
      'Expansion Shakti','Soul Awakener Shakti','Dissolver Shakti','Soul Regeneration',
      'Shakti Immune Healing Energy','Shakti Miracle','Spiritual Alignment Shakti'
    ],
    energias: [
      'Shakti Aura Healing','Shakti Body Purification','Soul Awakening','Soul Fire','Soul Shakti Healing',
      'Spiritual Individuality Attunement','Mind Shakti Empowerment','Soul Regeneration','Spiritual Alignment Shakti'
    ],
    comandos: [
      'Shakti Aura Healing !','Shakti Body Purification !','Soul Shakti Healing !',
      'Spiritual Individuality Attunement !','Soul Awakener Shakti !','Shakti Chakra Empowerment !',
      'Shakti Meridians Empowerment !'
    ],
    recursosInternos: [
      r('Shakti Aura Healing','energia',['protecao','integracao','corpo'],'SOUL.SHAKTI LEVEL1 / LEVEL2'),
      r('Shakti Body Purification','energia',['limpeza','corpo','integracao'],'SOUL.SHAKTI LEVEL1 / LEVEL2'),
      r('Soul Awakening','energia',['proposito','espiritualidade','recomeco'],'SOUL.SHAKTI LEVEL1'),
      r('Soul Fire','energia',['espiritualidade','limpeza','movimento'],'SOUL.SHAKTI LEVEL1'),
      r('Soul Shakti Healing','energia',['emocional','corpo','integracao','seguranca'],'SOUL.SHAKTI LEVEL1 / LEVEL2'),
      r('Spiritual Individuality Attunement','energia',['poder_pessoal','proposito','autovalor'],'SOUL SHAKTI LEVEL2'),
      r('Mind Shakti Empowerment','energia',['mente','movimento','poder_pessoal'],'SOUL SHAKTI LEVEL2'),
      r('Soul Regeneration','energia',['recomeco','integracao','autovalor'],'SOUL SHAKTI LEVEL2'),
      r('Spiritual Alignment Shakti','energia',['proposito','espiritualidade','integracao'],'SOUL SHAKTI LEVEL2'),
    ],
    objetivos: 'Sistema em dois níveis com funções para corpos sutis, chakras, meridianos, aura, purificação, despertar, alinhamento, mente, regeneração e integração, conforme os manuais.',
    areasAtuacao: ['corpo energético', 'aura', 'purificação', 'mente', 'autovalor', 'propósito', 'integração', 'movimento'],
    cuidados: ['As descrições de saúde presentes no manual são registradas como alegações do sistema, não como diagnóstico ou promessa clínica.'],
    origemDocumental: {
      idDocumento: 'SOUL.SHAKTI LEVEL1 - original.pdf + SOUL SHAKTI LEVEL2 - original.pdf',
      curso: 'Soul Shakti I e II',
      statusConfirmacao: 'Manuais e áudios de sintonização de ambos os níveis confirmados.',
    },
    compatibilidadeEixos: { emocional: 4, autovalor: 3, mente: 4, movimento: 3, vitalidade: 3, corpo: 3, limpeza: 4, proposito: 4, espiritualidade: 4, protecao: 3, recomeco: 3, integracao: 4 },
  },

  dna_light_integrative: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: '4 sintonizações — Mestrado',
    modulos: ['Anchoring Light Attunement','Genetic Coding Attunement','Universal Love Attunement','Divine Blueprint Attunement'],
    energias: ['Anchoring Light','Genetic Coding','Universal Love','Divine Blueprint'],
    comandos: ['Ancoragem da Sintonização da Luz!','Sintonia de codificação genética!','Universal Love Attunement!','Harmonização do Projeto Divino!'],
    recursosInternos: [
      r('Anchoring Light','energia',['seguranca','corpo','integracao'],'DNA LIGHT INTEGRATIVE ATTUNEMENTS - R.pdf'),
      r('Genetic Coding','energia',['autovalor','proposito','integracao'],'DNA LIGHT INTEGRATIVE ATTUNEMENTS - R.pdf'),
      r('Universal Love','energia',['emocional','relacionamentos','receber','autovalor'],'DNA LIGHT INTEGRATIVE ATTUNEMENTS - R.pdf'),
      r('Divine Blueprint','energia',['proposito','recomeco','integracao','espiritualidade'],'DNA LIGHT INTEGRATIVE ATTUNEMENTS - R.pdf'),
    ],
    objetivos: 'Sistema de quatro sintonizações documentadas: Anchoring Light, Genetic Coding, Universal Love e Divine Blueprint.',
    areasAtuacao: ['aterramento', 'integração', 'amor', 'propósito', 'recomeço'],
    restricoes: ['O manual informa restrições específicas para sintonização em gestantes e crianças pré-adolescentes e exige consentimento para sintonização.'],
    cuidados: ['Tratar essas restrições como instruções do próprio sistema; não convertê-las em aconselhamento médico.'],
    origemDocumental: {
      idDocumento: 'DNA LIGHT INTEGRATIVE ATTUNEMENTS - R.pdf',
      curso: 'DNA Light Integrative',
      statusConfirmacao: 'Manual e áudio de sintonização níveis 1–4 Mestrado confirmados.',
    },
    compatibilidadeEixos: { seguranca: 3, emocional: 3, autovalor: 3, relacionamentos: 3, receber: 3, proposito: 4, espiritualidade: 3, recomeco: 4, integracao: 4 },
  },

  life_force_energy_cone: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: [
      'Agora ATIVO o Life Force energy cone perfeitamente. Assim seja!',
      'Agora EU ATIVO o Life Force energy cone para impulsionar minha energia perfeitamente. Assim seja!'
    ],
    objetivos: 'Sistema documentado como recurso de apoio a outras sessões e para impulso de energia.',
    areasAtuacao: ['vitalidade', 'movimento', 'apoio de sessão', 'aterramento'],
    metodosAtivacao: ['Ativação mental conforme o objetivo; o manual orienta aguardar cerca de 5 minutos no uso para impulso de energia.'],
    origemDocumental: {
      idDocumento: 'Life Force Energy Cone.docx / Life Force Energy Cone.pdf',
      curso: 'Life Force Energy Cone',
      statusConfirmacao: 'Manual e áudio de sintonização Mestrado confirmados.',
    },
    ehEstimulanteAtivo: true,
    compatibilidadeEixos: { vitalidade: 4, movimento: 4, corpo: 2, seguranca: 2, recomeco: 2, integracao: 2 },
  },

  etheric_clearing: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Sequências 1–4 — Mestrado',
    modulos: ['Sequência 1','Sequência 2','Sequência 3','Sequência 4','Master Space Clearing'],
    comandos: ['Sintonização de Limpeza Etérica!','Ativando Master Space Clearing!!'],
    objetivos: 'Sistema de sequências de limpeza etérica e limpeza de espaços, com procedimentos para si, outros e ambientes.',
    areasAtuacao: ['limpeza', 'padrões', 'ambientes', 'proteção', 'recomeço'],
    recursosInternos: [
      r('Primeira sequência','módulo',['limpeza','padroes','recomeco'],'Etheric Clearing Sequences.pdf'),
      r('Master Space Clearing','técnica',['limpeza','protecao','integracao'],'Etheric Clearing Sequences.docx'),
    ],
    origemDocumental: {
      idDocumento: 'Etheric Clearing Sequences.docx / .pdf',
      curso: 'Etheric Clearing Sequences',
      statusConfirmacao: 'Manual e áudios de sintonização das sequências 1–4 confirmados.',
    },
    compatibilidadeEixos: { limpeza: 4, padroes: 4, protecao: 3, recomeco: 3, integracao: 2 },
  },

  acupuntura_eterica_quantica: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado — Acupuntura Etérica + Acupuntura Etérica Quântica',
    modulos: ['Acupuntura Etérica','Acupuntura Etérica Quântica','Cristal Mestre da Acupuntura'],
    comandos: ['Ativando agora o Cristal Mestre da Acupuntura em todo meu corpo.'],
    objetivos: 'Sistema energético descrito no manual para ativar agulhas etéricas por intenção; a versão quântica associa os cinco elementos. Inclui o Cristal Mestre da Acupuntura.',
    areasAtuacao: ['corpo energético', 'integração', 'distribuição de frequências', 'meridianos/nadis'],
    recursosInternos: [
      r('Acupuntura Etérica','técnica',['corpo','integracao'],'Apostila de Acupuntura Etérica e Cristal Mestre'),
      r('Acupuntura Etérica Quântica','técnica',['corpo','integracao','limpeza'],'Apostila de Acupuntura Etérica e Cristal Mestre'),
      r('Cristal Mestre da Acupuntura','técnica',['corpo','integracao'],'Apostila de Acupuntura Etérica e Cristal Mestre'),
    ],
    duracaoSugerida: 'O manual descreve aproximadamente 20 minutos para uma sessão de Acupuntura Etérica.',
    cuidados: ['Não transformar a linguagem energética do manual em diagnóstico ou tratamento médico.'],
    origemDocumental: {
      idDocumento: 'Apostila de Acupuntura Etérica e Cristal Mestre da Acupuntura_Fernando Kreutz.pdf',
      curso: 'Acupuntura Etérica / Acupuntura Etérica Quântica',
      statusConfirmacao: 'Manual e procedimento de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { corpo: 4, integracao: 4, limpeza: 3, seguranca: 2, movimento: 2, vitalidade: 2 },
  },

  golden_light_source: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Mestrado',
    comandos: ['ativando The Golden Light Source','Ativando The Golden Light Source 2017','Ativando Golden Light Source 2017 em nível mestrado'],
    objetivos: 'Sistema confirmado por manual; usado também na abertura e ancoragem dos roteiros da Reintegração da Vida.',
    areasAtuacao: ['abertura', 'sustentação', 'integração'],
    origemDocumental: {
      idDocumento: 'GOLDEN LIGHT SOURCE 2017 - Fernando.pdf',
      curso: 'The Golden Light Source 2017',
      statusConfirmacao: 'Manual e linhagem confirmados.',
    },
    compatibilidadeEixos: { seguranca: 3, espiritualidade: 3, integracao: 4 },
  },

  reiki_usui_tibetano_kahuna: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Níveis I, II, III-A e III-B Mestrado',
    simbolos: ['Cho Ku Rei','Sei He Ki','Hon Sha Ze Sho Nen','Dai Koo Myo Tradicional','Dai Koo Myo Tibetano','Serpente de Fogo'],
    objetivos: 'Formação completa documentada do Reiki Usui, Tibetano e Kahuna até o nível III-B Mestrado.',
    areasAtuacao: ['harmonização', 'emocional', 'mental', 'distância', 'integração', 'espiritualidade'],
    origemDocumental: {
      idDocumento: 'Apostilas Reiki Usui-Tibetano-Kahuna Níveis I, II, III-A e III-B',
      curso: 'Reiki Usui, Tibetano e Kahuna',
      statusConfirmacao: 'Apostilas licenciadas para Everton e material de sintonização confirmado.',
    },
    compatibilidadeEixos: { seguranca: 3, emocional: 4, mente: 3, corpo: 3, relacionamentos: 3, espiritualidade: 4, integracao: 4 },
  },

  cristais_etericos_quanticos_usui: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    simbolos: ['Cristal Mestre Usui','Cristal Cho Ku Rei','Cristal Sei He Ki','Cristal Hon Sha Ze Sho Nen','Cristal Dai Koo Myo'],
    objetivos: 'Cristais etéricos de quartzo sintonizados com energias do Reiki Usui/Tibetano/Kahuna, com uso em mãos, corpo, ambientes, distância e programações.',
    areasAtuacao: ['harmonização', 'amplificação', 'corpo', 'ambientes', 'integração'],
    metodosAtivacao: ['Ativação do cristal por nome/intenção conforme o manual; o Cristal Mestre pode ser intensificado progressivamente até o nível 7.'],
    origemDocumental: {
      idDocumento: 'CRISTAIS USUI.pdf',
      curso: 'Cristais Etéricos Quânticos Usui',
      statusConfirmacao: 'Manual completo confirmado.',
    },
    compatibilidadeEixos: { corpo: 3, integracao: 4, vitalidade: 3, protecao: 2, limpeza: 2, mente: 2, emocional: 2 },
  },

  violet_flame: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['ativando Violet flame','Violet flame 2017','Ativando Chama Violeta'],
    objetivos: 'Sistema descrito no manual como energia de renovação/transmutação, utilizável por intenção no corpo, em água e ambientes.',
    areasAtuacao: ['limpeza', 'renovação', 'ambientes', 'integração'],
    formasAplicacao: ['Aplicação intencional no corpo','Elixir energético conforme o manual','Preenchimento de ambiente'],
    origemDocumental: {
      idDocumento: 'VIOLET FLAME 2017.pdf',
      curso: 'Violet Flame 2017',
      statusConfirmacao: 'Manual e linhagem confirmados.',
    },
    compatibilidadeEixos: { limpeza: 4, recomeco: 4, integracao: 3, protecao: 2 },
  },

  empoderamentos_ganesha: {
    catalogacaoTecnica: 'PENDENTE',
    objetivos: 'Formação confirmada por certificado. O conteúdo técnico ainda não foi encontrado em manual legível no acervo consultado.',
    areasAtuacao: [],
    recursosInternos: [],
    compatibilidadeEixos: {},
  },

  my_red_hot_sizzling_aura: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['ATIVANDO AGORA MY RED HOT SIZZLING AURA','ATIVANDO MY RED HOT SIZZLING AURA EXPANDINDO AGORA'],
    objetivos: 'O manual relaciona o sistema a determinação, poder interior, magnetismo, prazer, sexualidade, paixão, resistência, força de vontade, sensualidade e vitalidade dos chakras inferiores.',
    areasAtuacao: ['vitalidade', 'prazer', 'sensualidade', 'magnetismo', 'poder pessoal', 'movimento'],
    chakras: ['chakras inferiores'],
    formasAplicacao: ['Autotratamento por alguns minutos','Uso isolado ou em conjunto com Reiki','Expansão da aura conforme comando do manual'],
    origemDocumental: {
      idDocumento: 'My Red Hot Sizzling Aura.docx / .pdf',
      curso: 'My Red Hot Sizzling Aura',
      statusConfirmacao: 'Manual e áudio de sintonização Mestrado confirmados.',
    },
    ehEstimulanteAtivo: true,
    requerEstabilizacaoPrevia: true,
    compatibilidadeEixos: { vitalidade: 4, prazer: 4, poder_pessoal: 4, movimento: 3, criatividade: 2, autovalor: 2 },
  },

  shamballa_multidimensional_healing: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Níveis 1, 2, 3 e 4',
    comandos: ['Shamballa AQUI'],
    objetivos: 'Sistema documentado em quatro níveis. No nível 1 o manual orienta aplicação regular, semelhante ao Reiki I ou guiada pela intuição, e descreve sessões geralmente inferiores a 10 minutos.',
    areasAtuacao: ['harmonização', 'espiritualidade', 'integração', 'emocional'],
    metodosAtivacao: ['No nível 1, intenção e comando “Shamballa AQUI”.'],
    formasAplicacao: ['Autotratamento','Tratamento presencial','Tratamento à distância a partir do nível correspondente'],
    origemDocumental: {
      idDocumento: 'Shamballa Multidimensional Healing Níveis 1, 2, 3 e 4',
      curso: 'Shamballa Multidimensional Healing',
      statusConfirmacao: 'Manuais dos quatro níveis confirmados.',
    },
    compatibilidadeEixos: { emocional: 3, espiritualidade: 4, integracao: 4, seguranca: 2, proposito: 3 },
  },

  ama_deus: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Mestrado / duas etapas de iniciação descritas no manual',
    modulos: ['26 símbolos Ama Deus'],
    comandos: ['AMA DEUS'],
    objetivos: 'Sistema xamânico Ama Deus com 26 símbolos. O manual descreve uma ou duas etapas de iniciação e práticas de autocuidado antes de trabalhar com outras pessoas.',
    areasAtuacao: ['acolhimento', 'espiritualidade', 'integração', 'autocuidado'],
    metodosAtivacao: ['Visualização dos símbolos conforme o manual; repetição de “AMA DEUS” nos procedimentos de iniciação.'],
    cuidados: ['O próprio manual orienta respeito ao sistema e não alterar os símbolos; também afirma que o sistema não substitui cuidados profissionais de saúde.'],
    origemDocumental: {
      idDocumento: 'Cura Xamânica Ama Deus - completo.pdf / .docx',
      curso: 'Cura Xamânica Ama Deus',
      statusConfirmacao: 'Manual completo e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { emocional: 3, espiritualidade: 4, integracao: 3, autovalor: 2, receber: 2 },
  },

  artes_misticas_java: {
    catalogacaoTecnica: 'PENDENTE',
    objetivos: 'Pacotes de áudio dos níveis 1 e 2 estão presentes no acervo, mas não há manual textual legível suficiente para mapear funções sem inferência.',
    areasAtuacao: [],
    recursosInternos: [],
    compatibilidadeEixos: {},
  },

  ativacao_chakras_celestiais: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Níveis 1 e 2 — Mestrado',
    modulos: ['8º chakra + subchakra 1','9º chakra + subchakra 2','10º chakra + subchakra 3','11º chakra + subchakra 4','12º chakra + subchakra 5'],
    objetivos: 'Sistema de ativação dos chakras celestiais por intenção e visualização; o manual recuperado confirma explicitamente chakras 8 a 12 e subchakras correspondentes.',
    areasAtuacao: ['espiritualidade', 'integração', 'propósito'],
    metodosAtivacao: ['Intenção e visualização conforme o manual; uso diário por 1–2 semanas é sugerido pelo material, depois mensal ou intuitivamente.'],
    cuidados: ['Não adicionar chakras 13–15 ao cadastro técnico até a seção correspondente do material ser confirmada diretamente.'],
    origemDocumental: {
      idDocumento: 'The Celestial Chakra Activation 1 e 2 mestrado.pdf / .docx',
      curso: 'The Celestial Chakra Activation',
      statusConfirmacao: 'Manual e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { espiritualidade: 4, integracao: 4, proposito: 3 },
  },

  benteng_diri_pamungkas: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['Ativando Benteng Diri Pamunkgas em nível mestrado','Ativando Benteng Diri Pamunkgas mais forte em nível mestrado'],
    objetivos: 'O manual descreve o sistema como “máxima fortaleza interior”, voltado à proteção energética pessoal e de ambientes.',
    areasAtuacao: ['proteção', 'segurança', 'ambientes'],
    metodosAtivacao: ['Esfregar as mãos, mãos em concha, ativar pelo nome e seguir a oração/procedimento do manual.'],
    origemDocumental: {
      idDocumento: 'Benteng Diri Pamungkas mestrado.pdf / .docx',
      curso: 'Benteng Diri Pamungkas',
      statusConfirmacao: 'Manual Mestrado confirmado.',
    },
    compatibilidadeEixos: { protecao: 4, seguranca: 4, integracao: 2 },
  },

  benzi_reiki: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Nível 1 confirmado em manual; níveis 2 e 3 descritos no material',
    simbolos: ['Setim','Cora-cora','Benzi Reiki'],
    objetivos: 'Sistema que integra Reiki e benzimento. O manual disponível detalha o nível 1 e descreve a estrutura dos níveis 2 e 3/Mestrado.',
    areasAtuacao: ['harmonização', 'emocional', 'mental', 'espiritualidade', 'limpeza'],
    recursosInternos: [
      r('Setim','símbolo',['corpo','integracao'],'01 Benzi Reiki nível 1 - GRATUITO.pdf'),
      r('Cora-cora','símbolo',['emocional','mente'],'01 Benzi Reiki nível 1 - GRATUITO.pdf'),
      r('Benzi Reiki','símbolo',['integracao','espiritualidade'],'01 Benzi Reiki nível 1 - GRATUITO.pdf'),
    ],
    cuidados: ['O manual local detalha apenas o nível 1; não inventar técnicas dos níveis 2 e 3.'],
    origemDocumental: {
      idDocumento: '01 Benzi Reiki nível 1 - GRATUITO.pdf + 05 Sobre a Iniciação e Agendamento.pdf',
      curso: 'Benzi Reiki',
      statusConfirmacao: 'Manual de nível 1 e material de iniciação confirmados.',
    },
    compatibilidadeEixos: { emocional: 3, mente: 3, limpeza: 3, espiritualidade: 3, integracao: 3, corpo: 2 },
  },

  energias_douradas_abundancia: {
    catalogacaoTecnica: 'PENDENTE',
    nivel: 'Mestrado',
    objetivos: 'PDF local confirma curso e iniciação em nível Mestrado, mas funciona como folha de acesso e não contém conteúdo técnico suficiente para recomendação automática.',
    areasAtuacao: [],
    compatibilidadeEixos: {},
    origemDocumental: {
      idDocumento: 'Material - Energias Douradas de Abundância da Mestre Ascensionada Abundantia.pdf',
      curso: 'Energias Douradas de Abundância',
      statusConfirmacao: 'Iniciação Mestrado confirmada; conteúdo técnico do curso não está detalhado no PDF local.',
    },
  },

  escudo_cristalino_metatron: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['Ativando Escudo Cristalino de Metatron'],
    cristais: ['Quartzo Fumê Tibetano'],
    objetivos: 'Sistema que combina, segundo o manual, Quartzo Fumê Tibetano e Escudo de Metatron para proteção, limpeza e ancoragem energética.',
    areasAtuacao: ['proteção', 'limpeza', 'aterramento', 'ambientes'],
    metodosAtivacao: ['Esfregar as mãos, visualizar o Quartzo Fumê Tibetano e dizer a frase de ativação três vezes.'],
    formasAplicacao: ['Aplicação pessoal','Envio à distância','Proteção/limpeza de ambientes'],
    origemDocumental: {
      idDocumento: 'Escudo Cristalino de Metatron.pdf',
      curso: 'Escudo Cristalino de Metatron',
      statusConfirmacao: 'Manual, gráfico sintonizado e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { protecao: 4, seguranca: 4, limpeza: 4, corpo: 2, integracao: 3 },
  },

  fonte_luz_magenta: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Magenta Source 2017',
    comandos: ['Orbe de Luz Magenta','Magenta Source 2017'],
    objetivos: 'Material local descreve práticas com luz Magenta, orbes/antenas e aterramento. A catalogação permanece parcial para separar o núcleo original do sistema de protocolos posteriores presentes no mesmo arquivo.',
    areasAtuacao: ['vitalidade', 'materialização', 'aterramento', 'integração'],
    cuidados: ['Usar apenas comandos e práticas claramente identificados como pertencentes ao sistema original; não absorver automaticamente protocolos posteriores do arquivo.'],
    origemDocumental: {
      idDocumento: 'Fonte de Luz Magenta - 2025.pdf',
      curso: 'Fonte de Luz Magenta / Magenta Source 2017',
      statusConfirmacao: 'Material confirmado; núcleo técnico em revisão documental.',
    },
    compatibilidadeEixos: { vitalidade: 3, prosperidade: 3, movimento: 2, seguranca: 2, integracao: 2 },
  },

  gods_angels_psychometry: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Níveis 1 e 2 — Mestrado',
    comandos: ['Ativando God’s Angels of Psychometry.'],
    objetivos: 'Sistema voltado, segundo o manual, ao desenvolvimento de psicometria; inclui autotratamento, tratamento para outros e preparação/limpeza de espaço antes da leitura.',
    areasAtuacao: ['percepção sutil', 'espiritualidade', 'clareza', 'proteção de espaço'],
    formasAplicacao: ['Autotratamento','Aplicação em outra pessoa','Tratamento do espaço'],
    origemDocumental: {
      idDocumento: "God's Angels of Psychometry Master 1 & 2.pdf / .docx",
      curso: "God's Angels of Psychometry",
      statusConfirmacao: 'Manual e áudio de sintonização níveis 1 e 2 Mestrado confirmados.',
    },
    compatibilidadeEixos: { espiritualidade: 4, mente: 3, protecao: 3, integracao: 2 },
  },

  higher_self_will_alignment: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Níveis 1 e 2',
    modulos: ['Higher Self Will Alignment','Divine Will Alignment'],
    comandos: ['Divine Will Alignment Activate!'],
    objetivos: 'O manual descreve o sistema como apoio ao alinhamento entre a vontade do Eu Superior e escolhas/prioridades conscientes. O nível 2 é Divine Will Alignment.',
    areasAtuacao: ['propósito', 'direção', 'escolhas', 'espiritualidade', 'integração'],
    restricoes: ['O manual desaconselha ativar Divine Will Alignment diretamente para outra pessoa; recomenda sintonização conscientemente solicitada.'],
    origemDocumental: {
      idDocumento: 'Higher Self Will Alignment - original.pdf + versão em português',
      curso: 'Higher Self Will Alignment',
      statusConfirmacao: 'Manuais e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { proposito: 4, poder_pessoal: 3, mente: 3, espiritualidade: 4, integracao: 4 },
  },

  ilmu_rajah_kalachakra: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Níveis 1–4; nível 4/Master habilita sintonização',
    objetivos: 'Sistema javanês cujo manual descreve práticas de proteção e aplicação por meditação, oração/intenção e afirmação.',
    areasAtuacao: ['proteção', 'segurança', 'espiritualidade'],
    cuidados: ['O manual contém práticas e afirmações intensas; usar somente procedimentos compatíveis com uma aplicação de cuidado não agressiva.'],
    origemDocumental: {
      idDocumento: 'Ilmu Rajah Kalachakra - Mestrado.pdf / .docx',
      curso: 'Ilmu Rajah Kalachakra',
      statusConfirmacao: 'Manual, mantra e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { protecao: 4, seguranca: 3, espiritualidade: 3 },
  },

  magical_red_light_vortex: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Master',
    comandos: ['Ativando Magical red light vortex!'],
    chakras: ['Básico','Umbilical/Sacral','Plexo Solar'],
    objetivos: 'O manual relaciona o sistema a motivação, energia e equilíbrio dos chakras inferiores, além de vitalidade e interesse sexual.',
    areasAtuacao: ['vitalidade', 'movimento', 'prazer', 'chakras inferiores'],
    metodosAtivacao: ['Ativação pelo nome três vezes; aplicação descrita em Básico, Umbilical e Plexo Solar por cerca de 3 minutos cada.'],
    origemDocumental: {
      idDocumento: 'Magical Red Light Vortex by Scion year 2020.pdf / .docx',
      curso: 'Magical Red Light Vortex',
      statusConfirmacao: 'Manual Master confirmado.',
    },
    ehEstimulanteAtivo: true,
    requerEstabilizacaoPrevia: true,
    compatibilidadeEixos: { vitalidade: 4, movimento: 4, prazer: 3, corpo: 3, poder_pessoal: 3 },
  },

  mega_power_spell_breaker: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['Ativando Mega Power Spell Breaker'],
    objetivos: 'O manual descreve o sistema para limpeza e proteção diante de energias percebidas como negativas.',
    areasAtuacao: ['proteção', 'limpeza', 'ambientes'],
    formasAplicacao: ['Proteção pessoal','Proteção de casa/escritório','Direcionamento pelas mãos'],
    cuidados: ['Não usar no aplicativo mecanismos retaliatórios ou de dano descritos no manual; limitar a aplicação a proteção e limpeza não agressivas.'],
    origemDocumental: {
      idDocumento: 'Mega Power Spell Breaker.pdf / .docx',
      curso: 'Mega Power Spell Breaker',
      statusConfirmacao: 'Manual e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { protecao: 4, limpeza: 4, seguranca: 3 },
  },

  original_reiki_cristalino: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['Ativando Original Reiki Cristalino'],
    cristais: ['Turmalina Verde'],
    objetivos: 'Sistema que combina Original Reiki Healing System com a frequência cristalina da Turmalina Verde, conforme o manual.',
    areasAtuacao: ['harmonização', 'vitalidade', 'corpo energético', 'limpeza', 'ambientes'],
    metodosAtivacao: ['Esfregar as mãos e repetir “Ativando Original Reiki Cristalino” três vezes, visualizando luz branca-esverdeada; forma cristalina opcional conforme manual.'],
    formasAplicacao: ['Imposição de mãos','Cristais etéricos em pessoa ou ambiente','Envio à distância'],
    origemDocumental: {
      idDocumento: 'Original Reiki Cristalino.pdf',
      curso: 'Original Reiki Cristalino',
      statusConfirmacao: 'Manual, gráfico e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { vitalidade: 4, corpo: 4, limpeza: 3, protecao: 3, integracao: 4, criatividade: 2 },
  },

  original_reiki_healing_system: {
    catalogacaoTecnica: 'PENDENTE',
    nivel: 'Níveis 1, 2 e 3 — Mestrado',
    objetivos: 'Formação completa confirmada pela folha de curso e sintonização. O PDF local encontrado não contém o manual técnico suficiente para mapeamento automático.',
    areasAtuacao: [],
    compatibilidadeEixos: {},
    origemDocumental: {
      idDocumento: 'Material - Original Reiki Platinum e Original Reiki Healing System.pdf',
      curso: 'Original Reiki Healing System',
      statusConfirmacao: 'Formação níveis 1, 2 e 3 Mestrado confirmada; conteúdo técnico local pendente.',
    },
  },

  prosonodo_light: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['Eu peço agora para receber a ativação / sintonização de Prosonodo Light de ...'],
    objetivos: 'Sistema de matriz cristã que o manual relaciona a amor, autoaceitação, perdão, liberdade e abundância, dentro de sua linguagem espiritual.',
    areasAtuacao: ['autovalor', 'receber', 'recomeço', 'espiritualidade', 'propósito'],
    cuidados: ['Preservar a moldura cristã do sistema e oferecer somente a pessoas confortáveis com essa linguagem espiritual.'],
    origemDocumental: {
      idDocumento: 'Prosonodo Light - mestrado.pdf / .docx',
      curso: 'Prosonodo Light',
      statusConfirmacao: 'Manual Mestrado confirmado.',
    },
    compatibilidadeEixos: { autovalor: 4, receber: 4, recomeco: 3, espiritualidade: 4, proposito: 3, emocional: 3 },
  },

  samurai_reiki: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Níveis 1, 2 e 3 — Mestrado',
    simbolos: [],
    objetivos: 'Sistema em três níveis. Para o aplicativo, somente o subconjunto não agressivo do manual é catalogado: autocuidado, limpeza e proteção.',
    areasAtuacao: ['proteção', 'limpeza', 'vitalidade'],
    metodosAtivacao: ['Uso por pensamento, intenção ou força de vontade, conforme o manual.'],
    cuidados: ['Excluir do motor qualquer instrução de retaliação, dano ou ataque presente no manual; usar somente funções de proteção, limpeza e autocuidado.'],
    origemDocumental: {
      idDocumento: 'SAMURAI REIKI 1, 2 e 3.docx',
      curso: 'Samurai Reiki',
      statusConfirmacao: 'Manual níveis 1, 2 e 3 e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { protecao: 4, limpeza: 3, vitalidade: 3, seguranca: 3 },
  },

  seichim_7_facetas: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: '7 facetas',
    simbolos: ['Cho Ku Rei','Sei He Ki','Hon Sha Ze Sho Nen','Cho Ku Ret / Zara','Angel Wings','Male Female Balance','High/Low/God','eeef tchay','Dai Koo Myo'],
    objetivos: 'Sistema Seichim em sete facetas. O manual fornece a progressão de símbolos por nível e procedimentos de sintonização.',
    areasAtuacao: ['harmonização', 'emocional', 'equilíbrio', 'espiritualidade', 'integração'],
    origemDocumental: {
      idDocumento: 'Seichim 7 Facetas.pdf / .docx',
      curso: 'Seichim 7 Facetas',
      statusConfirmacao: 'Manual confirmado; funções detalhadas de cada símbolo ainda em catalogação.',
    },
    compatibilidadeEixos: { emocional: 3, mente: 3, relacionamentos: 2, espiritualidade: 4, integracao: 4 },
  },

  sekhem_heka: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Nível 1',
    objetivos: 'O manual do nível 1 descreve conexão com Sekhmet e Heka e foco no chakra básico, estabilidade, segurança e conexão com a Terra.',
    areasAtuacao: ['segurança', 'aterramento', 'proteção', 'espiritualidade'],
    chakras: ['Básico / Sen-t'],
    origemDocumental: {
      idDocumento: 'Sekhem Heka nível 1 - Atualização 2024.pdf / .docx',
      curso: 'Sekhem Heka',
      statusConfirmacao: 'Manual de nível 1 confirmado.',
    },
    compatibilidadeEixos: { seguranca: 4, protecao: 3, corpo: 3, espiritualidade: 3 },
  },

  sol_a_vana: {
    catalogacaoTecnica: 'PENDENTE',
    objetivos: 'PDF local confirma aula, certificado, áudio de sintonização e gráfico, mas não contém conteúdo técnico suficiente para mapeamento automático.',
    areasAtuacao: [],
    compatibilidadeEixos: {},
    origemDocumental: {
      idDocumento: 'MATERIAL SOL A VANA.pdf',
      curso: 'Sol A Vana',
      statusConfirmacao: 'Formação confirmada; conteúdo técnico não detalhado no PDF local.',
    },
  },

  solar_fire_crystals: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['Cristais de Fogo Solar!','Purificação dos cristais de fogo solar!','Solar Fire Crystals ative escudo agora!'],
    objetivos: 'Sistema descrito no manual para purificação e proteção pessoal, de outras pessoas e de ambientes.',
    areasAtuacao: ['proteção', 'limpeza', 'segurança', 'aterramento'],
    chakras: ['Plexo Solar','Cardíaco','Básico'],
    formasAplicacao: ['Purificação pessoal','Purificação à distância','Purificação de ambiente','Escudo de proteção'],
    origemDocumental: {
      idDocumento: 'Solar Fire Crystals.pdf / .docx',
      curso: 'Solar Fire Crystals',
      statusConfirmacao: 'Manual e áudio de sintonização Mestrado confirmados.',
    },
    compatibilidadeEixos: { protecao: 4, limpeza: 4, seguranca: 4, corpo: 2, integracao: 3 },
  },

  the_magic_cosmic_light_sol_a_vana: {
    catalogacaoTecnica: 'PARCIAL',
    nivel: 'Mestrado',
    simbolos: ['Anson'],
    objetivos: 'Formação e símbolo Anson confirmados pela folha de curso. O conteúdo técnico detalhado não está presente no PDF local consultado.',
    areasAtuacao: [],
    recursosInternos: [],
    compatibilidadeEixos: {},
    origemDocumental: {
      idDocumento: 'Material - The Magic Cosmic Light Sol a Vana.pdf',
      curso: 'The Magic Cosmic Light / Sol a Vana',
      statusConfirmacao: 'Formação Mestrado e símbolo Anson confirmados; aplicação técnica pendente.',
    },
  },

  kundalini_reiki_millennium: {
    catalogacaoTecnica: 'COMPLETA',
    nivel: 'Mestrado',
    comandos: ['Kundalini Reiki'],
    objetivos: 'O manual descreve uma única sintonização e uso por intenção para ativar Kundalini Reiki, com aplicações pessoais, à distância, para ambientes e situações.',
    areasAtuacao: ['vitalidade', 'movimento', 'corpo energético', 'aterramento', 'limpeza'],
    chakras: ['Básico','7 chakras principais','Coronário'],
    formasAplicacao: ['Autotratamento','À distância','Ambiente','Situações e relacionamentos'],
    metodosAtivacao: ['Pensar/dizer “Kundalini Reiki”; o manual exemplifica 3–5 minutos em posições corporais.'],
    cuidados: ['Registrar as afirmações energéticas como linguagem do manual, sem convertê-las em alegações médicas.'],
    origemDocumental: {
      idDocumento: 'KUNDALINI REIKI MILLENNIUM.docx / .pdf',
      curso: 'Kundalini Reiki Millennium',
      statusConfirmacao: 'Manual e áudio de sintonização Mestrado confirmados.',
    },
    ehEstimulanteAtivo: true,
    requerEstabilizacaoPrevia: true,
    compatibilidadeEixos: { vitalidade: 4, movimento: 4, corpo: 3, seguranca: 3, limpeza: 3, integracao: 2 },
  },
};

const SISTEMA_KUNDALINI: SistemaBiblioteca = {
  id: 'kundalini_reiki_millennium',
  nome: 'Kundalini Reiki Millennium',
  curso: 'Kundalini Reiki Millennium',
  linhagem: '',
  nivel: 'Mestrado',
  modulos: [],
  simbolos: [],
  energias: ['Kundalini Reiki'],
  frequencias: [],
  comandos: ['Kundalini Reiki'],
  cristais: [],
  chakras: ['Básico','7 chakras principais','Coronário'],
  centrosEnergeticos: [],
  objetivos: CATALOGACAO_DOCUMENTAL.kundalini_reiki_millennium.objetivos || '',
  areasAtuacao: CATALOGACAO_DOCUMENTAL.kundalini_reiki_millennium.areasAtuacao || [],
  recursosInternos: [],
  metodosAtivacao: CATALOGACAO_DOCUMENTAL.kundalini_reiki_millennium.metodosAtivacao || [],
  formasAplicacao: CATALOGACAO_DOCUMENTAL.kundalini_reiki_millennium.formasAplicacao || [],
  sistemasCompativeis: [],
  sistemasComplementares: [],
  restricoes: [],
  cuidados: CATALOGACAO_DOCUMENTAL.kundalini_reiki_millennium.cuidados || [],
  origemDocumental: CATALOGACAO_DOCUMENTAL.kundalini_reiki_millennium.origemDocumental!,
  status: 'FORMAÇÃO_CONFIRMADA',
  ehBaseSustentacao: false,
  ehEstimulanteAtivo: true,
  requerEstabilizacaoPrevia: true,
  prioridadePadrao: 6,
  compatibilidadeEixos: CATALOGACAO_DOCUMENTAL.kundalini_reiki_millennium.compatibilidadeEixos || {},
  catalogacaoTecnica: 'COMPLETA',
};

export function aplicarCatalogacaoDocumental(base: SistemaBiblioteca[]): SistemaBiblioteca[] {
  const atualizados = base.map((sistema) => ({
    ...sistema,
    ...(CATALOGACAO_DOCUMENTAL[sistema.id] || { catalogacaoTecnica: 'PENDENTE' as const }),
    status: 'FORMAÇÃO_CONFIRMADA' as const,
  }));

  if (!atualizados.some((s) => s.id === SISTEMA_KUNDALINI.id)) {
    atualizados.push(SISTEMA_KUNDALINI);
  }

  return atualizados;
}
