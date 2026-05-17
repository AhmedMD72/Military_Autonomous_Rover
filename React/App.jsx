import { useState } from "react";

// ─── Shared styles injected once ────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@300;400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-dark:     #0F1717;
    --card-bg:     #182724;
    --accent-teal: #00f2c3;
    --accent-dim:  #00A890;
    --text-white:  #ffffff;
    --text-gray:   #9aa4a6;
    --border:      #2c3a3d;
  }

  html, body, #root {
    height: 100%;
    background-color: var(--bg-dark);
    color: var(--text-white);
    font-family: 'Inter', sans-serif;
  }

  /* Page transition wrapper */
  .page {
    min-height: 100vh;
    transition: opacity 0.8s ease;
  }
  .page.fading {
    opacity: 0;
    pointer-events: none;
  }
`;

// ─── SVG Icons (inline, no external deps) ───────────────────────────────────
const IconManual = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
    <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
);
const IconAutonomous = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
    <rect x="3" y="7" width="18" height="12" rx="2"/>
    <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/>
    <circle cx="9" cy="13" r="1.5"/><circle cx="15" cy="13" r="1.5"/>
    <path d="M9 17h6"/>
  </svg>
);
const IconNav = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
);
const IconFace = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
    <path d="M9 9h.01M15 9h.01"/>
    <path d="M9 12a3 3 0 0 0 6 0"/>
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
  </svg>
);
const IconObject = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
    <rect x="2" y="2" width="8" height="8" rx="1"/>
    <rect x="14" y="2" width="8" height="8" rx="1"/>
    <rect x="2" y="14" width="8" height="8" rx="1"/>
    <path d="M14 17h8M18 14v6"/>
  </svg>
);
const IconRocket = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
  </svg>
);

// ─── Mode data ───────────────────────────────────────────────────────────────
const modes = [
  { id: "manual",           title: "Manual Mode",       description: "Direct, real-time control of rover movement.",                                       icon: <IconManual />,     isLowerRow: false },
  { id: "autonomous",       title: "Autonomous Mode",   description: "Rover operates independently based on pre-defined tasks.",                            icon: <IconAutonomous />, isLowerRow: false },
  { id: "navigation",       title: "Navigation",        description: "Set and follow GPS waypoints or navigate a map.",                                     icon: <IconNav />,        isLowerRow: false },
  { id: "face-recognition", title: "Face Recognition",  description: "Identify and track recognized human faces.",                                          icon: <IconFace />,       isLowerRow: true  },
  { id: "object-detection", title: "Object Detection",  description: "Engage the vision system to identify and classify objects in real-time.",             icon: <IconObject />,     isLowerRow: true  },
];

// ─── Landing Page ────────────────────────────────────────────────────────────
function LandingPage({ onNavigate }) {
  const [fading, setFading] = useState(false);

  const startMission = () => {
    setFading(true);
    setTimeout(() => onNavigate("modes"), 800);
  };

  return (
    <>
      <style>{`
        .landing-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          overflow: hidden;
        }

        .splash-container {
          text-align: center;
          max-width: 800px;
          width: 90%;
        }

        .main-logo {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(3rem, 8vw, 5rem);
          letter-spacing: 10px;
          margin-bottom: 5px;
          animation: fadeDown 0.8s ease both;
        }

        .version {
          color: var(--accent-teal);
          text-shadow: 0 0 15px rgba(0, 242, 195, 0.4);
        }

        .tagline {
          font-size: 0.75rem;
          letter-spacing: 3px;
          color: var(--text-gray);
          font-weight: 300;
          margin-bottom: 40px;
          animation: fadeDown 0.8s ease 0.15s both;
        }

        .rover-display {
          margin: 40px 0;
          animation: fadeIn 1s ease 0.3s both;
        }

        /* Placeholder rover graphic (shown when no image asset) */
        .rover-placeholder {
          width: 450px;
          max-width: 100%;
          height: 220px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 10px rgba(0, 242, 195, 0.2));
        }

        .hero-image {
          width: 450px;
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0 auto;
          filter: drop-shadow(0 0 10px rgba(0, 242, 195, 0.2));
        }

        .action-section {
          animation: fadeUp 0.8s ease 0.5s both;
        }

        .start-btn {
          background-color: rgba(0, 0, 0, 0.8);
          color: var(--text-white);
          border: 1.5px solid var(--accent-teal);
          width: 450px;
          max-width: 100%;
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 2px;
          padding: 12px 0;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 0 auto;
          transition: all 0.3s ease;
        }

        .start-btn:hover {
          background-color: rgba(0, 242, 195, 0.1);
          box-shadow: 0 0 15px rgba(0, 242, 195, 0.3);
        }

        .start-btn:active {
          transform: scale(0.98);
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div className={`page landing-page${fading ? " fading" : ""}`}>
        <div className="splash-container">
          <header>
            <h1 className="main-logo">ROVEX <span className="version">1.0</span></h1>
            <p className="tagline">INTELLIGENT AUTONOMOUS EXPLORATION &amp; TACTICAL ROVER SYSTEM</p>
          </header>

          <div className="rover-display">
            {/* Replace with your actual image:
                <img src="image/logo.png" alt="Rovex Logo" className="hero-image" />
            */}
            <div className="rover-placeholder">
              <svg width="340" height="200" viewBox="0 0 340 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Body */}
                <rect x="90" y="70" width="160" height="80" rx="8" stroke="#00f2c3" strokeWidth="1.5" fill="none"/>
                {/* Top panel */}
                <rect x="110" y="50" width="120" height="25" rx="4" stroke="#00f2c3" strokeWidth="1.5" fill="none"/>
                {/* Antenna */}
                <line x1="170" y1="50" x2="170" y2="28" stroke="#00f2c3" strokeWidth="1.5"/>
                <circle cx="170" cy="24" r="4" stroke="#00f2c3" strokeWidth="1.5" fill="none"/>
                {/* Camera eye */}
                <circle cx="220" cy="110" r="14" stroke="#00f2c3" strokeWidth="1.5" fill="none"/>
                <circle cx="220" cy="110" r="6" fill="#00f2c3" opacity="0.4"/>
                {/* Left wheel set */}
                <ellipse cx="100" cy="165" rx="22" ry="14" stroke="#00f2c3" strokeWidth="1.5" fill="none"/>
                <line x1="100" y1="151" x2="100" y2="179" stroke="#00f2c3" strokeWidth="1"/>
                <line x1="78" y1="165" x2="122" y2="165" stroke="#00f2c3" strokeWidth="1"/>
                {/* Middle wheel */}
                <ellipse cx="170" cy="168" rx="22" ry="14" stroke="#00f2c3" strokeWidth="1.5" fill="none"/>
                <line x1="170" y1="154" x2="170" y2="182" stroke="#00f2c3" strokeWidth="1"/>
                <line x1="148" y1="168" x2="192" y2="168" stroke="#00f2c3" strokeWidth="1"/>
                {/* Right wheel */}
                <ellipse cx="240" cy="165" rx="22" ry="14" stroke="#00f2c3" strokeWidth="1.5" fill="none"/>
                <line x1="240" y1="151" x2="240" y2="179" stroke="#00f2c3" strokeWidth="1"/>
                <line x1="218" y1="165" x2="262" y2="165" stroke="#00f2c3" strokeWidth="1"/>
                {/* Suspension arms */}
                <line x1="100" y1="150" x2="100" y2="140" stroke="#00f2c3" strokeWidth="1.5"/>
                <line x1="170" y1="150" x2="170" y2="143" stroke="#00f2c3" strokeWidth="1.5"/>
                <line x1="240" y1="150" x2="240" y2="140" stroke="#00f2c3" strokeWidth="1.5"/>
                <line x1="100" y1="140" x2="240" y2="140" stroke="#00f2c3" strokeWidth="1" strokeDasharray="4 3"/>
                {/* Panel details */}
                <rect x="105" y="82" width="30" height="18" rx="2" stroke="#00f2c3" strokeWidth="1" opacity="0.5"/>
                <rect x="143" y="82" width="30" height="18" rx="2" stroke="#00f2c3" strokeWidth="1" opacity="0.5"/>
                <line x1="105" y1="110" x2="185" y2="110" stroke="#00f2c3" strokeWidth="1" opacity="0.4"/>
                <line x1="105" y1="120" x2="165" y2="120" stroke="#00f2c3" strokeWidth="1" opacity="0.4"/>
                {/* Glow effect */}
                <ellipse cx="170" cy="185" rx="100" ry="6" fill="#00f2c3" opacity="0.06"/>
              </svg>
            </div>
          </div>

          <div className="action-section">
            <button className="start-btn" onClick={startMission}>
              <IconRocket />
              START MISSION
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Mode Selector Page ──────────────────────────────────────────────────────
function ModeSelectorPage() {
  const [glowingId, setGlowingId] = useState(null);

  const handleCardClick = (mode) => {
    setGlowingId(mode.id);
    setTimeout(() => {
      // In the multi-page HTML version this would be window.location.href
      // In this single-page React app you'd swap this for your router navigation
      // e.g. navigate(`/${mode.id}`) if using React Router
      console.log(`Navigating to: ${mode.id}`);
      setGlowingId(null);
    }, 150);
  };

  return (
    <>
      <style>{`
        .modes-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          animation: fadeIn 0.5s ease both;
        }

        .top-nav {
          width: 90%;
          display: flex;
          justify-content: space-between;
          padding: 20px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .brand-icon {
          color: var(--accent-dim);
        }

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-white);
        }

        .dot {
          height: 8px;
          width: 8px;
          background-color: var(--accent-dim);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--accent-dim);
        }

        .modes-container {
          max-width: 1100px;
          width: 100%;
          text-align: center;
          padding: 60px 20px;
        }

        .main-title {
          font-family: 'Orbitron', sans-serif;
          font-size: clamp(1.8rem, 4vw, 3rem);
          color: var(--accent-dim);
          margin-bottom: 60px;
          letter-spacing: 2px;
        }

        .mode-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 30px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .mode-card {
          grid-column: span 2;
          background: var(--card-bg);
          padding: 30px;
          border-radius: 15px;
          text-align: left;
          cursor: pointer;
          user-select: none;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease-in-out;
        }

        .mode-card * { pointer-events: none; }

        .mode-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent-teal);
          box-shadow: 0 10px 25px rgba(0, 242, 195, 0.1);
          background: linear-gradient(145deg, #141e21, #1a272b);
        }

        .mode-card:active { transform: scale(0.98); }

        .mode-card.glowing {
          border-color: var(--accent-teal);
          box-shadow: 0 0 20px rgba(0, 242, 195, 0.4);
        }

        .lower-row:nth-child(4) { grid-column: 2 / span 2; }
        .lower-row:nth-child(5) { grid-column: 4 / span 2; }

        .icon-box {
          margin-bottom: 20px;
          height: 40px;
          display: flex;
          align-items: center;
          filter: drop-shadow(0 0 5px rgba(0, 242, 195, 0.3));
        }

        .mode-card h3 {
          font-size: 1.4rem;
          margin: 10px 0;
          color: var(--text-white);
        }

        .mode-card p {
          color: var(--text-gray);
          line-height: 1.5;
          font-size: 0.95rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @media (max-width: 700px) {
          .mode-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .mode-card { grid-column: span 1 !important; }
          .main-title { font-size: 1.6rem; letter-spacing: 1px; }
        }
      `}</style>

      <div className="page modes-page">
        <header className="top-nav">
          <div className="brand">
            <svg className="brand-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/>
            </svg>
            Rover Control System
          </div>
          <div className="status">
            <span className="dot" />
            Connected
          </div>
        </header>

        <main className="modes-container">
          <h1 className="main-title">Select Operational Mode</h1>

          <section className="mode-grid">
            {modes.map((mode) => (
              <div
                key={mode.id}
                className={[
                  "mode-card",
                  mode.isLowerRow ? "lower-row" : "",
                  glowingId === mode.id ? "glowing" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => handleCardClick(mode)}
              >
                <div className="icon-box">{mode.icon}</div>
                <h3>{mode.title}</h3>
                <p>{mode.description}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </>
  );
}

// ─── App (router) ────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("landing"); // "landing" | "modes"

  return (
    <>
      <style>{globalStyles}</style>
      {page === "landing"
        ? <LandingPage onNavigate={setPage} />
        : <ModeSelectorPage />
      }
    </>
  );
}
