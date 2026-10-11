import { jsPDF } from 'jspdf';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { FullReportApprovedView } from '../components/FullReportApprovedView';
import type { FullReportNarrative } from '../result/fullReportNarrative';

/** All complete delivery channels render the same approved report structure. */
export async function createFullReportPdfBlob(report: FullReportNarrative): Promise<{ blob: Blob; fileName: string }> {
  const { default: html2canvas } = await import('html2canvas-pro');
  const host = document.createElement('div');
  host.className = 'pdf-export';
  host.style.cssText = 'position:absolute;left:-10000px;top:0;width:794px;pointer-events:none;';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(createElement(FullReportApprovedView, { report })));
    await document.fonts.ready;
    await Promise.all(Array.from(host.querySelectorAll('img')).map(img => img.decode()));
    const pages = Array.from(host.querySelectorAll<HTMLElement>('.report-page'));
    const expected = 5 + Math.ceil((report.dailyEnergySchedule?.length || 0) / 7);
    if (pages.length !== expected) throw new Error('O relatório e sua programação diária precisam estar completos antes da exportação.');
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let printedPages = 0;
    for (const page of pages) {
      const canvas = await html2canvas(page, { scale: 2, backgroundColor: '#fffaf0', logging: false, windowWidth: 1280 });
      const pageBounds = page.getBoundingClientRect();
      const ratio = canvas.width / pageBounds.width;
      const maxHeight = Math.floor(canvas.width * 277 / 190);
      const blocks = Array.from(page.querySelectorAll<HTMLElement>('p, h2, h3, h4, [data-pdf-block], header, footer')).map(element => {
        const bounds = element.getBoundingClientRect();
        return { top: Math.floor((bounds.top - pageBounds.top) * ratio), bottom: Math.ceil((bounds.bottom - pageBounds.top) * ratio) };
      });
      let offset = 0;
      while (offset < canvas.height) {
        let end = Math.min(offset + maxHeight, canvas.height);
        const crossing = blocks.filter(block => block.top < end && block.bottom > end && block.top > offset);
        if (crossing.length) end = Math.min(...crossing.map(block => block.top));
        if (end <= offset) end = Math.min(offset + maxHeight, canvas.height);
        const fragment = document.createElement('canvas');
        fragment.width = canvas.width;
        fragment.height = end - offset;
        fragment.getContext('2d')!.drawImage(canvas, 0, offset, canvas.width, fragment.height, 0, 0, fragment.width, fragment.height);
        if (printedPages++) doc.addPage();
        doc.setFillColor(255, 250, 240);
        doc.rect(0, 0, 210, 297, 'F');
        doc.addImage(fragment.toDataURL('image/jpeg', .94), 'JPEG', 10, 10, 190, fragment.height * 190 / canvas.width);
        offset = end;
      }
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
