import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_WS_URL = import.meta.env.VITE_POTHOLE_WS_URL ?? "ws://localhost:5000/ws";
const FRAME_INTERVAL_MS = 300;
const DETECTION_STALE_MS = 1_500;

const statusPills = {
  idle: {
    label: "Idle",
    tone: "text-slate-300 border-white/10 bg-white/5",
  },
  connecting: {
    label: "Connecting",
    tone: "text-sky-200 border-sky-400/50 bg-sky-400/10 animate-pulse",
  },
  active: {
    label: "Live",
    tone: "text-emerald-200 border-emerald-400/40 bg-emerald-400/10",
  },
  error: {
    label: "Error",
    tone: "text-rose-200 border-rose-400/50 bg-rose-500/10",
  },
};

const formatStatusPill = (state) => statusPills[state] ?? statusPills.idle;

const normalizeBox = (box, width, height) => {
  if (!box) return null;
  const { x = 0, y = 0, width: w = 0, height: h = 0, left, top, right, bottom } = box;

  if (typeof left === "number" && typeof top === "number" && typeof right === "number" && typeof bottom === "number") {
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
      label: box.label ?? box.class ?? "Pothole",
      score: box.score ?? box.confidence ?? box.conf ?? null,
    };
  }

  const isNormalized = [x, y, w, h].every((value) => typeof value === "number" && value <= 1.01);
  return {
    x: isNormalized ? x * width : x,
    y: isNormalized ? y * height : y,
    width: isNormalized ? w * width : w,
    height: isNormalized ? h * height : h,
    label: box.label ?? box.class ?? "Pothole",
    score: box.score ?? box.confidence ?? box.conf ?? null,
  };
};

export function LiveHero({ showToast, wsUrl = DEFAULT_WS_URL, onStateUpdate }) {
  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const websocketRef = useRef(null);
  const frameTimerRef = useRef(null);
  const lastDetectionRef = useRef(Date.now());

  const [cameraState, setCameraState] = useState("idle");
  const [socketState, setSocketState] = useState("idle");
  const [detections, setDetections] = useState([]);
  const [heroAlert, setHeroAlert] = useState(null);
  const [socketUrl, setSocketUrl] = useState(wsUrl);
  const [directionCue, setDirectionCue] = useState(null);
  const [speedCue, setSpeedCue] = useState(null);

  const isLive = cameraState === "active" && socketState === "active";

  const clearTimer = useCallback(() => {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  }, []);

  const stopStreaming = useCallback(() => {
    clearTimer();

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState("idle");
    setSocketState("idle");
    setDetections([]);
    setHeroAlert(null);
    setDirectionCue(null);
    setSpeedCue(null);
  }, [clearTimer]);

  const sendFrame = useCallback(() => {
    const video = videoRef.current;
    const ws = websocketRef.current;
    if (!video || !ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const canvas = captureCanvasRef.current;
    if (!canvas) return;

    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) return;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob || ws.readyState !== WebSocket.OPEN) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            ws.send(
              JSON.stringify({
                type: "frame",
                timestamp: Date.now(),
                data: reader.result,
              })
            );
          } catch (error) {
            console.error("Failed to send frame", error);
          }
        };
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.7
    );
  }, []);

  const drawDetections = useCallback(
    (boxes) => {
      const canvas = overlayCanvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const width = video.videoWidth || canvas.width;
      const height = video.videoHeight || canvas.height;

      if (!width || !height) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      boxes.forEach((box) => {
        const { x, y, width: boxW, height: boxH, label, score } = box;
        ctx.strokeStyle = "rgba(56, 189, 248, 0.9)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, boxW, boxH);

        const text = `${label}${score ? ` ${(score * 100).toFixed(0)}%` : ""}`;
        const padding = 6;
        const fontSize = Math.max(14, Math.round(canvas.width * 0.015));
        ctx.font = `${fontSize}px "Inter", sans-serif`;
        const textWidth = ctx.measureText(text).width;
        const textHeight = fontSize + padding;

        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.fillRect(x - 1, Math.max(y - textHeight, 0), textWidth + padding * 2, textHeight + padding / 2);
        ctx.fillStyle = "rgba(226, 232, 240, 0.95)";
        ctx.fillText(text, x + padding - 2, Math.max(y - padding, fontSize));
      });
    },
    []
  );

  const handleSocketMessage = useCallback(
    (event) => {
      try {
        const payload = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!payload) return;

        const boxes = Array.isArray(payload.boxes)
          ? payload.boxes
          : Array.isArray(payload.detections)
          ? payload.detections
          : [];

        const video = videoRef.current;
        const width = video?.videoWidth ?? 0;
        const height = video?.videoHeight ?? 0;

        const parsedBoxes = boxes
          .map((box) => normalizeBox(box, width, height))
          .filter(Boolean);

        setDetections(parsedBoxes);
        lastDetectionRef.current = Date.now();
        if (parsedBoxes.length) {
          drawDetections(parsedBoxes);
        } else {
          drawDetections([]);
        }

        const rawDirection = payload.direction ?? payload.position ?? payload.lane ?? null;
        const normalizedDirection = typeof rawDirection === "string" ? rawDirection.toLowerCase() : null;
        const rawSpeed = payload.speedCue ?? payload.speed ?? payload.action ?? null;
        const normalizedSpeed = typeof rawSpeed === "string" && rawSpeed.toLowerCase().includes("slow") ? "slow" : null;

        setDirectionCue(normalizedDirection);
        setSpeedCue(normalizedSpeed);

        const alertText =
          payload.alert ??
          payload.message ??
          payload.commentary ??
          (normalizedDirection === "left"
            ? "Pothole on left — steer right"
            : normalizedDirection === "right"
            ? "Pothole on right — steer left"
            : normalizedDirection === "center"
            ? "Obstacle ahead"
            : normalizedSpeed === "slow"
            ? "Reduce speed — rough surface ahead"
            : null);

        setHeroAlert(alertText);
      } catch (error) {
        console.error("Unable to parse WebSocket message", error);
      }
    },
    [drawDetections]
  );

  const initializeWebSocket = useCallback(
    (url) => {
      try {
        const ws = new WebSocket(url);
        setSocketState("connecting");

        ws.onopen = () => {
          setSocketState("active");
          clearTimer();
          frameTimerRef.current = setInterval(sendFrame, FRAME_INTERVAL_MS);
          showToast?.({ message: "Live WebSocket connected", tone: "success" });
        };

        ws.onmessage = handleSocketMessage;

        ws.onerror = (event) => {
          console.error("WebSocket error", event);
          setSocketState("error");
          showToast?.({ message: "WebSocket error. Check backend logs.", tone: "error" });
        };

        ws.onclose = () => {
          clearTimer();
          setSocketState("idle");
          if (cameraState === "active") {
            showToast?.({ message: "WebSocket closed", tone: "warning" });
          }
        };

        websocketRef.current = ws;
      } catch (error) {
        console.error("Failed to initialize WebSocket", error);
        setSocketState("error");
        showToast?.({ message: "Unable to connect to WebSocket endpoint", tone: "error" });
      }
    },
    [cameraState, clearTimer, handleSocketMessage, sendFrame, showToast]
  );

  const requestCamera = useCallback(async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices API unavailable");
      }
      setCameraState("connecting");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState("active");
      return true;
    } catch (error) {
      console.error("Unable to access camera", error);
      setCameraState("error");
      showToast?.({ message: "Camera access denied or unsupported on this device.", tone: "error" });
      setDirectionCue(null);
      setSpeedCue(null);
      return false;
    }
  }, [showToast]);

  const startStreaming = useCallback(async () => {
    if (cameraState === "active" && socketState === "active") {
      return;
    }

    const hasCamera = await requestCamera();
    if (!hasCamera) return;

    initializeWebSocket(socketUrl);
  }, [cameraState, initializeWebSocket, requestCamera, socketState, socketUrl]);

  useEffect(() => () => stopStreaming(), [stopStreaming]);

  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const syncCanvasSize = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) return;
      canvas.width = width;
      canvas.height = height;
      drawDetections(detections);
    };

    video.addEventListener("loadedmetadata", syncCanvasSize);
    return () => video.removeEventListener("loadedmetadata", syncCanvasSize);
  }, [detections, drawDetections]);

  useEffect(() => {
    if (!detections.length) {
      drawDetections([]);
    }
  }, [detections, drawDetections]);

  useEffect(() => {
    onStateUpdate?.({ cameraState, socketState, directionCue, speedCue, heroAlert });
  }, [onStateUpdate, cameraState, socketState, directionCue, speedCue, heroAlert]);

  const cameraPill = useMemo(() => formatStatusPill(cameraState), [cameraState]);
  const socketPill = useMemo(() => formatStatusPill(socketState), [socketState]);

  return (
    <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-800/40 p-10 shadow-[0_25px_80px_rgba(15,23,42,0.7)]">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center">
        <div className="max-w-xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.4em] text-sky-200">
            Live pothole sentinel
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
            Real-time road hazard detection straight from your dash cam.
          </h1>
          <p className="text-lg leading-relaxed text-slate-300">
            Start the live demo to stream camera footage directly into our detection model. Bounding boxes and proactive
            safety cues appear the moment potholes surface.
          </p>

          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em]">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${cameraPill.tone}`}>
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
                    cameraState === "active" ? "animate-ping bg-emerald-300" : "bg-slate-400"
                  }`}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
              </span>
              Camera {cameraPill.label}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${socketPill.tone}`}>
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
                    socketState === "active" ? "animate-ping bg-emerald-300" : "bg-slate-400"
                  }`}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
              </span>
              WebSocket {socketPill.label}
            </span>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={startStreaming}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-sky-500/20 transition hover:shadow-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={cameraState === "connecting" || socketState === "connecting"}
            >
              {isLive ? "Live" : "Launch Live Demo"}
            </button>
            <button
              type="button"
              onClick={stopStreaming}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-200 transition hover:border-rose-400/60 hover:text-white"
            >
              Stop Session
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">WebSocket endpoint</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Configurable</span>
              </div>
              <input
                type="text"
                value={socketUrl}
                onChange={(event) => setSocketUrl(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none transition focus:border-sky-400/60"
                placeholder="ws://localhost:5000/ws"
              />
              <p className="text-xs text-slate-400">Update to match your backend WebSocket route if it differs.</p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-[0_20px_70px_rgba(2,6,23,0.6)]">
          <div className="relative aspect-video w-full">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="h-full w-full object-cover"
            />
            <canvas ref={overlayCanvasRef} className="absolute inset-0 h-full w-full" />
            {directionCue === "left" && (
              <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-rose-500/30 via-rose-400/10 to-transparent" />
            )}
            {directionCue === "right" && (
              <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-rose-500/30 via-rose-400/10 to-transparent" />
            )}
            {speedCue === "slow" && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-amber-500/25 via-amber-400/10 to-transparent" />
            )}
            {heroAlert && (
              <div className="pointer-events-none absolute inset-x-6 top-6 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-2 text-center text-sm font-medium uppercase tracking-[0.35em] text-amber-200 shadow-[0_15px_45px_rgba(245,158,11,0.25)]">
                {heroAlert}
              </div>
            )}
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-center">
                <div className="max-w-xs space-y-3 text-slate-200">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Awaiting stream</p>
                  <p className="text-md font-semibold text-white">Launch the live demo to see pothole insights instantly.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <canvas ref={captureCanvasRef} className="hidden" />
    </section>
  );
}

export default LiveHero;
