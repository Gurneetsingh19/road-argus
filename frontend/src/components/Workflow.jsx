const workflowStages = [
  {
    title: "Input",
    headline: "Live streaming from dashcams or mobile devices",
    details: [
      "Supports RTSP, WebRTC, and browser camera feeds.",
      "Latency-aware ingest keeps raw frames flowing under 200ms.",
      "Geo-tagging metadata attaches GPS context to every frame.",
    ],
  },
  {
    title: "Processing",
    headline:
      "YOLOv8 deep learning model detects potholes, LMV, HMV, speed bumps, pedestrians, traffic signals, and road signs in real time",
    details: [
      "TensorRT-optimized YOLOv8 runs at 45+ FPS on edge GPUs.",
      "Multi-class detection feeds a hazard priority queue.",
      "Confidence thresholds adapt dynamically to road conditions.",
    ],
  },
  {
    title: "Guidance",
    headline:
      "Slows down when multiple potholes are detected, suggests slight left or right movement if a pothole or obstacle on that side is present",
    details: [
      "Decision engine fuses detections across the last 3 seconds.",
      "Speed advisory integrates vehicle class and road category.",
      "Directional cues stream to the in-car HUD and mobile app.",
    ],
  },
  {
    title: "Simulation",
    headline:
      "Overlay car on input shows recommended path, speed adjustments, and highlights traffic signals/signs",
    details: [
      "Digital twin mirrors vehicle pose with real-time overlays.",
      "Heatmap highlights risk zones and traffic signal states.",
      "Playback controls enable incident rewinds for root-cause analysis.",
    ],
  },
];

function Workflow() {
  return (
    <section
      id="workflow"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.55)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_55%)]" />
      <div className="relative grid gap-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workflow</p>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            From raw road footage to adaptive driver guidance — in seconds
          </h2>
          <p className="text-sm leading-relaxed text-slate-300 md:text-base">
            Vahan Sarthi orchestrates ingest, detection, guidance, and simulation in a tightly coupled loop so drivers
            stay ahead of hazards without manual intervention.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {workflowStages.map((stage, index) => (
            <article
              key={stage.title}
              className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-6 transition duration-200 hover:border-sky-400/60 hover:bg-slate-900/70"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.35em] text-sky-300/80">{stage.title}</span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.25em] text-slate-200">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-slate-100">{stage.headline}</h3>
              <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                {stage.details.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Workflow;

