export interface Heading {
  level: number;
  text: string;
  line: number; // 1-based line number
}

const HEADING_RE = /^(#{1,6})\s+(.+)$/;

export function extractHeadings(content: string): Heading[] {
  const lines = content.split('\n');
  const headings: Heading[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(HEADING_RE);
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2].replace(/\s*#+\s*$/, ''), // strip trailing # markers
        line: i + 1,
      });
    }
  }

  return headings;
}
