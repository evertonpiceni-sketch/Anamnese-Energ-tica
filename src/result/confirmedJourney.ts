import type { FullReportNarrative } from './fullReportNarrative';

export function applyConfirmedJourney(report: FullReportNarrative, days: 7 | 21): FullReportNarrative {
  const replaceDuration = (text: string) => text.replace(/7 ou 21 dias/g, `${days} dias`);
  const paragraphs = report.page5.paragraphs.filter(text => !text.startsWith('Você pode escolher um percurso de 7 dias') && !text.startsWith('Sua jornada confirmada é de ') && !text.startsWith('Este percurso foi confirmado para '));
  const schedule = report.dailyEnergySchedule?.length === days ? report.dailyEnergySchedule : undefined;
  return {
    ...report,
    journeyDays: days,
    page1: { ...report.page1, subtitle: replaceDuration(report.page1.subtitle), intro: replaceDuration(report.page1.intro) },
    page5: {
      ...report.page5,
      title: `Seu percurso de ${days} dias`,
      paragraphs: [`Este percurso foi confirmado para ${days} dias. ${schedule ? 'A programação que acompanha o relatório foi organizada a partir do que você contou e apresenta, dia a dia, a intenção e os apoios escolhidos para acompanhar seu momento.' : 'A programação diária será organizada a partir da sua anamnese, respeitando o seu momento e a duração escolhida.'}`, ...paragraphs.map(replaceDuration)],
    },
    // A different duration must be reviewed; never pad, truncate or repeat an approved schedule.
    dailyEnergySchedule: schedule,
  };
}
