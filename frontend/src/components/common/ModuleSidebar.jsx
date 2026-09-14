import React from "react";
import {
  LayoutDashboard,
  Globe2,
  Compass,
  GitBranch,
  Scale,
  Cuboid,
  Eye,
  FileSpreadsheet,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
  Cpu
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function ModuleSidebar() {
  const {
    selectedModule,
    setSelectedModule,
    activeWorld,
    currentEnv,
    activeDomain,
    simulationResult
  } = useFutureView();

  const currentWorldObj = activeWorld || currentEnv || {
    name: "MetroCare Emergency Department",
    domain_name: "Healthcare Operations"
  };

  const navSections = [
    {
      title: "INTELLIGENCE DOCK",
      items: [
        {
          id: "dashboard",
          num: "01",
          label: "Command Center",
          icon: LayoutDashboard,
          badge: "CORE"
        },
        {
          id: "worlds_library",
          num: "02",
          label: "Explore Worlds",
          icon: Globe2,
          badge: "8 WORLDS"
        },
        {
          id: "spatial_simulator",
          num: "03",
          label: "What-If Spatial Lab",
          icon: Compass,
          badge: "HOT"
        },
        {
          id: "cascade_lab",
          num: "04",
          label: "Consequence Cascade",
          icon: GitBranch,
          badge: "DAG"
        },
        {
          id: "scenario_compare",
          num: "05",
          label: "Alternative Futures",
          icon: Scale,
          badge: "PARETO"
        }
      ]
    },
    {
      title: "SPATIAL & GOVERNANCE",
      items: [
        {
          id: "threed_view",
          num: "06",
          label: "3D Simulation Space",
          icon: Cuboid,
          badge: "3D"
        },
        {
          id: "ar_view",
          num: "07",
          label: "Spatial Vision (AR)",
          icon: Eye,
          badge: "WEBXR"
        },
        {
          id: "decision_report",
          num: "08",
          label: "Decision Dossier",
          icon: FileSpreadsheet,
          badge: "SHA-256"
        }
      ]
    }
  ];

  return (
    <aside className="futureviewSidebar">
      {/* Brand Header */}
      <div className="sidebarHeroBlock" onClick={() => setSelectedModule("dashboard")}>
        <div className="sidebarLogoGem">
          <Sparkles size={16} />
        </div>
        <div className="sidebarBrandMeta">
          <b className="sidebarBrandName">FUTUREVIEW</b>
          <span className="sidebarTagline">What-If Layout Simulation</span>
        </div>
      </div>

      {/* Navigation Links Scroll */}
      <div className="sidebarNavBody">
        {navSections.map((sec) => (
          <div key={sec.title} className="sidebarNavGroup">
            <span className="sidebarSectionHeading">{sec.title}</span>
            <div className="sidebarNavList">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = selectedModule === item.id;
                return (
                  <button
                    key={item.id}
                    className={`sidebarNavButton ${isActive ? "active" : ""}`}
                    onClick={() => setSelectedModule(item.id)}
                    title={item.label}
                  >
                    <div className="navButtonLeft">
                      <span className="navButtonIndex">{item.num}</span>
                      <Icon size={14} className={isActive ? "iconActive" : "iconMuted"} />
                      <span className="navButtonTitle">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`navButtonBadge ${isActive ? "active" : ""}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Active Simulation Twin Footer Pill */}
      <div className="sidebarFooterDock">
        <div className="activeTwinPill">
          <div className="activeTwinPulse" />
          <div className="activeTwinMeta">
            <span className="activeTwinLabel">ACTIVE SIMULATION</span>
            <b className="activeTwinName">{currentWorldObj.name}</b>
          </div>
        </div>
      </div>
    </aside>
  );
}
