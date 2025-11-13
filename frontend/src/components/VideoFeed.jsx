import { useRef, useEffect, useState } from "react";

export function VideoFeed({ 
  title, 
  videoRef, 
  overlayCanvasRef, 
  isLive, 
  stream = null,
  processedFrameUrl = null,
  className = "" 
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().then(() => setIsPlaying(true));
    }
  }, [stream, videoRef]);

  useEffect(() => {
    if (processedFrameUrl && imgRef.current) {
      imgRef.current.src = processedFrameUrl;
    }
  }, [processedFrameUrl]);

  const showPlaceholder = !isLive && !processedFrameUrl;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl ${className}`}>
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <div className={`h-3 w-3 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-white">
          {isLive ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>
      
      <div className="absolute right-4 top-4 z-20">
        <div className="rounded-lg bg-black/60 px-3 py-1.5 backdrop-blur-sm">
          <span className="text-xs font-medium text-slate-200">{title}</span>
        </div>
      </div>

      <div className="relative aspect-video w-full">
        {processedFrameUrl && title === "Processed Feed" ? (
          <>
            <img
              ref={imgRef}
              alt="Processed frame"
              className="h-full w-full object-cover"
            />
            {overlayCanvasRef && (
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 h-full w-full pointer-events-none"
              />
            )}
          </>
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="h-full w-full object-cover"
            />
            {overlayCanvasRef && (
              <canvas
                ref={overlayCanvasRef}
                className="absolute inset-0 h-full w-full pointer-events-none"
              />
            )}
          </>
        )}
        
        {showPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90">
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full border-2 border-slate-600 flex items-center justify-center">
                <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-400">Awaiting stream</p>
              <p className="text-xs text-slate-500">Start the session to begin</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoFeed;

