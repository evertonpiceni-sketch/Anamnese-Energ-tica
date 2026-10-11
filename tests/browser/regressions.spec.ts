import { test, expect } from '@playwright/test';

declare global { interface Window { __recovery: Array<{ email: string; options: { redirectTo: string } }>; __passwordUpdates: number; } }

async function render(page, component: string, props: object) {
  await page.goto('/');
  await page.evaluate(async ({ component, props }) => {
    const { default: React } = await import(/* @vite-ignore */ String('/node_modules/.vite/deps/react.js'));
    const { default: ReactDOM } = await import(/* @vite-ignore */ String('/node_modules/.vite/deps/react-dom_client.js'));
    const module = await import(`/src/components/${component}.tsx`);
    document.getElementById('root')!.remove();
    const host = document.createElement('div'); document.body.appendChild(host);
    ReactDOM.createRoot(host).render(React.createElement(module.default || module[component], props));
  }, { component, props });
}

async function report(page) {
  return page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { BIBLIOTECA_MESTRA } = await import(/* @vite-ignore */ String('/src/data/bibliotecaMestra.ts'));
    const { executarAnaliseIntegrativa } = await import(/* @vite-ignore */ String('/src/engine/analysisEngine.ts'));
    const { buildFullReportNarrative } = await import(/* @vite-ignore */ String('/src/result/fullReportNarrative.ts'));
    const intake = CASOS_DE_TESTE[0].dados;
    const analysis = executarAnaliseIntegrativa(intake, BIBLIOTECA_MESTRA);
    const narrative = buildFullReportNarrative({ intake, analysis, journeyDays: 7, composition: { audio: null, floral: [], aromatherapy: [], ethericCrystals: [], solfeggio: null, journey21Mode: 'NAO_INDICADO' } });
    return narrative;
  });
}

test('approved report preserves manual removals, has a continuous reading and exports the same view', async ({ page }) => {
  await page.goto('/');
  const narrative = await report(page);
  expect(narrative.page4.paragraphs.join(' ')).not.toMatch(/Florais —|Cristais etéricos —|Aromaterapia —|Frequência de apoio|Como essa energia/);
  expect(narrative.page5.title).toBe('Os próximos 7 dias');
  expect(narrative.page5.paragraphs.join(' ')).not.toContain('21 dias');
  await render(page, 'FullReportApprovedView', { report: narrative });
  await expect(page.locator('.report-page')).toHaveCount(1);
  await page.screenshot({ path: '/workspace/scratch/report-desktop.png', fullPage: true });
  const pdf = await page.evaluate(async narrative => {
    const { createFullReportPdfBlob } = await import(/* @vite-ignore */ String('/src/pdf/fullReportPdf.ts'));
    const { blob } = await createFullReportPdfBlob(narrative);
    const content = await blob.text();
    return { size: blob.size, pages: (content.match(/\/Type \/Page\b/g) || []).length, hiddenHosts: document.querySelectorAll('[style*="-10000px"]').length };
  }, narrative);
  expect(pdf.pages).toBeGreaterThan(0); expect(pdf.pages).toBeLessThan(5); expect(pdf.size).toBeGreaterThan(10000); expect(pdf.hiddenHosts).toBe(0);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.screenshot({ path: '/workspace/scratch/report-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('draft survives restore, processing resumes review and storage failures do not crash', async ({ page }) => {
  await page.goto('/');
  const draft = { form: { id: 'draft', nomePessoa: 'Marina', respostasObjetivas: {}, regioesCorporaisPercebidas: [] }, step: 'processing', questionIndex: 10000 };
  await page.evaluate(draft => localStorage.setItem('anamnese-integrativa-draft-v1:test-user', JSON.stringify(draft)), draft);
  await render(page, 'UserAnamneseApp', { userId: 'test-user' });
  await expect(page.getByText('Isso representa seu momento?')).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('anamnese-integrativa-draft-v1:test-user')!).form.nomePessoa)).toBe('Marina');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('quota'); }; });
  await page.getByRole('button', { name: 'Revisar', exact: true }).click();
  await expect(page.getByText('O que precisa ser acolhido?')).toBeVisible();
});

test('no entitlement never requests complete report', async ({ page }) => {
  let requests = 0;
  await page.route('**/rest/v1/full_report_publications**', async route => { requests++; await route.fulfill({ json: [] }); });
  await render(page, 'EntitledFullReportCard', { intakeId: 'test', entitlement: null });
  await expect(page.getByText('Baixar relatório completo')).toHaveCount(0);
  expect(requests).toBe(0);
});

test('submitting a complete intake waits for the approved publication', async ({ page }) => {
  await page.goto('/');
  await page.route('**/rest/v1/intake_sessions**', route => route.fulfill({ json: { id: 'saved-intake' } }));
  await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    localStorage.setItem('anamnese-integrativa-draft-v1:test-user', JSON.stringify({ form: CASOS_DE_TESTE[0].dados, step: 'review', questionIndex: 0 }));
  });
  await render(page, 'UserAnamneseApp', { userId: 'test-user' });
  await page.getByRole('button', { name: 'Enviar minha anamnese' }).click();
  await expect(page.getByText('ANAMNESE RECEBIDA')).toBeVisible();
  await expect(page.locator('.report-page')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('anamnese-integrativa-draft-v1:test-user'))).toBeNull();
});

test('basic reading follows its own approved block layout', async ({ page }) => {
  const data = { intake: { personName: 'Marina' }, entitlement: { days: 7 }, result: { headline: 'Um momento de acolhimento', intro: 'Suas respostas foram recebidas com cuidado.', priorities: ['Mais presença', 'Mais espaço para você'], intention: 'Acompanhar seu momento com delicadeza.', closing: 'Você merece receber cuidado.', solfeggio: null, floral: [], aromatherapy: [], ethericCrystals: [] }, carePlan: null, audio: null };
  await render(page, 'BasicReadingApprovedView', { data });
  await expect(page.getByRole('heading', { name: 'Leitura Básica' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Como você chega neste momento', exact: false })).toBeVisible();
  await page.screenshot({ path: '/workspace/scratch/basic-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('confirmed journeys deliver every approved day in the screen and PDF', async ({ page }) => {
  await page.goto('/');
  const narrative = await report(page);
  const result = await page.evaluate(async narrative => {
    const { applyConfirmedJourney } = await import(/* @vite-ignore */ String('/src/result/confirmedJourney.ts'));
    const { validateDailyEnergySchedule } = await import(/* @vite-ignore */ String('/src/care/dailyEnergySchedule.ts'));
    const schedule = Array.from({ length: 21 }, (_, index) => ({ day: index + 1, energyNames: [index % 2 ? 'Soul Healing' : 'Original Reiki Platinum'], intention: `Intenção aprovada para o dia ${index + 1}.` }));
    const report21 = applyConfirmedJourney({ ...narrative, dailyEnergySchedule: schedule }, 21);
    return { report21, invalid: validateDailyEnergySchedule(schedule, 7, ['Soul Healing', 'Original Reiki Platinum']), wrongEnergy: validateDailyEnergySchedule(schedule, 21, ['Original Reiki Platinum']), resized: applyConfirmedJourney(report21, 7) };
  }, narrative);
  expect(result.invalid).toContain('7 dias');
  expect(result.wrongEnergy).toContain('fora da composição');
  expect(result.resized.dailyEnergySchedule).toBeUndefined();
  expect(result.resized.page5.title).toBe('Os próximos 7 dias');
  expect(result.report21.page5.title).toBe('Os próximos 21 dias');
  await render(page, 'FullReportApprovedView', { report: result.report21 });
  await expect(page.locator('.report-page')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Dia 21', exact: true })).toBeVisible();
  const pdfPages = await page.evaluate(async narrative => {
    const { createFullReportPdfBlob } = await import(/* @vite-ignore */ String('/src/pdf/fullReportPdf.ts'));
    const { blob } = await createFullReportPdfBlob(narrative);
    return ((await blob.text()).match(/\/Type \/Page\b/g) || []).length;
  }, result.report21);
  expect(pdfPages).toBeGreaterThan(1); expect(pdfPages).toBeLessThan(8);
});

test('daily motor proposal uses documented resources and respects early stabilization', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { BIBLIOTECA_MESTRA } = await import(/* @vite-ignore */ String('/src/data/bibliotecaMestra.ts'));
    const { proposeDailyEnergySchedule, documentedEnergyNames } = await import(/* @vite-ignore */ String('/src/care/dailyEnergySchedule.ts'));
    const systems = BIBLIOTECA_MESTRA.filter(system => system.catalogacaoTecnica === 'COMPLETA');
    const schedule = proposeDailyEnergySchedule({ days: 7, systems, axes: [{ eixoId: 'mente', percentual: 80 }, { eixoId: 'emocional', percentual: 65 }], highSensitivity: true });
    const allowed = systems.filter(system => !system.ehEstimulanteAtivo).flatMap(documentedEnergyNames);
    return { schedule, documented: schedule.every(entry => entry.energyNames.every(name => allowed.includes(name))), variations: new Set(schedule.map(entry => entry.energyNames.join('|'))).size };
  });
  expect(result.schedule).toHaveLength(7);
  expect(result.documented).toBe(true);
  expect(result.variations).toBeGreaterThan(1);
});

test('report names the reviewed energies and uses the approved chakra artwork', async ({ page }) => {
  await page.goto('/');
  const narrative = await report(page);
  const approved = { ...narrative, dailyEnergySchedule: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, energyNames: [i % 2 ? 'Soul Healing' : 'Original Reiki Platinum'], intention: 'Acolher o momento com presença.' })), page3: { ...narrative.page3, chakras: ['Plexo Solar', 'Cardíaco', 'Laríngeo', 'Frontal', 'Raiz', 'Coronário', 'Sacral'].map(name => ({ name, text: 'Centro identificado na leitura individual.' })) } };
  await render(page, 'FullReportApprovedView', { report: approved });
  const energies = page.getByRole('region', { name: 'Programação diária' });
  await expect(energies).toContainText('Soul Healing');
  await expect(energies).toContainText('Original Reiki Platinum');
  const symbols = page.getByRole('img', { name: /^Símbolo do / });
  await expect(symbols).toHaveCount(7);
  expect(await symbols.evaluateAll(items => items.every(item => getComputedStyle(item).backgroundImage.includes('chakras-logo.png')))).toBe(true);
  await page.getByRole('region', { name: 'Chakras do cuidado' }).screenshot({ path: '/workspace/scratch/chakras-aprovados.png' });
  await page.getByRole('region', { name: 'Programação diária' }).screenshot({ path: '/workspace/scratch/energias-aprovadas.png' });
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('region', { name: 'Chakras do cuidado' }).screenshot({ path: '/workspace/scratch/chakras-mobile.png' });
  await render(page, 'FullReportApprovedView', { report: narrative });
  await expect(page.getByRole('region', { name: 'Energias do cuidado' })).toContainText('Estamos preparando sua composição individual');
  await expect(page.getByRole('region', { name: 'Energias do cuidado' }).getByText('Soul Healing', { exact: true })).toHaveCount(0);
});

test('ADM opens with a daily motor draft and preserves an existing review', async ({ page }) => {
  await page.goto('/');
  const props = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { BIBLIOTECA_MESTRA } = await import(/* @vite-ignore */ String('/src/data/bibliotecaMestra.ts'));
    const { executarAnaliseIntegrativa } = await import(/* @vite-ignore */ String('/src/engine/analysisEngine.ts'));
    const anamnese = CASOS_DE_TESTE[0].dados;
    return { anamnese, analise: executarAnaliseIntegrativa(anamnese, BIBLIOTECA_MESTRA), backendIntakeId: 'test-intake', backendUserId: 'test-user' };
  });
  let writes = 0;
  await page.route('**/rest/v1/**', async route => {
    if (route.request().method() !== 'GET') writes++;
    await route.fulfill({ json: null });
  });
  await page.route('**/rest/v1/commercial_entitlements**', route => route.fulfill({ json: { product_code: 'CARE_7_BASIC', paid_amount_cents: 100, full_report_addon_paid: true, status: 'active' } }));
  await render(page, 'CareComposerAdminView', props);
  await expect(page.getByText('O motor preparou a proposta para cada dia.', { exact: false })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Dia 7', exact: true })).toBeVisible();
  expect(await page.getByRole('textbox', { name: 'Roteiro energético do dia 7', exact: true }).inputValue()).toContain('Fonte:');
  expect(writes).toBe(0);
  const draft = { baseSystemId: '', mainSystemId: '', complementSystemIds: [], solfeggioId: null, floralIds: [], aromatherapyIds: [], crystalIds: [], audioIntention: 'Intenção revisada', scriptLines: [], dailyEnergySchedule: [{ day: 1, energyNames: ['Energia preservada'], intention: 'Revisão manual preservada' }] };
  await page.route('**/rest/v1/care_composition_reviews**', route => route.fulfill({ json: { id: 'review', intake_id: 'test-intake', user_id: 'test-user', status: 'draft', manual_composition: draft } }));
  await render(page, 'CareComposerAdminView', props);
  await expect(page.getByRole('textbox', { name: 'Intenção do dia' })).toHaveValue('Revisão manual preservada');
  await expect(page.getByRole('group', { name: 'Dia 7', exact: true })).toHaveCount(0);
});

test('every question changes the reading and unsupported difficulties are absent', async ({ page }) => {
  await page.goto('/');
  const data = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { PERGUNTAS_ANAMNESE } = await import(/* @vite-ignore */ String('/src/data/questions.ts'));
    const { executarAnaliseIntegrativa } = await import(/* @vite-ignore */ String('/src/engine/analysisEngine.ts'));
    const { buildFullReportNarrative } = await import(/* @vite-ignore */ String('/src/result/fullReportNarrative.ts'));
    const { buildBasicUserResult } = await import(/* @vite-ignore */ String('/src/result/basicUserResult.ts'));
    const intake = { ...CASOS_DE_TESTE[0].dados, id: 'same-person', nomePessoa: 'Teste', respostasObjetivas: Object.fromEntries(PERGUNTAS_ANAMNESE.map(q => [q.id, 0])), intencaoDeclarada: '', relatoLivreNecessidade: '', relatoLivreDesafios: '', relatoLivrePreservado: '', regioesCorporaisPercebidas: [], sensibilidadeEnergetica: 'moderada' };
    const build = input => { const analysis = executarAnaliseIntegrativa(input); return { full: buildFullReportNarrative({ intake: input, analysis, composition: null }), basic: buildBasicUserResult(analysis, input) }; };
    const zero = build(intake);
    const variants = PERGUNTAS_ANAMNESE.map(q => ({ question: q, ...build({ ...intake, respostasObjetivas: { ...intake.respostasObjetivas, [q.id]: 4 } }) }));
    const partial = { ...intake, respostasObjetivas: { ...intake.respostasObjetivas } }; delete partial.respostasObjetivas.q3_sensacao_ameaca_inseguranca;
    const partialReport = build(partial).full;
    const quoted = build({ ...intake, relatoLivreNecessidade: 'Não sinto ansiedade. Quero reconhecer meu próprio ritmo.', relatoLivrePreservado: 'Minha criatividade continua viva.' }).full;
    const faith = build({ ...intake, intencaoDeclarada: 'CURA', relatoLivrePreservado: 'fé', respostasObjetivas: { ...intake.respostasObjetivas, q4_cansaco_esgotamento: 4, q13_inseguranca_material_prosperidade: 1 } }).full;
    const lostStrength = build({ ...intake, relatoLivrePreservado: 'Não tenho vontade. Perdi minha fé.' }).full;
    return { zero, variants, partialReport, quoted, faith, lostStrength };
  });
  expect(data.lostStrength.page3.preserved.join(' ')).not.toMatch(/Não tenho vontade|Perdi minha fé/);
  expect(data.lostStrength.page2.paragraphs.join(' ')).toContain('Não tenho vontade. Perdi minha fé.');
  expect(data.faith.page3.preserved.join(' ')).toContain('A fé que você reconhece');
  expect(data.faith.page3.preserved.join(' ')).not.toMatch(/preocupações financeiras|mais distante|você marcou/i);
  expect(data.faith.page1.intro).not.toContain('CURA');
  expect(data.faith.page1.intro).toContain('cansaço');
  expect(data.zero.full.page3.chakras).toHaveLength(0);
  expect(data.zero.basic.priorities).toHaveLength(0);
  expect(data.zero.full.page2.cycle).toBeUndefined();
  expect(data.zero.full.page3.preserved.join(' ')).not.toContain('desejo verdadeiro de mudança');
  expect(data.zero.full.energyNames).toHaveLength(0);
  expect(new Set(data.variants.map(item => JSON.stringify(item.full.page2))).size).toBe(20);
  expect(new Set(data.variants.map(item => item.basic.headline)).size).toBe(20);
  for (const item of data.variants) {
    expect(item.full.answerEvidence.find(x => x.questionId === item.question.id).level).toBe(4);
    expect(item.full.page2.paragraphs.join(' ')).not.toMatch(/você marcou|de 20 respostas|marcação|pontuação/i);
    expect(item.full.page3.chakras.map(x => x.text).join(' ')).not.toMatch(/\d\/4/);
    expect(item.full.source.fingerprint).not.toBe(data.zero.full.source.fingerprint);
  }
  const creative = data.variants.find(item => item.question.id === 'q12_trava_expressao_criatividade');
  expect(creative.full.page3.chakras.map(item => item.name).sort()).toEqual(['Laríngeo', 'Sacral']);
  expect(creative.full.page2.cycle).toBeUndefined();
  expect(data.partialReport.answerEvidence).toHaveLength(19);
  expect(data.partialReport.page2.paragraphs.join(' ')).not.toContain('Ausência de resposta');
  expect(data.zero.full.page3.preserved.join(' ')).not.toMatch(/preocupações financeiras|criatividade|Você não descreveu forças/);
  expect(data.quoted.page2.paragraphs.join(' ')).toContain('Não sinto ansiedade. Quero reconhecer meu próprio ritmo.');
  expect(data.quoted.page3.preserved.join(' ')).toContain('Minha criatividade continua viva.');
  expect(data.quoted.page3.chakras).toHaveLength(0);
});

test('refreshing a legacy report changes the reading and preserves reviewed care', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { executarAnaliseIntegrativa } = await import(/* @vite-ignore */ String('/src/engine/analysisEngine.ts'));
    const { buildFullReportNarrative, refreshReportReading } = await import(/* @vite-ignore */ String('/src/result/fullReportNarrative.ts'));
    const intake = CASOS_DE_TESTE[0].dados;
    const analysis = executarAnaliseIntegrativa(intake);
    const schedule = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, energyNames: [i % 2 ? 'Soul Healing' : 'Original Reiki Platinum'], intention: 'Intenção revisada.' }));
    const stored = { ...buildFullReportNarrative({ intake, analysis, composition: null, journeyDays: 7, dailyEnergySchedule: schedule }), source: undefined, page2: { title: 'Diagnóstico da Anamnese', paragraphs: ['Texto genérico de outra pessoa.'] }, page4: { title: 'Cuidado', paragraphs: ['Direção do cuidado: caminho genérico.', 'Florais — Recurso aprovado.'] } };
    return { fresh: refreshReportReading(stored, intake, analysis), schedule };
  });
  expect(result.fresh.source.generatorVersion).toBe('answers-v5');
  expect(result.fresh.page2.paragraphs.join(' ')).not.toContain('Texto genérico');
  expect(result.fresh.page4.paragraphs).toContain('Florais — Recurso aprovado.');
  expect(result.fresh.dailyEnergySchedule).toEqual(result.schedule);
  expect(result.fresh.journeyDays).toBe(7);
});

test('publication rejects a report built from different saved answers', async ({ page }) => {
  await page.goto('/');
  const fixture = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { executarAnaliseIntegrativa } = await import(/* @vite-ignore */ String('/src/engine/analysisEngine.ts'));
    const { buildFullReportNarrative } = await import(/* @vite-ignore */ String('/src/result/fullReportNarrative.ts'));
    const intake = CASOS_DE_TESTE[0].dados;
    return { report: buildFullReportNarrative({ intake, analysis: executarAnaliseIntegrativa(intake), composition: null }), row: { id: intake.id, person_name: intake.nomePessoa, answers: { ...intake.respostasObjetivas, q2_mente_acelerada: 0 }, declared_intention: intake.intencaoDeclarada, free_text_need: intake.relatoLivreNecessidade, free_text_challenges: intake.relatoLivreDesafios, free_text_strengths: intake.relatoLivrePreservado, body_regions: intake.regioesCorporaisPercebidas, energetic_sensitivity: intake.sensibilidadeEnergetica } };
  });
  let writes = 0;
  await page.route('**/rest/v1/intake_sessions**', route => route.fulfill({ json: fixture.row }));
  await page.route('**/rest/v1/full_report_publications**', async route => { if (route.request().method() !== 'GET') writes++; await route.fulfill({ json: null }); });
  const message = await page.evaluate(async report => {
    const { publishFullReport } = await import(/* @vite-ignore */ String('/src/services/fullReportBackend.ts'));
    try { await publishFullReport({ intakeId: 'test', userId: 'test', report }); return 'unexpected success'; } catch (error) { return error.message; }
  }, fixture.report);
  expect(message).toContain('não corresponde às respostas salvas');
  expect(writes).toBe(0);
});


test('automatic care delivers seven distinct days and documented complementary resources without ADM approval', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { buildAutomaticCare } = await import(/* @vite-ignore */ String('/src/care/automaticCare.ts'));
    const { PERGUNTAS_ANAMNESE } = await import(/* @vite-ignore */ String('/src/data/questions.ts'));
    const cases = CASOS_DE_TESTE.map(sample => buildAutomaticCare(sample.dados, 7));
    const original = CASOS_DE_TESTE[0].dados;
    const zeroAnswers = Object.fromEntries(PERGUNTAS_ANAMNESE.map(question => [question.id, 0]));
    const calm = buildAutomaticCare({ ...original, respostasObjetivas: zeroAnswers, relatoLivreNecessidade: '', relatoLivreDesafios: '', regioesCorporaisPercebidas: [] }, 7);
    const mental = buildAutomaticCare({ ...original, respostasObjetivas: { ...zeroAnswers, q2_mente_acelerada: 4 }, relatoLivreNecessidade: '', relatoLivreDesafios: '', regioesCorporaisPercebidas: [] }, 7);
    const emotional = buildAutomaticCare({ ...original, respostasObjetivas: { ...zeroAnswers, q6_engolir_emocoes: 4 }, relatoLivreNecessidade: '', relatoLivreDesafios: '', regioesCorporaisPercebidas: [] }, 7);
    return { reports: cases.map(item => item.report), resources: cases.map(item => item.resources), calm: calm.report, mental: mental.report, emotional: emotional.report };
  });
  for (const report of result.reports) {
    expect(report.deliveryMode).toBe('automatic');
    expect(report.dailyEnergySchedule).toHaveLength(7);
    expect(new Set(report.dailyEnergySchedule.map(day => [...day.energyNames].sort().join('|'))).size).toBe(7);
    expect(report.dailyEnergySchedule.every(day => day.reason && day.energyDetails.every(item => item.source) && day.resources.every(item => item.source))).toBe(true);
  }
  for (const resources of result.resources) {
    expect(resources.every(item => ['Cristal etérico', 'Floral', 'Aromaterapia', 'Banho energético', 'Solfeggio'].includes(item.category))).toBe(true);
    expect(resources.some(item => item.category === 'Solfeggio')).toBe(true);
    expect(resources.some(item => item.category === 'Cristal etérico')).toBe(true);
  }
  expect(result.mental.source.fingerprint).not.toBe(result.emotional.source.fingerprint);
  expect(result.mental.dailyEnergySchedule).not.toEqual(result.emotional.dailyEnergySchedule);
  expect(result.calm.page3.chakras).toHaveLength(0);
  expect(result.mental.page3.chakras.map(item => item.name)).toEqual(['Frontal']);
  expect(result.emotional.page3.chakras.map(item => item.name).sort()).toEqual(['Cardíaco', 'Laríngeo']);
  await render(page, 'FullReportApprovedView', { report: result.reports[0] });
  await expect(page.getByRole('heading', { name: 'Dia 7', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Programação diária' })).toContainText('Cristal etérico');
  await expect(page.getByText('aguarda revisão', { exact: false })).toHaveCount(0);
  await expect(page.getByText('Neste cuidado, esse centro está associado', { exact: false })).toHaveCount(0);
});

test('paid report is generated from saved answers even without a publication or an ADM review', async ({ page }) => {
  await page.goto('/');
  const source = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    return CASOS_DE_TESTE[0].dados;
  });
  await page.route('**/rest/v1/commercial_entitlements**', route => route.fulfill({ json: { product_code: 'CARE_7_BASIC', paid_amount_cents: 5000, full_report_addon_paid: true, status: 'active' } }));
  await page.route('**/rest/v1/intake_sessions**', route => route.fulfill({ json: { id: 'saved-intake', external_ref: source.id, person_name: source.nomePessoa, answers: source.respostasObjetivas, declared_intention: source.intencaoDeclarada, free_text_need: source.relatoLivreNecessidade, free_text_challenges: source.relatoLivreDesafios, free_text_strengths: source.relatoLivrePreservado, body_regions: source.regioesCorporaisPercebidas, energetic_sensitivity: source.sensibilidadeEnergetica } }));
  await page.route('**/rest/v1/full_report_publications**', route => route.fulfill({ json: null }));
  const publication = await page.evaluate(async () => {
    const { loadOwnFullReport } = await import(/* @vite-ignore */ String('/src/services/fullReportBackend.ts'));
    return loadOwnFullReport('saved-intake');
  });
  expect(publication.report.deliveryMode).toBe('automatic');
  expect(publication.report.dailyEnergySchedule).toHaveLength(7);
  expect(publication.report.source.intakeId).toBe(source.id);
});


test('paid complete reading is shown once, without a repeated basic report or an approval gate', async ({ page }) => {
  await page.goto('/');
  const source = await page.evaluate(async () => { const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts')); return CASOS_DE_TESTE[0].dados; });
  await page.route('**/rest/v1/**', route => route.fulfill({ json: null }));
  await page.route('**/rest/v1/intake_sessions**', route => route.fulfill({ json: { id: 'paid-intake', external_ref: source.id, person_name: source.nomePessoa, answers: source.respostasObjetivas, declared_intention: source.intencaoDeclarada, free_text_need: source.relatoLivreNecessidade, free_text_challenges: source.relatoLivreDesafios, free_text_strengths: source.relatoLivrePreservado, body_regions: source.regioesCorporaisPercebidas, energetic_sensitivity: source.sensibilidadeEnergetica } }));
  await page.route('**/rest/v1/commercial_entitlements**', route => route.fulfill({ json: { product_code: 'CARE_7_BASIC', paid_amount_cents: 5000, full_report_addon_paid: true, status: 'active' } }));
  await page.evaluate(async () => {
    const { default: React } = await import(/* @vite-ignore */ String('/node_modules/.vite/deps/react.js'));
    const { default: ReactDOM } = await import(/* @vite-ignore */ String('/node_modules/.vite/deps/react-dom_client.js'));
    const { supabase } = await import(/* @vite-ignore */ String('/src/lib/supabase.ts'));
    supabase.auth.getUser = async () => ({ data: { user: { id: 'test-user' } }, error: null });
    const { UserMomentArea } = await import(/* @vite-ignore */ String('/src/components/UserMomentArea.tsx'));
    document.getElementById('root').remove(); const host = document.createElement('div'); document.body.appendChild(host);
    ReactDOM.createRoot(host).render(React.createElement(UserMomentArea, { mode: 'momento', onStartNewIntake: () => {} }));
  });
  await expect(page.getByRole('heading', { name: 'Dia 7', exact: true })).toBeVisible();
  await expect(page.locator('.report-page')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Leitura Básica', exact: true })).toHaveCount(0);
  await expect(page.getByText('aguarda revisão', { exact: false })).toHaveCount(0);
});


test('free text changes contextual care without treating explicit denials as symptoms or inventing strengths', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { executarAnaliseQualitativaProfunda } = await import(/* @vite-ignore */ String('/src/engine/contextualEngine.ts'));
    const input = { ...CASOS_DE_TESTE[0].dados, relatoLivreNecessidade: '', relatoLivreDesafios: '', relatoLivrePreservado: '', intencaoDeclarada: '' };
    return {
      denied: executarAnaliseQualitativaProfunda({ ...input, relatoLivreNecessidade: 'Não tenho medo. Não sinto ansiedade. Não tenho cansaço. Não tenho crise.' }),
      mixed: executarAnaliseQualitativaProfunda({ ...input, relatoLivreNecessidade: 'Não sinto medo, mas tenho cansaço e esgotamento.' }),
      exhausted: executarAnaliseQualitativaProfunda({ ...input, relatoLivreNecessidade: 'Tenho cansaço e esgotamento.' }),
      limits: executarAnaliseQualitativaProfunda({ ...input, relatoLivreDesafios: 'Não consigo dizer não. Preciso colocar limites.' }),
      noStrength: executarAnaliseQualitativaProfunda({ ...input, relatoLivrePreservado: 'Não tenho vontade. Perdi minha fé.' }),
    };
  });
  expect(result.denied.clustersSemanticos).toHaveLength(0);
  expect(result.denied.emocoesMencionadas).toHaveLength(0);
  expect(result.denied.urgenciaEstabilizacaoQualitativa).toBe(false);
  expect(result.mixed.clustersSemanticos).toEqual(result.exhausted.clustersSemanticos);
  expect(result.limits.clustersSemanticos.some(item => item.nomeCluster.includes('Limites'))).toBe(true);
  expect(result.noStrength.fatoresPreservados.recursosInternosPreservados).toHaveLength(0);
  expect(result.noStrength.fatoresPreservados.potencialExpansao).toBe(false);
});

test('ADM programming script uses the exact patient daily energies and documented supporting resources', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { buildAutomaticCare } = await import(/* @vite-ignore */ String('/src/care/automaticCare.ts'));
    const { buildEnergyProgrammingScript } = await import(/* @vite-ignore */ String('/src/care/energyProgrammingScript.ts'));
    const intake = CASOS_DE_TESTE[0].dados;
    const schedule = buildAutomaticCare(intake, 7).report.dailyEnergySchedule;
    return { schedule, script: buildEnergyProgrammingScript(intake.nomePessoa, schedule) };
  });
  expect(result.script).toHaveLength(7);
  result.script.forEach((day, index) => {
    expect(day.energyNames).toEqual(result.schedule[index].energyNames);
    expect(day.lines.join('\n')).toContain('Destinatário:');
    day.energyNames.forEach(name => expect(day.lines.join('\n')).toContain(`Energia: ${name}`));
    day.resources.forEach(resource => expect(day.lines.join('\n')).toContain(`${resource.category}: ${resource.name}`));
    expect(day.lines.join('\n')).toContain('Fonte:');
  });
});

test('failed preparatory replacement preserves the previous audio and removes only the new upload', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { supabase } = await import(/* @vite-ignore */ String('/src/lib/supabase.ts'));
    const { uploadPreparatoryAudio } = await import(/* @vite-ignore */ String('/src/services/preparatoryAudioBackend.ts'));
    const uploaded = []; const removed = [];
    supabase.from = () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'preparatory-default', storage_path: 'preparatory/previous.mp3', status: 'published' }, error: null }) }) }), update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: null, error: new Error('publication failed') }) }) }) }) });
    supabase.storage.from = () => ({ upload: async (path, file, options) => { uploaded.push({ path, upsert: options.upsert }); return { error: null }; }, remove: async paths => { removed.push(...paths); return { error: null }; } });
    try { await uploadPreparatoryAudio({ file: new File(['test'], 'replacement.mp3', { type: 'audio/mpeg' }) }); } catch { /* expected failure */ }
    return { uploaded, removed };
  });
  expect(result.uploaded).toHaveLength(1);
  expect(result.uploaded[0].upsert).toBe(false);
  expect(result.removed).toEqual([result.uploaded[0].path]);
  expect(result.removed).not.toContain('preparatory/previous.mp3');
});

test('patient reading does not repeat its opening and explains every scheduled energy and support without ADM jargon', async ({ page }) => {
  await page.goto('/');
  const report = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { buildAutomaticCare } = await import(/* @vite-ignore */ String('/src/care/automaticCare.ts'));
    return buildAutomaticCare(CASOS_DE_TESTE[0].dados, 7).report;
  });
  expect(report.page2.paragraphs).not.toContain(report.page1.intro);
  expect(report.page1.intro).not.toContain(report.page2.paragraphs[0]);
  await render(page, 'FullReportApprovedView', { report });
  const schedule = page.getByRole('region', { name: 'Programação diária' });
  for (const day of report.dailyEnergySchedule) {
    const dayView = schedule.locator('ol > li').nth(day.day - 1);
    for (const energy of day.energyDetails) await expect(dayView).toContainText(`${energy.name}: ${energy.explanation}`);
    for (const resource of day.resources.filter(item => !report.journeyResources.some(resource => resource.id === item.id))) await expect(dayView).toContainText(`${resource.category} · ${resource.name}: ${resource.explanation}`);
  }
  await expect(page.locator('.report-page')).not.toContainText('O app limita');
  await expect(page.locator('.report-page')).not.toContainText('Recurso confirmado no material');
  await expect(page.getByRole('heading', { name: 'Recursos que acompanham o seu percurso' })).toHaveCount(0);
});

test('floral aroma and one Solfeggio remain fixed throughout the journey and ADM receives the same guidance', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { buildAutomaticCare } = await import(/* @vite-ignore */ String('/src/care/automaticCare.ts'));
    const { buildEnergyProgrammingScript } = await import(/* @vite-ignore */ String('/src/care/energyProgrammingScript.ts'));
    const reports = CASOS_DE_TESTE.map(sample => buildAutomaticCare(sample.dados, 7).report);
    return { reports, script: buildEnergyProgrammingScript(CASOS_DE_TESTE[0].dados.nomePessoa, reports[0].dailyEnergySchedule) };
  });
  for (const report of result.reports) {
    expect(report.journeyResources.filter(item => item.category === 'Solfeggio')).toHaveLength(1);
    expect(report.journeyResources.filter(item => item.category === 'Floral')).toHaveLength(1);
    const fixed = report.journeyResources.map(item => item.id).sort();
    for (const day of report.dailyEnergySchedule) expect(day.resources.filter(item => ['Solfeggio', 'Floral', 'Aromaterapia'].includes(item.category)).map(item => item.id).sort()).toEqual(fixed);
    expect(report.journeyResources.find(item => item.category === 'Floral').guidance).toContain('10 gotas, duas vezes ao dia');
  }
  expect(result.script.every(day => day.lines.join('\n').includes('única frequência-base'))).toBe(true);
  await render(page, 'FullReportApprovedView', { report: result.reports[0] });
  await expect(page.getByRole('region', { name: 'Apoios de toda a jornada' })).toContainText('10 gotas, duas vezes ao dia');
  await expect(page.getByRole('region', { name: 'Como receber os banhos de luz' })).toContainText('recebido durante a sessão de escuta');
});


test('contextual care welcomes actual experiences, combines documented Karuna symbols and gives concrete bath instructions', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { CASOS_DE_TESTE } = await import(/* @vite-ignore */ String('/src/data/sampleCases.ts'));
    const { PERGUNTAS_ANAMNESE } = await import(/* @vite-ignore */ String('/src/data/questions.ts'));
    const { buildAutomaticCare } = await import(/* @vite-ignore */ String('/src/care/automaticCare.ts'));
    const { buildEnergyProgrammingScript } = await import(/* @vite-ignore */ String('/src/care/energyProgrammingScript.ts'));
    const base = { ...CASOS_DE_TESTE[0].dados, relatoLivreNecessidade: '', relatoLivreDesafios: '', relatoLivrePreservado: '', intencaoDeclarada: '', regioesCorporaisPercebidas: [], respostasObjetivas: Object.fromEntries(PERGUNTAS_ANAMNESE.map(q => [q.id, 0])) };
    const anxious = buildAutomaticCare({ ...base, respostasObjetivas: { ...base.respostasObjetivas, q3_sensacao_ameaca_inseguranca: 4, q2_mente_acelerada: 4, q4_cansaco_esgotamento: 4 }, relatoLivreNecessidade: 'Depressão e ansiedade' }, 7).report;
    const creative = buildAutomaticCare({ ...base, respostasObjetivas: { ...base.respostasObjetivas, q12_trava_expressao_criatividade: 3 } }, 7).report;
    return { anxious, creative, script: buildEnergyProgrammingScript('Pessoa', anxious.dailyEnergySchedule) };
  });
  expect(result.anxious.page2.paragraphs.join(' ')).toContain('como se algo ruim pudesse acontecer');
  expect(result.anxious.page2.paragraphs.join(' ')).toContain('inclusive ao acordar');
  expect(result.creative.page2.paragraphs.join(' ')).not.toMatch(/esgotamento|estado de alerta|depressão/i);
  expect(result.anxious.dailyEnergySchedule.some(day => day.energyNames.some(name => /^Karuna Ki · (Shanti|Rama|Harth)/.test(name)))).toBe(true);
  expect(result.anxious.dailyEnergySchedule.some(day => day.energyNames.length >= 3)).toBe(true);
  expect(result.anxious.dailyEnergySchedule.every(day => day.invitation)).toBe(true);
  expect(result.script.some(day => day.lines.some(line => line.includes('Eu solicito um banho no Templo de Luz')))).toBe(true);
  await render(page, 'FullReportApprovedView', { report: result.anxious });
  await expect(page.locator('.report-page')).not.toContainText('Pertence ao sistema');
  await expect(page.getByRole('region', { name: 'Como receber os banhos de luz' })).toContainText('imagine uma piscina de luz');
  await expect(page.getByRole('region', { name: 'Programação diária' })).toContainText('Um gesto possível para hoje');
  await expect(page.locator('.report-page')).not.toContainText('Eu desbloqueio');
});

test('common connection audio is offered without a paid journey and has app-only playback', async ({ page }) => {
  await page.goto('/');
  await page.route('**/rest/v1/**', route => route.fulfill({ json: null }));
  await page.evaluate(async () => {
    const { default: React } = await import(/* @vite-ignore */ String('/node_modules/.vite/deps/react.js'));
    const { default: ReactDOM } = await import(/* @vite-ignore */ String('/node_modules/.vite/deps/react-dom_client.js'));
    const { supabase } = await import(/* @vite-ignore */ String('/src/lib/supabase.ts'));
    supabase.auth.getUser = async () => ({ data: { user: { id: 'new-user-without-entitlement' } }, error: null });
    const originalFrom = supabase.from.bind(supabase);
    supabase.from = table => table === 'protocol_audio_assets' ? { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'preparatory-default', title: 'Um momento de conexão com seu cuidado', status: 'published', storage_path: 'preparatory/connection.mp3', duration_seconds: 900, fixed_for_all_users: true, downloadable: false }, error: null }) }) }) } : originalFrom(table);
    supabase.storage.from = () => ({ createSignedUrl: async () => ({ data: { signedUrl: '/connection-test.mp3' }, error: null }) });
    const { UserMomentArea } = await import(/* @vite-ignore */ String('/src/components/UserMomentArea.tsx'));
    document.getElementById('root').remove(); const host = document.createElement('div'); document.body.appendChild(host);
    ReactDOM.createRoot(host).render(React.createElement(UserMomentArea, { mode: 'momento', onStartNewIntake: () => {} }));
  });
  await expect(page.getByRole('heading', { name: 'Um momento de conexão com seu cuidado' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Iniciar áudio' })).toBeDisabled();
  await page.getByRole('checkbox').check();
  await expect(page.getByRole('button', { name: 'Iniciar áudio' })).toBeEnabled();
  await expect(page.locator('audio')).toHaveAttribute('src', '/connection-test.mp3');
  await expect(page.locator('audio')).not.toHaveAttribute('controls', '');
  await expect(page.getByRole('link', { name: /baixar|download/i })).toHaveCount(0);
});

test('forgot password requests the correct recovery redirect and password setup checks confirmation', async ({ page }) => {
  await render(page, 'AuthScreen', {});
  await page.evaluate(async () => {
    const { supabase } = await import(/* @vite-ignore */ String('/src/lib/supabase.ts'));
    window.__recovery = [];
    supabase.auth.resetPasswordForEmail = async (email, options) => { window.__recovery.push({ email, options }); return { data: {}, error: null }; };
  });
  await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
  await expect(page.getByText('Informe seu e-mail para receber o link de recuperação.')).toBeVisible();
  await page.getByLabel('E-mail', { exact: true }).fill('example@example.com');
  await page.getByRole('button', { name: 'Esqueci minha senha' }).click();
  await expect(page.getByText(/você receberá um link para definir uma nova senha/)).toBeVisible();
  expect(await page.evaluate(() => window.__recovery)).toEqual([{ email: 'example@example.com', options: { redirectTo: 'https://relatorioenergetico.vercel.app/?setup=password' } }]);
  await render(page, 'PasswordSetupScreen', { });
  await page.evaluate(async () => {
    const { supabase } = await import(/* @vite-ignore */ String('/src/lib/supabase.ts'));
    window.__passwordUpdates = 0;
    supabase.auth.updateUser = async () => { window.__passwordUpdates++; return { data: {}, error: new Error('temporary failure') }; };
  });
  await page.getByLabel('Nova senha').fill('example-secure-123');
  await page.getByLabel('Confirme a senha').fill('different-secure-123');
  await page.getByRole('button', { name: 'Salvar senha e continuar' }).click();
  await expect(page.getByRole('alert')).toContainText('As senhas precisam ser iguais');
  expect(await page.evaluate(() => window.__passwordUpdates)).toBe(0);
  await page.getByLabel('Confirme a senha').fill('example-secure-123');
  await page.getByRole('button', { name: 'Salvar senha e continuar' }).click();
  await expect(page.getByRole('alert')).toContainText('temporary failure');
  expect(await page.evaluate(() => window.__passwordUpdates)).toBe(1);
});
