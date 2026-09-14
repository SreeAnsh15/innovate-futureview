import React, { useState } from "react";
import {
  Upload,
  CloudUpload,
  Layers,
  Map,
  Check,
  Building2,
  Sliders,
  Sparkles,
  Info
} from "lucide-react";
import { FloorPlanAnnotator } from "./FloorPlanAnnotator";
import { RealEnvironmentImport } from "./RealEnvironmentImport";

export function EnvironmentStudio({
  environments,
  currentEnv,
  onSelectEnv,
  onUpdateEnv,
  setTab,
  onShowToast
}) {
  const [selectedEnvId, setSelectedEnvId] = useState(currentEnv.id);
  const [activeTab, setActiveTab] = useState("upload"); // presets, upload, annotate

  const activeEnvironment = environments.find((e) => e.id === selectedEnvId) || currentEnv;

  function handleEnvironmentImported(newEnv) {
    onUpdateEnv(newEnv);
    setSelectedEnvId(newEnv.id);
    onSelectEnv(newEnv);
  }

  return (
    <div className="studioPage">
      <div className="studioHeader">
        <div>
          <div className="studioTag">
            <Map size={14} />
            <span>ENVIRONMENT STUDIO</span>
          </div>
          <h2>Bring Real-World Spaces into FUTUREVIEW</h2>
          <p>Import floor plans, architectural CAD captures, or select curated environment benchmarks.</p>
        </div>

        <div className="studioTopActions">
          <button
            className={`tabToggle ${activeTab === "upload" ? "active" : ""}`}
            onClick={() => setActiveTab("upload")}
          >
            <CloudUpload size={14} />
            <span>Import Floor Plan</span>
          </button>
          <button
            className={`tabToggle ${activeTab === "presets" ? "active" : ""}`}
            onClick={() => setActiveTab("presets")}
          >
            <Building2 size={14} />
            <span>Preset Benchmarks</span>
          </button>
          <button
            className={`tabToggle ${activeTab === "annotate" ? "active" : ""}`}
            onClick={() => setActiveTab("annotate")}
          >
            <Sliders size={14} />
            <span>Spatial Annotator</span>
          </button>
        </div>
      </div>

      {activeTab === "upload" && (
        <RealEnvironmentImport
          onEnvironmentImported={handleEnvironmentImported}
          onShowToast={onShowToast}
          setTab={setTab}
        />
      )}

      {activeTab === "presets" && (
        <div className="presetsGrid">
          {environments.map((env) => (
            <div
              key={env.id}
              className={`presetCard ${env.id === activeEnvironment.id ? "selected" : ""}`}
              onClick={() => {
                setSelectedEnvId(env.id);
                onSelectEnv(env);
                onShowToast(`Switched active environment to ${env.name}`);
              }}
            >
              <div className="presetIcon">
                <Building2 size={24} />
              </div>
              <div className="presetMeta">
                <span className="presetType">{env.type}</span>
                <b>{env.name}</b>
                <span className="presetDimensions">{env.size} · {env.objects?.length || 0} Elements</span>
              </div>
              {env.id === activeEnvironment.id && (
                <div className="presetActiveBadge">
                  <Check size={14} />
                  <span>ACTIVE</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "annotate" && (
        <FloorPlanAnnotator
          environment={activeEnvironment}
          onUpdateEnvironment={(updated) => {
            onUpdateEnv(updated);
            onShowToast("Environment annotations updated.");
          }}
          setTab={setTab}
        />
      )}
    </div>
  );
}
