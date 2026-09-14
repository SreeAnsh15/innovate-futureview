import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Globe,
  Play,
  Award,
  ChevronDown,
  Building2,
  Activity,
  Zap,
  Sliders,
  Palette,
  Sun,
  Moon,
  Eye,
  Shield,
  Stethoscope,
  HeartPulse,
  Compass,
  Siren,
  Car,
  Users,
  LifeBuoy,
  Wind,
  Cpu,
  Clock,
  Check
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { UNIVERSAL_WORLDS } from "../../data/universalWorlds";

const WORLD_ICONS = {
  "hospital-demo": Stethoscope,
  "school-demo": Building2,
  "transit-demo": Compass,
  "urban-disaster": Siren,
  "city-intersection": Car,
  "stadium-arena": Users,
  "highrise-rescue": LifeBuoy,
  "industrial-district": Wind,
  "power-water-grid": Cpu
};

export function Header({ onOpenJuryDemo, onOpenWowScreen }) {
  const {
    environment,
    currentEnv,
    environmentId,
    setEnvironmentId,
    defaultEnvironments,
    environments,
    activeWorld,
    switchWorld,
    isBharatMode,
    setIsBharatMode,
    bharatLanguage,
    setBharatLanguage,
    theme,
    setTheme,
    themes,
    isLightMode,
    toggleLightDarkMode,
    t,
    isEngineOnline
  } = useFutureView();

  const [showWorldMenu, setShowWorldMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const handleGlobalClick = () => {
      setShowWorldMenu(false);
      setShowLangMenu(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const worldsList = UNIVERSAL_WORLDS || environments || defaultEnvironments || [];
  const currentWorldObj = activeWorld || worldsList.find((w) => w.id === environmentId) || worldsList[0] || {
    id: "hospital-demo",
    name: "MetroCare Emergency Department",
    domain_name: "Healthcare Operations",
    size: "120 × 80 m"
  };

  const IconComponent = WORLD_ICONS[currentWorldObj.id] || Building2;

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
    { code: "ml", name: "Malayalam", native: "മലയാളം" }
  ];

  const currentLang = languages.find((l) => l.code === bharatLanguage) || languages[0];

  return (
    <header className="futureviewTopHeader">
      {/* Left: Global World Switcher Dropdown (The Core Gateway to all 8 Worlds) */}
      <div className="headerLeftSection">
        <div className="worldSwitcherContainer">
          <button
            className="worldSwitcherButton"
            onClick={(e) => {
              e.stopPropagation();
              setShowWorldMenu(!showWorldMenu);
              setShowLangMenu(false);
            }}
          >
            <div className="worldButtonIconWrap">
              <IconComponent size={14} />
            </div>
            <div className="worldButtonMeta">
              <span className="worldButtonPrefix">ACTIVE SIMULATION WORLD</span>
              <span className="worldButtonName">{currentWorldObj.name}</span>
            </div>
            <span className="worldDomainBadgePill">
              {currentWorldObj.domain_name || "Spatial Twin"}
            </span>
            <ChevronDown size={12} className="worldChevron" />
          </button>

          {showWorldMenu && (
            <div className="worldDropdownMenu" onClick={(e) => e.stopPropagation()}>
              <div className="worldDropdownHeader">
                <span>SIMULATION WORLDS & ENVIRONMENTS</span>
                <small>Select to transform simulation space</small>
              </div>
              <div className="worldDropdownList">
                {worldsList.map((world) => {
                  const WIcon = WORLD_ICONS[world.id] || Building2;
                  const isSelected = world.id === currentWorldObj.id;
                  return (
                    <button
                      key={world.id}
                      className={`worldDropdownItem ${isSelected ? "active" : ""}`}
                      onClick={() => {
                        if (switchWorld) {
                          switchWorld(world.id);
                        } else {
                          setEnvironmentId(world.id);
                        }
                        setShowWorldMenu(false);
                      }}
                    >
                      <div className="worldItemLeft">
                        <div className="worldItemIcon">
                          <WIcon size={14} />
                        </div>
                        <div className="worldItemText">
                          <b className="worldItemName">{world.name}</b>
                          <span className="worldItemDomain">{world.domain_name || world.type || "Physical Twin"} &bull; {world.size || "100 × 75 m"}</span>
                        </div>
                      </div>
                      {isSelected && <Check size={14} className="worldCheckIcon" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Engine Status, Time Travel, Language, & Jury Demo */}
      <div className="headerRightSection">
        {/* Real-time engine status */}
        <div className="engineStatusCapsule">
          <Activity size={12} className="engineLivePulse" />
          <span>ENGINE: <strong>REAL-TIME 60FPS</strong></span>
        </div>

        {/* Light / Dark Mode */}
        <button
          className="headerToolIconBtn"
          onClick={toggleLightDarkMode}
          title={isLightMode ? "Switch to Deep Space Obsidian" : "Switch to Crisp Light Canvas"}
        >
          {isLightMode ? <Moon size={14} /> : <Sun size={14} />}
        </button>

        {/* Multilingual Selector */}
        <div style={{ position: "relative" }}>
          <button
            className="headerLangBtn"
            onClick={(e) => {
              e.stopPropagation();
              setShowLangMenu(!showLangMenu);
              setShowWorldMenu(false);
            }}
          >
            <Globe size={13} />
            <span>{currentLang.native}</span>
            <ChevronDown size={10} />
          </button>

          {showLangMenu && (
            <div className="headerLangMenu" onClick={(e) => e.stopPropagation()}>
              <div className="langMenuHeader">SELECT BHARAT AI LANGUAGE</div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  className={`langMenuItem ${l.code === bharatLanguage ? "active" : ""}`}
                  onClick={() => {
                    setBharatLanguage(l.code);
                    setShowLangMenu(false);
                  }}
                >
                  <span>{l.native}</span>
                  <small>{l.name}</small>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* High-Impact Presentation Jury Demo */}
        <button className="juryPresentationBtn" onClick={onOpenJuryDemo}>
          <Sparkles size={14} />
          <span>JURY DEMO</span>
        </button>
      </div>
    </header>
  );
}
