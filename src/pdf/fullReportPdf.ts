import { jsPDF } from 'jspdf';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { FullReportApprovedView } from '../components/FullReportApprovedView';
import type { FullReportNarrative } from '../result/fullReportNarrative';

/** All complete delivery channels render the same approved five-page component. */
export async function createFullReportPdfBlob(report: FullReportNarrative): Promise<{ blob: Blob; fileName: string }> {
  const { default: html2canvas } = await import('html2canvas-pro');
  const host = document.createElement('div');
  host.style.cssText = 'position:absolute;left:-10000px;top:0;width:794px;pointer-events:none;';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(createElement(FullReportApprovedView, { report })));
    await document.fonts.ready;
    await Promise.all(Array.from(host.querySelectorAll('img')).map(img => img.decode()));
    const pages = Array.from(host.querySelectorAll<HTMLElement>('.report-page'));
    if (pages.length !== 5 + Math.ceil((report.dailyEnergySchedule?.length || 0) / 7)) throw new Error('O relatório e sua programação diária precisam estar completos.');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    for (const [index, page] of pages.entries()) {
      if (index) doc.addPage();
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#fffaf0', logging: false, windowWidth: 1280 });
      const scale = Math.min(210 / canvas.width, 297 / canvas.height);
      const width = canvas.width * scale;
      const height = canvas.height * scale;
      doc.setFillColor(255, 250, 240);
      doc.rect(0, 0, 210, 297, 'F');
      doc.addImage(canvas.toDataURL('image/jpeg', .94), 'JPEG', (210 - width) / 2, 0, width, height);
    }
    const name = report.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
    return { blob: doc.output('blob'), fileName: `relatorio-completo-${name || 'resultado'}.pdf` };
  } finally {
    root.unmount();
    host.remove();
  }
}

export async function downloadFullReportPdf(report: FullReportNarrative) {
  const { blob, fileName } = await createFullReportPdfBlob(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
