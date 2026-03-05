import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import PackCard from "../components/PackCard";

interface Pack {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export default function NewInstance() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPacks = async () => {
      try {
        const data = await api.getPacks();
        setPacks(data);
        const preselectedId = searchParams.get("packId");
        if (preselectedId) {
          const pack = data.find(
            (p: Pack) => p.id === parseInt(preselectedId, 10)
          );
          if (pack) {
            setSelectedPack(pack);
            setStep(2);
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load packs"
        );
      } finally {
        setLoading(false);
      }
    };
    loadPacks();
  }, [searchParams]);

  const handleCreate = async () => {
    if (!selectedPack) return;
    setSubmitting(true);
    setError("");
    try {
      await api.createInstance({
        name,
        packId: selectedPack.id,
        apiKey,
      });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create instance");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-400">Loading packs...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Create New Instance</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                s <= step
                  ? "bg-[#00e5ff] text-black"
                  : "bg-[#2d2d44] text-gray-400"
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-12 h-0.5 transition-colors ${
                  s < step ? "bg-[#00e5ff]" : "bg-[#2d2d44]"
                }`}
              />
            )}
          </div>
        ))}
        <span className="text-sm text-gray-400 ml-2">
          {step === 1
            ? "Select Pack"
            : step === 2
              ? "API Key"
              : "Name & Confirm"}
        </span>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Pick a pack */}
      {step === 1 && (
        <div>
          <p className="text-gray-400 mb-6">
            Choose a pack for your new instance:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packs.map((pack) => (
              <PackCard
                key={pack.id}
                pack={pack}
                actionLabel="Select"
                onAction={() => {
                  setSelectedPack(pack);
                  setStep(2);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Step 2: API Key */}
      {step === 2 && (
        <div className="bg-[#1e1e2e] border border-[#2d2d44] rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-2">Enter API Key</h2>
          <p className="text-gray-400 text-sm mb-6">
            Provide the API key for the{" "}
            <span className="text-[#00e5ff]">{selectedPack?.name}</span> pack.
            This key will be securely stored and used by your instance.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full bg-[#0a0a0f] border border-[#2d2d44] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff] transition-colors mb-6"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 border border-[#2d2d44] rounded-lg text-gray-300 hover:border-gray-500 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!apiKey}
              className="bg-[#00e5ff] text-black font-semibold rounded-lg px-5 py-2.5 hover:bg-[#00c8e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Name & Confirm */}
      {step === 3 && (
        <div className="bg-[#1e1e2e] border border-[#2d2d44] rounded-xl p-8">
          <h2 className="text-lg font-semibold mb-2">Name Your Instance</h2>
          <p className="text-gray-400 text-sm mb-6">
            Give your instance a name to identify it easily.
          </p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-nullclaw-bot"
            className="w-full bg-[#0a0a0f] border border-[#2d2d44] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#00e5ff] transition-colors mb-6"
          />

          <div className="bg-[#0a0a0f] border border-[#2d2d44] rounded-lg p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Summary</h3>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-400">Pack: </span>
                <span className="text-[#00e5ff]">{selectedPack?.name}</span>
              </div>
              <div>
                <span className="text-gray-400">API Key: </span>
                <span className="text-gray-300">{"*".repeat(12)}</span>
              </div>
              <div>
                <span className="text-gray-400">Name: </span>
                <span className="text-white">{name || "—"}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 border border-[#2d2d44] rounded-lg text-gray-300 hover:border-gray-500 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={!name || submitting}
              className="bg-[#00e5ff] text-black font-semibold rounded-lg px-5 py-2.5 hover:bg-[#00c8e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating..." : "Create Instance"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
