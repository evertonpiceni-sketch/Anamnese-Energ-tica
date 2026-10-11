import type { FullReportNarrative } from './fullReportNarrative';

export function applyConfirmedJourney(report: FullReportNarrative, days: 7 | 21): FullReportNarrative {
  const replaceDuration = (text: string) => text.replace(/7 ou 21 dias/g, `${days} dias`);
  const paragraphs = report.page5.paragraphs.filter(text => !text.startsWith('Você pode escolher um percurso de 7 dias') && !text.startsWith('Sua jornada confirmada é de '));
  const schedule = report.dailyEnergySchedule?.length === days ? report.dailyEnergySchedule : undefined;
  return {
    ...report,
    journeyDays: days,
    page1: { ...report.page1, subtitle: replaceDuration(report.page1.subtitle), intro: replaceDuration(report.page1.intro) },
    page5: {
      ...report.page5,
      title: `Os próximos ${days} dias`,
      paragraphs: [`Sua jornada confirmada é de ${days} dias. ${schedule ? 'A programação que acompanha este relatório apresenta as energias escolhidas para cada dia a partir da sua anamnese.' : 'Sua programação diária será preparada automaticamente a partir da sua anamnese.'}`, ...paragraphs.map(replaceDuration)],
    },
    // A different duration must be reviewed; never pad, truncate or repeat an approved schedule.
    dailyEnergySchedule: schedule,
  };
}
