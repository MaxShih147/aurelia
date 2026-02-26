interface TitleBarProps {
  filename: string | null;
  isDirty: boolean;
}

export default function TitleBar({ filename, isDirty }: TitleBarProps) {
  const displayName = filename ?? 'Untitled';

  return (
    <div className="h-8 flex items-center justify-center shrink-0 select-none">
      <span className="text-xs opacity-60 flex items-center gap-1.5">
        {displayName}
        {isDirty && (
          <span className="w-1.5 h-1.5 rounded-full bg-white/40 inline-block" />
        )}
      </span>
    </div>
  );
}
