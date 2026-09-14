import React from "react";
import {
  Globe2,
  Compass,
  Siren,
  Activity,
  Car,
  Users,
  LifeBuoy,
  Wind,
  Cpu,
  ArrowRight,
  Sparkles,
  Layers,
  Building2,
  CheckCircle2,
  Zap,
  Play
} from "lucide-react";
import { UNIVERSAL_WORLDS } from "../../data/universalWorlds";
import { useFutureView } from "../../context/FutureViewContext";

const WORLD_ICONS = {
  "hospital-demo": Activity,
  "urban-disaster": Siren,
  "city-intersection": Car,
  "stadium-arena": Users,
  "highrise-rescue": LifeBuoy,
  "industrial-district": Wind,
  "power-water-grid": Cpu,
  "school-demo": Building2,
  "transit-demo": Compass
};

const WORLD_ACCENTS = {
  "hospital-demo": "#38bdf8",
  "urban-disaster": "#f43f5e",
  "city-intersection": "#f59e0b",
  "stadium-arena": "#a855f7",
  "highrise-rescue": "#10b981",
  "industrial-district": "#00e5ff",
  "power-water-grid": "#6366f1",
  "school-demo": "#10b981",
  "transit-demo": "#38bdf8"
};

export function WorldsLibraryView({ setTab }) {
  const {
    activeWorld,
    switchWorld,
    activeDomain,
    switchDomain,
    setSelectedModule,
    showToast
  } = useFutureView();

  const handleEnterWorld = (world) => {
    switchWorld(world.id);
    if (world.domain) {
      switchDomain(world.domain);
    }
    showToast(`Teleporting to ${world.name}...`, "info");
    if (setTab) setTab("spatial_simulator");
  };

  return (
    <div className="worldsLibraryContainer">
      {/* Header Banner */}
      <div className="worldsLibraryHero">
        <div className="worldsHeroBadge">
          <Globe2 size={14} className="iconCyan" />
          <span>UNIVERSAL SIMULATION WORLDS</span>
        </div>
        <h1 className="worldsHeroTitle">
          One Engine. <span className="textGradientCyan">Many Real Worlds.</span>
        </h1>
        <p className="worldsHeroSubtitle">
          Select any real-world simulation environment to test spatial mutations, demand surges, multi-agent flows, disaster cascades, and deterministic interventions.
        </p>
      </div>

      {/* World Cards Grid */}
      <div className="worldsGrid">
        {UNIVERSAL_WORLDS.map((world) => {
          const Icon = WORLD_ICONS[world.id] || Compass;
          const accentColor = WORLD_ACCENTS[world.id] || "#38bdf8";
          const isCurrentActive = activeWorld?.id === world.id;

          return (
            <div
              key={world.id}
              className={`worldPortalCard ${isCurrentActive ? "active" : ""}`}
              style={{ "--world-accent": accentColor }}
            >
              {/* Card Header */}
              <div className="worldCardTop">
                <div className="worldIconBox" style={{ background: `${accentColor}18`, color: accentColor }}>
                  <Icon size={20} />
                </div>
                <div className="worldBadgeGroup">
                  <span className="worldTypeBadge">{world.type}</span>
                  {isCurrentActive && <span className="worldActiveDot">ACTIVE</span>}
                </div>
              </div>

              {/* Card Body */}
              <div className="worldCardBody">
                <h3 className="worldCardTitle">{world.name}</h3>
                <span className="worldCardScale">Physical Footprint: <strong>{world.size}</strong></span>
                <p className="worldCardSummary">{world.summary}</p>

                {/* Primary What-If Scenario Question */}
                <div className="worldWhatIfBox">
                  <span className="worldWhatIfTag">PRIMARY WHAT-IF EXPERIMENT:</span>
                  <span className="worldWhatIfText">"{world.primary_what_if}"</span>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="worldCardFooter">
                <div className="worldSupportedPills">
                  {world.supported_domains?.map((dom) => (
                    <span key={dom} className="worldDomainPill">{dom.toUpperCase()}</span>
                  ))}
                </div>

                <button
                  className={`worldEnterBtn ${isCurrentActive ? "active" : ""}`}
                  onClick={() => handleEnterWorld(world)}
                >
                  <span>{isCurrentActive ? "EXPERIMENT NOW" : "ENTER WORLD"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
