import { forwardRef, useMemo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import MermaidBlock from './MermaidBlock';

interface PreviewProps {
  content: string;
  fontFamily?: string;
  fontSize?: number;
  onWikiLinkClick?: (name: string) => void;
}

// Transform [[wikilinks]] into regular markdown links before rendering
function preprocessWikiLinks(content: string): string {
  return content.replace(/\[\[([^\]]+)\]\]/g, '[$1](#wikilink:$1)');
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(function Preview(
  { content, fontFamily, fontSize, onWikiLinkClick },
  ref
) {
  const processedContent = useMemo(() => preprocessWikiLinks(content), [content]);

  return (
    <div
      ref={ref}
      className="flex-1 h-full overflow-y-auto bg-white/5 backdrop-blur-md border-l border-white/8"
    >
      <div
        className="p-8 prose prose-invert max-w-none"
        style={{
          fontFamily: fontFamily || undefined,
          fontSize: fontSize ? `${fontSize}px` : undefined,
        }}
      >
        <Markdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath, remarkFrontmatter]}
          rehypePlugins={[rehypeHighlight, rehypeKatex]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-mermaid/.exec(className || '');
              if (match) {
                return <MermaidBlock code={String(children).trim()} />;
              }
              return <code className={className} {...props}>{children}</code>;
            },
            a({ href, children, ...props }) {
              if (href?.startsWith('#wikilink:')) {
                const name = href.replace('#wikilink:', '');
                return (
                  <a
                    {...props}
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onWikiLinkClick?.(name);
                    }}
                    className="text-[var(--deep-sea-accent)] underline decoration-dotted cursor-pointer"
                  >
                    {children}
                  </a>
                );
              }
              return <a href={href} {...props}>{children}</a>;
            },
          }}
        >
          {processedContent}
        </Markdown>
      </div>
    </div>
  );
});

export default Preview;
