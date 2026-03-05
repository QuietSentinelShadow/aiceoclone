import { useEffect, useRef } from "react";

interface Props {
  logs: string[];
}

export default function LogViewer({ logs }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={containerRef}
      className="bg-[#0a0a0f] border border-[#2d2d44] rounded-lg p-4 h-80 overflow-y-auto font-mono text-xs leading-relaxed"
    >
      {logs.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No logs available
        </div>
      ) : (
        logs.map((line, i) => (
          <div key={i} className="text-gray-300 hover:bg-white/5 px-1">
            <span className="text-gray-600 select-none mr-3">
              {String(i + 1).padStart(4)}
            </span>
            {line}
          </div>
        ))
      )}
    </div>
  );
}
