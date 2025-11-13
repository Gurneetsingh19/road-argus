import { useMemo } from "react";

const detectionIcons = {
  pothole: "🕳️",
  lmv: "🚗",
  hmv: "🚛",
  "speed bump": "🔺",
  pedestrian: "🚶",
  "traffic signal": "🚦",
  "road sign": "🛑",
};

const detectionColors = {
  pothole: "from-amber-500/20 to-orange-500/20 border-amber-400/30",
  lmv: "from-blue-500/20 to-cyan-500/20 border-blue-400/30",
  hmv: "from-purple-500/20 to-pink-500/20 border-purple-400/30",
  "speed bump": "from-yellow-500/20 to-amber-500/20 border-yellow-400/30",
  pedestrian: "from-red-500/20 to-rose-500/20 border-red-400/30",
  "traffic signal": "from-green-500/20 to-emerald-500/20 border-green-400/30",
  "road sign": "from-indigo-500/20 to-violet-500/20 border-indigo-400/30",
};

export function DetectionsPanel({ detections = [] }) {
  const groupedDetections = useMemo(() => {
    const groups = {};
    detections.forEach((det) => {
      const label = (det.label || "unknown").toLowerCase();
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(det);
    });
    return groups;
  }, [detections]);

  const totalCount = detections.length;

  if (totalCount === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-slate-800/60 p-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Detections</h3>
            <p className="text-xs text-slate-400">Real-time object detection</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">No detections yet</p>
          <p className="text-xs text-slate-500 mt-1">Objects will appear here when detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-sky-500/20 to-indigo-500/20 p-2 border border-sky-400/30">
            <svg className="h-5 w-5 text-sky-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Active Detections</h3>
            <p className="text-xs text-slate-400">{totalCount} object{totalCount !== 1 ? 's' : ''} detected</p>
          </div>
        </div>
        <div className="rounded-full bg-emerald-500/20 px-3 py-1 border border-emerald-400/30">
          <span className="text-xs font-semibold text-emerald-300">{totalCount}</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {Object.entries(groupedDetections).map(([label, items]) => {
          const colorClass = detectionColors[label] || "from-slate-500/20 to-slate-600/20 border-slate-400/30";
          const icon = detectionIcons[label] || "📦";
          
          return (
            <div
              key={label}
              className={`rounded-xl border bg-gradient-to-br ${colorClass} p-4 backdrop-blur-sm transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white capitalize">{label}</h4>
                    <p className="text-xs text-slate-300">{items.length} detected</p>
                  </div>
                </div>
                <div className="rounded-full bg-white/10 px-2 py-1">
                  <span className="text-xs font-medium text-white">{items.length}</span>
                </div>
              </div>
              
              {items.length > 0 && (
                <div className="mt-3 space-y-2">
                  {items.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">
                        Detection #{idx + 1}
                        {item.score && (
                          <span className="ml-2 text-slate-400">
                            {(item.score * 100).toFixed(0)}% confidence
                          </span>
                        )}
                      </span>
                      {item.score && (
                        <div className="flex items-center gap-1">
                          <div className="h-1.5 w-16 rounded-full bg-slate-700/50 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all"
                              style={{ width: `${item.score * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {items.length > 3 && (
                    <p className="text-xs text-slate-400 italic">+{items.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DetectionsPanel;

