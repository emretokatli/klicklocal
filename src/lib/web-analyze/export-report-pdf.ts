import { de } from '@/lib/i18n/de';
import { formatEuro } from '@/lib/web-analyze/parse-report';
import type { ParsedWebAnalyzeReport } from '@/lib/web-analyze/types';

export type ReportPdfMeta = {
  model?: string | null;
  durationMs?: number | null;
  totalCostUsd?: number | null;
};

export type ReportPdfOptions = {
  /**
   * Internal variant: includes run metadata and the "Interne Notizen" block.
   * The default (customer) PDF must never contain either.
   */
  internal?: boolean;
};

type Rgb = [number, number, number];

const INK: Rgb = [26, 26, 26];
const MUTED: Rgb = [95, 107, 105];
const BRAND: Rgb = [13, 159, 120];
const VIOLET: Rgb = [106, 92, 216];
const AMBER: Rgb = [217, 119, 6];
const RED: Rgb = [220, 38, 38];
const LINE: Rgb = [228, 233, 232];
const BOX: Rgb = [247, 248, 250];

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 16;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CONTENT_BOTTOM = PAGE_H - 20;
const LINE_FACTOR = 1.35;

// pt → mm at the configured line-height factor
const lh = (fontSize: number) => fontSize * 0.3528 * LINE_FACTOR;

// jsPDF standard fonts only cover WinAnsi — drop anything outside it
const clean = (text: string) =>
  text
    .replace(/→/g, '->')
    .replace(/★/g, '*')
    .replace(/[^\n\x20-\xFF€‚„–—‘’“”…•]/g, '')
    .trim();

function scoreColor(score: number): Rgb {
  if (score < 40) return RED;
  if (score < 60) return AMBER;
  return BRAND;
}

function ratioColor(ratio: number): Rgb {
  if (ratio >= 0.7) return BRAND;
  if (ratio >= 0.4) return AMBER;
  return RED;
}

export function buildReportPdfFilename(businessName: string, internal = false): string {
  const slug = businessName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9äöüÄÖÜß]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const date = new Date().toISOString().slice(0, 10);

  return `${internal ? 'Intern-' : ''}Lead-Analyse-${slug || 'Website'}-${date}.pdf`;
}

export async function exportReportToPdf(
  report: ParsedWebAnalyzeReport,
  meta: ReportPdfMeta,
  filename: string,
  { internal = false }: ReportPdfOptions = {},
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const L = de.admin.websiteAnalyze;
  const R = L.report;

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setLineHeightFactor(LINE_FACTOR);

  let y = MARGIN;

  const ensure = (height: number) => {
    if (y + height > CONTENT_BOTTOM) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const setText = (size: number, color: Rgb, style: 'normal' | 'bold' | 'italic' = 'normal') => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };

  const paragraph = (text: string, size = 9.5, color: Rgb = INK) => {
    setText(size, color);
    const lines: string[] = doc.splitTextToSize(clean(text), CONTENT_W);
    for (const line of lines) {
      ensure(lh(size));
      doc.text(line, MARGIN, y);
      y += lh(size);
    }
  };

  const sectionTitle = (title: string, accent: Rgb = BRAND) => {
    ensure(18);
    y += 6;
    setText(12.5, INK, 'bold');
    doc.text(clean(title), MARGIN, y);
    y += 2.5;
    doc.setDrawColor(...accent);
    doc.setLineWidth(0.8);
    doc.line(MARGIN, y, MARGIN + 11, y);
    y += 6;
  };

  const bulletList = (items: string[], dot: Rgb) => {
    for (const item of items) {
      setText(9.5, INK);
      const lines: string[] = doc.splitTextToSize(clean(item), CONTENT_W - 6);
      ensure(lh(9.5) * lines.length + 2);
      doc.setFillColor(...dot);
      doc.circle(MARGIN + 1.2, y - 1.1, 0.8, 'F');
      doc.text(lines, MARGIN + 5, y);
      y += lh(9.5) * lines.length + 2;
    }
  };

  const numberedList = (items: string[], accent: Rgb) => {
    items.forEach((item, i) => {
      setText(9.5, INK);
      const lines: string[] = doc.splitTextToSize(clean(item), CONTENT_W - 8);
      ensure(lh(9.5) * lines.length + 2.5);
      setText(9.5, accent, 'bold');
      doc.text(`${i + 1}.`, MARGIN, y);
      setText(9.5, INK);
      doc.text(lines, MARGIN + 7, y);
      y += lh(9.5) * lines.length + 2.5;
    });
  };

  const dateStr = new Date().toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  // Document header
  setText(12, BRAND, 'bold');
  doc.text('Klicklocal', MARGIN, y + 2);
  if (internal) {
    setText(8, RED, 'bold');
    doc.text(R.internalPdfLabel, MARGIN + 28, y + 2);
  }
  setText(9, MUTED);
  doc.text(`${R.leadAnalysis} · ${dateStr}`, PAGE_W - MARGIN, y + 2, { align: 'right' });
  y += 5.5;
  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 11;

  // Title block: business name + URL + band, score ring on the right
  const hasScore = report.score !== null;
  const titleWidth = hasScore ? CONTENT_W - 40 : CONTENT_W;

  setText(17, INK, 'bold');
  const nameLines: string[] = doc.splitTextToSize(clean(report.businessName), titleWidth);
  ensure(36);
  const blockTop = y;
  doc.text(nameLines, MARGIN, y + 4);
  let textY = y + 4 + lh(17) * (nameLines.length - 1);

  if (report.url) {
    textY += 7;
    setText(9.5, BRAND);
    doc.text(clean(report.url), MARGIN, textY);
  }

  if (report.band) {
    textY += 7;
    setText(10.5, hasScore ? scoreColor(report.score as number) : MUTED, 'bold');
    doc.text(clean(report.band), MARGIN, textY);
  }

  if (hasScore) {
    const color = scoreColor(report.score as number);
    const cx = PAGE_W - MARGIN - 15;
    const cy = blockTop + 13;
    doc.setDrawColor(...color);
    doc.setLineWidth(1.6);
    doc.circle(cx, cy, 12.5, 'S');
    setText(19, color, 'bold');
    doc.text(String(report.score), cx, cy + 1.5, { align: 'center' });
    setText(7, MUTED);
    doc.text('/ 100', cx, cy + 6.5, { align: 'center' });
    doc.text(R.overallScore, cx, cy + 18.5, { align: 'center' });
  }

  y = Math.max(textY + 4, blockTop + 33);

  // Growth forecast
  if (report.growthForecast.length > 0) {
    sectionTitle(R.growthForecast);
    const cols = Math.min(2, report.growthForecast.length);
    const boxW = (CONTENT_W - (cols - 1) * 5) / cols;
    const boxH = 30;

    for (let i = 0; i < report.growthForecast.length; i += cols) {
      ensure(boxH + 4);
      report.growthForecast.slice(i, i + cols).forEach((row, j) => {
        const x = MARGIN + j * (boxW + 5);
        doc.setFillColor(...BOX);
        doc.setDrawColor(...LINE);
        doc.setLineWidth(0.3);
        doc.roundedRect(x, y, boxW, boxH, 2.5, 2.5, 'FD');

        setText(8.5, MUTED);
        doc.text(clean(row.horizon), x + 5, y + 7);
        setText(12, BRAND, 'bold');
        doc.text(clean(row.growth), x + 5, y + 13.5);
        setText(6.5, MUTED);
        doc.text(R.revenuePotential.toUpperCase(), x + 5, y + 19.5);

        const revenue =
          row.revenueMin !== undefined && row.revenueMax !== undefined
            ? `${formatEuro(row.revenueMin)} – ${formatEuro(row.revenueMax)}`
            : row.revenue;
        setText(12.5, INK, 'bold');
        doc.text(clean(revenue), x + 5, y + 25.5);
      });
      y += boxH + 4;
    }

    if (report.growthAssumptions) {
      y += 1;
      paragraph(`${R.assumptions}: ${report.growthAssumptions}`, 8, MUTED);
    }
    if (report.growthDisclaimer) {
      setText(8, MUTED, 'italic');
      const lines: string[] = doc.splitTextToSize(clean(report.growthDisclaimer), CONTENT_W);
      ensure(lh(8) * lines.length + 1);
      doc.text(lines, MARGIN, y);
      y += lh(8) * lines.length + 1;
    }
  }

  // Category scores with bars
  if (report.categories.length > 0) {
    sectionTitle(R.categoryScores);
    for (const cat of report.categories) {
      ensure(10);
      const ratio = cat.max > 0 ? cat.points / cat.max : 0;
      setText(9.5, INK);
      doc.text(clean(cat.name), MARGIN, y);
      setText(9.5, INK, 'bold');
      doc.text(`${cat.points}/${cat.max}`, PAGE_W - MARGIN, y, { align: 'right' });

      doc.setFillColor(...LINE);
      doc.roundedRect(MARGIN, y + 1.7, CONTENT_W, 1.8, 0.9, 0.9, 'F');
      if (ratio > 0) {
        doc.setFillColor(...ratioColor(ratio));
        doc.roundedRect(MARGIN, y + 1.7, Math.max(2, CONTENT_W * ratio), 1.8, 0.9, 0.9, 'F');
      }
      y += 9.5;
    }
  }

  // Talking points (sales hooks)
  if (report.talkingPoints.length > 0) {
    sectionTitle(R.talkingPoints, VIOLET);
    numberedList(report.talkingPoints, VIOLET);
  }

  if (report.strengths.length > 0) {
    sectionTitle(R.strengths);
    bulletList(report.strengths, BRAND);
  }

  if (report.weaknesses.length > 0) {
    sectionTitle(R.weaknesses, RED);
    bulletList(report.weaknesses, RED);
  }

  if (report.socialAudit) {
    sectionTitle(R.socialAudit, VIOLET);
    paragraph(report.socialAudit);
  }

  if (report.googleVisibility) {
    sectionTitle(R.googleVisibility);
    paragraph(report.googleVisibility);
  }

  if (report.improvements.length > 0) {
    sectionTitle(R.improvements, AMBER);
    numberedList(report.improvements, BRAND);
  }

  if (report.klicklocalPitch.length > 0) {
    sectionTitle(R.klicklocalPitch);
    bulletList(report.klicklocalPitch, BRAND);
  }

  // CRM contact fields, two-column grid
  if (report.crm.length > 0) {
    sectionTitle(R.crm);
    const colW = (CONTENT_W - 8) / 2;

    for (let i = 0; i < report.crm.length; i += 2) {
      const pair = report.crm.slice(i, i + 2);
      setText(9.5, INK);
      const valueLines = pair.map(
        (field) => doc.splitTextToSize(clean(field.value), colW) as string[],
      );
      const rowH = Math.max(...valueLines.map((l) => l.length)) * lh(9.5) + 8;
      ensure(rowH);

      pair.forEach((field, j) => {
        const x = MARGIN + j * (colW + 8);
        setText(7.5, MUTED, 'bold');
        doc.text(clean(field.label).toUpperCase(), x, y);
        setText(9.5, INK);
        doc.text(valueLines[j], x, y + 4.5);
      });
      y += rowH;
    }
  }

  if (report.marketPotential) {
    sectionTitle(R.marketPotential);
    paragraph(report.marketPotential);
  }

  if (report.seoAssessment) {
    sectionTitle(R.seoAssessment);
    paragraph(report.seoAssessment);
  }

  // Internal-only content: notes + run metadata. The customer PDF must not
  // contain any of this.
  if (internal) {
    if (report.internalNotes) {
      sectionTitle(`${R.internalNotes} (${R.internalNotesHint})`, RED);
      paragraph(report.internalNotes, 9, MUTED);
    }

    const metaParts = [
      meta.model ? `${L.model}: ${meta.model}` : null,
      meta.durationMs != null ? `${L.duration}: ${Math.round(meta.durationMs / 1000)}s` : null,
      meta.totalCostUsd != null ? `${L.cost}: $${meta.totalCostUsd.toFixed(2)}` : null,
    ].filter(Boolean);

    if (metaParts.length > 0) {
      y += 6;
      ensure(6);
      setText(7.5, MUTED);
      doc.text(metaParts.join('  ·  '), MARGIN, y);
    }
  }

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 14, PAGE_W - MARGIN, PAGE_H - 14);
    setText(7.5, MUTED);
    doc.text(`Klicklocal · ${R.leadAnalysis}`, MARGIN, PAGE_H - 9);
    doc.text(`Seite ${page} von ${pageCount}`, PAGE_W - MARGIN, PAGE_H - 9, {
      align: 'right',
    });
  }

  doc.save(filename);
}
