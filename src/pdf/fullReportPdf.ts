import { jsPDF } from 'jspdf';
import { FullReportNarrative } from '../result/fullReportNarrative';

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 20;
const TEXT_W = PAGE_W - MARGIN_X * 2;

async function loadOfficialLogoPng(): Promise<string | null> {
  try {
    const response = await fetch('/logo-everton-oficial.svg');
    if (!response.ok) return null;
    const svgText = await response.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
      });
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL('image/png');
    } finally {
      URL.revokeObjectURL(url);
    }
  } catch {
    return null;
  }
}

function drawBackground(doc: jsPDF) {
  doc.setFillColor(255, 250, 240);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');
  doc.setFillColor(242, 238, 221);
  doc.circle(195, 38, 38, 'F');
  doc.setFillColor(244, 246, 238);
  doc.circle(10, 278, 42, 'F');
  doc.setDrawColor(202, 164, 81);
  doc.setLineWidth(0.35);
  doc.circle(201, 52, 31, 'S');
  doc.circle(3, 264, 30, 'S');
}

function drawHeader(doc: jsPDF, logo: string | null, page: number) {
  if (logo) doc.addImage(logo, 'PNG', 84, 8, 42, 42, undefined, 'FAST');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(26, 59, 44);
  doc.text('EVERTON PICENI', 105, 51, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(150, 119, 53);
  doc.text('TERAPIAS HOLISTICAS E BEM-ESTAR', 105, 55, { align: 'center' });
  doc.setFontSize(6.2);
  doc.setTextColor(91, 108, 97);
  doc.text('CORPO  |  MENTE  |  ENERGIA  |  ESPIRITO', 105, 59, { align: 'center' });
  doc.setDrawColor(202, 164, 81);
  doc.line(70, 62, 140, 62);
  doc.setFontSize(7);
  doc.setTextColor(107, 116, 109);
  doc.text(`PAGINA ${page} DE 5`, 190, 286, { align: 'right' });
}

function drawTitle(doc: jsPDF, title: string, y: number) {
  doc.setFont('times', 'bold');
  doc.setFontSize(25);
  doc.setTextColor(24, 58, 43);
  const lines = doc.splitTextToSize(title, TEXT_W);
  doc.text(lines, MARGIN_X, y);
  const nextY = y + lines.length * 10;
  doc.setDrawColor(202, 164, 81);
  doc.line(MARGIN_X, nextY + 2, 190, nextY + 2);
  return nextY + 10;
}

function measureParagraphs(doc: jsPDF, items: string[], fontSize: number, lineHeight: number) {
  doc.setFont('times', 'normal');
  doc.setFontSize(fontSize);
  return items.reduce((total, text) => {
    const lines = doc.splitTextToSize(text, TEXT_W);
    return total + lines.length * lineHeight + 4.2;
  }, 0);
}

function drawParagraphsFitted(
  doc: jsPDF,
  items: string[],
  startY: number,
  maxY: number,
  options?: { maxFont?: number; minFont?: number }
) {
  const maxFont = options?.maxFont ?? 10.6;
  const minFont = options?.minFont ?? 7.8;
  let fontSize = maxFont;
  let lineHeight = fontSize * 0.49;
  const available = maxY - startY;

  while (fontSize > minFont && measureParagraphs(doc, items, fontSize, lineHeight) > available) {
    fontSize -= 0.35;
    lineHeight = fontSize * 0.49;
  }

  let y = startY;
  doc.setFont('times', 'normal');
  doc.setFontSize(fontSize);
  doc.setTextColor(62, 79, 68);

  for (const text of items) {
    const lines = doc.splitTextToSize(text, TEXT_W);
    doc.text(lines, MARGIN_X, y);
    y += lines.length * lineHeight + 4.2;
  }
  return y;
}

function drawQuote(doc: jsPDF, text: string, y: number) {
  const lines = doc.splitTextToSize(text, 154);
  const h = Math.max(17, lines.length * 5 + 9);
  doc.setFillColor(251, 243, 223);
  doc.setDrawColor(222, 201, 142);
  doc.roundedRect(25, y, 160, h, 5, 5, 'FD');
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(151, 109, 34);
  doc.text(lines, 105, y + 8, { align: 'center' });
  return y + h + 6;
}

function addBasePage(doc: jsPDF, logo: string | null, page: number) {
  if (page > 1) doc.addPage();
  drawBackground(doc);
  drawHeader(doc, logo, page);
}

function safeName(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function drawChakrasFitted(doc: jsPDF, chakras: Array<{ name: string; text: string }>, startY: number, maxY: number) {
  let fontSize = 9.2;
  let prepared = chakras.slice(0, 5).map(chakra => ({ chakra, lines: [] as string[] }));

  const prepare = () => {
    doc.setFontSize(fontSize);
    prepared = chakras.slice(0, 5).map(chakra => {
      doc.setFont('times', 'bold');
      const label = `${chakra.name}: `;
      const labelW = doc.getTextWidth(label);
      doc.setFont('times', 'normal');
      return { chakra, lines: doc.splitTextToSize(chakra.text, TEXT_W - labelW) as string[] };
    });
  };

  prepare();
  const totalHeight = () => prepared.reduce((sum, item) => sum + Math.max(7, item.lines.length * fontSize * 0.48 + 2.4), 0);
  while (fontSize > 7.3 && totalHeight() > maxY - startY) {
    fontSize -= 0.3;
    prepare();
  }

  let y = startY;
  for (const { chakra, lines } of prepared) {
    const label = `${chakra.name}: `;
    doc.setFont('times', 'bold');
    doc.setFontSize(fontSize);
    doc.setTextColor(160, 113, 38);
    doc.text(label, MARGIN_X, y);
    const labelW = doc.getTextWidth(label);
    doc.setFont('times', 'normal');
    doc.setTextColor(66, 83, 72);
    doc.text(lines, MARGIN_X + labelW, y);
    y += Math.max(7, lines.length * fontSize * 0.48 + 2.4);
  }
  return y;
}

export async function createFullReportPdfBlob(report: FullReportNarrative): Promise<{ blob: Blob; fileName: string }> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const logo = await loadOfficialLogoPng();

  drawBackground(doc);
  drawHeader(doc, logo, 1);
  let y = 84;
  doc.setFont('times', 'bold');
  doc.setFontSize(27);
  doc.setTextColor(24, 58, 43);
  doc.text('Relatorio Completo', MARGIN_X, y);
  y += 12;
  doc.setTextColor(164, 116, 39);
  doc.text('Leitura do Seu Momento', MARGIN_X, y);
  y += 18;
  doc.setDrawColor(202, 164, 81);
  doc.line(MARGIN_X, y - 6, 190, y - 6);
  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(24, 58, 43);
  doc.text(report.nome, MARGIN_X, y + 6);
  y += 18;
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(63, 81, 69);
  const intro = doc.splitTextToSize(report.page1.intro, 146);
  doc.text(intro, MARGIN_X, y);
  y += intro.length * 6 + 10;
  const subtitle = doc.splitTextToSize(report.page1.subtitle, 146);
  doc.setTextColor(94, 108, 99);
  doc.text(subtitle, MARGIN_X, y);
  y += subtitle.length * 6 + 18;
  doc.setFont('times', 'italic');
  doc.setFontSize(17);
  doc.setTextColor(164, 116, 39);
  doc.text('Cuidar da sua energia e voltar para voce.', MARGIN_X, y);

  addBasePage(doc, logo, 2);
  y = drawTitle(doc, report.page2.title, 76);
  const page2Max = report.page2.cycle ? 238 : 270;
  y = drawParagraphsFitted(doc, report.page2.paragraphs, y, page2Max, { maxFont: 10.4, minFont: 7.5 });
  if (report.page2.cycle) drawQuote(doc, report.page2.cycle, Math.min(y + 3, 246));

  addBasePage(doc, logo, 3);
  y = drawTitle(doc, report.page3.title, 76);
  y = drawParagraphsFitted(doc, report.page3.paragraphs, y, 145, { maxFont: 9.8, minFont: 7.7 });

  const preservedItems = report.page3.preserved.slice(0, 5);
  const preservedHeight = Math.max(32, 16 + preservedItems.length * 4.4);
  doc.setFillColor(250, 245, 231);
  doc.setDrawColor(226, 212, 179);
  doc.roundedRect(MARGIN_X, y, 170, preservedHeight, 5, 5, 'FD');
  doc.setFont('times', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(29, 65, 47);
  doc.text('Recursos que permanecem vivos em voce', 26, y + 8);
  doc.setFont('times', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(76, 96, 83);
  let py = y + 15;
  preservedItems.forEach(item => { doc.text(`- ${item}`, 28, py); py += 4.4; });
  y += preservedHeight + 8;

  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(24, 58, 43);
  doc.text('O que os seus chakras nos mostram dentro do protocolo', MARGIN_X, y);
  y += 8;
  drawChakrasFitted(doc, report.page3.chakras, y, 270);

  addBasePage(doc, logo, 4);
  y = drawTitle(doc, report.page4.title, 76);
  drawParagraphsFitted(doc, report.page4.paragraphs, y, 270, { maxFont: 10.2, minFont: 7.3 });

  addBasePage(doc, logo, 5);
  y = drawTitle(doc, report.page5.title, 76);
  y = drawParagraphsFitted(doc, report.page5.paragraphs, y, 172, { maxFont: 10.2, minFont: 8 });
  y += 4;
  doc.setFont('times', 'bold');
  doc.setFontSize(21);
  doc.setTextColor(24, 58, 43);
  doc.text(report.page5.closingTitle, MARGIN_X, y);
  y += 11;
  drawParagraphsFitted(doc, report.page5.closing, y, 268, { maxFont: 10.3, minFont: 7.8 });

  return { blob: doc.output('blob'), fileName: `relatorio-completo-${safeName(report.nome) || 'resultado'}.pdf` };
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
