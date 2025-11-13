import { useCallback, useState } from "react";
import Navbar from "./components/Navbar";
import { Toast } from "./components/Toast";
import LiveStream from "./components/LiveStream";
import Workflow from "./components/Workflow";

function App() {
  const [toasts, setToasts] = useState([]);
  const [liveState, setLiveState] = useState({
    cameraState: "idle",
    socketState: "idle",
    directionCue: null,
    speedCue: null,
    heroAlert: null,
    detections: [],
  });

  const showToast = useCallback(({ message, tone = "info", duration = 3200 }) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, message, tone, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleLiveStateUpdate = useCallback((state) => {
    if (!state) return;
    setLiveState((prev) => ({ ...prev, ...state }));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Animated Background Gradients */}
      <div className="pointer-events-none absolute -left-48 top-[-180px] h-[480px] w-[480px] rounded-full bg-sky-500/35 blur-[200px]" />
      <div className="pointer-events-none absolute -right-72 top-52 h-[420px] w-[420px] rounded-full bg-fuchsia-500/25 blur-[220px]" />
      <div className="pointer-events-none absolute inset-x-0 top-64 h-64 bg-gradient-to-r from-sky-500/15 via-transparent to-fuchsia-500/15 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-16 pt-8">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl">
              Real-Time Road Hazard Detection
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-300">
              Advanced AI-powered detection system for potholes, vehicles, pedestrians, and traffic signs
            </p>
          </div>

          {/* Main Live Stream Component */}
          <div id="insights" className="mb-16">
            <LiveStream showToast={showToast} onStateUpdate={handleLiveStateUpdate} />
          </div>

          {/* Workflow Section */}
          <div className="mx-auto w-full max-w-5xl">
            <Workflow />
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
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
