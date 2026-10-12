import { useMemo, useState } from 'react';
import { Check, ChevronDown, Copy, Download, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { buildEnergyProgrammingScript } from '../care/energyProgrammingScript';
import type { DailyEnergyPlan } from '../care/dailyEnergySchedule';

interface EnergyProgrammingPanelProps {
  personName: string;
  schedule: DailyEnergyPlan[];
}

function safeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'interagente';
}

function addPdfParagraph(doc: jsPDF, text: string, y: number, options?: { bold?: boolean; size?: number }) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const size = options?.size || 10.5;
  doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  const lines = doc.splitTextToSize(text, width) as string[];
  const lineHeight = size * 0.48;

  for (const line of lines) {
    if (y > pageHeight - 18) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }
  return y + 2;
}

export function EnergyProgrammingPanel({ personName, schedule }: EnergyProgrammingPanelProps) {
  const [copied, setCopied] = useState(false);
  const script = useMemo(() => buildEnergyProgrammingScript(personName || 'Interagente', schedule), [personName, schedule]);

  const fullText = useMemo(
    () => script.map(day => day.lines.join('\n')).join('\n\n'),
    [script]
  );

  async function copyScript() {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadPdf() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    let y = 22;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Roteiro de Programação Energética', 18, y);
    y += 9;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.text(`Interagente: ${personName || 'Interagente'}`, 18, y);
    y += 6;
    doc.text(`Percurso: ${schedule.length} dias`, 18, y);
    y += 10;

    script.forEach((day, index) => {
      if (index > 0) y += 3;
      for (const line of day.lines) {
        const isHeading = /^(ABERTURA GERAL|DESTINATÁRIO:|DIA \d+|INTEGRAÇÃO DO DIA|INTEGRAÇÃO DOS|COMANDO-MESTRE|SELAMENTO FINAL|REVISÃO OBRIGATÓRIA)/i.test(line);
        y = addPdfParagraph(doc, line, y, { bold: isHeading, size: isHeading ? 11 : 9.7 });
      }
    });

    const totalPages = doc.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      doc.setPage(page);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Roteiro interno do ADM • ${page}/${totalPages}`, 18, doc.internal.pageSize.getHeight() - 8);
    }

    doc.save(`roteiro-programacao-energetica-${safeFileName(personName)}.pdf`);
  }

  if (!schedule.length) {
    return (
      <section className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-amber-300" />
          <div>
            <h2 className="text-lg font-semibold text-stone-100">Roteiro de Programação Energética</h2>
            <p className="mt-1 text-sm text-stone-400">O roteiro aparecerá aqui assim que o percurso diário estiver disponível.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-5 rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-stone-900 p-5 shadow-[0_18px_60px_rgba(0,0,0,.18)] sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-amber-300">
            <FileText className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.16em]">Uso interno do ADM</span>
          </div>
          <h2 className="mt-2 text-xl font-semibold text-stone-100">Roteiro de Programação Energética</h2>
          <p className="mt-2 text-sm leading-6 text-stone-400">Aqui está o roteiro que você realmente executa: abertura única, ativações, direcionamentos, distribuição pela Acupuntura Etérica Quântica, integração e selamento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void copyScript()} className="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-stone-950/60 px-4 py-2.5 text-sm font-semibold text-stone-200 hover:bg-stone-800">
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado' : 'Copiar roteiro'}
          </button>
          <button type="button" onClick={downloadPdf} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400">
            <Download className="h-4 w-4" />Gerar PDF do roteiro
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {script.map(day => (
          <details key={day.day} open={day.day === 1} className="group rounded-xl border border-stone-700/80 bg-stone-950/60 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-amber-200">Dia {day.day} — {day.intention}</div>
                <div className="mt-1 text-xs text-stone-500">Abrir para ver a programação completa deste dia</div>
              </div>
              <ChevronDown className="h-4 w-4 shrink-0 text-stone-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-4 space-y-2 border-t border-stone-800 pt-4">
              {day.lines.map((line, index) => {
                const heading = /^(ABERTURA GERAL|DESTINATÁRIO:|DIA \d+|INTEGRAÇÃO DO DIA|INTEGRAÇÃO DOS|COMANDO-MESTRE|SELAMENTO FINAL|REVISÃO OBRIGATÓRIA)/i.test(line);
                return <p key={`${day.day}-${index}`} className={heading ? 'pt-2 text-sm font-bold text-stone-100' : 'text-sm leading-6 text-stone-300'}>{line}</p>;
              })}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
