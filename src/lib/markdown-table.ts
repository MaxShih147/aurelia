export interface TableData {
  headers: string[];
  rows: string[][];
}

export function parseGfmTable(text: string): TableData | null {
  const lines = text.trim().split('\n').filter((l) => l.trim());
  if (lines.length < 2) return null;

  const parseLine = (line: string): string[] =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim());

  const headers = parseLine(lines[0]);

  // Validate separator line
  const sepCells = parseLine(lines[1]);
  const isSeparator = sepCells.every((c) => /^:?-+:?$/.test(c));
  if (!isSeparator) return null;

  const rows = lines.slice(2).map(parseLine);

  return { headers, rows };
}

export function serializeGfmTable(data: TableData): string {
  const colWidths = data.headers.map((h, i) => {
    const cellWidths = data.rows.map((r) => (r[i] || '').length);
    return Math.max(h.length, ...cellWidths, 3);
  });

  const pad = (s: string, w: number) => s.padEnd(w);
  const headerLine =
    '| ' + data.headers.map((h, i) => pad(h, colWidths[i])).join(' | ') + ' |';
  const sepLine =
    '| ' + colWidths.map((w) => '-'.repeat(w)).join(' | ') + ' |';
  const bodyLines = data.rows.map(
    (row) =>
      '| ' +
      data.headers.map((_, i) => pad(row[i] || '', colWidths[i])).join(' | ') +
      ' |'
  );

  return [headerLine, sepLine, ...bodyLines].join('\n');
}

export function createEmptyTable(cols: number, rows: number): TableData {
  return {
    headers: Array.from({ length: cols }, (_, i) => `Column ${i + 1}`),
    rows: Array.from({ length: rows }, () => Array(cols).fill('')),
  };
}
