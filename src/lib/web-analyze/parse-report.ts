import type {
  CategoryScore,
  CrmField,
  GrowthForecastRow,
  ParsedWebAnalyzeReport,
} from '@/lib/web-analyze/types';

const SECTION_KEYS = {
  score: /^Gesamtbewertung/i,
  strengths: /^Stärken/i,
  weaknesses: /^Schwächen/i,
  improvements: /^Verbesserungspotenziale/i,
  seo: /^SEO-Bewertung/i,
  crm: /^Kontaktdaten/i,
  market: /^Lokales Marktpotenzial/i,
  growth: /^Wachstumsprognose/i,
  talking: /^Gesprächsaufhänger/i,
  socialAudit: /^Social-Media-Audit/i,
  googleVisibility: /^Google-Sichtbarkeit/i,
  klicklocalPitch: /^So hilft Klicklocal/i,
} as const;

// v2 reports append internal notes after the customer-facing body, either as
// "--- Interne Notizen (nicht für den Kunden) ---" or as a markdown heading.
const INTERNAL_NOTES_MARKER =
  /(?:^|\n)(?:-{3,}\s*Interne Notizen[^\n]*|#{1,6}\s+Interne Notizen[^\n]*)\n?/i;

function splitInternalNotes(markdown: string): {
  body: string;
  internalNotes: string | null;
} {
  const match = INTERNAL_NOTES_MARKER.exec(markdown);
  if (!match) return { body: markdown, internalNotes: null };

  const notes = markdown
    .slice(match.index + match[0].length)
    .replace(/^-{3,}\s*$/gm, '')
    .trim();

  return {
    body: markdown.slice(0, match.index).trim(),
    internalNotes: notes || null,
  };
}

export function parseWebAnalyzeReport(markdown: string): ParsedWebAnalyzeReport {
  const { body: reportBody, internalNotes } = splitInternalNotes(markdown);
  const sections = splitSections(reportBody);
  const header = sections.find((s) => s.title.startsWith('Lead-Analyse')) ?? sections[0];
  const { businessName, url } = parseHeader(header?.title ?? reportBody);

  let score: number | null = null;
  let band: string | null = null;
  let categories: CategoryScore[] = [];

  const scoreSection = sections.find((s) => SECTION_KEYS.score.test(s.title));
  if (scoreSection) {
    const parsed = parseScoreSection(scoreSection.title, scoreSection.body);
    score = parsed.score;
    band = parsed.band;
    categories = parsed.categories;
  }

  const growthSection = sections.find((s) => SECTION_KEYS.growth.test(s.title));
  const growthParsed = growthSection ? parseGrowthSection(growthSection.body) : null;

  return {
    businessName,
    url,
    score,
    band,
    categories,
    strengths: parseBulletList(findBody(sections, SECTION_KEYS.strengths)),
    weaknesses: parseBulletList(findBody(sections, SECTION_KEYS.weaknesses)),
    improvements: parseNumberedList(findBody(sections, SECTION_KEYS.improvements)),
    seoAssessment: findBody(sections, SECTION_KEYS.seo).trim(),
    crm: parseCrmFields(findBody(sections, SECTION_KEYS.crm)),
    marketPotential: findBody(sections, SECTION_KEYS.market).trim(),
    growthForecast: growthParsed?.rows ?? [],
    growthAssumptions: growthParsed?.assumptions ?? '',
    growthDisclaimer: growthParsed?.disclaimer ?? null,
    talkingPoints: parseNumberedList(findBody(sections, SECTION_KEYS.talking)),
    preamble: extractPreamble(reportBody),
    socialAudit: cleanMultiline(findBody(sections, SECTION_KEYS.socialAudit)),
    googleVisibility: cleanMultiline(findBody(sections, SECTION_KEYS.googleVisibility)),
    klicklocalPitch: parsePitchList(findBody(sections, SECTION_KEYS.klicklocalPitch)),
    internalNotes,
  };
}

// Free-form section bodies: keep line structure, turn markdown bullets into
// "•" lines and strip inline emphasis
function cleanMultiline(body: string): string {
  return body
    .split('\n')
    .map((line) => stripMarkdown(line.replace(/^-\s+/, '• ')))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parsePitchList(body: string): string[] {
  const bullets = parseBulletList(body);
  if (bullets.length > 0) return bullets;

  const text = cleanMultiline(body);
  return text ? [text] : [];
}

type Section = { title: string; body: string };

function splitSections(markdown: string): Section[] {
  const lines = markdown.split('\n');
  const sections: Section[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (currentTitle || currentLines.length) {
        sections.push({ title: currentTitle, body: currentLines.join('\n').trim() });
      }
      currentTitle = line.replace(/^##\s+/, '').trim();
      currentLines = [];
      continue;
    }

    if (line.startsWith('# ') && !currentTitle) {
      currentTitle = line.replace(/^#\s+/, '').trim();
      continue;
    }

    currentLines.push(line);
  }

  if (currentTitle || currentLines.length) {
    sections.push({ title: currentTitle, body: currentLines.join('\n').trim() });
  }

  return sections;
}

function parseHeader(titleOrMarkdown: string): { businessName: string; url: string } {
  const match = titleOrMarkdown.match(
    /Lead-Analyse:\s*(.+?)\s*[—–-]\s*(https?:\/\/\S+)/i,
  );

  if (match) {
    return { businessName: match[1].trim(), url: match[2].trim() };
  }

  const urlMatch = titleOrMarkdown.match(/https?:\/\/\S+/);
  return {
    businessName: 'Unbekanntes Unternehmen',
    url: urlMatch?.[0] ?? '',
  };
}

function parseScoreSection(title: string, body: string): {
  score: number | null;
  band: string | null;
  categories: CategoryScore[];
} {
  const titleMatch = title.match(/Gesamtbewertung:\s*(\d+)\/100\s*[—–-]\s*(.+)/i);
  const firstLine = body.split('\n')[0] ?? '';
  const bodyMatch = firstLine.match(/(\d+)\/100\s*[—–-]\s*(.+)/i);

  const categories: CategoryScore[] = [];
  for (const line of body.split('\n')) {
    const row = line.match(/^\|\s*(.+?)\s*\|\s*(\d+)\/(\d+)\s*\|/);
    if (!row || row[1] === 'Kategorie' || row[1].includes('---')) continue;
    categories.push({
      name: row[1].trim(),
      points: Number.parseInt(row[2], 10),
      max: Number.parseInt(row[3], 10),
    });
  }

  const scoreMatch = titleMatch ?? bodyMatch;

  return {
    score: scoreMatch ? Number.parseInt(scoreMatch[1], 10) : null,
    band: scoreMatch?.[2]?.trim() ?? null,
    categories,
  };
}

function parseGrowthSection(body: string): {
  rows: GrowthForecastRow[];
  assumptions: string;
  disclaimer: string | null;
} {
  const rows: GrowthForecastRow[] = [];

  for (const line of body.split('\n')) {
    const row = line.match(/^\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|/);
    if (!row || row[1] === 'Horizont' || row[1].includes('---')) continue;

    const revenue = row[3].trim();
    const euroMatch = revenue.match(
      /~?\s*([\d.,]+)\s*[–-]\s*([\d.,]+)\s*€/,
    );

    rows.push({
      horizon: row[1].trim(),
      growth: row[2].trim(),
      revenue,
      revenueMin: euroMatch ? parseEuro(euroMatch[1]) : undefined,
      revenueMax: euroMatch ? parseEuro(euroMatch[2]) : undefined,
    });
  }

  // v1 wrote "**Annahmen:**", v2 writes plain "Annahmen:" — accept both
  const assumptionMatch = body.match(/\*{0,2}Annahmen:\*{0,2}\s*([\s\S]*?)(?:\n\*|\n\n|$)/i);
  const disclaimerMatch = body.match(/\*([^*]+)\*$/);

  return {
    rows,
    assumptions: assumptionMatch?.[1]?.trim() ?? '',
    disclaimer: disclaimerMatch?.[1]?.trim() ?? null,
  };
}

function parseEuro(value: string): number {
  return Number.parseInt(value.replace(/\./g, ''), 10);
}

function parseCrmFields(body: string): CrmField[] {
  const fields: CrmField[] = [];

  for (const line of body.split('\n')) {
    const match = line.match(/^-\s*\*\*(.+?):\*\*\s*(.+)$/);
    if (match) {
      fields.push({ label: match[1].trim(), value: stripMarkdown(match[2].trim()) });
    }
  }

  return fields;
}

function parseBulletList(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.match(/^-\s+(.+)$/)?.[1])
    .filter((item): item is string => Boolean(item))
    .map(stripMarkdown);
}

function parseNumberedList(body: string): string[] {
  return body
    .split('\n')
    .map((line) => line.match(/^\d+\.\s+(.+)$/)?.[1])
    .filter((item): item is string => Boolean(item))
    .map(stripMarkdown);
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[Quick Win\]\s*/gi, '')
    .trim();
}

function findBody(
  sections: Section[],
  pattern: RegExp,
): string {
  return sections.find((s) => pattern.test(s.title))?.body ?? '';
}

function extractPreamble(markdown: string): string | null {
  const idx = markdown.indexOf('\n# ');
  if (idx <= 0) return null;
  const text = markdown.slice(0, idx).trim();
  return text.length > 0 ? text : null;
}

export function mergeReportWithApi(
  parsed: ParsedWebAnalyzeReport,
  apiScore: number | null,
  apiBand: string | null,
  apiUrl: string,
): ParsedWebAnalyzeReport {
  return {
    ...parsed,
    url: parsed.url || apiUrl,
    score: parsed.score ?? apiScore,
    band: parsed.band ?? apiBand,
  };
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount);
}
