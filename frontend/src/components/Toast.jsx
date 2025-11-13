import { useEffect } from "react";

const toneStyles = {
  info: {
    container: "bg-slate-900/90 border-white/10",
    accent: "text-sky-300",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5ZM8.75 10.75C8.75 11.1642 8.41421 11.5 8 11.5C7.58579 11.5 7.25 11.1642 7.25 10.75V7.75C7.25 7.33579 7.58579 7 8 7C8.41421 7 8.75 7.33579 8.75 7.75V10.75ZM8 5.5C7.58579 5.5 7.25 5.16421 7.25 4.75C7.25 4.33579 7.58579 4 8 4C8.41421 4 8.75 4.33579 8.75 4.75C8.75 5.16421 8.41421 5.5 8 5.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  success: {
    container: "bg-emerald-600/15 border-emerald-400/40",
    accent: "text-emerald-300",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13.6454 4.479C13.9138 4.21058 13.9138 3.77542 13.6454 3.507L13.0052 2.8668C12.7368 2.59838 12.3016 2.59838 12.0332 2.8668L6.25 8.65001L3.9668 6.3668C3.69838 6.09838 3.26322 6.09838 2.9948 6.3668L2.35459 7.007C2.08617 7.27542 2.08617 7.71058 2.35459 7.979L5.75459 11.379C6.02301 11.6474 6.45817 11.6474 6.72659 11.379L13.6454 4.479Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  warning: {
    container: "bg-amber-500/15 border-amber-400/40",
    accent: "text-amber-300",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7.11652 2.24557C7.57917 1.43263 8.71014 1.43264 9.17279 2.24557L13.8675 10.5783C14.3152 11.3634 13.7471 12.3333 12.8948 12.3333H3.39452C2.54216 12.3333 1.97408 11.3634 2.42185 10.5783L7.11652 2.24557ZM8.14469 5.49999C7.73047 5.49999 7.39469 5.83578 7.39469 6.24999V8.91666C7.39469 9.33088 7.73047 9.66666 8.14469 9.66666C8.5589 9.66666 8.89469 9.33088 8.89469 8.91666V6.24999C8.89469 5.83578 8.5589 5.49999 8.14469 5.49999ZM8.14469 11.0833C7.73047 11.0833 7.39469 10.7475 7.39469 10.3333C7.39469 9.91912 7.73047 9.58333 8.14469 9.58333C8.5589 9.58333 8.89469 9.91912 8.89469 10.3333C8.89469 10.7475 8.5589 11.0833 8.14469 11.0833Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  error: {
    container: "bg-rose-600/15 border-rose-400/40",
    accent: "text-rose-300",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M8 1.5C4.41015 1.5 1.5 4.41015 1.5 8C1.5 11.5899 4.41015 14.5 8 14.5C11.5899 14.5 14.5 11.5899 14.5 8C14.5 4.41015 11.5899 1.5 8 1.5ZM10.5303 10.5303C10.2374 10.8232 9.76256 10.8232 9.46967 10.5303L8 9.06066L6.53033 10.5303C6.23744 10.8232 5.76256 10.8232 5.46967 10.5303C5.17678 10.2374 5.17678 9.76256 5.46967 9.46967L6.93934 8L5.46967 6.53033C5.17678 6.23744 5.17678 5.76256 5.46967 5.46967C5.76256 5.17678 6.23744 5.17678 6.53033 5.46967L8 6.93934L9.46967 5.46967C9.76256 5.17678 10.2374 5.17678 10.5303 5.46967C10.8232 5.76256 10.8232 6.23744 10.5303 6.53033L9.06066 8L10.5303 9.46967C10.8232 9.76256 10.8232 10.2374 10.5303 10.5303Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
};

export const Toast = ({ message, tone = "info", duration = 3000, onClose }) => {
  useEffect(() => {
    if (!duration) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const style = toneStyles[tone] ?? toneStyles.info;

  return (
    <div
      className={`pointer-events-auto flex min-w-[260px] max-w-xs items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.45)] backdrop-blur ${style.container}`}
    >
      <span className={`mt-1 ${style.accent}`}>{style.icon}</span>
      <div className="flex-1 text-sm leading-5 text-slate-100">{message}</div>
      <button
        type="button"
        onClick={() => onClose?.()}
        className="ml-2 rounded-full p-1 text-xs font-semibold uppercase tracking-wide text-slate-400 transition hover:text-white"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};
