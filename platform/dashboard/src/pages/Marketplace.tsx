import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PackCard from "../components/PackCard";
import { useNavigate } from "react-router-dom";

interface Pack {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export default function Marketplace() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getPacks();
        setPacks(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load packs"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading marketplace...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-gray-400 mt-1">
          Browse available packs to power your NullClaw instances.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packs.map((pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            actionLabel="Use this pack"
            onAction={() => navigate(`/new?packId=${pack.id}`)}
          />
        ))}
      </div>

      {packs.length === 0 && !error && (
        <div className="bg-[#1e1e2e] border border-[#2d2d44] rounded-xl p-12 text-center">
          <p className="text-gray-400">No packs available yet.</p>
        </div>
      )}
    </div>
  );
}
