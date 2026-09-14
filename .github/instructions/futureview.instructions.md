# Futureview V2 Project Standards

- Framework: React (Vite) + Tailwind CSS + Python (FastAPI).
- Theme: High-contrast technical CAD / Industrial operations dashboard.
- Styling Rules:
  - NEVER use saturated neon box-shadows or glow filters.
  - Secondary/body text must use text-slate-300 (#CBD5E1) or text-slate-400 (#94A3B8) for readability.
  - Keep border radii tight (rounded-md / 6px) rather than large pill bubbles (rounded-2xl).
  - All numerical metrics, time stamps, and coordinates must use monospace font (`font-mono`).
- Integrity:
  - Always verify that the React tree builds cleanly without syntax or Hook order errors.
  - Modify only the files requested.