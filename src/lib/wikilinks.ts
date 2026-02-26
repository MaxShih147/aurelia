import { readFile, scanMarkdownFiles } from './tauri';

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;

export interface WikiLink {
  name: string;
  resolvedPath: string | null;
}

export interface Backlink {
  sourcePath: string;
  sourceName: string;
  context: string; // the line containing the wikilink
}

export function extractWikiLinks(content: string): string[] {
  const links: string[] = [];
  let match;
  while ((match = WIKILINK_RE.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
}

export async function findBacklinks(
  targetName: string,
  directory: string
): Promise<Backlink[]> {
  const backlinks: Backlink[] = [];

  try {
    const files = await scanMarkdownFiles(directory);

    for (const filePath of files) {
      const fileName = filePath.split('/').pop()?.replace(/\.md$/i, '') ?? '';
      if (fileName.toLowerCase() === targetName.toLowerCase()) continue;

      try {
        const content = await readFile(filePath);
        const lines = content.split('\n');

        for (const line of lines) {
          if (line.includes(`[[${targetName}]]`)) {
            backlinks.push({
              sourcePath: filePath,
              sourceName: fileName,
              context: line.trim(),
            });
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }
  } catch {
    // Directory scan failed
  }

  return backlinks;
}

export interface GraphNode {
  id: string;
  name: string;
  path: string | null;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export async function buildGraphData(directory: string): Promise<GraphData> {
  const nodesMap = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  try {
    const files = await scanMarkdownFiles(directory);

    for (const filePath of files) {
      const name = filePath.split('/').pop()?.replace(/\.md$/i, '') ?? filePath;
      const id = name.toLowerCase();

      if (!nodesMap.has(id)) {
        nodesMap.set(id, { id, name, path: filePath });
      }

      try {
        const content = await readFile(filePath);
        const links = extractWikiLinks(content);

        for (const linkName of links) {
          const targetId = linkName.toLowerCase();
          if (!nodesMap.has(targetId)) {
            nodesMap.set(targetId, { id: targetId, name: linkName, path: null });
          }
          edges.push({ source: id, target: targetId });
        }
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Directory scan failed
  }

  return {
    nodes: Array.from(nodesMap.values()),
    edges,
  };
}
