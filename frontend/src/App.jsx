import { useCallback, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { Toast } from "./components/Toast";
import LiveHero from "./components/LiveHero";
import Workflow from "./components/Workflow";

const highlightCards = [
  {
    title: "Lane-aware cues",
    description: "See directional guidance instantly when the model spots a pothole on either side of your lane.",
  },
  {
    title: "Live annotation overlay",
    description: "Bounding boxes and alerts appear directly on the stream so drivers never miss critical hazards.",
  },
  {
    title: "Adaptive speed control",
    description: "Automatic slow-down warnings fire whenever stacked potholes demand extra caution.",
  },
];

const resources = [
  {
    title: "Workflow Playbook",
    description: "Understand how Vahan Sarthi triages crash telemetry end-to-end.",
    href: "#workflow",
  },
  {
    title: "Open Source Repo",
    description: "Track releases, raise issues, or fork the project roadmap.",
    href: "https://github.com/GoldGroove06/ct-hackathon-2025/",
    icon: "github",
    external: true,
  },
];

function App() {
  const [toasts, setToasts] = useState([]);
  const [liveState, setLiveState] = useState({
    cameraState: "idle",
    socketState: "idle",
    directionCue: null,
    speedCue: null,
    heroAlert: null,
  });
  const [guidanceLog, setGuidanceLog] = useState([]);

  const showToast = useCallback(({ message, tone = "info", duration = 3200 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleLiveStateUpdate = useCallback((state) => {
    if (!state) return;
    setLiveState((prev) => {
      const next = { ...prev, ...state };
      const directionChanged = state.directionCue && state.directionCue !== prev.directionCue;
      const speedChanged = state.speedCue && state.speedCue !== prev.speedCue;
      const alertChanged = state.heroAlert && state.heroAlert !== prev.heroAlert;

      if (directionChanged || speedChanged || alertChanged) {
        setGuidanceLog((log) => [
          {
            id: Date.now(),
            direction: state.directionCue ?? prev.directionCue ?? next.directionCue,
            speed: state.speedCue ?? prev.speedCue ?? next.speedCue,
            alert: state.heroAlert ?? prev.heroAlert ?? next.heroAlert,
            timestamp: new Date().toISOString(),
          },
          ...log,
        ].slice(0, 8));
      }

      return next;
    });
  }, []);

  const steps = useMemo(() => {
    const baseSteps = [
      {
        title: "Enable camera",
        description: "Allow browser access so we can stream dashcam footage to the detector.",
        status:
          liveState.cameraState === "active"
            ? "complete"
            : liveState.cameraState === "connecting"
            ? "current"
            : "pending",
      },
      {
        title: "Connect WebSocket",
        description: "Establish a low-latency socket so every frame reaches the pothole detector.",
        status:
          liveState.socketState === "active"
            ? "complete"
            : liveState.socketState === "connecting"
            ? "current"
            : liveState.cameraState === "active"
            ? "pending"
            : "pending",
        tag: liveState.socketState === "connecting" ? "Sync" : undefined,
      },
      {
        title: "Follow lane guidance",
        description: "React to directional cues and slow-down alerts as hazards surface live.",
        status: liveState.directionCue || liveState.speedCue || liveState.heroAlert ? "complete" : "pending",
        tag: liveState.directionCue || liveState.speedCue ? "Live" : undefined,
      },
    ];
    return baseSteps;
  }, [liveState]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute -left-48 top-[-180px] h-[480px] w-[480px] rounded-full bg-sky-500/35 blur-[200px]" />
      <div className="pointer-events-none absolute -right-72 top-52 h-[420px] w-[420px] rounded-full bg-fuchsia-500/25 blur-[220px]" />
      <div className="pointer-events-none absolute inset-x-0 top-64 h-64 bg-gradient-to-r from-sky-500/15 via-transparent to-fuchsia-500/15 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-6 pb-16 pt-12 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <section className="flex flex-col gap-8">
            <div id="insights">
              <LiveHero showToast={showToast} onStateUpdate={handleLiveStateUpdate} />
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {highlightCards.map((card) => (
                  <div
                    key={card.title}
                    className="group rounded-3xl border border-white/10 bg-white/5 p-4 transition duration-150 hover:border-sky-400/70 hover:bg-white/10 hover:shadow-[0_16px_40px_rgba(56,189,248,0.25)]"
                  >
                    <p className="text-sm font-semibold text-white">{card.title}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Sidebar steps={steps} resources={resources} />
          </section>

          <section className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.45)]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Session telemetry</p>
              <div className="mt-4 flex flex-col gap-4 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-300">Camera</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                    {liveState.cameraState}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-slate-300">WebSocket</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
                    {liveState.socketState}
                  </span>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Latest guidance</p>
                  <p className="mt-3 text-base font-semibold text-white">
                    {liveState.heroAlert ||
                      (liveState.directionCue === "left"
                        ? "Obstacle left — steer right"
                        : liveState.directionCue === "right"
                        ? "Obstacle right — steer left"
                        : liveState.directionCue === "center"
                        ? "Obstacle ahead"
                        : liveState.speedCue === "slow"
                        ? "Reduce speed"
                        : "Standing by for detections")}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Direction: {liveState.directionCue ?? "—"} · Speed cue: {liveState.speedCue ?? "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.45)]">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Guidance feed</p>
              <div className="mt-4 space-y-3">
                {guidanceLog.length === 0 && <p className="text-sm text-slate-400">No guidance yet. Start the session to populate live cues.</p>}
                {guidanceLog.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/50 px-4 py-3 text-sm text-slate-200"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                      <span>{entry.direction?.toUpperCase() ?? "—"}</span>
                    </div>
                    <p className="mt-2 font-medium text-white">
                      {entry.alert ||
                        (entry.direction === "left"
                          ? "Obstacle left — steer right"
                          : entry.direction === "right"
                          ? "Obstacle right — steer left"
                          : entry.direction === "center"
                          ? "Obstacle ahead"
                          : entry.speed === "slow"
                          ? "Reduce speed"
                          : "Monitoring road conditions" )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <div className="mx-auto w-full max-w-5xl px-6 pb-24 lg:px-0">
          <Workflow />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      <div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            tone={toast.tone}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
