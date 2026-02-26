import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeDocument from 'rehype-document';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from './tauri';

const DEEP_SEA_CSS = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
    background: rgb(8, 12, 24);
    color: rgb(203, 213, 225);
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    color: rgb(241, 245, 249);
  }
  h1, h2 {
    text-shadow: 0 0 20px rgba(56, 189, 248, 0.15);
  }
  a { color: rgba(56, 189, 248, 0.8); }
  code {
    color: rgba(56, 189, 248, 0.9);
    font-family: "SF Mono", Menlo, Monaco, monospace;
    background: rgba(0, 0, 0, 0.3);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
  }
  pre code { background: none; padding: 0; }
  blockquote {
    border-left: 3px solid rgba(56, 189, 248, 0.8);
    color: rgba(148, 163, 184, 0.7);
    margin-left: 0;
    padding-left: 16px;
    font-style: italic;
  }
  hr { border: none; border-top: 1px solid rgba(255, 255, 255, 0.08); }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 8px 12px;
    text-align: left;
  }
  th { background: rgba(255, 255, 255, 0.03); color: rgb(241, 245, 249); }
  img { max-width: 100%; border-radius: 8px; }
  input[type="checkbox"] {
    appearance: none;
    width: 14px;
    height: 14px;
    border: 1.5px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    background: transparent;
    vertical-align: middle;
    margin-right: 8px;
    position: relative;
  }
  input[type="checkbox"]:checked {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.8);
  }
  @media print {
    body { background: white; color: #333; }
    h1, h2, h3, h4, h5, h6 { color: #111; text-shadow: none; }
    a { color: #0066cc; }
    code { color: #d63384; background: #f5f5f5; }
    pre { background: #f5f5f5; }
    blockquote { color: #666; border-left-color: #ccc; }
    th { background: #f5f5f5; color: #111; }
    th, td { border-color: #ddd; }
  }
`;

async function markdownToHTML(content: string, title: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeDocument, {
      title,
      css: [],
      style: DEEP_SEA_CSS,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  return String(result);
}

export async function exportToHTML(content: string, filename: string): Promise<void> {
  const title = filename.replace(/\.md$/i, '');
  const html = await markdownToHTML(content, title);

  const path = await save({
    title: 'Export HTML',
    defaultPath: `${title}.html`,
    filters: [{ name: 'HTML', extensions: ['html'] }],
  });

  if (path) {
    await writeFile(path, html);
  }
}

export async function exportToPDF(content: string, filename: string): Promise<void> {
  const title = filename.replace(/\.md$/i, '');
  const html = await markdownToHTML(content, title);

  // Create a hidden iframe, inject the HTML, and trigger print (macOS print dialog has "Save as PDF")
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '800px';
  iframe.style.height = '600px';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  // Wait for content to render
  await new Promise((resolve) => setTimeout(resolve, 500));

  iframe.contentWindow?.print();

  // Clean up after a delay to allow print dialog to use the content
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 2000);
}
