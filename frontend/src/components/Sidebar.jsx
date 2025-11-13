import React from "react";

const StepIcon = ({ status, label }) => {
  const base = "flex h-11 w-11 items-center justify-center rounded-full border transition";

  if (status === "complete") {
    return (
      <span className={`${base} border-emerald-400/60 bg-emerald-400/10 text-emerald-300 shadow-[0_0_24px_rgba(52,211,153,0.25)]`}>
        <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12.1465 3.85355C12.3417 4.04882 12.3417 4.3654 12.1465 4.56066L6.14645 10.5607C5.95118 10.7559 5.6346 10.7559 5.43934 10.5607L2.43934 7.56066C2.24408 7.3654 2.24408 7.04882 2.43934 6.85355C2.63461 6.65829 2.95119 6.65829 3.14645 6.85355L5.79289 9.5L11.4393 3.85355C11.6346 3.65829 11.9512 3.65829 12.1465 3.85355Z"
            fill="currentColor"
          ></path>
        </svg>
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className={`${base} border-sky-400/60 bg-sky-400/10 text-sky-300 animate-pulse`}>
        <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M7.5 2C4.73858 2 2.5 4.23858 2.5 7C2.5 9.76142 4.73858 12 7.5 12C8.27946 12 9.01267 11.8157 9.65621 11.493L12.7626 12.7966C12.924 12.8653 13.1098 12.8156 13.2165 12.6795C13.3233 12.5434 13.327 12.351 13.2262 12.2102L11.4665 9.72947C11.8188 9.01604 12 8.23243 12 7.5C12 4.73858 9.76142 2 7.5 2Z"
            fill="currentColor"
          ></path>
        </svg>
      </span>
    );
  }

  return (
    <span className={`${base} border-white/10 bg-white/5 text-sm font-medium text-slate-300`}>{label}</span>
  );
};

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 8H11.25M11.25 8L7.25 4M11.25 8L7.25 12"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GithubLogo = () => (
  <svg width="16" height="16" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    ></path>
  </svg>
);

const DatasetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 3.5C3 2.67157 3.67157 2 4.5 2H11.5C12.3284 2 13 2.67157 13 3.5V12.5C13 13.3284 12.3284 14 11.5 14H4.5C3.67157 14 3 13.3284 3 12.5V3.5Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M5.5 5.5H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M5.5 8H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M5.5 10.5H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

function Sidebar({ steps = [], resources = [] }) {
  return (
    <aside className="flex flex-col gap-6">
      <section
        id="workflow"
        className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Workflow</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Crash-to-Insight Pipeline</h2>
          </div>
          <div className="hidden text-sm text-slate-400 lg:block">{steps.length} steps</div>
        </div>

        <div className="mt-6 space-y-5">
          {steps.map((step, index) => (
            <div key={step.title} className="flex items-start gap-4">
              <div className="relative">
                <StepIcon status={step.status} label={String(index + 1).padStart(2, "0")} />
                {index !== steps.length - 1 && (
                  <span className="absolute left-1/2 top-[46px] h-12 w-px -translate-x-1/2 bg-gradient-to-b from-white/40 via-white/10 to-transparent" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span>{step.title}</span>
                  {step.tag && (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wide text-sky-300">
                      {step.tag}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-6 text-slate-300">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Resources</h3>
          <span className="text-[11px] uppercase tracking-[0.4em] text-slate-400">Stay sharp</span>
        </div>

        <div className="mt-6 space-y-4">
          {resources.map((resource) => (
            <a
              key={resource.href}
              href={resource.href}
              target={resource.external ? "_blank" : undefined}
              rel={resource.external ? "noopener noreferrer" : undefined}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-sky-400/60 hover:bg-white/10"
            >
              <div className="flex items-center gap-3 text-sm">
                <span className="rounded-full bg-white/10 p-2 text-white/80 transition group-hover:bg-sky-400/15 group-hover:text-sky-200">
                  {resource.icon === "github" ? <GithubLogo /> : <DatasetIcon />}
                </span>
                <div>
                  <p className="font-medium text-white">{resource.title}</p>
                  <p className="text-xs text-slate-300">{resource.description}</p>
                </div>
              </div>
              <span className="mt-1 text-slate-400 transition group-hover:text-sky-300">
                <ArrowIcon />
              </span>
            </a>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default Sidebar;
