import { test, expect } from '@playwright/test';

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
    const narrative = buildFullReportNarrative({ intake, analysis, composition: { audio: null, floral: [], aromatherapy: [], ethericCrystals: [], solfeggio: null, journey21Mode: 'NAO_INDICADO' } });
    return narrative;
  });
}

test('approved report preserves manual removals, has five pages and exports the same view', async ({ page }) => {
  await page.goto('/');
  const narrative = await report(page);
  expect(narrative.page4.paragraphs.join(' ')).not.toMatch(/Florais —|Cristais etéricos —|Aromaterapia —|Frequência de apoio|Como essa energia/);
  expect(narrative.page5.paragraphs.join(' ')).toMatch(/7 dias.*21 dias/);
  await render(page, 'FullReportApprovedView', { report: narrative });
  await expect(page.locator('.report-page')).toHaveCount(5);
  await page.screenshot({ path: '/workspace/scratch/report-desktop.png', fullPage: true });
  const pdf = await page.evaluate(async narrative => {
    const { createFullReportPdfBlob } = await import(/* @vite-ignore */ String('/src/pdf/fullReportPdf.ts'));
    const { blob } = await createFullReportPdfBlob(narrative);
    const content = await blob.text();
    return { size: blob.size, pages: (content.match(/\/Type \/Page\b/g) || []).length, hiddenHosts: document.querySelectorAll('[style*="-10000px"]').length };
  }, narrative);
  expect(pdf.pages).toBe(5); expect(pdf.size).toBeGreaterThan(10000); expect(pdf.hiddenHosts).toBe(0);
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
