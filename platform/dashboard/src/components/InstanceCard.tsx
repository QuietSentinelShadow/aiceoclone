import { Link } from "react-router-dom";

interface Instance {
  id: number;
  name: string;
  status: string;
  port: number;
  packId: number;
  packName?: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  running: "bg-[#22c55e]",
  stopped: "bg-[#6b7280]",
  error: "bg-[#ef4444]",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  running: "text-[#22c55e]",
  stopped: "text-[#6b7280]",
  error: "text-[#ef4444]",
};

interface Props {
  instance: Instance;
  onAction: (id: number, action: "start" | "stop" | "delete") => void;
}

export default function InstanceCard({ instance, onAction }: Props) {
  const status = instance.status || "stopped";

  return (
    <div className="bg-[#1e1e2e] border border-[#2d2d44] rounded-xl p-5 hover:border-[#3d3d54] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <Link
          to={`/instance/${instance.id}`}
          className="text-lg font-semibold text-white hover:text-[#00e5ff] transition-colors"
        >
          {instance.name}
        </Link>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_TEXT_COLORS[status] || STATUS_TEXT_COLORS.stopped}`}
        >
          <span
            className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] || STATUS_COLORS.stopped}`}
          />
          {status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-400 mb-4">
        <div>
          Port: <span className="text-gray-200">{instance.port}</span>
        </div>
        {instance.packName && (
          <div>
            Pack:{" "}
            <span className="text-[#00e5ff]">{instance.packName}</span>
          </div>
        )}
        <div>
          Created:{" "}
          <span className="text-gray-200">
            {new Date(instance.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {status === "stopped" && (
          <button
            onClick={() => onAction(instance.id, "start")}
            className="flex-1 bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[#22c55e]/20 transition-colors"
          >
            Start
          </button>
        )}
        {status === "running" && (
          <button
            onClick={() => onAction(instance.id, "stop")}
            className="flex-1 bg-[#ff6d00]/10 text-[#ff6d00] border border-[#ff6d00]/30 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[#ff6d00]/20 transition-colors"
          >
            Stop
          </button>
        )}
        <button
          onClick={() => onAction(instance.id, "delete")}
          className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-[#ef4444]/20 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
