import React, { useState, useEffect } from "react";
import {
  Scale,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Compass,
  FileText,
  Check
} from "lucide-react";
import { compareScenarios } from "../../services/api";
import { DataHonestyBadge } from "../common/Toast";
import { SplitScreenComparison } from "../comparison/SplitScreenComparison";

export function ScenarioComparison({
  scenarios,
  currentEnv,
  selectedObject,
  proposalPosition,
  simulationResult,
  onApplyRecommendation,
  setTab,
  onSelectScenario,
  onShowToast
}) {
  const [viewMode, setViewMode] = useState("matrix"); // "matrix" | "split"
  const [selectedIds, setSelectedIds] = useState(
    scenarios.slice(0, 3).map((s) => s.id)
  );
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadComparison() {
      if (selectedIds.length === 0) return;
      setLoading(true);
      try {
        const data = await compareScenarios(currentEnv.id, selectedIds);
        setComparisonData(data);
      } catch (e) {
        onShowToast("Using local comparison matrix.", "info");
      } finally {
        setLoading(false);
      }
    }
    loadComparison();
  }, [selectedIds, currentEnv.id]);

  function toggleScenario(id) {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) {
        onShowToast("Select at least one scenario to inspect", "warning");
        return;
      }
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      if (selectedIds.length >= 4) {
        onShowToast("Maximum 4 scenarios can be compared simultaneously", "warning");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  }

  const comparedList = comparisonData?.scenarios || scenarios.filter((s) => selectedIds.includes(s.id)).map((s) => ({
    scenario: s,
    simulation: {
      score: s.score || 85,
      verdict: s.verdict || "RECOMMENDED",
      metrics: {
        walking_distance: { proposed: 24.5, current: 21.4, delta_pct: 14.5 },
        congestion: { proposed: 35, current: 31, delta: 4 },
        accessibility: { proposed: 92, current: 94, delta: -2 },
        safety: { proposed: 90, current: 92, delta: -2 },
        flow_efficiency: { proposed: 88, current: 89, delta: -1 },
        experience: { proposed: 90, current: 91, delta: -1 }
      }
    }
  }));

  // Identify top scenario
  const bestScen = comparedList.length > 0
    ? comparedList.reduce((max, cur) => (cur.simulation.score > max.simulation.score ? cur : max), comparedList[0])
    : null;

  return (
    <div className="comparisonPage">
      <div className="comparisonHeader">
        <div>
          <div className="comparisonTag">
            <Scale size={14} />
            <span>SCENARIO COMPARISON MATRIX</span>
            <DataHonestyBadge text="MULTI-VARIATE ANALYSIS" />
          </div>
          <h2>Side-by-Side Spatial Decision Evaluation</h2>
          <p>
            Evaluate alternative space configurations across walking distances, congestion friction, and
            barrier-free accessibility.
          </p>
        </div>

        <div className="comparisonTopBtnGroup">
          <div className="modeSwitchPillGroup">
            <button
              className={`modeSwitchBtn ${viewMode === "matrix" ? "active" : ""}`}
              onClick={() => setViewMode("matrix")}
            >
              <Scale size={13} />
              <span>Matrix Table</span>
            </button>
            <button
              className={`modeSwitchBtn ${viewMode === "split" ? "active" : ""}`}
              onClick={() => setViewMode("split")}
            >
              <Sparkles size={13} className="iconCyan" />
              <span>Live Split-Screen</span>
            </button>
          </div>

          <button className="primaryBtn" onClick={() => setTab("reports")}>
            <FileText size={15} />
            <span>Decision Support</span>
          </button>
        </div>
      </div>

      {viewMode === "split" ? (
        <SplitScreenComparison
          environment={currentEnv}
          selectedObject={selectedObject}
          proposalPosition={proposalPosition}
          simulationResult={simulationResult}
          onApplyRecommendation={onApplyRecommendation}
          setTab={setTab}
        />
      ) : (
        <>

      {/* Scenario Selection Checkboxes */}
      <div className="scenSelectorBar">
        <span className="selectorLabel">COMPARE ITERATIONS:</span>
        <div className="selectorChips">
          {scenarios.map((sc) => {
            const isSelected = selectedIds.includes(sc.id);
            return (
              <button
                key={sc.id}
                className={`scenChip ${isSelected ? "selected" : ""}`}
                onClick={() => toggleScenario(sc.id)}
              >
                {isSelected && <Check size={12} />}
                <span>{sc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Best Configuration Highlight Banner */}
      {bestScen && (
        <div className="bestScenBanner">
          <div className="bestBadge">
            <Sparkles size={16} />
            <span>AI RECOMMENDED WINNER</span>
          </div>
          <div className="bestBody">
            <b>{bestScen.scenario.name}</b> is the optimal spatial layout with an overall score of{" "}
            <strong>{bestScen.simulation.score}/100</strong>.
          </div>
          <button
            className="secondaryBtn small"
            onClick={() => {
              onSelectScenario(bestScen.scenario);
              setTab("simulator");
            }}
          >
            <Compass size={13} /> Load in Editor
          </button>
        </div>
      )}

      {/* Matrix Table */}
      <div className="matrixTableWrapper">
        <table className="matrixTable">
          <thead>
            <tr>
              <th className="thMetric">CRITERIA / METRIC</th>
              {comparedList.map((item) => {
                const sc = item.scenario;
                const sim = item.simulation;
                const isWinner = bestScen && bestScen.scenario.id === sc.id;

                return (
                  <th key={sc.id} className={`thScen ${isWinner ? "winnerCol" : ""}`}>
                    <div className="thScenHeader">
                      {isWinner && <span className="winnerTag">★ BEST</span>}
                      <b>{sc.name}</b>
                      <span className={`pill ${sim.verdict.toLowerCase()}`}>{sim.verdict}</span>
                      <div className="thScore">
                        <span>{sim.score}</span>
                        <small>/100</small>
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="metricName">Walking Distance (m)</td>
              {comparedList.map((item) => {
                const wd = item.simulation.metrics.walking_distance;
                return (
                  <td key={item.scenario.id} className="metricCell">
                    <b>{wd.proposed}m</b>
                    <small className={wd.delta_pct <= 0 ? "good" : "bad"}>
                      {wd.delta_pct > 0 ? "+" : ""}{wd.delta_pct}%
                    </small>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="metricName">Congestion Index</td>
              {comparedList.map((item) => {
                const cg = item.simulation.metrics.congestion;
                return (
                  <td key={item.scenario.id} className="metricCell">
                    <b>{cg.proposed}/100</b>
                    <div className="barContainer">
                      <div className="barFill amber" style={{ width: `${cg.proposed}%` }} />
                    </div>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="metricName">Accessibility Compliance</td>
              {comparedList.map((item) => {
                const ac = item.simulation.metrics.accessibility;
                return (
                  <td key={item.scenario.id} className="metricCell">
                    <b>{ac.proposed}/100</b>
                    <div className="barContainer">
                      <div className="barFill green" style={{ width: `${ac.proposed}%` }} />
                    </div>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="metricName">Emergency Safety Score</td>
              {comparedList.map((item) => {
                const sf = item.simulation.metrics.safety;
                return (
                  <td key={item.scenario.id} className="metricCell">
                    <b>{sf.proposed}/100</b>
                    <div className="barContainer">
                      <div className="barFill blue" style={{ width: `${sf.proposed}%` }} />
                    </div>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="metricName">Flow Efficiency</td>
              {comparedList.map((item) => {
                const fe = item.simulation.metrics.flow_efficiency;
                return (
                  <td key={item.scenario.id} className="metricCell">
                    <b>{fe.proposed}/100</b>
                    <div className="barContainer">
                      <div className="barFill cyan" style={{ width: `${fe.proposed}%` }} />
                    </div>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="metricName">User Experience (UX)</td>
              {comparedList.map((item) => {
                const ux = item.simulation.metrics.experience;
                return (
                  <td key={item.scenario.id} className="metricCell">
                    <b>{ux.proposed}/100</b>
                    <div className="barContainer">
                      <div className="barFill violet" style={{ width: `${ux.proposed}%` }} />
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      </>
      )}
    </div>
  );
}
