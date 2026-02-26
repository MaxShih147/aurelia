import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import rehypeHighlight from 'rehype-highlight';

interface PreviewProps {
  content: string;
}

export default function Preview({ content }: PreviewProps) {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-white/5 backdrop-blur-md border-l border-white/8">
      <div className="p-8 prose prose-invert max-w-none">
        <Markdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
}
