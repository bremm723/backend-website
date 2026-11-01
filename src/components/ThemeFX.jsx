"use client";

function Bat({ className = "" }) {
  return (
    <svg viewBox="0 0 120 54" className={className} fill="currentColor" aria-hidden="true">
      <path d="M60 24c-6-7-13-9-21-6-6 2-9 7-14 9 2 6 7 9 13 9 3 0 6-1 8-3-2 5-4 8-9 11 9 1 18-2 23-9 5 7 14 10 23 9-5-3-7-6-9-11 2 2 5 3 8 3 6 0 11-3 13-9-5-2-8-7-14-9-8-3-15-1-21 6Z" />
    </svg>
  );
}

function Deathbat({ className = "" }) {
  return (
    <svg viewBox="0 0 180 110" className={className} aria-hidden="true">
      <path
        d="M90 46c-9-11-21-15-33-10-9 3-14 11-22 14 4 10 12 15 22 15 5 0 9-2 13-5-3 8-8 13-16 18 15 2 30-4 36-16 6 12 21 18 36 16-8-5-13-10-16-18 4 3 8 5 13 5 10 0 18-5 22-15-8-3-13-11-22-14-12-5-24-1-33 10Z"
        fill="currentColor"
      />
      <path
        d="M90 30c10 0 17 7 17 17 0 6-2 10-6 13l3 11H76l3-11c-4-3-6-7-6-13 0-10 7-17 17-17Z"
        fill="currentColor"
      />
      <g fill="#fff" opacity="0.9">
        <circle cx="83" cy="46" r="3.4" />
        <circle cx="97" cy="46" r="3.4" />
        <path d="M90 51l3 5h-6z" />
      </g>
    </svg>
  );
}

function AutobotMark({ className = "" }) {
  return (
    <svg viewBox="0 0 120 120" className={className} fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
      <path d="M60 8 110 32v32c0 27-20 43-50 48C30 107 10 91 10 64V32L60 8Z" />
      <path d="M60 30 85 43v20c0 14-11 22-25 27-14-5-25-13-25-27V43l25-13Z" opacity="0.55" />
      <path d="M45 50l12 5v9l-12-4V50ZM75 50l-12 5v9l12-4V50Z" fill="currentColor" stroke="none" />
      <path d="M60 50v24M46 68l14 6 14-6" opacity="0.7" />
    </svg>
  );
}

function Honeycomb({ className = "" }) {
  return (
    <svg viewBox="0 0 240 220" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <path d="M70 8 112 32v46L70 102 28 78V32Z" />
      <path d="M112 56 154 80v46l-42 24-42-24V80Z" opacity="0.75" />
      <path d="M154 8 196 32v46l-42 24-42-24V32Z" opacity="0.5" />
      <path d="M70 102l42 24v46l-42 24-42-24v-46Z" opacity="0.55" />
      <path d="M154 102l42 24v46l-42 24-42-24v-46Z" opacity="0.35" />
    </svg>
  );
}

function BeeCar({ className = "" }) {
  return (
    <svg viewBox="0 0 220 78" className={className} aria-hidden="true">
      <ellipse cx="205" cy="44" rx="18" ry="7" fill="#fff4b8" opacity="0.65" />
      <path
        d="M6 55c0-6 4-9 12-10l32-4 18-15c4-3 9-5 15-5h42c8 0 14 2 19 8l12 13 42 3c8 1 12 5 12 11 0 5-3 8-8 8H12c-4 0-6-3-6-9Z"
        fill="#e6b83f"
      />
      <path d="M70 26h40c6 0 10 2 14 6l8 9H70Z" fill="#2f3a44" />
      <path d="M129 26h20c5 0 9 2 12 6l6 9h-30Z" fill="#2f3a44" opacity="0.85" />
      <path d="M52 34l-12 8h90V34H52Z" fill="#b8902b" opacity="0.35" />
      <path d="M104 22v16M118 22v16" stroke="#24211c" strokeWidth="6" />
      <rect x="196" y="45" width="10" height="7" rx="2" fill="#fff8cd" />
      <circle cx="58" cy="60" r="13" fill="#24211c" />
      <circle cx="58" cy="60" r="5.5" fill="#cfd6dd" />
      <circle cx="168" cy="60" r="13" fill="#24211c" />
      <circle cx="168" cy="60" r="5.5" fill="#cfd6dd" />
    </svg>
  );
}

function OptimusTruck({ className = "" }) {
  return (
    <svg viewBox="0 0 280 84" className={className} aria-hidden="true">
      <rect x="8" y="16" width="140" height="40" rx="4" fill="#3f5f86" />
      <rect x="8" y="46" width="140" height="7" rx="2" fill="#243b55" opacity="0.7" />
      <path d="M22 24h108v6H22z" fill="#8ea9c6" opacity="0.35" />
      <path
        d="M148 56V28c0-5 4-9 9-9h30l14-9h28c5 0 9 4 9 9v8h10c7 0 11 5 11 12v9c0 6-3 8-8 8H148Z"
        fill="#b4403e"
      />
      <path d="M187 19h26c4 0 6 2 6 6v7h-46l14-13Z" fill="#cfe3f2" />
      <rect x="200" y="4" width="5" height="16" rx="2" fill="#8e9aa6" />
      <rect x="212" y="4" width="5" height="16" rx="2" fill="#8e9aa6" />
      <rect x="238" y="40" width="22" height="12" rx="2" fill="#dbe3ea" />
      <rect x="257" y="42" width="8" height="7" rx="2" fill="#fff6c9" />
      <circle cx="44" cy="60" r="12" fill="#23272d" />
      <circle cx="44" cy="60" r="5" fill="#cfd6dd" />
      <circle cx="104" cy="60" r="12" fill="#23272d" />
      <circle cx="104" cy="60" r="5" fill="#cfd6dd" />
      <circle cx="184" cy="61" r="12" fill="#23272d" />
      <circle cx="184" cy="61" r="5" fill="#cfd6dd" />
      <circle cx="238" cy="61" r="12" fill="#23272d" />
      <circle cx="238" cy="61" r="5" fill="#cfd6dd" />
    </svg>
  );
}

function TaksakaTrain({ className = "" }) {
  return (
    <svg viewBox="0 0 380 92" className={className} aria-hidden="true">
      {/* gerbong penumpang */}
      <rect x="4" y="34" width="148" height="38" rx="4" fill="#dbe5ec" />
      <rect x="4" y="34" width="148" height="5" rx="2" fill="#a9bccb" />
      <rect x="12" y="43" width="132" height="12" rx="3" fill="#1b3b56" opacity="0.85" />
      <rect x="4" y="58" width="148" height="5" fill="#d9922f" />
      <rect x="4" y="66" width="148" height="4" fill="#8d9daa" opacity="0.7" />
      <rect x="150" y="48" width="12" height="4" rx="2" fill="#6f8290" />
      <circle cx="34" cy="73" r="7.5" fill="#22303b" />
      <circle cx="34" cy="73" r="3" fill="#cbd5dd" />
      <circle cx="80" cy="73" r="7.5" fill="#22303b" />
      <circle cx="80" cy="73" r="3" fill="#cbd5dd" />
      <circle cx="126" cy="73" r="7.5" fill="#22303b" />
      <circle cx="126" cy="73" r="3" fill="#cbd5dd" />

      {/* lokomotif KAI */}
      <rect x="160" y="26" width="120" height="5" rx="2" fill="#7c93a6" />
      <path d="M196 26 208 12h22l10 14" fill="none" stroke="#8ba1b2" strokeWidth="2" />
      <rect x="160" y="31" width="122" height="44" rx="4" fill="#1f6398" />
      <path d="M282 37h44c7 0 11 5 11 12v26h-55Z" fill="#1f6398" />
      <rect x="164" y="38" width="36" height="17" rx="2" fill="#cfe8f6" opacity="0.92" />
      <rect x="206" y="38" width="48" height="7" rx="2" fill="#e8f3fa" opacity="0.8" />
      <rect x="288" y="42" width="30" height="12" rx="2" fill="#cfe8f6" opacity="0.85" />
      <rect x="164" y="57" width="152" height="5" fill="#e0a03f" />
      <rect x="319" y="55" width="13" height="7" rx="2" fill="#fff4bd" />
      <rect x="160" y="72" width="176" height="4" fill="#334a5c" opacity="0.8" />
      <circle cx="190" cy="76" r="8.5" fill="#22303b" />
      <circle cx="190" cy="76" r="3.2" fill="#cbd5dd" />
      <circle cx="246" cy="76" r="8.5" fill="#22303b" />
      <circle cx="246" cy="76" r="3.2" fill="#cbd5dd" />
      <circle cx="318" cy="76" r="8.5" fill="#22303b" />
      <circle cx="318" cy="76" r="3.2" fill="#cbd5dd" />
      <circle cx="348" cy="76" r="6.5" fill="#22303b" />
    </svg>
  );
}

function ThemeEmblem({ theme }) {
  const family = theme?.family;
  const dark = theme?.key === "avenged-nightmare";

  if (family === "bumblebee") {
    return (
      <div className="mt-emblem absolute -left-12 top-[10%] w-[clamp(250px,36vw,440px)] text-[color:var(--mt-border-strong)]">
        <Honeycomb className="w-full opacity-[0.22] drop-shadow-[0_0_30px_var(--mt-shadow)]" />
        <span className="mt-1 block pl-12 text-center font-serif text-[10px] font-black uppercase tracking-[0.5em] opacity-50">
          Bumblebee
        </span>
      </div>
    );
  }
  if (family === "optimus") {
    return (
      <div className="mt-emblem absolute right-[-2%] top-[10%] w-[clamp(220px,30vw,380px)] text-[color:var(--mt-accent)]">
        <div className="relative">
          <span className="mt-glow absolute inset-[14%] rounded-full bg-[radial-gradient(circle,var(--mt-soft-romance),transparent_68%)]" />
          <AutobotMark className="relative w-full opacity-[0.24] drop-shadow-[0_0_34px_var(--mt-shadow)]" />
        </div>
        <span className="mt-1 block text-center font-serif text-[10px] font-black uppercase tracking-[0.5em] opacity-50">
          Autobots
        </span>
      </div>
    );
  }
  if (family === "avenged") {
    return (
      <div
        className={`mt-emblem absolute right-[0%] top-[7%] w-[clamp(230px,31vw,400px)] ${
          dark ? "text-[color:var(--mt-romance)]" : "text-[color:var(--mt-accent)]"
        }`}
      >
        <span className="absolute left-[17%] right-[17%] top-[0%] aspect-square rounded-full bg-[radial-gradient(circle,var(--mt-soft-2)_0%,var(--mt-soft-romance)_40%,transparent_72%)] opacity-50 blur-[1px]" />
        <Deathbat
          className={`relative w-full drop-shadow-[0_0_36px_var(--mt-romance)] ${
            dark ? "opacity-45" : "opacity-30"
          }`}
        />
        <span className="mt-2 block text-center font-serif text-[10px] font-black uppercase tracking-[0.42em] opacity-75">
          Avenged Sevenfold
        </span>
      </div>
    );
  }
  if (family === "taksaka") {
    return (
      <div className="mt-emblem absolute right-[1%] top-[8%] w-[clamp(260px,38vw,500px)] text-[color:var(--mt-soft-2)]">
        <div className="flex items-center justify-end gap-2 opacity-70">
          <span className="rounded border border-current px-1.5 py-0.5 text-[9px] font-black tracking-[0.28em]">KAI</span>
          <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Kereta Api Indonesia</span>
        </div>
        <span className="mt-3 block text-right font-serif text-[clamp(2.5rem,8vw,5.8rem)] font-black leading-none tracking-[0.05em] opacity-25">
          TAKSAKA
        </span>
        <div className="ml-auto mt-2 h-[2px] w-[80%] bg-[linear-gradient(90deg,transparent,currentColor)] opacity-40" />
        <div className="ml-auto mt-1.5 flex items-center justify-end gap-2 text-[8px] font-bold uppercase tracking-[0.38em] opacity-55">
          <span>Gambir</span>
          <span>·</span>
          <span>Yogyakarta</span>
        </div>
        <span className="ml-auto mt-3 block h-3 w-[72%] bg-[repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_15px)] opacity-25" />
      </div>
    );
  }
  return (
    <div className="mt-emblem absolute right-[2%] top-[11%] w-[clamp(250px,34vw,440px)] text-[color:var(--mt-title)]">
      <span className="mt-twinkle absolute right-[7%] top-[-10%] text-[clamp(2.5rem,7vw,5rem)] text-[color:var(--mt-romance)] opacity-50">
        ★
      </span>
      <span className="block text-right font-serif text-[clamp(3rem,9vw,6.5rem)] font-black leading-none tracking-[0.06em] opacity-30">
        GAGA
      </span>
      <span className="mt-1 block text-right font-serif text-[10px] font-black uppercase tracking-[0.45em] opacity-70">
        Lady Gaga
      </span>
      <span className="absolute right-[4%] top-[44%] text-[clamp(2rem,6vw,4.5rem)] text-[color:var(--mt-accent)] opacity-80">
        ϟ
      </span>
    </div>
  );
}

export function ThemeBackdrop({ theme }) {
  const family = theme?.family || "bumblebee";

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className={`absolute inset-0 opacity-40 ${
          family === "bumblebee"
            ? "mt-pattern-bee"
            : family === "optimus"
              ? "mt-pattern-optimus"
              : family === "avenged"
                ? "mt-pattern-avenged"
                : family === "taksaka"
                  ? "mt-pattern-taksaka"
                  : "mt-pattern-gaga"
        }`}
      />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(65% 48% at 86% 8%, var(--mt-soft-romance), transparent 70%), radial-gradient(58% 44% at 4% 88%, var(--mt-soft), transparent 72%)",
        }}
      />

      <ThemeEmblem theme={theme} />

      {family === "bumblebee" && (
        <>
          <span className="mt-bee absolute left-0 top-[14%] text-2xl opacity-70" style={{ animationDelay: "-3s" }}>🐝</span>
          <span className="mt-bee absolute left-0 top-[58%] text-lg opacity-50" style={{ animationDelay: "-11s" }}>🐝</span>
          <div className="absolute inset-x-0 top-[70%]">
            <span className="mt-road block h-[2px] w-full opacity-40" />
            <div className="mt-drive absolute bottom-1 left-0 w-44 sm:w-64" style={{ animationDelay: "-7s" }}>
              <div className="mt-bob relative drop-shadow-[0_16px_24px_rgba(0,0,0,0.2)]">
                <span className="mt-headlight absolute -right-9 top-[38%] h-2 w-24 rounded-full bg-[linear-gradient(90deg,var(--mt-soft-2),transparent)] blur-sm" />
                <BeeCar className="w-full" />
              </div>
            </div>
          </div>
          <span className="mt-float absolute right-[8%] top-[24%] h-24 w-24 rounded-full bg-[radial-gradient(circle,var(--mt-soft-romance),transparent_68%)] opacity-80" />
          <span className="mt-float-slow absolute bottom-[14%] left-[12%] h-32 w-32 rounded-full bg-[radial-gradient(circle,var(--mt-soft),transparent_70%)]" />
          <span className="mt-float absolute left-[58%] top-[16%] text-sm opacity-70">💛</span>
          <span className="mt-float-slow absolute left-[36%] top-[72%] text-xs opacity-60">❤</span>
        </>
      )}

      {family === "optimus" && (
        <>
          <div className="mt-scan absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,transparent,var(--mt-soft-romance),transparent)] opacity-40 blur-sm" />
          <span className="mt-pulse-ring absolute right-[12%] top-[26%] h-24 w-24 rounded-full border border-[color:var(--mt-border-strong)]" />
          <div className="absolute inset-x-0 top-[74%]">
            <span className="mt-road block h-[2px] w-full opacity-35" />
            <div className="mt-drive mt-drive-slow absolute bottom-1 left-0 w-52 sm:w-80" style={{ animationDelay: "-13s" }}>
              <div className="mt-bob relative drop-shadow-[0_16px_26px_rgba(0,0,0,0.24)]">
                <span className="mt-headlight absolute -right-10 top-[48%] h-2.5 w-28 rounded-full bg-[linear-gradient(90deg,var(--mt-soft-2),transparent)] blur-sm" />
                <OptimusTruck className="w-full" />
              </div>
            </div>
          </div>
          <span className="mt-float absolute left-[8%] top-[64%] h-2 w-2 rounded-full bg-[color:var(--mt-accent-2)] opacity-60" />
          <span className="mt-float-slow absolute left-[18%] top-[32%] h-1.5 w-1.5 rounded-full bg-[color:var(--mt-accent)] opacity-60" />
          <span className="mt-float absolute right-[24%] top-[70%] text-lg opacity-40">⚙️</span>
        </>
      )}

      {family === "avenged" && (
        <>
          <span className="mt-bat absolute left-0 top-[18%] text-[color:var(--mt-romance)] opacity-40" style={{ animationDelay: "-4s" }}><Bat className="h-9 w-20" /></span>
          <span className="mt-bat absolute left-0 top-[52%] text-[color:var(--mt-accent)] opacity-30" style={{ animationDelay: "-13s" }}><Bat className="h-6 w-14" /></span>
          <span className="mt-bat absolute left-0 top-[76%] text-[color:var(--mt-romance)] opacity-25" style={{ animationDelay: "-8s" }}><Bat className="h-5 w-12" /></span>
          <span className="mt-flicker absolute left-[18%] top-0 h-[55vh] w-px bg-[linear-gradient(180deg,transparent,var(--mt-soft-romance),transparent)]" />
          <span className="mt-flicker absolute right-[22%] top-[10%] h-[42vh] w-px bg-[linear-gradient(180deg,transparent,var(--mt-accent-2),transparent)]" style={{ animationDelay: "-3s" }} />
          <span className="mt-float-slow absolute bottom-[8%] left-[6%] h-40 w-40 rounded-full bg-[radial-gradient(circle,var(--mt-soft-romance),transparent_70%)] opacity-30" />
          <span className="absolute left-[5%] top-[8%] font-serif text-[clamp(2.4rem,7vw,6rem)] font-black tracking-[0.12em] text-[color:var(--mt-accent)] opacity-15">
            A7X
          </span>
          <span className="absolute right-[9%] top-[15%] font-serif text-6xl text-[color:var(--mt-romance)] opacity-30">♰</span>
          <span className="mt-flicker absolute left-[42%] top-[6%] h-[30vh] w-px bg-[linear-gradient(180deg,var(--mt-soft-2),transparent)]" style={{ animationDelay: "-5s" }} />
        </>
      )}

      {family === "gaga" && (
        <>
          <div className="mt-spotlight absolute left-[12%] top-0 h-[62vh] w-40 origin-top bg-[linear-gradient(180deg,var(--mt-soft-romance),transparent_78%)] opacity-30 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" />
          <div className="mt-spotlight absolute right-[10%] top-0 h-[56vh] w-44 origin-top bg-[linear-gradient(180deg,var(--mt-soft),transparent_78%)] opacity-30 [clip-path:polygon(42%_0,58%_0,100%_100%,0_100%)]" style={{ animationDelay: "-4s" }} />
          <span className="mt-spin-slow absolute right-[7%] top-[12%] block h-20 w-20 opacity-70">
            <DiscoBall className="h-full w-full" />
          </span>
          <span className="mt-twinkle absolute left-[20%] top-[22%] h-1.5 w-1.5 rounded-full bg-[color:var(--mt-accent-2)]" />
          <span className="mt-twinkle absolute left-[38%] top-[48%] h-1 w-1 rounded-full bg-[color:var(--mt-accent)]" style={{ animationDelay: "1.2s" }} />
          <span className="mt-twinkle absolute right-[30%] top-[30%] h-2 w-2 rounded-full bg-[color:var(--mt-romance)]" style={{ animationDelay: "2.1s" }} />
          <span className="mt-twinkle absolute right-[16%] top-[64%] h-1.5 w-1.5 rounded-full bg-[color:var(--mt-accent-2)]" style={{ animationDelay: "0.6s" }} />
          <span className="mt-float absolute left-[8%] top-[70%] text-lg opacity-50">💖</span>
          <span className="mt-float-slow absolute right-[22%] top-[20%] text-sm opacity-50">✦</span>
        </>
      )}

      {family === "taksaka" && (
        <>
          <span className="absolute right-[9%] top-[9%] h-28 w-28 rounded-full bg-[radial-gradient(circle,var(--mt-soft-romance),transparent_68%)] opacity-25" />
          <span className="mt-flicker absolute left-[8%] top-0 h-[42vh] w-px bg-[linear-gradient(180deg,transparent,var(--mt-soft-romance),transparent)] opacity-60" />
          <span
            className="mt-flicker absolute right-[27%] top-[12%] h-[32vh] w-px bg-[linear-gradient(180deg,transparent,var(--mt-border-strong),transparent)] opacity-40"
            style={{ animationDelay: "-4s" }}
          />
          <span className="mt-twinkle absolute left-[14%] top-[24%] h-1.5 w-1.5 rounded-full bg-[color:var(--mt-romance)]" />
          <span className="mt-twinkle absolute left-[31%] top-[58%] h-1 w-1 rounded-full bg-[color:var(--mt-soft-2)]" style={{ animationDelay: "1.4s" }} />
          <span className="mt-twinkle absolute right-[19%] top-[40%] h-1.5 w-1.5 rounded-full bg-[color:var(--mt-romance)]" style={{ animationDelay: "2.2s" }} />
          <span className="absolute left-[4%] top-[11%] font-serif text-[clamp(1.8rem,5.5vw,4rem)] font-black tracking-[0.2em] text-[color:var(--mt-border-strong)] opacity-10">
            RAILWAY
          </span>

          <div className="absolute inset-x-0 bottom-[16%]">
            <div className="mt-track h-10 w-full opacity-40" />
            <div
              className="mt-drive absolute bottom-3 left-0 w-[clamp(15rem,42vw,34rem)]"
              style={{ animationDelay: "-12s", animationDuration: "34s" }}
            >
              <div className="mt-bob relative drop-shadow-[0_16px_26px_rgba(0,0,0,0.4)]">
                <span className="mt-headlight absolute -right-8 top-[48%] h-2.5 w-24 rounded-full bg-[linear-gradient(90deg,var(--mt-soft-2),transparent)] blur-sm" />
                <TaksakaTrain className="w-full" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DiscoBall({ className = "" }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_32%_28%,var(--mt-soft-2),var(--mt-border-strong)_48%,var(--mt-title))] shadow-[0_0_45px_var(--mt-shadow)]" />
      <div className="absolute inset-0 rounded-full opacity-45 [background-image:linear-gradient(to_right,var(--mt-soft-2)_1px,transparent_1px),linear-gradient(to_bottom,var(--mt-soft-2)_1px,transparent_1px)] [background-size:12px_12px]" />
      <div className="absolute left-1/2 top-0 h-6 w-px -translate-y-full bg-[color:var(--mt-border-strong)]" />
    </div>
  );
}

export function ThemeArt({ theme, className = "", compact = false }) {
  return (
    <div className={`group relative overflow-hidden ${className}`} role="img" aria-label={theme.art.alt}>
      <div
        className="absolute inset-0 bg-cover saturate-[.9] transition-transform duration-700 ease-out group-hover:scale-105"
        style={{
          backgroundImage: `url(${theme.art.image})`,
          backgroundPosition: theme.artPosition || "center",
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--mt-bg-from)_0%,transparent_52%,var(--mt-bg-to)_100%)] opacity-60" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--mt-bg-from)_0%,transparent_58%)]" />
      <div className="absolute inset-0 bg-[color:var(--mt-soft)] opacity-10 mix-blend-color" />

      {theme.family === "bumblebee" && <span className="mt-art-bee absolute left-0 top-1/3 text-xl drop-shadow-sm">🐝</span>}
      {theme.family === "optimus" && (
        <span className="mt-art-scan absolute inset-x-0 top-0 h-px bg-[color:var(--mt-soft-2)] shadow-[0_0_18px_4px_var(--mt-shadow)]" />
      )}
      {theme.family === "avenged" && (
        <span className="mt-art-bat absolute left-0 top-1/2 text-[color:var(--mt-soft-2)] opacity-80">
          <Bat className="h-5 w-12 drop-shadow" />
        </span>
      )}
      {theme.family === "gaga" && (
        <>
          <span className="mt-twinkle absolute left-[18%] top-[30%] h-1.5 w-1.5 rounded-full bg-white" />
          <span className="mt-twinkle absolute right-[20%] top-[38%] h-1 w-1 rounded-full bg-white" style={{ animationDelay: "1.3s" }} />
          <span className="mt-twinkle absolute left-[42%] top-[22%] h-2 w-2 rounded-full bg-[color:var(--mt-soft-2)]" style={{ animationDelay: "2.2s" }} />
        </>
      )}

      {theme.family === "bumblebee" && (
        <div className="mt-drive-art absolute bottom-10 w-24 sm:w-32" style={{ animationDelay: "-4s" }}>
          <BeeCar className="w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" />
        </div>
      )}
      {theme.family === "optimus" && (
        <div className="mt-drive-art absolute bottom-10 w-32 sm:w-44" style={{ animationDelay: "-1.5s" }}>
          <OptimusTruck className="w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" />
        </div>
      )}
      {theme.family === "taksaka" && (
        <div className="mt-drive-art absolute bottom-9 w-36 sm:w-48" style={{ animationDelay: "-3s" }}>
          <TaksakaTrain className="w-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.45)]" />
        </div>
      )}

      <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-1.5">
        {theme.icons.map((item) => (
          <span
            key={item.label}
            title={item.label}
            className="group/chip flex items-center gap-1 rounded-full border border-white/30 bg-black/30 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:scale-105 hover:bg-black/45"
          >
            <span className="text-sm transition-transform group-hover/chip:scale-125">{item.icon}</span>
            {!compact && <span>{item.label}</span>}
          </span>
        ))}
      </div>

      <a
        href={theme.art.creditUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(event) => event.stopPropagation()}
        className={`absolute bottom-3 right-3 max-w-[45%] truncate rounded-full bg-black/30 px-2 py-1 ${compact ? "text-[7px]" : "text-[8px]"} font-semibold text-white/80 backdrop-blur-sm hover:text-white`}
      >
        {theme.art.credit}
      </a>
    </div>
  );
}

export function ThemeStatus({ theme }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--mt-border)] bg-white/40 px-3 py-1 text-[10px] font-bold text-[color:var(--mt-title)] backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[color:var(--mt-accent)] opacity-50" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[color:var(--mt-accent)]" />
      </span>
      {theme.status}
    </span>
  );
}
