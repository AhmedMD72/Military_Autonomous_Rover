import { useState } from "react";

const modes = [
  {
    id: "manual",
    title: "Manual Mode",
    description: "Direct, real-time control of rover movement.",
    target: "manual.html",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  {
    id: "autonomous",
    title: "Autonomous Mode",
    description: "Rover operates independently based on pre-defined tasks.",
    target: "autonomous.html",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
        <circle cx="9" cy="13" r="1.5" />
        <circle cx="15" cy="13" r="1.5" />
        <path d="M9 17h6" />
      </svg>
    ),
  },
  {
    id: "navigation",
    title: "Navigation",
    description: "Set and follow GPS waypoints or navigate a map.",
    target: "navigation.html",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
  {
    id: "face-recognition",
    title: "Face Recognition",
    description: "Identify and track recognized human faces.",
    target: "face-recognition.html",
    isLowerRow: true,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
        <path d="M9 9h.01M15 9h.01" />
        <path d="M9 12a3 3 0 0 0 6 0" />
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      </svg>
    ),
  },
  {
    id: "object-detection",
    title: "Object Detection",
    description: "Engage the vision system to identify and classify objects in real-time.",
    target: "object-detection.html",
    isLowerRow: true,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f2c3" strokeWidth="1.5">
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <path d="M14 17h8M18 14v6" />
      </svg>
    ),
  },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Inter:wght@300;400;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background-color: #0F1717;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
  }

  .top-nav {
    width: 90%;
    display: flex;
    justify-content: space-between;
    padding: 20px 0;
    border-bottom: 1px solid #2c3a3d;
    font-size: 0.9rem;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .brand span {
    font-weight: 600;
    letter-spacing: 0.5px;
    color: #ffffff;
  }

  .brand-icon {
    height: 24px;
    width: 24px;
    color: #00A890;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
  }

  .dot {
    height: 8px;
    width: 8px;
    background-color: #00A890;
    border-radius: 50%;
    box-shadow: 0 0 8px #00A890;
  }

  .container {
    max-width: 1100px;
    width: 100%;
    text-align: center;
    padding-top: 60px;
    padding-bottom: 60px;
  }

  .main-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 3rem;
    color: #00A890;
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
    background: #182724;
    padding: 30px;
    border-radius: 15px;
    text-align: left;
    cursor: pointer;
    user-select: none;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease-in-out;
  }

  .mode-card * {
    pointer-events: none;
  }

  .mode-card:hover {
    transform: translateY(-5px);
    border-color: #00f2c3;
    box-shadow: 0 10px 25px rgba(0, 242, 195, 0.1);
    background: linear-gradient(145deg, #141e21, #1a272b);
  }

  .mode-card:active {
    transform: scale(0.98);
    background-color: #1a272b;
  }

  .mode-card.glowing {
    border-color: #00f2c3;
    box-shadow: 0 0 20px rgba(0, 242, 195, 0.4);
  }

  .lower-row:nth-child(4) {
    grid-column: 2 / span 2;
  }

  .lower-row:nth-child(5) {
    grid-column: 4 / span 2;
  }

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
    color: #ffffff;
  }

  .mode-card p {
    color: #9aa4a6;
    line-height: 1.5;
    font-size: 0.95rem;
  }
`;

function selectMode(target) {
  setTimeout(() => {
    if (target) {
      window.location.href = target;
    } else {
      console.error("Target page not defined for this card.");
    }
  }, 150);
}

export default function RoverControlSystem() {
  const [glowingId, setGlowingId] = useState(null);

  const handleCardClick = (mode) => {
    setGlowingId(mode.id);
    selectMode(mode.target);
    setTimeout(() => setGlowingId(null), 300);
  };

  return (
    <>
      <style>{styles}</style>

      <header className="top-nav">
        <div className="brand">
          {/* Swap this SVG for your actual logo:
              <img src="image/vector.png" alt="Logo" className="brand-logo" /> */}
          <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
          </svg>
          <span>Rover Control System</span>
        </div>
        <div className="status">
          <span className="dot" />
          Connected
        </div>
      </header>

      <main className="container">
        <h1 className="main-title">Select Operational Mode</h1>

        <section className="mode-grid">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={[
                "mode-card",
                mode.isLowerRow ? "lower-row" : "",
                glowingId === mode.id ? "glowing" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleCardClick(mode)}
            >
              <div className="icon-box">{mode.icon}</div>
              <h3>{mode.title}</h3>
              <p>{mode.description}</p>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}
