import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { buildGraphData, type GraphData } from '../lib/wikilinks';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum, type SimulationLinkDatum } from 'd3-force';

interface GraphViewProps {
  isOpen: boolean;
  filePath: string | null;
  onClose: () => void;
  onOpenFile: (path: string) => void;
}

interface SimNode extends SimulationNodeDatum {
  id: string;
  name: string;
  path: string | null;
}

interface SimLink extends SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
}

export default function GraphView({ isOpen, filePath, onClose, onOpenFile }: GraphViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [data, setData] = useState<GraphData | null>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const linksRef = useRef<SimLink[]>([]);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!isOpen || !filePath) return;
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    buildGraphData(dir).then(setData).catch(() => setData(null));
  }, [isOpen, filePath]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dpr = window.devicePixelRatio || 1;

      for (const node of nodesRef.current) {
        const nx = (node.x ?? 0) * dpr;
        const ny = (node.y ?? 0) * dpr;
        const dist = Math.sqrt((x * dpr - nx) ** 2 + (y * dpr - ny) ** 2);
        if (dist < 12 * dpr && node.path) {
          onOpenFile(node.path);
          onClose();
          return;
        }
      }
    },
    [onOpenFile, onClose]
  );

  useEffect(() => {
    if (!isOpen || !data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const nodes: SimNode[] = data.nodes.map((n) => ({ ...n }));
    const links: SimLink[] = data.edges.map((e) => ({ source: e.source, target: e.target }));
    nodesRef.current = nodes;
    linksRef.current = links;

    const simulation = forceSimulation(nodes)
      .force('link', forceLink<SimNode, SimLink>(links).id((d) => d.id).distance(80))
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide(20));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw edges
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      for (const link of links) {
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        ctx.beginPath();
        ctx.moveTo(source.x ?? 0, source.y ?? 0);
        ctx.lineTo(target.x ?? 0, target.y ?? 0);
        ctx.stroke();
      }

      // Draw nodes
      for (const node of nodes) {
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const hasFile = node.path !== null;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = hasFile
          ? 'rgba(56, 189, 248, 0.15)'
          : 'rgba(148, 163, 184, 0.1)';
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = hasFile
          ? 'rgba(56, 189, 248, 0.8)'
          : 'rgba(148, 163, 184, 0.4)';
        ctx.fill();

        // Label
        ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, x, y + 16);
      }
    };

    simulation.on('tick', () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    });

    return () => {
      simulation.stop();
      cancelAnimationFrame(rafRef.current);
    };
  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(8, 12, 24, 0.9)' }}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer z-10"
      >
        <X size={16} />
      </button>

      <div className="text-xs opacity-40 absolute top-5 left-5">
        Graph View {data ? `— ${data.nodes.length} notes, ${data.edges.length} links` : ''}
      </div>

      {!data ? (
        <div className="text-xs opacity-40">Loading graph...</div>
      ) : data.nodes.length === 0 ? (
        <div className="text-xs opacity-40">No markdown files found</div>
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair"
          onClick={handleClick}
        />
      )}
    </div>
  );
}
