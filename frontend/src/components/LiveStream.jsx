import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import VideoFeed from "./VideoFeed";
import DetectionsPanel from "./DetectionsPanel";
import MessagesPanel from "./MessagesPanel";

const DEFAULT_SOCKET_URL = import.meta.env.VITE_POTHOLE_WS_URL ?? "http://localhost:5000";
const FRAME_INTERVAL_MS = 500;

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

export function LiveStream({ showToast, wsUrl = DEFAULT_SOCKET_URL, onStateUpdate }) {
  const userVideoRef = useRef(null);
  const processedVideoRef = useRef(null);
  const userOverlayCanvasRef = useRef(null);
  const processedOverlayCanvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);
  const frameTimerRef = useRef(null);

  const [cameraState, setCameraState] = useState("idle");
  const [socketState, setSocketState] = useState("idle");
  const [detections, setDetections] = useState([]);
  const [heroAlert, setHeroAlert] = useState(null);
  const [socketUrl, setSocketUrl] = useState(wsUrl);
  const [directionCue, setDirectionCue] = useState(null);
  const [speedCue, setSpeedCue] = useState(null);
  const [processedFrameUrl, setProcessedFrameUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [command, setCommand] = useState("");

  const isLive = cameraState === "active" && socketState === "active";

  const clearTimer = useCallback(() => {
    if (frameTimerRef.current) {
      clearInterval(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  }, []);

  const stopStreaming = useCallback(() => {
    clearTimer();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }

    setCameraState("idle");
    setSocketState("idle");
    setDetections([]);
    setHeroAlert(null);
    setDirectionCue(null);
    setSpeedCue(null);
    setProcessedFrameUrl(null);
    setMessages([]);
    setCommand("");
  }, [clearTimer]);

  const sendFrame = useCallback(() => {
    const video = userVideoRef.current;
    const socket = socketRef.current;
    if (!video || !socket || !socket.connected) {
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

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, width, height);
    
    try {
      const dataUrl = canvas.toDataURL("image/jpeg");
      socket.emit("frame", dataUrl);
    } catch (error) {
      console.error("Failed to send frame", error);
    }
  }, []);

  const drawDetections = useCallback(
    (boxes, canvasRef, videoRef) => {
      const canvas = canvasRef.current;
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

  const handleProcessedData = useCallback(
    (data) => {
      try {
        // Handle processed frame and command from Socket.IO "processed" event
        if (data.frame) {
          setProcessedFrameUrl(data.frame);
        }

        if (data.command) {
          setCommand(data.command);
          setHeroAlert(data.command);
          
          // Add command to messages
          setMessages((prev) => [
            {
              id: Date.now(),
              message: data.command,
              type: "alert",
              timestamp: new Date().toISOString(),
            },
            ...prev.slice(0, 9),
          ]);
        }

        // Handle detections if present
        const boxes = Array.isArray(data.boxes)
          ? data.boxes
          : Array.isArray(data.detections)
          ? data.detections
          : [];

        const video = userVideoRef.current;
        const width = video?.videoWidth ?? 0;
        const height = video?.videoHeight ?? 0;

        const parsedBoxes = boxes
          .map((box) => normalizeBox(box, width, height))
          .filter(Boolean);

        setDetections(parsedBoxes);
        if (parsedBoxes.length) {
          drawDetections(parsedBoxes, userOverlayCanvasRef, userVideoRef);
          drawDetections(parsedBoxes, processedOverlayCanvasRef, processedVideoRef);
        } else {
          drawDetections([], userOverlayCanvasRef, userVideoRef);
          drawDetections([], processedOverlayCanvasRef, processedVideoRef);
        }

        // Handle direction and speed cues if present
        const rawDirection = data.direction ?? data.position ?? data.lane ?? null;
        const normalizedDirection = typeof rawDirection === "string" ? rawDirection.toLowerCase() : null;
        const rawSpeed = data.speedCue ?? data.speed ?? data.action ?? null;
        const normalizedSpeed = typeof rawSpeed === "string" && rawSpeed.toLowerCase().includes("slow") ? "slow" : null;

        if (normalizedDirection) setDirectionCue(normalizedDirection);
        if (normalizedSpeed) setSpeedCue(normalizedSpeed);
      } catch (error) {
        console.error("Unable to parse processed data", error);
      }
    },
    [drawDetections]
  );

  const initializeSocket = useCallback(
    (url) => {
      try {
        setSocketState("connecting");
        const socket = io(url);

        socket.on("connect", () => {
          console.log("Connected to Flask backend");
          setSocketState("active");
          clearTimer();
          frameTimerRef.current = setInterval(sendFrame, FRAME_INTERVAL_MS);
          showToast?.({ message: "Live Socket.IO connected", tone: "success" });
        });

        socket.on("processed", handleProcessedData);

        socket.on("disconnect", () => {
          clearTimer();
          setSocketState("idle");
          if (cameraState === "active") {
            showToast?.({ message: "Socket.IO disconnected", tone: "warning" });
          }
        });

        socket.on("connect_error", (error) => {
          console.error("Socket.IO connection error", error);
          setSocketState("error");
          showToast?.({ message: "Socket.IO connection error. Check backend logs.", tone: "error" });
        });

        socketRef.current = socket;
      } catch (error) {
        console.error("Failed to initialize Socket.IO", error);
        setSocketState("error");
        showToast?.({ message: "Unable to connect to Socket.IO endpoint", tone: "error" });
      }
    },
    [cameraState, clearTimer, handleProcessedData, sendFrame, showToast]
  );

  const requestCamera = useCallback(async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices API unavailable");
      }
      setCameraState("connecting");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;

      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
        await userVideoRef.current.play();
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

    initializeSocket(socketUrl);
  }, [cameraState, initializeSocket, requestCamera, socketState, socketUrl]);

  useEffect(() => () => stopStreaming(), [stopStreaming]);

  useEffect(() => {
    const canvas = userOverlayCanvasRef.current;
    const video = userVideoRef.current;
    if (!canvas || !video) return;

    const syncCanvasSize = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) return;
      canvas.width = width;
      canvas.height = height;
      drawDetections(detections, userOverlayCanvasRef, userVideoRef);
    };

    video.addEventListener("loadedmetadata", syncCanvasSize);
    return () => video.removeEventListener("loadedmetadata", syncCanvasSize);
  }, [detections, drawDetections]);

  useEffect(() => {
    if (!detections.length) {
      drawDetections([], userOverlayCanvasRef, userVideoRef);
      drawDetections([], processedOverlayCanvasRef, processedVideoRef);
    }
  }, [detections, drawDetections]);

  useEffect(() => {
    onStateUpdate?.({ cameraState, socketState, directionCue, speedCue, heroAlert, detections });
  }, [onStateUpdate, cameraState, socketState, directionCue, speedCue, heroAlert, detections]);

  const cameraPill = useMemo(() => formatStatusPill(cameraState), [cameraState]);
  const socketPill = useMemo(() => formatStatusPill(socketState), [socketState]);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider ${cameraPill.tone}`}>
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
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs uppercase tracking-wider ${socketPill.tone}`}>
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${
                    socketState === "active" ? "animate-ping bg-emerald-300" : "bg-slate-400"
                  }`}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
              </span>
              Socket.IO {socketPill.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={startStreaming}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-sky-500/20 transition hover:shadow-sky-400/40 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={cameraState === "connecting" || socketState === "connecting"}
            >
              {isLive ? "● Live" : "▶ Start Stream"}
            </button>
            <button
              type="button"
              onClick={stopStreaming}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-slate-200 transition hover:border-rose-400/60 hover:text-white"
            >
              ⏹ Stop
            </button>
          </div>
        </div>
      </div>

      {/* Video Feeds */}
      <div className="grid gap-6 lg:grid-cols-2">
        <VideoFeed
          title="User Live Feed"
          videoRef={userVideoRef}
          overlayCanvasRef={userOverlayCanvasRef}
          isLive={isLive && cameraState === "active"}
          stream={streamRef.current}
        />
        <VideoFeed
          title="Processed Feed"
          videoRef={processedVideoRef}
          overlayCanvasRef={processedOverlayCanvasRef}
          isLive={isLive && socketState === "active"}
          processedFrameUrl={processedFrameUrl}
        />
      </div>

      {/* Detections and Messages */}
      <div className="grid gap-6 lg:grid-cols-2">
        <DetectionsPanel detections={detections} />
        <MessagesPanel 
          messages={messages} 
          directionCue={directionCue}
          speedCue={speedCue}
          heroAlert={heroAlert}
        />
      </div>

      <canvas ref={captureCanvasRef} className="hidden" />
    </div>
  );
}

export default LiveStream;

