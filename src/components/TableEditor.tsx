import { useState, useCallback } from 'react';
import { Plus, Minus } from 'lucide-react';
import type { TableData } from '../lib/markdown-table';
import { serializeGfmTable, createEmptyTable } from '../lib/markdown-table';

interface TableEditorProps {
  isOpen: boolean;
  initialData?: TableData;
  onInsert: (markdown: string) => void;
  onClose: () => void;
}

export default function TableEditor({ isOpen, initialData, onInsert, onClose }: TableEditorProps) {
  const [data, setData] = useState<TableData>(
    () => initialData ?? createEmptyTable(3, 2)
  );

  const updateHeader = useCallback((col: number, value: string) => {
    setData((prev) => ({
      ...prev,
      headers: prev.headers.map((h, i) => (i === col ? value : h)),
    }));
  }, []);

  const updateCell = useCallback((row: number, col: number, value: string) => {
    setData((prev) => ({
      ...prev,
      rows: prev.rows.map((r, ri) =>
        ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r
      ),
    }));
  }, []);

  const addRow = useCallback(() => {
    setData((prev) => ({
      ...prev,
      rows: [...prev.rows, Array(prev.headers.length).fill('')],
    }));
  }, []);

  const removeRow = useCallback(() => {
    setData((prev) => ({
      ...prev,
      rows: prev.rows.length > 1 ? prev.rows.slice(0, -1) : prev.rows,
    }));
  }, []);

  const addColumn = useCallback(() => {
    setData((prev) => ({
      headers: [...prev.headers, `Col ${prev.headers.length + 1}`],
      rows: prev.rows.map((r) => [...r, '']),
    }));
  }, []);

  const removeColumn = useCallback(() => {
    if (data.headers.length <= 1) return;
    setData((prev) => ({
      headers: prev.headers.slice(0, -1),
      rows: prev.rows.map((r) => r.slice(0, -1)),
    }));
  }, [data.headers.length]);

  const handleInsert = useCallback(() => {
    onInsert(serializeGfmTable(data));
    onClose();
  }, [data, onInsert, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="min-w-[400px] max-w-[90vw] max-h-[70vh] bg-black/70 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-medium">Table Editor</h2>
          <div className="flex items-center gap-2">
            <button onClick={addColumn} className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer" title="Add column">
              <Plus size={14} />
            </button>
            <button onClick={removeColumn} className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer" title="Remove column">
              <Minus size={14} />
            </button>
            <span className="text-xs opacity-40 mx-1">|</span>
            <button onClick={addRow} className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer" title="Add row">
              <Plus size={14} />
            </button>
            <button onClick={removeRow} className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer" title="Remove row">
              <Minus size={14} />
            </button>
          </div>
        </div>

        <div className="overflow-auto p-4">
          <table className="border-collapse w-full">
            <thead>
              <tr>
                {data.headers.map((h, ci) => (
                  <th key={ci} className="border border-white/10 p-0">
                    <input
                      type="text"
                      value={h}
                      onChange={(e) => updateHeader(ci, e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 text-xs font-medium outline-none"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-white/10 p-0">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        className="w-full px-3 py-2 bg-transparent text-xs outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-white/10 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            className="px-4 py-1.5 text-xs bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 rounded-md transition-colors cursor-pointer"
          >
            Insert Table
          </button>
        </div>
      </div>
    </div>
  );
}
