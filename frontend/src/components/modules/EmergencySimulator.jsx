import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  AlertTriangle,
  ShieldAlert,
  Play,
  RotateCcw,
  DoorOpen,
  Users,
  Sparkles,
  Activity,
  Zap,
  Waves,
  Truck,
  PowerOff,
  ChevronRight
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function EmergencySimulator() {
  const {
    currentEnv,
    proposalPosition,
    activeEmergency,
    triggerEmergency,
    clearEmergency,
    agentCount
  } = useFutureView();

  const [selectedEmergency, setSelectedEmergency] = useState("fire");
  const [isEvacuating, setIsEvacuating] = useState(false);
  const [evacTimer, setEvacTimer] = useState(0);
  const canvasRef = useRef(null);

  const emergencies = [
    {
      id: "fire",
      name: "Structural Fire Outbreak",
      icon: Flame,
      color: "#f43f5e",
      desc: "Flames in east corridor block secondary exits and generate heavy smoke obstruction.",
      baseEvacTime: 78,
      blockedExit: "East Wing Stairwell B",
      safestExit: "Main West Entrance Ramp"
    },
    {
      id: "flood",
      name: "Flash Flood / Water Surge",
      icon: Waves,
      color: "#0284c7",
      desc: "Ground floor ingress flooded; walking speed reduced by 35% with submerged zones.",
      baseEvacTime: 115,
      blockedExit: "Basement Parking Ramp",
      safestExit: "Elevated North Concourse Walkway"
    },
    {
      id: "earthquake",
      name: "Earthquake Tremor Egress",
      icon: AlertTriangle,
      color: "#f59e0b",
      desc: "Debris hazards in main spine; requires urgent egress to open-air assembly zones.",
      baseEvacTime: 92,
      blockedExit: "Central Atrium Glassway",
      safestExit: "Exterior Courtyard Gate 2"
    },
    {
      id: "road_blockage",
      name: "Ambulance Bay Road Blockage",
      icon: Truck,
      color: "#e11d48",
      desc: "Emergency vehicles block curbside ingress; reroutes patient transfer flow.",
      baseEvacTime: 84,
      blockedExit: "Ambulance Bay Curbside",
      safestExit: "Secondary Service Bay D"
    },
    {
      id: "power_outage",
      name: "Total Grid Blackout",
      icon: PowerOff,
      color: "#8b5cf6",
      desc: "Auxiliary lighting only; reduced visual range and slower corridor navigation.",
      baseEvacTime: 104,
      blockedExit: "Elevator Banks (Inoperable)",
      safestExit: "Illuminated South Egress Stair"
    }
  ];

  const currentScenario = emergencies.find((e) => e.id === selectedEmergency) || emergencies[0];
  const calculatedEvacTime = currentScenario.baseEvacTime + (proposalPosition.x > 60 ? 32 : 0);

  // Evacuation Timer Animation
  useEffect(() => {
    let interval = null;
    if (activeEmergency) {
      setIsEvacuating(true);
      setEvacTimer(0);
      interval = setInterval(() => {
        setEvacTimer((prev) => {
          if (prev >= calculatedEvacTime) {
            clearInterval(interval);
            return calculatedEvacTime;
          }
          return prev + 1;
        });
      }, 50);
    } else {
      setIsEvacuating(false);
      setEvacTimer(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEmergency, calculatedEvacTime]);

  // Evacuation Canvas Visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    let frameId;
    let particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        speed: 1.5 + Math.random() * 1.5,
        targetX: 10,
        targetY: 40,
        color: i % 5 === 0 ? "#f43f5e" : i % 4 === 0 ? "#fbbf24" : "#38bdf8"
      });
    }

    const render = () => {
      ctx.fillStyle = "#03070d";
      ctx.fillRect(0, 0, w, h);

      // Draw Danger Zone
      if (activeEmergency) {
        ctx.fillStyle = "rgba(244, 63, 94, 0.15)";
        ctx.strokeStyle = "#f43f5e";
        ctx.lineWidth = 2;
        ctx.fillRect(w * 0.6, h * 0.2, w * 0.35, h * 0.6);
        ctx.strokeRect(w * 0.6, h * 0.2, w * 0.35, h * 0.6);

        ctx.fillStyle = "#f43f5e";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.fillText("HAZARD ZONE: EVACUATE IMMEDIATELY", w * 0.62, h * 0.26);
      }

      // Draw Evacuation Arrows
      ctx.strokeStyle = activeEmergency ? "#10b981" : "rgba(56, 189, 248, 0.3)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(w * 0.75, h * 0.5);
      ctx.lineTo(w * 0.38, h * 0.45);
      ctx.lineTo(w * 0.12, h * 0.4);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Exit Anchor
      ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(w * 0.05, h * 0.32, w * 0.12, h * 0.18, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#10b981";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SAFEST EXIT", w * 0.11, h * 0.42);

      // Draw Moving Evacuating Agents
      particles.forEach((p) => {
        if (activeEmergency) {
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist > 2) {
            p.x += (dx / dist) * p.speed * 0.4;
            p.y += (dy / dist) * p.speed * 0.4;
          }
        }

        const px = (p.x / 100) * w;
        const py = (p.y / 100) * h;

        ctx.fillStyle = activeEmergency ? "#10b981" : p.color;
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
      });

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frameId);
  }, [activeEmergency]);

  return (
    <div className="modulePage">
      {/* 1. Module Header */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge red">
            <Flame size={14} />
            <span>MODULE 06</span>
          </div>
          <h2 className="moduleTitle">Emergency & Disaster Evacuation Simulator</h2>
          <span className="moduleSubtitle">
            Dynamic life-safety simulation testing egress capacity, corridor choke hazards, and vulnerable patient evacuation times under disaster conditions.
          </span>
        </div>

        {/* Header Stats */}
        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>CALCULATED EVAC TIME</small>
            <b className={calculatedEvacTime > 90 ? "bad" : "good"}>
              {calculatedEvacTime}s ({Math.floor(calculatedEvacTime / 60)}m {calculatedEvacTime % 60}s)
            </b>
          </div>
          <div className="headerStatBox">
            <small>SAFEST EGRESS</small>
            <b className="green">{currentScenario.safestExit}</b>
          </div>
          <div className="headerStatBox">
            <small>BLOCKED EXITS</small>
            <b className="bad">{activeEmergency ? "2 Exits Blocked" : "0 Blocked"}</b>
          </div>
          <div className="headerStatBox">
            <small>EVACUATION STATE</small>
            <b className={activeEmergency ? "bad pulse" : "good"}>
              {activeEmergency ? "ACTIVE EVACUATION" : "READY"}
            </b>
          </div>
        </div>
      </div>

      {/* 2. Emergency Scenarios Palette */}
      <div className="emergencyScenariosRow">
        {emergencies.map((em) => {
          const Icon = em.icon;
          const isSelected = selectedEmergency === em.id;
          return (
            <button
              key={em.id}
              className={`emergencyScenarioCard ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedEmergency(em.id)}
            >
              <div className="emCardTop">
                <div className="emIconWrap" style={{ backgroundColor: `${em.color}22`, color: em.color }}>
                  <Icon size={18} />
                </div>
                <span className="emTimePill">{em.baseEvacTime}s Evac</span>
              </div>
              <strong className="emName">{em.name}</strong>
              <p className="emDesc">{em.desc}</p>
            </button>
          );
        })}
      </div>

      {/* 3. Evacuation Trigger Bar */}
      <div className="emergencyActionBar">
        <div className="emActionLeft">
          <ShieldAlert size={20} className="iconRed" />
          <div>
            <b>READY TO SIMULATE: {currentScenario.name.toUpperCase()}</b>
            <span>Simulating {agentCount} people evacuating to {currentScenario.safestExit}</span>
          </div>
        </div>

        <div className="emActionRight">
          {activeEmergency ? (
            <button className="primaryBtn red" onClick={clearEmergency}>
              <RotateCcw size={14} />
              <span>Reset Emergency Mode</span>
            </button>
          ) : (
            <button
              className="primaryBtn red pulse"
              onClick={() => triggerEmergency(selectedEmergency)}
            >
              <Flame size={14} />
              <span>ACTIVATE {currentScenario.name.toUpperCase()}</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Canvas & Egress Intelligence */}
      <div className="moduleWorkspaceGrid">
        {/* Left 65%: Animated Evacuation Map */}
        <div className="canvasCard">
          <div className="canvasCardHeader">
            <div className="canvasHeaderLeft">
              <span className={`dotLive ${activeEmergency ? "redPulse" : ""}`} />
              <b>EVACUATION CHOREOGRAPHY MAP</b>
              <span className="canvasDimText">&bull; Evacuation Time: {evacTimer}s / {calculatedEvacTime}s</span>
            </div>
            <span className="emergencyExitBadge">
              <DoorOpen size={13} />
              <span>{currentScenario.safestExit}</span>
            </span>
          </div>

          <div className="canvasWrapper">
            <canvas ref={canvasRef} width={1000} height={600} className="liveSimCanvas" />
          </div>
        </div>

        {/* Right 35%: AI Emergency Protocols & Bottleneck Assessment */}
        <div className="moduleSidePanel">
          <div className="sidePanelCard aiEmergencyCard">
            <div className="cardHead">
              <Sparkles size={16} className="iconCyan" />
              <b>AI Life-Safety Emergency Response</b>
            </div>

            <p className="aiProtocolText">
              {proposalPosition.x > 60
                ? `CRITICAL RISK: Relocating registration desk to the East corridor adds +32 seconds to total building evacuation because queuing stanchions obstruct the primary secondary egress door. Recommendation: Maintain a 3.0m sterile buffer around all fire exits.`
                : `OPTIMAL EGRESS: Layout configuration satisfies NFPA 101 Life Safety standards. Direct straight-line paths permit complete evacuation within ${calculatedEvacTime} seconds.`}
            </p>

            <div className="egressStatsList">
              <div className="egressStatItem">
                <small>VULNERABLE USERS AT RISK</small>
                <b className={proposalPosition.x > 60 ? "bad" : "good"}>
                  {proposalPosition.x > 60 ? "14 Wheelchair & Elderly Detoured" : "Zero High Hazards"}
                </b>
              </div>
              <div className="egressStatItem">
                <small>CRITICAL CHOKE POINT</small>
                <b className="amber">Central Corridor Merging Foyer</b>
              </div>
              <div className="egressStatItem">
                <small>FIRE DOOR ACCESSIBILITY</small>
                <b className="good">100% Operational (West Exit)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
