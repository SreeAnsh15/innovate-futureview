import React from "react";
import { 
  Compass, Flame, Activity, ShieldAlert, Users, 
  Zap, Wind, Building2, ChevronRight, Sparkles 
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";
import { DOMAINS_LIST } from "../../data/domainsData";

const DOMAIN_ICONS = {
  spatial: Compass,
  disaster: Flame,
  healthcare: Activity,
  road: ShieldAlert,
  crowd: Users,
  rescue: Zap,
  environmental: Wind,
  infrastructure: Building2
};

export function DomainNavigator({ className = "" }) {
  const { 
    activeDomain, 
    switchDomain,
    selectedModule,
    setSelectedModule
  } = useFutureView();

  return (
    <div className={`domainNavContainer ${className}`}>
      <div className="domainNavScroll">
        {DOMAINS_LIST.map((domain) => {
          const Icon = DOMAIN_ICONS[domain.id] || Compass;
          const isActive = activeDomain === domain.id;

          return (
            <button
              key={domain.id}
              className={`domainPill ${isActive ? "active" : ""}`}
              onClick={() => {
                switchDomain(domain.id);
                // If on a domain view, switch to the corresponding domain view or keep in dashboard
                if (selectedModule !== "dashboard" && selectedModule !== "threed_view" && selectedModule !== "ar_view" && selectedModule !== "spatial_simulator") {
                  setSelectedModule(`domain_${domain.id}`);
                }
              }}
              title={domain.description}
            >
              <div className="domainPillIcon" style={{ color: domain.color }}>
                <Icon size={14} />
              </div>
              <div className="domainPillMeta">
                <span className="domainPillNum">{domain.num}</span>
                <span className="domainPillName">{domain.name}</span>
              </div>
              {isActive && <div className="activeGlowIndicator" style={{ background: domain.color }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
