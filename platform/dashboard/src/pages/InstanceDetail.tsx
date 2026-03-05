import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import LogViewer from "../components/LogViewer";

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

export default function InstanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const instanceId = parseInt(id || "0", 10);

  const fetchInstance = useCallback(async () => {
    try {
      const all = await api.getInstances();
      const found = all.find((i: Instance) => i.id === instanceId);
      if (found) setInstance(found);
      else setError("Instance not found");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load instance"
      );
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  const fetchLogs = useCallback(async () => {
    try {
      const data = await api.getLogs(instanceId);
      if (data && data.logs) setLogs(data.logs);
    } catch {
      // silently fail for logs
    }
  }, [instanceId]);

  useEffect(() => {
    fetchInstance();
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [fetchInstance, fetchLogs]);

  const handleAction = async (action: "start" | "stop" | "delete") => {
    try {
      if (action === "start") await api.startInstance(instanceId);
      else if (action === "stop") await api.stopInstance(instanceId);
      else if (action === "delete") {
        await api.deleteInstance(instanceId);
        navigate("/");
        return;
      }
      await fetchInstance();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading instance...</div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error || "Instance not found"}</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 text-[#00e5ff] hover:underline"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const status = instance.status || "stopped";

  return (
    <div>
      <button
        onClick={() => navigate("/")}
        className="text-gray-400 hover:text-white transition-colors mb-6 flex items-center gap-1"
      >
        &larr; Back to Dashboard
      </button>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="bg-[#1e1e2e] border border-[#2d2d44] rounded-xl p-8 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{instance.name}</h1>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_TEXT_COLORS[status] || STATUS_TEXT_COLORS.stopped}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] || STATUS_COLORS.stopped}`}
                />
                {status}
              </span>
            </div>
            <div className="space-y-1 text-sm text-gray-400">
              <div>
                Port: <span className="text-white">{instance.port}</span>
              </div>
              {instance.packName && (
                <div>
                  Pack:{" "}
                  <span className="text-[#00e5ff]">{instance.packName}</span>
                </div>
              )}
              <div>
                Created:{" "}
                <span className="text-white">
                  {new Date(instance.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {status === "stopped" && (
              <button
                onClick={() => handleAction("start")}
                className="bg-[#22c55e] text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-[#16a34a] transition-colors"
              >
                Start
              </button>
            )}
            {status === "running" && (
              <button
                onClick={() => handleAction("stop")}
                className="bg-[#ff6d00] text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-[#e56200] transition-colors"
              >
                Stop
              </button>
            )}
            <button
              onClick={() => handleAction("delete")}
              className="bg-[#ef4444] text-white font-semibold rounded-lg px-4 py-2 text-sm hover:bg-[#dc2626] transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#1e1e2e] border border-[#2d2d44] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Logs</h2>
        <LogViewer logs={logs} />
      </div>
    </div>
  );
}
