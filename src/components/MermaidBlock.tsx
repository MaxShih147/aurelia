import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: 'rgba(56, 189, 248, 0.2)',
    primaryTextColor: 'rgb(203, 213, 225)',
    primaryBorderColor: 'rgba(56, 189, 248, 0.5)',
    lineColor: 'rgba(148, 163, 184, 0.4)',
    secondaryColor: 'rgba(255, 255, 255, 0.05)',
    tertiaryColor: 'rgba(255, 255, 255, 0.03)',
    background: 'transparent',
    mainBkg: 'rgba(56, 189, 248, 0.1)',
    nodeBorder: 'rgba(56, 189, 248, 0.5)',
    clusterBkg: 'rgba(255, 255, 255, 0.03)',
    titleColor: 'rgb(241, 245, 249)',
    edgeLabelBackground: 'rgba(8, 12, 24, 0.8)',
  },
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
});

let mermaidCounter = 0;

interface MermaidBlockProps {
  code: string;
}

export default function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${++mermaidCounter}`);

  useEffect(() => {
    const render = async () => {
      if (!containerRef.current) return;
      try {
        const { svg } = await mermaid.render(idRef.current, code);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
        // Clean up mermaid's error element if present
        const errorEl = document.getElementById('d' + idRef.current);
        errorEl?.remove();
      }
    };
    render();
  }, [code]);

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono whitespace-pre-wrap">
        Mermaid Error: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="my-4 flex justify-center [&_svg]:max-w-full"
    />
  );
}
