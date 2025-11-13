import { useMemo } from "react";

const messageTypes = {
  direction: {
    left: { icon: "←", color: "from-blue-500/20 to-cyan-500/20 border-blue-400/30 text-blue-300", label: "Steer Right" },
    right: { icon: "→", color: "from-purple-500/20 to-pink-500/20 border-purple-400/30 text-purple-300", label: "Steer Left" },
    center: { icon: "↑", color: "from-amber-500/20 to-orange-500/20 border-amber-400/30 text-amber-300", label: "Obstacle Ahead" },
  },
  speed: {
    slow: { icon: "⚠️", color: "from-red-500/20 to-rose-500/20 border-red-400/30 text-red-300", label: "Reduce Speed" },
  },
  alert: {
    default: { icon: "🔔", color: "from-yellow-500/20 to-amber-500/20 border-yellow-400/30 text-yellow-300", label: "Alert" },
  },
};

export function MessagesPanel({ messages = [], directionCue, speedCue, heroAlert }) {
  const activeMessages = useMemo(() => {
    const msgs = [];
    
    if (heroAlert) {
      msgs.push({
        id: 'alert-' + Date.now(),
        type: 'alert',
        message: heroAlert,
        timestamp: new Date(),
        priority: 'high',
      });
    }
    
    if (directionCue) {
      const dirInfo = messageTypes.direction[directionCue] || messageTypes.direction.center;
      msgs.push({
        id: 'direction-' + Date.now(),
        type: 'direction',
        direction: directionCue,
        message: dirInfo.label,
        icon: dirInfo.icon,
        color: dirInfo.color,
        timestamp: new Date(),
        priority: 'high',
      });
    }
    
    if (speedCue) {
      const speedInfo = messageTypes.speed[speedCue] || messageTypes.speed.slow;
      msgs.push({
        id: 'speed-' + Date.now(),
        type: 'speed',
        message: speedInfo.label,
        icon: speedInfo.icon,
        color: speedInfo.color,
        timestamp: new Date(),
        priority: 'high',
      });
    }
    
    // Add historical messages
    messages.forEach((msg) => {
      msgs.push({
        ...msg,
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
      });
    });
    
    return msgs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }, [messages, directionCue, speedCue, heroAlert]);

  if (activeMessages.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-slate-800/60 p-2">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Guidance Messages</h3>
            <p className="text-xs text-slate-400">Real-time alerts & recommendations</p>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-800/60 flex items-center justify-center mb-3">
            <svg className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-sm text-slate-400">No messages yet</p>
          <p className="text-xs text-slate-500 mt-1">Guidance will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/40 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 p-2 border border-indigo-400/30">
            <svg className="h-5 w-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Guidance Messages</h3>
            <p className="text-xs text-slate-400">{activeMessages.length} active message{activeMessages.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {activeMessages.length > 0 && (
          <div className="rounded-full bg-indigo-500/20 px-3 py-1 border border-indigo-400/30">
            <span className="text-xs font-semibold text-indigo-300">{activeMessages.length}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        {activeMessages.map((msg, idx) => {
          const isHighPriority = msg.priority === 'high' || idx === 0;
          const colorClass = msg.color || messageTypes.alert.default.color;
          const icon = msg.icon || messageTypes.alert.default.icon;
          
          return (
            <div
              key={msg.id || idx}
              className={`rounded-xl border bg-gradient-to-br ${colorClass} p-4 backdrop-blur-sm transition-all ${
                isHighPriority ? 'ring-2 ring-opacity-50 animate-pulse' : 'hover:scale-[1.02]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="text-2xl">{icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className={`text-sm font-semibold ${msg.color?.split(' ')[2] || 'text-white'}`}>
                      {msg.message || msg.alert || 'New guidance'}
                    </p>
                    {isHighPriority && (
                      <span className="flex-shrink-0 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-300 border border-red-400/30">
                        Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400">
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                    {msg.direction && (
                      <span className="text-xs text-slate-500">
                        • Direction: {msg.direction}
                      </span>
                    )}
                    {msg.type && (
                      <span className="text-xs text-slate-500 capitalize">
                        • {msg.type}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MessagesPanel;

