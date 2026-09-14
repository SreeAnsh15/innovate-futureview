import React from "react";
import {
  GitBranch,
  Zap,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  BrainCircuit,
  Layers,
  Activity
} from "lucide-react";
import { CausalCascadeGraph } from "../simulation/CausalCascadeGraph";
import { UniversalTimelineScrubber } from "../simulation/UniversalTimelineScrubber";
import { useFutureView } from "../../context/FutureViewContext";

export function CascadeLabView({ setTab }) {
  const { activeWorld, activeDomain, simulationResult } = useFutureView();

  return (
    <div className="cascadeLabPage">
      {/* Header Banner */}
      <div className="cascadeLabHero">
        <div className="cascadeBadge">
          <GitBranch size={14} className="iconCyan" />
          <span>DETERMINISTIC CAUSAL GRAPH (DAG)</span>
        </div>
        <h1 className="cascadeMainTitle">
          Consequence Cascade &bull; <span className="textGradientCyan">What Breaks First?</span>
        </h1>
        <p className="cascadeSubtitle">
          Discover how localized perturbations propagate into systemic failures across space, velocity, and time.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="cascadeContentGrid">
        {/* Timeline Scrubber */}
        <div className="cascadeTimelineCard">
          <div className="cardHeaderSimple">
            <Clock size={15} className="iconCyan" />
            <b>TIME-SERIES SYSTEM PROPAGATION (0 - 60 MIN)</b>
          </div>
          <UniversalTimelineScrubber />
        </div>

        {/* Interactive Causal Graph */}
        <div className="cascadeGraphContainer">
          <CausalCascadeGraph />
        </div>
      </div>
    </div>
  );
}
