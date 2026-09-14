import React, { useState, useEffect } from "react";
import {
  Sliders,
  X,
  BrainCircuit,
  Activity,
  ShieldCheck,
  Info,
  Check,
  Cpu,
  Key,
  RefreshCw,
  Sparkles,
  Zap
} from "lucide-react";
import { fetchAIStatus } from "../../api/aiApi";

export function SettingsModal({
  isOpen,
  onClose,
  usersPerHour,
  setUsersPerHour,
  aiProvider,
  setAiProvider,
  aiProviderInfo,
  setAiProviderInfo,
  units,
  setUnits,
  onShowToast
}) {
  const [liveStatus, setLiveStatus] = useState(aiProviderInfo || null);
  const [checking, setChecking] = useState(false);

  // Fetch real backend AI status when modal opens
  useEffect(() => {
    if (isOpen) {
      checkLiveStatus();
    }
  }, [isOpen]);

  async function checkLiveStatus() {
    setChecking(true);
    try {
      const status = await fetchAIStatus();
      setLiveStatus(status);
      if (setAiProviderInfo) setAiProviderInfo(status);
    } catch (err) {
      console.warn("Failed to check AI status:", err);
    } finally {
      setChecking(false);
    }
  }

  if (!isOpen) return null;

  const hasGemini = liveStatus?.available || liveStatus?.provider === "gemini";
  const activeName = liveStatus?.active_provider_name || (hasGemini ? "Google Gemini" : "Local Spatial Reasoning");
  const activeMode = liveStatus?.mode || (hasGemini ? "AI Spatial Reasoning" : "Deterministic Spatial Reasoning");
  const modelName = liveStatus?.model_name || (hasGemini ? "gemini-1.5-flash" : "Deterministic Local Rules Engine");

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalCard settingsModal" onClick={(e) => e.stopPropagation()}>
        <div className="modalHead">
          <div className="modalHeadLeft">
            <Sliders size={20} className="iconCyan" />
            <div>
              <h3>Settings & AI Architecture</h3>
              <span className="modalSubtitle">Hybrid Simulation Engine & Generative Reasoning Configuration</span>
            </div>
          </div>
          <button className="iconCloseBtn" onClick={onClose} title="Close Settings">
            <X size={16} />
          </button>
        </div>

        <div className="settingsBody">
          {/* Active Provider Dynamic Status Card */}
          <div className={`activeProviderStatusBox ${hasGemini ? "geminiActive" : "localActive"}`}>
            <div className="provStatusTop">
              <div className="provStatusPill">
                <span className={`statusDot ${hasGemini ? "dotGreen" : "dotAmber"}`} />
                <span className="statusPillText">
                  {hasGemini ? "● GEMINI AI CONNECTED" : "● LOCAL ENGINE ACTIVE"}
                </span>
              </div>
              <button
                className="refreshStatusBtn"
                onClick={checkLiveStatus}
                disabled={checking}
                title="Refresh live backend AI connection status"
              >
                <RefreshCw size={13} className={checking ? "spin" : ""} />
                <span>{checking ? "Checking..." : "Re-check"}</span>
              </button>
            </div>

            <div className="provDetailGrid">
              <div className="provDetailItem">
                <span className="provDetailLabel">ACTIVE PROVIDER</span>
                <b className="provDetailVal">{activeName}</b>
              </div>
              <div className="provDetailItem">
                <span className="provDetailLabel">EXECUTION MODE</span>
                <span className="provDetailVal highlight">{activeMode}</span>
              </div>
              <div className="provDetailItem">
                <span className="provDetailLabel">UNDERLYING MODEL / ENGINE</span>
                <span className="provDetailVal">{modelName}</span>
              </div>
              <div className="provDetailItem">
                <span className="provDetailLabel">SECURITY & API KEY STATUS</span>
                <span className="provDetailVal secure">
                  <Key size={12} />
                  <span>{hasGemini ? "Server-side Key Verified (Hidden from Client)" : "No Key Set (Using Local Deterministic Engine)"}</span>
                </span>
              </div>
            </div>

            {!hasGemini && (
              <div className="geminiSetupPrompt">
                <Info size={14} className="iconCyan" />
                <span>
                  To connect Google Gemini: Copy <code>backend/.env.example</code> to <code>backend/.env</code>, add your <code>GEMINI_API_KEY</code>, and restart the backend.
                </span>
              </div>
            )}
          </div>

          {/* AI Provider Architecture Selector */}
          <div className="formGroup">
            <label>SPATIAL REASONING PROVIDER SELECTION</label>
            <select
              value={aiProvider}
              onChange={(e) => {
                setAiProvider(e.target.value);
                if (onShowToast) onShowToast(`Spatial reasoning preference: ${e.target.value}`);
              }}
            >
              <option value="gemini">GeminiSpatialAIProvider (Google Generative AI + Deterministic Input)</option>
              <option value="local">LocalSpatialAIProvider (Deterministic Multi-Agent Rules Engine)</option>
            </select>
            <small className="fieldHint">
              FUTUREVIEW uses a hybrid architecture: the deterministic simulator calculates exact physical metrics, and the selected AI provider synthesizes the human and spatial consequences.
            </small>
          </div>

          {/* Pedestrian Design Demand Slider */}
          <div className="formGroup">
            <div className="labelRow">
              <label>DESIGN PEAK DEMAND</label>
              <span className="valBadge">{usersPerHour} users/hr</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="25"
              value={usersPerHour}
              onChange={(e) => setUsersPerHour(Number(e.target.value))}
            />
            <small className="fieldHint">Simulates queue build-up and congestion velocity during high-volume periods.</small>
          </div>

          {/* Measurement Unit System */}
          <div className="formGroup">
            <label>MEASUREMENT SYSTEM</label>
            <div className="unitToggleRow">
              <button
                className={`unitBtn ${units === "metric" ? "active" : ""}`}
                onClick={() => setUnits("metric")}
              >
                Metric (Meters / m²)
              </button>
              <button
                className={`unitBtn ${units === "imperial" ? "active" : ""}`}
                onClick={() => setUnits("imperial")}
              >
                Imperial (Feet / sq ft)
              </button>
            </div>
          </div>

          {/* Data Honesty & Transparency Policy */}
          <div className="dataHonestyBox">
            <div className="honestyHead">
              <ShieldCheck size={16} className="iconGreen" />
              <b>Data Honesty & Transparency Policy</b>
            </div>
            <p>
              AI-generated reasoning is decision-support guidance derived from simulation inputs. It is not a guarantee of real-world outcomes.
              Deterministic simulation numbers (walking distance, congestion, accessibility) are strictly segregated from AI qualitative interpretations.
            </p>
          </div>
        </div>

        <div className="modalActions">
          <button className="primaryBtn" onClick={onClose}>
            <Check size={15} /> Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
