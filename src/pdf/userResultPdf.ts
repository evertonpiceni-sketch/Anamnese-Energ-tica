import { jsPDF } from 'jspdf';
import { CareComposition } from '../care/careComposer';

export interface UserResultPdfData {
  nome: string;
  data: string;
  headline: string;
  intro: string;
  priorities: string[];
  intention: string;
  closing: string;
  composition: CareComposition | null;
}

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN_X = 20;
const BOTTOM = 270;

export function downloadUserResultPdf(data: UserResultPdfData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  let y = 22;

  const ensure = (needed = 16) => {
    if (y + needed > BOTTOM) {
      doc.addPage();
      y = 22;
      drawHeader(doc);
    }
  };

  const paragraph = (
    text: string,
    options?: { size?: number; bold?: boolean; gap?: number; indent?: number }
  ) => {
    const size = options?.size ?? 10.5;
    const indent = options?.indent ?? 0;
    doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(58, 79, 67);
    const lines = doc.splitTextToSize(text, PAGE_W - MARGIN_X * 2 - indent);
    ensure(lines.length * 5 + 5);
    doc.text(lines, MARGIN_X + indent, y);
    y += lines.length * 5 + (options?.gap ?? 4);
  };

  const section = (title: string) => {
    ensure(16);
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(151, 122, 59);
    doc.text(title.toUpperCase(), MARGIN_X, y);
    y += 7;
  };

  drawHeader(doc);
  y = 54;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(27, 62, 45);
  const title = doc.splitTextToSize('Seu resultado - Anamnese Integrativa', 170);
  doc.text(title, MARGIN_X, y);
  y += title.length * 8 + 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(104, 113, 106);
  doc.text(`${data.nome || 'Pessoa'} • ${formatDate(data.data)}`, MARGIN_X, y);
  y += 11;

  section('Seu momento');
  paragraph(data.headline, { size: 14, bold: true, gap: 5 });
  paragraph(data.intro);

  section('O que pede mais cuidado agora');
  data.priorities.forEach(item => {
    ensure(12);
    doc.setFillColor(239, 242, 234);
    const lines = doc.splitTextToSize(item, 154);
    const h = Math.max(13, lines.length * 5 + 6);
    doc.roundedRect(MARGIN_X, y - 4, 170, h, 3, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(62, 83, 70);
    doc.text(lines, MARGIN_X + 6, y + 2);
    y += h + 3;
  });

  section('Intenção para o próximo passo');
  paragraph(data.intention, { size: 11 });

  if (data.composition) {
    section('Seu cuidado neste momento');

    if (data.composition.solfeggio) {
      paragraph(
        `Frequência da sessão: ${data.composition.solfeggio.hz} Hz - ${data.composition.solfeggio.chakraProjeto}. ${data.composition.solfeggio.intencaoProjeto}`,
        { size: 10 }
      );
    }

    if (data.composition.floral.length) {
      paragraph(
        `Floral sugerido: ${data.composition.floral.map(x => x.nome).join(', ')}.`,
        { size: 10 }
      );
    }

    if (data.composition.aromatherapy.length) {
      paragraph(
        `Aromaterapia: ${data.composition.aromatherapy.map(x => x.nome).join(', ')}.`,
        { size: 10 }
      );
    }

    if (data.composition.ethericCrystals.length) {
      paragraph(
        `Cristais etéricos indicados: ${data.composition.ethericCrystals.map(x => x.nome).join(', ')}.`,
        { size: 10 }
      );
    }

    if (data.composition.audio) {
      paragraph(
        'Sua sessão de áudio é exclusiva e foi composta a partir desta anamnese. O áudio final não é reutilizado para outra pessoa.',
        { size: 10 }
      );
    }
  }

  section('Uma lembrança importante');
  paragraph(data.closing, { size: 9.5 });

  ensure(25);
  y += 5;
  doc.setDrawColor(211, 196, 154);
  doc.line(MARGIN_X, y, 190, y);
  y += 7;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9.5);
  doc.setTextColor(95, 108, 99);
  doc.text(
    doc.splitTextToSize('Seu processo é único. Você pode caminhar no seu tempo.', 165),
    MARGIN_X,
    y
  );

  drawFooter(doc);

  const safe = (data.nome || 'resultado')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  doc.save(`resultado-anamnese-${safe || 'usuario'}.pdf`);
}

function drawHeader(doc: jsPDF) {
  doc.setFillColor(246, 241, 230);
  doc.rect(0, 0, PAGE_W, 42, 'F');

  doc.setFillColor(31, 72, 52);
  doc.circle(28, 21, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(31, 72, 52);
  doc.text('EVERTON PICENI', 44, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(151, 122, 59);
  doc.text('ANAMNESE INTEGRATIVA', 44, 23);

  doc.setFontSize(7.5);
  doc.setTextColor(104, 113, 106);
  doc.text('TERAPIAS HOLÍSTICAS E BEM-ESTAR', 44, 29);
}

function drawFooter(doc: jsPDF) {
  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(224, 214, 190);
    doc.line(MARGIN_X, 282, 190, 282);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(125, 130, 124);
    doc.text('Resultado pessoal - conteúdo acolhedor e complementar', MARGIN_X, 288);
    doc.text(`${page}/${total}`, 184, 288);
  }
}

function formatDate(value: string): string {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}
