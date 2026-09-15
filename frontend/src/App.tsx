import { useEffect, useState } from "react";
import { getBaselineWorld } from "./api/world";
import { SpatialCanvas } from "./components/SpatialCanvas";
import type { SpatialWorld } from "./types/world";

const tools = ["Explore", "Rooms", "Walls", "Doors", "Objects", "Zones"];

export function App() {
  const [world, setWorld] = useState<SpatialWorld>();
  const [error, setError] = useState<string>();
  const [activeTool, setActiveTool] = useState("Explore");

  useEffect(() => {
    const controller = new AbortController();
    getBaselineWorld(controller.signal).then(setWorld).catch((reason: unknown) => {
      if (reason instanceof DOMException && reason.name === "AbortError") return;
      setError(reason instanceof Error ? reason.message : "Could not load the spatial world.");
    });
    return () => controller.abort();
  }, []);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="Futureview">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>FUTUREVIEW</span>
          <span className="phase-label">Spatial playground</span>
        </div>
        <div className="world-name">{world?.name ?? "Loading world…"}</div>
        <button className="run-button" type="button" disabled title="Simulation will be available in a later phase">
          <span aria-hidden="true">▶</span> Run simulation
        </button>
      </header>

      <section className="workspace" aria-label="Spatial workspace">
        <aside className="tool-rail" aria-label="Workspace tools">
          <p className="rail-label">Tools</p>
          {tools.map((tool) => (
            <button
              className={activeTool === tool ? "tool-button active" : "tool-button"}
              key={tool}
              onClick={() => setActiveTool(tool)}
              type="button"
              aria-pressed={activeTool === tool}
              title={`${tool} tool (editing is planned)`}
            >
              {tool}
            </button>
          ))}
          <p className="rail-note">Editing tools are coming next.</p>
        </aside>

        <section className="scene-panel" aria-label="Hospital spatial canvas">
          {error ? (
            <div className="status-message" role="alert">
              <h1>World unavailable</h1>
              <p>{error}</p>
              <p>Start the FUTUREVIEW backend and refresh this page.</p>
            </div>
          ) : !world ? (
            <div className="status-message" role="status"><p>Preparing the spatial workspace…</p></div>
          ) : (
            <SpatialCanvas world={world} />
          )}
        </section>

        <aside className="inspector" aria-label="World properties">
          <p className="eyebrow">World</p>
          <h1>{world?.name ?? "Baseline hospital"}</h1>
          <dl>
            <div><dt>Canvas</dt><dd>{world ? `${world.dimensions.width} × ${world.dimensions.depth} m` : "—"}</dd></div>
            <div><dt>Objects</dt><dd>{world?.objects.length ?? "—"}</dd></div>
            <div><dt>Access points</dt><dd>{world ? world.entrances.length + world.exits.length : "—"}</dd></div>
          </dl>
          <div className="inspector-divider" />
          <p className="eyebrow">Canvas guide</p>
          <ul className="guide-list">
            <li><span className="guide-swatch object" /> Blocking object</li>
            <li><span className="guide-swatch entrance" /> Entrance</li>
            <li><span className="guide-swatch exit" /> Exit</li>
          </ul>
          <p className="inspector-note">Scroll to zoom. Drag the scene to pan. World coordinates are shown in metres.</p>
        </aside>
      </section>
    </main>
  );
}
