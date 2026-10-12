import { BIBLIOTECA_MESTRA } from '../data/bibliotecaMestra';
import { documentedEnergyNames, isDocumentedCareSystem, type DailyEnergyPlan } from './dailyEnergySchedule';

const KARUNA_CRYSTALS = new Set(['RAMA', 'SHANTI', 'KRIYA', 'HARTH', 'ZONAR', 'HALU', 'GNOSA', 'IAVA']);
const SOUL_SHAKTI_FREQUENCIES = new Set([
  'Body Purification',
  'Aura Healing',
  'Soul Healing',
  'Mind Empowerment',
  'Soul Awakening',
  'Soul Fire',
  'Soul Regeneration',
  'Spiritual Alignment',
  'Spiritual Individuality',
]);

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function openingLines(personName: string, totalDays: number) {
  return [
    'ABERTURA GERAL — executar uma única vez antes do Dia 1.',
    `Eu, Everton Rodrigo Piceni, inicio a programação energética da jornada de ${totalDays} dias destinada a ${personName}, pedindo licença às egrégoras de luz, aos mestres, mentores e guardiões dos sistemas efetivamente selecionados para este cuidado.`,
    'Que se façam presentes somente consciências e presenças compatíveis com amor, equilíbrio, sabedoria, discernimento, proteção e respeito ao livre-arbítrio.',
    'Que cada energia atue somente dentro de sua finalidade, sem excesso, sem imposição e sem ultrapassar a capacidade de acolhimento de quem receber esta prática.',
    'Que a programação permaneça íntegra, harmoniosa e vinculada somente aos áudios e dias correspondentes desta jornada.',
    'A energia acompanha. O acolhimento sustenta. A consciência escolhe.',
    'HSZSN — realizar o procedimento recebido e repetir o mantra 3 vezes, vinculando a programação à pessoa, à jornada e aos áudios.',
    'RAKU SUPERLUMINAL — realizar o procedimento recebido e repetir o mantra 3 vezes, com intenção de organização, ancoragem e proteção da estrutura.',
    'GOLDEN LIGHT SOURCE — ativar pelo procedimento recebido e direcionar: “Golden Light Source, sustente e harmonize esta programação, mantendo-a suave, organizada e compatível com o bem maior.”',
  ];
}

function closingLines(personName: string, totalDays: number) {
  return [
    `INTEGRAÇÃO DA JORNADA DE ${totalDays} DIAS`,
    `Integro agora toda a programação energética preparada para ${personName}.`,
    'Que cada dia permaneça ligado somente ao seu propósito e às energias realmente selecionadas para ele.',
    'Que nenhuma energia atue além do necessário e que todo o conjunto permaneça harmonizado, protegido e respeitoso com a autonomia da pessoa.',
    'COMANDO-MESTRE — repetir 3 vezes:',
    `ATIVANDO AGORA A PROGRAMAÇÃO ENERGÉTICA DESTA JORNADA DE ${totalDays} DIAS, CONFORME PROGRAMADA E ENERGIZADA NESTES ÁUDIOS POR MIM, EVERTON RODRIGO PICENI, PARA ${personName.toUpperCase()}.`,
    'A pessoa permanece livre para receber, pausar, interromper ou recomeçar.',
    'A energia acompanha. O acolhimento sustenta. A consciência escolhe.',
    'SELAMENTO FINAL',
    'Agradeço às egrégoras, aos mestres, mentores e presenças de luz que acompanharam este trabalho.',
    'Que permaneça somente aquilo que foi conscientemente programado e esteja alinhado ao bem maior, à liberdade e aos limites desta pessoa.',
    'HSZSN, HSZSN, HSZSN.',
    'RAKU SUPERLUMINAL, RAKU SUPERLUMINAL, RAKU SUPERLUMINAL.',
    'Golden Light Source acima, os áudios ao centro e todo o campo integrado.',
    'Eu agradeço. Eu integro. Eu selo.',
  ];
}

function systemForEnergy(name: string) {
  return BIBLIOTECA_MESTRA.find(
    item => isDocumentedCareSystem(item) && documentedEnergyNames(item).includes(name)
  );
}

function activationLines(name: string, day: DailyEnergyPlan) {
  const system = systemForEnergy(name);
  if (!system) {
    return [
      `ENERGIA: ${name}`,
      'REVISÃO OBRIGATÓRIA — esta energia não possui documentação suficiente na Biblioteca-Mestra para gerar uma ativação segura. Não aprovar sem revisar.',
    ];
  }

  const purpose = day.energyDetails?.find(item => item.name === name)?.explanation || system.objetivos;
  const lines = [`ENERGIA: ${name} — Sistema: ${system.nome}`];

  if (KARUNA_CRYSTALS.has(name.toUpperCase())) {
    const crystalName = name.toUpperCase();
    lines.push(
      `ATIVAÇÃO — visualize o cristal ${crystalName} envolvendo/atuando no corpo e diga 3 vezes: “Ativando cristal ${crystalName} em todo o meu corpo.”`
    );
  } else if (name.toLowerCase() === 'life force energy cone') {
    lines.push(
      'ATIVAÇÃO — respire fundo, expire lentamente e diga mentalmente: “Agora EU ATIVO o Life Force Energy Cone para impulsionar minha energia perfeitamente. Assim seja!”',
      'TEMPO — aguarde aproximadamente 5 minutos antes de integrar ao restante da composição.'
    );
  } else if (name.toLowerCase() === 'original reiki platinum') {
    lines.push('ATIVAÇÃO — diga “ORIGINAL REIKI PLATINUM.” 3 vezes.');
  } else if (SOUL_SHAKTI_FREQUENCIES.has(name)) {
    lines.push(`ATIVAÇÃO — por intenção/comando mental: “Ativo agora, por intenção consciente, ${name} para o Dia ${day.day} desta jornada.”`);
  } else if (system.metodosAtivacao.length) {
    lines.push(...system.metodosAtivacao.map(method => `ATIVAÇÃO DOCUMENTADA — ${method}`));
  } else if (system.formasAplicacao.length) {
    lines.push(...system.formasAplicacao.map(method => `APLICAÇÃO DOCUMENTADA — ${method}`));
  } else {
    lines.push('REVISÃO OBRIGATÓRIA — a Biblioteca reconhece esta energia, mas ainda não contém um procedimento de ativação suficientemente documentado. Não inventar fórmula verbal.');
  }

  lines.push(
    `DIRECIONAMENTO PERSONALIZADO — “${name}, acompanhe ${day.intention.toLowerCase()} com suavidade. ${purpose} Que sua atuação respeite o ritmo, a sensibilidade e os limites de ${day.day === 1 ? 'quem recebe' : 'esta pessoa'}.”`
  );

  if (system.cuidados.length) lines.push(...system.cuidados.map(care => `CUIDADO — ${care}`));
  if (system.restricoes.length) lines.push(...system.restricoes.map(restriction => `RESTRIÇÃO — ${restriction}`));
  lines.push(`FONTE — ${system.origemDocumental.idDocumento}`);
  return lines;
}

function resourceLines(day: DailyEnergyPlan) {
  const resources = day.resources || [];
  if (!resources.length) return [];

  const lines = ['RECURSOS COMPLEMENTARES DO DIA'];
  resources.forEach(resource => {
    lines.push(`${resource.category}: ${resource.name} — ${resource.explanation}`);
    if (resource.guidance) lines.push(`USO/CONDUÇÃO — ${resource.guidance}`);
    (resource.programmingInstructions || []).forEach(instruction => lines.push(`PROGRAMAÇÃO DOCUMENTADA — ${instruction}`));
    lines.push(`FONTE — ${resource.source}`);
  });
  return lines;
}

function aequLines(personName: string, day: DailyEnergyPlan) {
  const resources = unique([
    ...day.energyNames,
    ...(day.resources || []).map(resource => resource.name),
  ]);
  if (!resources.length) return [];

  return [
    'ACUPUNTURA ETÉRICA QUÂNTICA — rede de distribuição do dia.',
    'Diga 3 vezes: “Ativando Acupuntura Etérica Quântica.”',
    `Depois diga 3 vezes: “Ativando Acupuntura Etérica Quântica em ${personName}, que conscientemente aceitar esta prática, com ${resources.join(', ')}, em todos os pontos necessários para ${day.reason || day.intention}. Ativo e deixo programada esta sessão para começar quando ${personName} aceitar conscientemente e iniciar o áudio correspondente ao Dia ${day.day}, encerrando-se automaticamente ao final da sessão.”`,
  ];
}

function buildPersonalizedDay(personName: string, day: DailyEnergyPlan, totalDays: number) {
  const lines = [
    ...(day.day === 1 ? openingLines(personName, totalDays) : []),
    `DESTINATÁRIO: ${personName}`,
    `DIA ${day.day} — ${day.intention}`,
    `INTENÇÃO CONTEXTUAL DA ANAMNESE — ${day.reason || day.intention}`,
  ];

  day.energyNames.forEach(name => lines.push(...activationLines(name, day)));
  lines.push(...resourceLines(day));
  lines.push(...aequLines(personName, day));
  lines.push(
    'INTEGRAÇÃO DO DIA',
    `“Integro agora as energias e recursos escolhidos para o Dia ${day.day}. Que atuem em harmonia para ${day.intention.toLowerCase()}, sem excesso, sem imposição e respeitando a capacidade de acolhimento desta pessoa.”`,
    `“Dia ${day.day} programado e vinculado ao seu respectivo áudio.”`
  );

  if (day.day === totalDays) lines.push(...closingLines(personName, totalDays));
  return { ...day, lines };
}

/**
 * Roteiro privado do ADM. Cada nova anamnese recebe um roteiro derivado da composição
 * diária real: técnica de ativação vem da Biblioteca-Mestra; intenção vem da anamnese.
 * Nenhuma fórmula ausente é inventada: lacunas ficam marcadas para revisão do ADM.
 */
export function buildEnergyProgrammingScript(personName: string, schedule: DailyEnergyPlan[]) {
  const ordered = [...schedule].sort((a, b) => a.day - b.day);
  const totalDays = ordered.length;
  return ordered.map(day => buildPersonalizedDay(personName, day, totalDays));
}
