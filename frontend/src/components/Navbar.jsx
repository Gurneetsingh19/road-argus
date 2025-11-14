import React from "react";

const SparkIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="drop-shadow-[0_0_12px_rgba(56,189,248,0.45)]"
  >
    <path
      d="M11.998 2.25L13.824 8.534H20.25L15.05 12.366L16.877 18.65L11.998 14.999L7.119 18.65L8.946 12.366L3.75 8.533H10.172L11.998 2.25Z"
      fill="url(#spark-gradient)"
    />
    <defs>
      <linearGradient
        id="spark-gradient"
        x1="3.75"
        y1="2.25"
        x2="18.036"
        y2="21.886"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#38BDF8" />
        <stop offset="0.53" stopColor="#818CF8" />
        <stop offset="1" stopColor="#C084FC" />
      </linearGradient>
    </defs>
  </svg>
);

const GithubLogo = () => (
  <svg width="18" height="18" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    ></path>
  </svg>
);

const navItems = [
  { label: "Workflow", href: "#workflow" },
  { label: "Showcase", href: "#workflow" },
  { label: "Insights", href: "#insights" },
];

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-6 py-5 text-sm text-slate-200">
        <a href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
          <span className="rounded-full bg-slate-900/70 p-2 ring-1 ring-white/10">
            <SparkIcon />
          </span>
          Road Argus
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors duration-200 hover:text-sky-300"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/GoldGroove06/ct-hackathon-2025/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-200 transition hover:border-sky-400/60 hover:text-white hover:shadow-[0_0_28px_rgba(56,189,248,0.35)] md:flex"
          >
            <GithubLogo />
            GitHub
          </a>
          <a
            href="#upload"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-sky-500/20 transition duration-200 hover:shadow-sky-400/40"
          >
            Launch Studio
          </a>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
