import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { documentedEnergyNames, isDocumentedCareSystem, type DailyEnergyPlan } from './dailyEnergySchedule';

type ApprovedDayScript = {
  title: string;
  activations: string[];
  integration: string[];
  aequResources: string[];
};

const OPENING_LINES = [
  'ABERTURA GERAL — executar uma única vez antes do Dia 1.',
  'Eu, Everton Rodrigo Piceni, inicio esta programação energética pedindo licença às egrégoras de luz, aos mestres, mentores e guardiões dos sistemas que serão utilizados nesta jornada.',
  'Que se façam presentes somente consciências e presenças compatíveis com amor, equilíbrio, sabedoria, discernimento, proteção e respeito ao livre-arbítrio.',
  'Que cada energia atue somente dentro de sua finalidade, sem excesso, sem imposição e sem ultrapassar a capacidade de acolhimento de quem receber esta prática.',
  'Que a programação permaneça íntegra, harmoniosa e vinculada somente aos áudios correspondentes desta jornada.',
  'A energia acompanha. A consciência escolhe.',
  'HSZSN — usar o procedimento recebido e repetir o mantra 3 vezes, vinculando a programação à jornada e aos áudios.',
  'RAKU SUPERLUMINAL — usar o procedimento recebido e repetir o mantra 3 vezes, com intenção de organização, ancoragem e proteção da estrutura.',
  'GOLDEN LIGHT SOURCE — ativar pelo procedimento recebido e direcionar: “Golden Light Source, sustente e harmonize toda esta programação, mantendo-a suave, organizada e compatível com o bem maior.”',
];

const MASTER_CLOSING_LINES = [
  'INTEGRAÇÃO DOS SETE DIAS',
  'Integro agora toda a programação desta jornada de sete dias.',
  'Que cada dia permaneça ligado somente ao seu propósito e às suas energias correspondentes.',
  'Que nenhuma energia atue além do necessário.',
  'Que todo o conjunto permaneça harmonizado, protegido e respeitoso com a autonomia de quem recebe.',
  'Dia 1 oferece chão. Dia 2 devolve presença ao corpo. Dia 3 permite começar. Dia 4 ensina a receber. Dia 5 direciona o cuidado para si. Dia 6 reabre espaço para sentir vida. Dia 7 favorece consciência e escolha.',
  'COMANDO-MESTRE — repetir 3 vezes:',
  'ATIVANDO AGORA A PROGRAMAÇÃO ENERGÉTICA DESTA JORNADA DE 7 DIAS, CONFORME PROGRAMADA E ENERGIZADA NESTE ÁUDIO POR MIM, EVERTON RODRIGO PICENI.',
  'A pessoa permanece livre para receber, pausar, interromper ou recomeçar.',
  'A energia acompanha. O acolhimento sustenta. A consciência escolhe.',
  'SELAMENTO FINAL',
  'Agradeço às egrégoras, aos mestres, mentores e presenças de luz que acompanharam este trabalho.',
  'Que permaneça somente aquilo que foi conscientemente programado e esteja alinhado ao bem maior, à liberdade e aos limites de cada pessoa.',
  'HSZSN, HSZSN, HSZSN.',
  'RAKU SUPERLUMINAL, RAKU SUPERLUMINAL, RAKU SUPERLUMINAL.',
  'Golden Light Source acima, o áudio ao centro e todo o campo integrado.',
  'Eu agradeço. Eu integro. Eu selo.',
];

const APPROVED_7_DAY_SCRIPTS: Record<number, ApprovedDayScript> = {
  1: {
    title: 'PRESENÇA E CHÃO',
    activations: [
      'RAMA — visualize o cristal RAMA envolvendo o corpo, com atenção aos pés. Diga 3 vezes: “Ativando cristal RAMA em todo o meu corpo.”',
      'Direcionamento RAMA: “RAMA, sustente aterramento, presença, estabilidade e contato com o momento presente. Que haja chão antes de qualquer movimento.”',
      'LIFE FORCE ENERGY CONE — respire fundo, expire lentamente e diga mentalmente: “Agora EU ATIVO o Life Force Energy Cone para impulsionar minha energia perfeitamente. Assim seja!” Aguarde aproximadamente 5 minutos antes de integrar ao restante.',
      'Direcionamento Life Force: “Que esta força vital se apresente de modo gradual e acolhedor, oferecendo apenas a sustentação necessária para permanecer presente.”',
      'CRISTAIS DE APOIO — Jaspe Vermelho, Turmalina Negra e Cornalina serão inseridos pela rede de Cristais Etéricos/Acupuntura Etérica Quântica no comando de distribuição deste dia.',
    ],
    integration: [
      'RAMA dá chão. Life Force Energy Cone sustenta. Jaspe firma. Turmalina protege. Cornalina mantém a chama.',
      'Que este primeiro dia não exija transformação. Que ofereça apenas presença suficiente para permanecer.',
    ],
    aequResources: ['RAMA', 'Life Force Energy Cone', 'Jaspe Vermelho', 'Turmalina Negra', 'Cornalina'],
  },
  2: {
    title: 'VOLTAR AO CORPO',
    activations: [
      'BODY PURIFICATION — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Body Purification para este segundo dia.”',
      'Direcionamento Body Purification: “Que Body Purification favoreça uma sensação de limpeza, reorganização e maior presença corporal, sem expulsar, forçar ou acelerar nenhum processo.”',
      'AURA HEALING — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Aura Healing para este segundo dia.”',
      'Direcionamento Aura Healing: “Que Aura Healing envolva suavemente o campo da pessoa, favorecendo acolhimento, recomposição e sensação de integridade.”',
      'RAMA — visualize o cristal e diga 3 vezes: “Ativando cristal RAMA em todo o meu corpo.”',
      'Direcionamento RAMA: “RAMA, conduza a presença para baixo, em direção às pernas, aos pés e à sensação de apoio.”',
      'SHANTI — visualize o cristal envolvendo o corpo e diga 3 vezes: “Ativando cristal SHANTI em todo o meu corpo.”',
      'Direcionamento SHANTI: “SHANTI, ofereça serenidade, suavidade e permissão para estar presente sem pressão.”',
      'CRISTAIS DE APOIO — Hematita, Turmalina Negra e Quartzo Fumê serão inseridos pela rede de Cristais Etéricos/Acupuntura Etérica Quântica no comando de distribuição deste dia.',
      'CONDUÇÃO: “Que a energia percorra suavemente cabeça, pescoço, ombros, peito, abdômen, quadris, pernas e pés. Ao alcançar os pés, que seja visualizada seguindo à terra como raízes douradas. Nada precisa acontecer depressa. O corpo pode ser reencontrado aos poucos.”',
    ],
    integration: [
      'Body Purification reorganiza. Aura Healing envolve. RAMA dá chão. SHANTI oferece paz. Hematita ancora. Turmalina protege. Quartzo Fumê ajuda a soltar o excesso.',
      'Dia 2 programado para voltar ao corpo com gentileza.',
    ],
    aequResources: ['Body Purification', 'Aura Healing', 'RAMA', 'SHANTI', 'Hematita', 'Turmalina Negra', 'Quartzo Fumê'],
  },
  3: {
    title: 'UM PEQUENO COMEÇO',
    activations: [
      'KRIYA — visualize o cristal envolvendo o corpo e diga 3 vezes: “Ativando cristal KRIYA em todo o meu corpo.”',
      'Direcionamento KRIYA: “KRIYA, favoreça movimento, direção e passagem da intenção para um pequeno gesto possível. Não é necessário resolver tudo; apenas enxergar o próximo passo.”',
      'MIND EMPOWERMENT — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Mind Empowerment para este terceiro dia.”',
      'Direcionamento Mind Empowerment: “Que Mind Empowerment favoreça organização mental, discernimento e capacidade de escolher uma direção possível sem transformar pensamento em cobrança.”',
      'CRISTAIS DE APOIO — Cornalina, Olho de Tigre e Jaspe Vermelho serão inseridos pela rede de Cristais Etéricos/Acupuntura Etérica Quântica no comando de distribuição deste dia.',
    ],
    integration: [
      'KRIYA movimenta. Mind Empowerment organiza. Cornalina desperta. Olho de Tigre direciona. Jaspe sustenta.',
      'Que um pequeno começo seja suficiente.',
    ],
    aequResources: ['KRIYA', 'Mind Empowerment', 'Cornalina', 'Olho de Tigre', 'Jaspe Vermelho'],
  },
  4: {
    title: 'PERMITIR-SE RECEBER',
    activations: [
      'HARTH — visualize HARTH envolvendo o corpo, especialmente a região cardíaca, e diga 3 vezes: “Ativando cristal HARTH em todo o meu corpo.”',
      'Direcionamento HARTH: “HARTH, favoreça acolhimento, compaixão e suavidade na relação consigo. Que receber cuidado não gere dívida, culpa ou obrigação.”',
      'SOUL HEALING — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Soul Healing para este quarto dia.”',
      'Direcionamento Soul Healing: “Que Soul Healing acompanhe com delicadeza aquilo que ainda necessita de acolhimento profundo. Que nada seja buscado ou reaberto à força.”',
      'UNIVERSAL LOVE — ativar conforme o procedimento recebido na iniciação DNA Light Integrative; não substituir por fórmula verbal inventada.',
      'Direcionamento Universal Love: “Universal Love, envolva este dia com amor sem exigência, permitindo que a pessoa experimente a possibilidade de receber sem precisar merecer ou retribuir.”',
      'CRISTAIS DE APOIO — Quartzo Rosa, Rodonita e Aventurina Verde serão inseridos pela rede de Cristais Etéricos/Acupuntura Etérica Quântica no comando de distribuição deste dia.',
    ],
    integration: [
      'HARTH acolhe. Soul Healing acompanha. Universal Love envolve. Quartzo Rosa suaviza. Rodonita reconcilia. Aventurina abre espaço.',
      'Que este dia ensine que receber também pode ser seguro.',
    ],
    aequResources: ['HARTH', 'Soul Healing', 'Universal Love', 'Quartzo Rosa', 'Rodonita', 'Aventurina Verde'],
  },
  5: {
    title: 'CUIDAR DE SI',
    activations: [
      'HARTH — diga 3 vezes: “Ativando cristal HARTH em todo o meu corpo.”',
      'Direcionamento HARTH: “HARTH, ajude a transformar gentileza em cuidado dirigido a si mesmo.”',
      'SOUL HEALING — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Soul Healing para este quinto dia.”',
      'Direcionamento Soul Healing: “Que Soul Healing acompanhe necessidades internas que por muito tempo ficaram em segundo plano.”',
      'AURA HEALING — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Aura Healing para este quinto dia.”',
      'Direcionamento Aura Healing: “Que Aura Healing envolva todo o campo com sensação de cuidado, proteção e recomposição.”',
      'CRISTAIS DE APOIO — Quartzo Rosa, Rodocrosita e Aventurina Verde serão inseridos pela rede de Cristais Etéricos/Acupuntura Etérica Quântica no comando de distribuição deste dia.',
    ],
    integration: [
      'HARTH ensina gentileza. Soul Healing acolhe. Aura Healing envolve.',
      'Que cuidar de si possa deixar de parecer egoísmo e começar a ser reconhecido como presença.',
    ],
    aequResources: ['HARTH', 'Soul Healing', 'Aura Healing', 'Quartzo Rosa', 'Rodocrosita', 'Aventurina Verde'],
  },
  6: {
    title: 'REABRIR ESPAÇO PARA O PRAZER',
    activations: [
      'SOUL AWAKENING — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Soul Awakening para este sexto dia.”',
      'Direcionamento Soul Awakening: “Que Soul Awakening favoreça reconexão com aquilo que ainda desperta curiosidade, interesse, prazer simples ou sentido.”',
      'LIFE FORCE ENERGY CONE — diga mentalmente: “Agora EU ATIVO o Life Force Energy Cone para impulsionar minha energia perfeitamente. Assim seja!” Aguarde aproximadamente 5 minutos.',
      'Direcionamento Life Force: “Que esta energia sustente vitalidade gradual e compatível com o momento atual, sem excesso.”',
      'SOUL HEALING — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Soul Healing para este sexto dia.”',
      'Direcionamento Soul Healing: “Que Soul Healing acolha qualquer dificuldade de permitir prazer, leveza, descanso ou alegria.”',
      'SHANTI — diga 3 vezes: “Ativando cristal SHANTI em todo o meu corpo.”',
      'Direcionamento SHANTI: “SHANTI, ofereça tranquilidade para que o prazer possa se aproximar sem cobrança e sem medo.”',
      'CRISTAIS DE APOIO — Cornalina, Calcita Laranja e Pedra da Lua serão inseridos pela rede de Cristais Etéricos/Acupuntura Etérica Quântica no comando de distribuição deste dia.',
    ],
    integration: [
      'Soul Awakening recorda. Life Force Energy Cone nutre. Soul Healing acolhe. SHANTI suaviza. Cornalina acende. Calcita Laranja convida. Pedra da Lua respeita o ritmo.',
      'Que a vida volte a ter pequenas cores.',
    ],
    aequResources: ['Soul Awakening', 'Life Force Energy Cone', 'Soul Healing', 'SHANTI', 'Cornalina', 'Calcita Laranja', 'Pedra da Lua'],
  },
  7: {
    title: 'RECONHECER O QUE SE REPETE',
    activations: [
      'ZONAR — visualize o cristal e diga 3 vezes: “Ativando cristal ZONAR em todo o meu corpo.”',
      'Direcionamento ZONAR: “ZONAR, acompanhe padrões, marcas e experiências que parecem se repetir, permitindo perceber sem precisar reviver.”',
      'HALU — diga 3 vezes: “Ativando cristal HALU em todo o meu corpo.”',
      'Direcionamento HALU: “HALU, aprofunde a percepção daquilo que sustenta esses padrões, trazendo clareza sem culpa e sem confronto.”',
      'GNOSA — diga 3 vezes: “Ativando cristal GNOSA em todo o meu corpo.”',
      'Direcionamento GNOSA: “GNOSA, favoreça integração entre percepção, entendimento e consciência. Que aquilo que foi percebido possa começar a fazer sentido internamente.”',
      'MIND EMPOWERMENT — ativação Soul Shakti por intenção/comando mental: “Ativo agora, por intenção consciente, Mind Empowerment para este sétimo dia.”',
      'Direcionamento Mind Empowerment: “Que Mind Empowerment ajude a transformar percepção em possibilidade de escolha. Reconhecer um padrão não significa estar condenado a repeti-lo.”',
      'CRISTAIS DE APOIO — Ametista, Labradorita e Lápis-Lazúli serão inseridos pela rede de Cristais Etéricos/Acupuntura Etérica Quântica no comando de distribuição deste dia.',
    ],
    integration: [
      'ZONAR toca o padrão. HALU aprofunda. GNOSA ajuda a compreender. Mind Empowerment devolve escolha.',
      'Ametista acalma. Labradorita acompanha a transição. Lápis-Lazúli favorece clareza.',
      'Que reconhecer o que se repete seja início de consciência, não motivo para condenação.',
    ],
    aequResources: ['ZONAR', 'HALU', 'GNOSA', 'Mind Empowerment', 'Ametista', 'Labradorita', 'Lápis-Lazúli'],
  },
};

function aequLines(day: number, personName: string, resources: string[], intention: string) {
  const resourceText = resources.join(', ');
  return [
    'ACUPUNTURA ETÉRICA QUÂNTICA — rede de distribuição do dia.',
    'Diga 3 vezes: “Ativando Acupuntura Etérica Quântica.”',
    `Depois diga 3 vezes: “Ativando Acupuntura Etérica Quântica em ${personName}, que conscientemente aceitar esta prática, com ${resourceText}, em todos os pontos necessários para ${intention}. Ativo e deixo programada esta sessão para começar quando a pessoa aceitar conscientemente e iniciar o áudio correspondente ao Dia ${day}, encerrando-se automaticamente ao final da sessão.”`,
  ];
}

function buildApprovedSevenDayScript(personName: string, schedule: DailyEnergyPlan[]) {
  return schedule.map(day => {
    const approved = APPROVED_7_DAY_SCRIPTS[day.day];
    if (!approved) return buildDocumentedDay(personName, day);

    const lines = [
      ...(day.day === 1 ? OPENING_LINES : []),
      `DESTINATÁRIO: ${personName}`,
      `DIA ${day.day} — ${approved.title}`,
      `Intenção contextual da anamnese: ${day.reason || day.intention}`,
      ...approved.activations,
      ...aequLines(day.day, personName, approved.aequResources, day.reason || day.intention),
      'INTEGRAÇÃO DO DIA',
      ...approved.integration,
      ...(day.day === 7 ? MASTER_CLOSING_LINES : []),
    ];

    return { ...day, intention: approved.title, lines };
  });
}

function buildDocumentedDay(personName: string, day: DailyEnergyPlan) {
  const lines = [`Destinatário: ${personName}`, `Dia ${day.day}: ${day.intention}`, `Intenção contextual: ${day.reason || day.intention}`];
  day.energyNames.forEach((name, index) => {
    const system = BIBLIOTECA_MESTRA.find(item => isDocumentedCareSystem(item) && documentedEnergyNames(item).includes(name));
    if (!system) throw new Error(`Energia sem documentação: ${name}`);
    lines.push(`${index + 1}. Energia: ${name} — Sistema: ${system.nome}`);
    lines.push(`Finalidade: ${day.energyDetails?.find(item => item.name === name)?.explanation || system.objetivos}`);
    lines.push(...system.metodosAtivacao.map(method => `Ativação documentada: ${method}`), ...system.formasAplicacao.map(method => `Aplicação documentada: ${method}`));
    if (!system.metodosAtivacao.length && !system.formasAplicacao.length) lines.push('Consultar o método no material de formação; o cadastro não contém instruções de ativação.');
    lines.push(...system.cuidados.map(care => `Cuidado: ${care}`), ...system.restricoes.map(restriction => `Restrição: ${restriction}`), `Fonte: ${system.origemDocumental.idDocumento}`);
  });
  day.resources?.forEach(resource => lines.push(`${resource.category}: ${resource.name} — ${resource.explanation}`, ...(resource.guidance ? [resource.guidance] : []), ...(resource.programmingInstructions || []).map(instruction => `Programação documentada do banho: ${instruction}`), `Fonte: ${resource.source}`));
  return { ...day, lines };
}

/** ADM-only preparation notes, using the approved 7-day ritual when applicable. */
export function buildEnergyProgrammingScript(personName: string, schedule: DailyEnergyPlan[]) {
  if (schedule.length === 7 && schedule.every(day => day.day >= 1 && day.day <= 7)) {
    return buildApprovedSevenDayScript(personName, schedule);
  }
  return schedule.map(day => buildDocumentedDay(personName, day));
}
