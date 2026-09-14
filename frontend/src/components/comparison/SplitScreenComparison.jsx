import React, { useState, useEffect, useRef } from "react";
import {
  Scale,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Compass,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Activity,
  Users,
  Clock,
  ShieldCheck
} from "lucide-react";

export function SplitScreenComparison({
  environment,
  selectedObject,
  proposalPosition,
  simulationResult,
  onApplyRecommendation,
  setTab
}) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  const targetObj = selectedObject || environment.objects?.find((o) => o.movable !== false) || environment.objects?.[0] || { name: "Registration Desk", x: 38, y: 40 };
  const basePos = { x: targetObj.x, y: targetObj.y };
  const propPos = proposalPosition || { x: 75.0, y: 45.0 };

  const res = simulationResult;
  const metrics = res?.metrics;

  // Dual continuous simulation animation loop
  useEffect(() => {
    let animId;
    function loop() {
      if (isPlaying) {
        setProgress((prev) => (prev >= 1 ? 0 : prev + 0.003 * playbackSpeed));
      }
      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  return (
    <div className="splitScreenPage">
      {/* Top Header & Simulation Controls */}
      <div className="splitHeader">
        <div>
          <div className="splitTag">
            <Scale size={14} className="iconCyan" />
            <span>DUAL SIMULATION ENGINE</span>
          </div>
          <h2>Current Reality vs Proposed What-If Live Comparison</h2>
          <span className="splitSub">
            Simultaneous multi-agent pedestrian flow across baseline & proposed spatial layouts
          </span>
        </div>

        <div className="splitControls">
          <button
            className={`playBtn ${isPlaying ? "playing" : ""}`}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause size={15} /> : <Play size={15} />}
            <span>{isPlaying ? "PAUSE SIMULATION" : "RESUME SIMULATION"}</span>
          </button>

          <div className="speedGroup">
            {[0.5, 1, 2, 5].map((s) => (
              <button
                key={s}
                className={`speedBtn ${playbackSpeed === s ? "active" : ""}`}
                onClick={() => setPlaybackSpeed(s)}
              >
                {s}x
              </button>
            ))}
          </div>

          <button className="secondaryBtn small" onClick={() => setProgress(0)}>
            <RotateCcw size={13} />
            <span>Reset Time</span>
          </button>
        </div>
      </div>

      {/* Dual Split Screen Canvas Viewports */}
      <div className="splitCanvasGrid">
        {/* Left Side: Current Reality */}
        <div className="splitPane currentPane">
          <div className="paneHeader">
            <div className="paneTitleRow">
              <span className="paneBadge baseline">CURRENT REALITY</span>
              <b className="paneScore">89/100 Baseline Score</b>
            </div>
            <p className="paneDesc">Original entrance foyer registration layout with direct circulation.</p>
          </div>

          <div className="splitCanvasFrame">
            <svg className="splitSvg" viewBox="0 0 100 80">
              {/* Zones */}
              <rect x="5" y="28" width="25" height="24" fill="rgba(80, 221, 255, 0.06)" stroke="rgba(80, 221, 255, 0.2)" rx="2" />
              <rect x="58" y="12" width="28" height="22" fill="rgba(255, 199, 101, 0.06)" stroke="rgba(255, 199, 101, 0.2)" rx="2" />
              <rect x="58" y="48" width="28" height="22" fill="rgba(255, 100, 123, 0.06)" stroke="rgba(255, 100, 123, 0.2)" rx="2" />

              {/* Baseline Path */}
              <path
                d={`M 10,40 L ${basePos.x},${basePos.y} L 68,22 L 92,57`}
                fill="none"
                stroke="#50ddff"
                strokeWidth="2.5"
                opacity="0.85"
              />

              {/* Congestion Ring (Low) */}
              <circle cx={basePos.x} cy={basePos.y} r="7" fill="rgba(80, 221, 255, 0.15)" stroke="#50ddff" strokeWidth="0.8" />

              {/* Objects */}
              <rect x="3" y="32" width="10" height="16" fill="#142636" stroke="#50ddff" rx="2" />
              <text x="8" y="41" fill="#50ddff" fontSize="2.8" fontWeight="bold" textAnchor="middle">ENTRY</text>

              <rect x="58" y="14" width="20" height="16" fill="#18241e" stroke="#4fe0a4" rx="2" />
              <text x="68" y="23" fill="#4fe0a4" fontSize="2.8" fontWeight="bold" textAnchor="middle">WAITING</text>

              <rect x="58" y="50" width="20" height="16" fill="#29161a" stroke="#ff647b" rx="2" />
              <text x="68" y="59" fill="#ff647b" fontSize="2.8" fontWeight="bold" textAnchor="middle">EMERGENCY</text>

              {/* Target Desk at baseline */}
              <rect x={basePos.x - 7} y={basePos.y - 4} width="14" height="8" fill="#50ddff" rx="2" />
              <text x={basePos.x} y={basePos.y + 1} fill="#03080d" fontSize="2.4" fontWeight="800" textAnchor="middle">REGISTRATION</text>

              {/* Agents Moving along baseline path */}
              <circle cx={10 + (basePos.x - 10) * progress} cy={40 + (basePos.y - 40) * progress} r="1.8" fill="#50ddff" stroke="#ffffff" strokeWidth="0.6" />
              <circle cx={basePos.x + (68 - basePos.x) * progress} cy={basePos.y + (22 - basePos.y) * progress} r="1.8" fill="#ffc765" stroke="#ffffff" strokeWidth="0.6" />
              <circle cx={68 + (92 - 68) * progress} cy={22 + (57 - 22) * progress} r="1.8" fill="#a78bfa" stroke="#ffffff" strokeWidth="0.6" />
            </svg>

            <div className="paneLiveStats">
              <span>Walking Time: <strong>01:12</strong></span>
              <span>Queue Length: <strong>3 users</strong></span>
              <span>Congestion: <strong className="good">LOW (31/100)</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: Proposed What-If */}
        <div className="splitPane proposedPane">
          <div className="paneHeader">
            <div className="paneTitleRow">
              <span className="paneBadge proposed">PROPOSED WHAT-IF</span>
              <b className="paneScore bad">{res?.score || 48}/100 Proposed Score</b>
            </div>
            <p className="paneDesc">Reconfigured registration desk in east wing with extended walking routes.</p>
          </div>

          <div className="splitCanvasFrame">
            <svg className="splitSvg" viewBox="0 0 100 80">
              {/* Zones */}
              <rect x="5" y="28" width="25" height="24" fill="rgba(80, 221, 255, 0.06)" stroke="rgba(80, 221, 255, 0.2)" rx="2" />
              <rect x="58" y="12" width="28" height="22" fill="rgba(255, 199, 101, 0.06)" stroke="rgba(255, 199, 101, 0.2)" rx="2" />
              <rect x="58" y="48" width="28" height="22" fill="rgba(255, 100, 123, 0.06)" stroke="rgba(255, 100, 123, 0.2)" rx="2" />

              {/* Proposed Rerouted Path */}
              <path
                d={`M 10,40 Q ${(10 + propPos.x) / 2},${propPos.y} ${propPos.x},${propPos.y} T 68,22 T 92,57`}
                fill="none"
                stroke="#ff647b"
                strokeWidth="2.5"
                strokeDasharray="3 2"
                opacity="0.85"
              />

              {/* Congestion Ring (Critical) */}
              <circle cx={propPos.x} cy={propPos.y} r="14" fill="rgba(255, 100, 123, 0.25)" stroke="#ff647b" strokeWidth="1" className="pulseSlow" />

              {/* Objects */}
              <rect x="3" y="32" width="10" height="16" fill="#142636" stroke="#50ddff" rx="2" />
              <text x="8" y="41" fill="#50ddff" fontSize="2.8" fontWeight="bold" textAnchor="middle">ENTRY</text>

              <rect x="58" y="14" width="20" height="16" fill="#18241e" stroke="#4fe0a4" rx="2" />
              <text x="68" y="23" fill="#4fe0a4" fontSize="2.8" fontWeight="bold" textAnchor="middle">WAITING</text>

              <rect x="58" y="50" width="20" height="16" fill="#29161a" stroke="#ff647b" rx="2" />
              <text x="68" y="59" fill="#ff647b" fontSize="2.8" fontWeight="bold" textAnchor="middle">EMERGENCY</text>

              {/* Target Desk at proposed */}
              <rect x={propPos.x - 7} y={propPos.y - 4} width="14" height="8" fill="#ff647b" rx="2" />
              <text x={propPos.x} y={propPos.y + 1} fill="#ffffff" fontSize="2.4" fontWeight="800" textAnchor="middle">REGISTRATION</text>

              {/* Agents Moving along proposed path */}
              <circle cx={10 + (propPos.x - 10) * progress} cy={40 + (propPos.y - 40) * progress} r="1.8" fill="#50ddff" stroke="#ffffff" strokeWidth="0.6" />
              <circle cx={propPos.x + (68 - propPos.x) * progress} cy={propPos.y + (22 - propPos.y) * progress} r="1.8" fill="#ffc765" stroke="#ffffff" strokeWidth="0.6" />
              <circle cx={68 + (92 - 68) * progress} cy={22 + (57 - 22) * progress} r="1.8" fill="#a78bfa" stroke="#ffffff" strokeWidth="0.6" />
            </svg>

            <div className="paneLiveStats">
              <span>Walking Time: <strong className="bad">02:41</strong></span>
              <span>Queue Length: <strong className="bad">12 users</strong></span>
              <span>Congestion: <strong className="bad">HIGH (48/100)</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Metrics Live Scorecard */}
      <div className="splitScorecardTable">
        <table className="docTable">
          <thead>
            <tr>
              <th>METRIC CRITERIA</th>
              <th>CURRENT REALITY</th>
              <th>PROPOSED WHAT-IF</th>
              <th>COMPARATIVE IMPACT (Δ)</th>
              <th>VERDICT STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Average Walking Distance</td>
              <td>21.4m</td>
              <td>{metrics?.walking_distance?.proposed || 49.8}m</td>
              <td className="bad">+132.8% (+28.4m)</td>
              <td><span className="verdictPill avoid">WORSE (-132%)</span></td>
            </tr>
            <tr>
              <td>Registration Queue Wait Time</td>
              <td>01m 12s</td>
              <td>03m 42s</td>
              <td className="bad">+02m 30s queue delay</td>
              <td><span className="verdictPill avoid">WORSE</span></td>
            </tr>
            <tr>
              <td>Corridor Congestion Index</td>
              <td>31/100</td>
              <td>{metrics?.congestion?.proposed || 48}/100</td>
              <td className="bad">+17 points choke surge</td>
              <td><span className="verdictPill avoid">WORSE</span></td>
            </tr>
            <tr>
              <td>ADA Barrier-Free Rating</td>
              <td>94/100</td>
              <td>{metrics?.accessibility?.proposed || 78}/100</td>
              <td className="bad">-16 points</td>
              <td><span className="verdictPill avoid">WORSE</span></td>
            </tr>
            <tr>
              <td>Emergency Egress Safety</td>
              <td>92/100</td>
              <td>{metrics?.safety?.proposed || 68}/100</td>
              <td className="bad">-24 points</td>
              <td><span className="verdictPill avoid">WORSE</span></td>
            </tr>
            <tr className="summaryRow">
              <td><strong>OVERALL DECISION SCORE</strong></td>
              <td><strong>89/100</strong></td>
              <td><strong className="bad">{res?.score || 48}/100</strong></td>
              <td className="bad"><strong>-41 points net degradation</strong></td>
              <td><span className="verdictPill avoid"><strong>AVOID PROPOSAL</strong></span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
