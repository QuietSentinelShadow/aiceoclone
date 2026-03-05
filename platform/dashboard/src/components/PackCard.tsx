interface Pack {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
}

interface Props {
  pack: Pack;
  actionLabel: string;
  onAction: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  automation: "bg-[#00e5ff]/10 text-[#00e5ff] border-[#00e5ff]/30",
  ai: "bg-[#7c4dff]/10 text-[#7c4dff] border-[#7c4dff]/30",
  scraping: "bg-[#ff6d00]/10 text-[#ff6d00] border-[#ff6d00]/30",
};

export default function PackCard({ pack, actionLabel, onAction }: Props) {
  const categoryStyle =
    CATEGORY_COLORS[pack.category?.toLowerCase()] ||
    "bg-gray-500/10 text-gray-400 border-gray-500/30";

  return (
    <div className="bg-[#1e1e2e] border border-[#2d2d44] rounded-xl p-5 hover:border-[#3d3d54] transition-colors flex flex-col">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{pack.icon || "📦"}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white truncate">
            {pack.name}
          </h3>
          {pack.category && (
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium border ${categoryStyle}`}
            >
              {pack.category}
            </span>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 mb-4 flex-1">
        {pack.description}
      </p>

      <button
        onClick={onAction}
        className="w-full bg-[#7c4dff] text-white font-semibold rounded-lg px-4 py-2 text-sm hover:bg-[#6a3de8] transition-colors"
      >
        {actionLabel}
      </button>
    </div>
  );
}
