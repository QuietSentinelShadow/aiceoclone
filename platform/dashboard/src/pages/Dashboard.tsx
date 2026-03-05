import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import InstanceCard from "../components/InstanceCard";

interface Instance {
  id: number;
  name: string;
  status: string;
  port: number;
  packId: number;
  packName?: string;
  createdAt: string;
}

export default function Dashboard() {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInstances = async () => {
    try {
      const data = await api.getInstances();
      setInstances(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load instances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const handleAction = async (
    id: number,
    action: "start" | "stop" | "delete"
  ) => {
    try {
      if (action === "start") await api.startInstance(id);
      else if (action === "stop") await api.stopInstance(id);
      else if (action === "delete") await api.deleteInstance(id);
      await fetchInstances();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading instances...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Your Instances</h1>
        <Link
          to="/new"
          className="bg-[#00e5ff] text-black font-semibold rounded-lg px-5 py-2.5 hover:bg-[#00c8e0] transition-colors"
        >
          + New Instance
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {instances.length === 0 ? (
        <div className="bg-[#1e1e2e] border border-[#2d2d44] rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">{"{ }"}</div>
          <h2 className="text-xl font-semibold mb-2">No instances yet</h2>
          <p className="text-gray-400 mb-6">
            Create your first NullClaw instance to get started.
          </p>
          <Link
            to="/new"
            className="inline-block bg-[#00e5ff] text-black font-semibold rounded-lg px-6 py-3 hover:bg-[#00c8e0] transition-colors"
          >
            Create Instance
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              onAction={handleAction}
            />
          ))}
        </div>
      )}
    </div>
  );
}
