import React, { useEffect, useRef } from "react";
import { useFutureView } from "../../context/FutureViewContext";

const DOMAIN_AURA_COLORS = {
  spatial: { primary: "rgba(56, 189, 248, 0.09)", secondary: "rgba(99, 102, 241, 0.06)", grid: "rgba(56, 189, 248, 0.04)" },
  healthcare: { primary: "rgba(6, 182, 212, 0.09)", secondary: "rgba(99, 102, 241, 0.06)", grid: "rgba(6, 182, 212, 0.04)" },
  disaster: { primary: "rgba(239, 68, 68, 0.09)", secondary: "rgba(245, 158, 11, 0.06)", grid: "rgba(239, 68, 68, 0.04)" },
  road: { primary: "rgba(245, 158, 11, 0.09)", secondary: "rgba(16, 185, 129, 0.06)", grid: "rgba(245, 158, 11, 0.04)" },
  crowd: { primary: "rgba(236, 72, 153, 0.09)", secondary: "rgba(59, 130, 246, 0.06)", grid: "rgba(236, 72, 153, 0.04)" },
  rescue: { primary: "rgba(234, 88, 12, 0.09)", secondary: "rgba(249, 115, 22, 0.06)", grid: "rgba(234, 88, 12, 0.04)" },
  environmental: { primary: "rgba(16, 185, 129, 0.09)", secondary: "rgba(6, 182, 212, 0.06)", grid: "rgba(16, 185, 129, 0.04)" },
  infrastructure: { primary: "rgba(139, 92, 246, 0.09)", secondary: "rgba(56, 189, 248, 0.06)", grid: "rgba(139, 92, 246, 0.04)" }
};

export function FuturescapeBackground() {
  const { activeWorld } = useFutureView();
  const domain = activeWorld?.domain || "spatial";
  const aura = DOMAIN_AURA_COLORS[domain] || DOMAIN_AURA_COLORS.spatial;

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Subtle ambient computational dust/nodes (sparse, slow)
    const nodes = Array.from({ length: 24 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      radius: Math.random() * 1.5 + 0.8,
      alpha: Math.random() * 0.25 + 0.08
    }));

    const render = () => {
      time += 0.004;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw subtle floating computational nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${node.alpha * (0.8 + 0.2 * Math.sin(time * 2 + node.x))})`;
        ctx.fill();
      });

      // 2. Draw subtle connected field lines between closest nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.03 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="futurescapeAtmosphere" aria-hidden="true">
      {/* 1. Dynamic Radial Aura Field */}
      <div 
        className="auraPrimaryGlow"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 15%, ${aura.primary} 0%, transparent 70%)`
        }}
      />
      <div 
        className="auraSecondaryGlow"
        style={{
          background: `radial-gradient(circle 50% at 85% 75%, ${aura.secondary} 0%, transparent 60%)`
        }}
      />

      {/* 2. Perspective Spatial Grid */}
      <div 
        className="auraSpatialGrid"
        style={{
          backgroundImage: `linear-gradient(to right, ${aura.grid} 1px, transparent 1px), linear-gradient(to bottom, ${aura.grid} 1px, transparent 1px)`,
          backgroundSize: "48px 48px"
        }}
      />

      {/* 3. Ambient Canvas for Sparse Computational Nodes */}
      <canvas ref={canvasRef} className="auraCanvasLayer" />

      {/* 4. Cinematic Vignette */}
      <div className="auraVignette" />
    </div>
  );
}
