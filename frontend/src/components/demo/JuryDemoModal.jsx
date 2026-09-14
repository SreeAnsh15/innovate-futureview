import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, X, Sparkles, 
  CheckCircle2, ArrowRight, Activity, ShieldAlert, Cpu, Box, Award,
  Compass, Siren, Users, Globe2, Layers, GitBranch
} from 'lucide-react';
import { useFutureView } from '../../context/FutureViewContext';

export default function JuryDemoModal({ isOpen, onClose }) {
  const { 
    setSelectedModule, 
    switchWorld,
    switchDomain,
    runDomainSimulation,
    showToast
  } = useFutureView();

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const demoScenes = [
    {
      scene: 1,
      domain: "spatial",
      world: "hospital-demo",
      title: "SCENE 1: Spatial Intelligence & Ergonomic Mutation",
      question: "What if the primary registration desk is relocated to the East Ingress?",
      speech: "FUTUREVIEW ingests real physical blueprints and evaluates multi-agent trajectory friction, walking fatigue, and ADA Title III accessibility compliance.",
      highlights: ["Physical 2D/3D Mutation", "A* Pathfinding Friction", "ADA Barrier-Free Clearance"]
    },
    {
      scene: 2,
      domain: "crowd",
      world: "stadium-arena",
      title: "SCENE 2: Crowd Dynamics & Stampede Prevention",
      question: "What if Gate A turnstiles close during 850 visitors/min peak surge?",
      speech: "The engine runs continuous crowd pressure physics, detecting compression wave thresholds before physical instability occurs.",
      highlights: ["60FPS Multi-Agent Physics", "Compression Wave Detection", "Gate Throttling Intervention"]
    },
    {
      scene: 3,
      domain: "disaster",
      world: "urban-disaster",
      title: "SCENE 3: Disaster Intelligence & Causal Cascades",
      question: "What if river rises 1.8m and North River Bridge is severed?",
      speech: "Causal DAG discovers what breaks first, mapping flood propagation across medical supply routes and civic relief shelters.",
      highlights: ["Hazard Inundation Modeling", "What Breaks First? (12 min)", "Dynamic Evacuation Rerouting"]
    },
    {
      scene: 4,
      domain: "infrastructure",
      world: "power-water-grid",
      title: "SCENE 4: Critical Infrastructure Cascading Failure",
      question: "What if Substation 04 trips offline during heatwave peak?",
      speech: "Deterministic network models trace secondary stress propagation across high-voltage distribution lines and municipal water pumps.",
      highlights: ["N-1 Contingency Analysis", "Cascading Blackout Prevention", "Pareto Islanding Strategy"]
    },
    {
      scene: 5,
      domain: "healthcare",
      world: "hospital-demo",
      title: "SCENE 5: Platform Synthesis & Decision Governance",
      question: "One Engine. Many Worlds. Infinite What-Ifs.",
      speech: "FUTUREVIEW synthesizes all consequences into an immutable SHA-256 decision dossier with Pareto-optimal alternatives.",
      highlights: ["AI Suggests • Simulation Verifies", "Pareto Decision Optimizer", "Cryptographic Audit Dossier"]
    }
  ];

  const activeScene = demoScenes[currentStep] || demoScenes[0];

  useEffect(() => {
    if (!isOpen) return;
    const s = demoScenes[currentStep];
    if (s) {
      if (switchWorld && s.world) switchWorld(s.world);
      if (switchDomain && s.domain) switchDomain(s.domain);
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    let timer;
    if (isOpen && isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < demoScenes.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, demoScenes.length]);

  if (!isOpen) return null;

  return (
    <div className="juryModalOverlay" onClick={onClose}>
      <div className="juryModalContainer" onClick={(e) => e.stopPropagation()}>
        {/* Header Ribbon */}
        <div className="juryModalHeader">
          <div className="juryHeaderLeft">
            <div className="juryLogoGem">
              <Sparkles size={16} />
            </div>
            <div>
              <b className="juryHeaderTitle">FUTUREVIEW &bull; JURY PRESENTATION</b>
              <span className="juryHeaderSub">Counterfactual Intelligence Platform Demonstration</span>
            </div>
          </div>
          <button className="juryCloseBtn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Scene Progress Track */}
        <div className="juryProgressTrack">
          {demoScenes.map((sc, i) => (
            <div
              key={i}
              className={`juryStepIndicator ${i === currentStep ? 'active' : i < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(i)}
            >
              <span className="stepNum">0{sc.scene}</span>
              <span className="stepTitle">{sc.title.split(':')[0]}</span>
            </div>
          ))}
        </div>

        {/* Active Scene Showcase */}
        <div className="jurySceneBody">
          <div className="sceneTopMeta">
            <span className="sceneTag">{activeScene.title}</span>
            <span className="sceneWorldPill">World: <strong>{activeScene.world}</strong></span>
          </div>

          <h2 className="sceneWhatIfQuestion">"{activeScene.question}"</h2>
          <p className="sceneSpeechNarrative">{activeScene.speech}</p>

          <div className="sceneHighlightsGrid">
            {activeScene.highlights.map((h, i) => (
              <div key={i} className="sceneHighlightCard">
                <CheckCircle2 size={14} className="iconCyan" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls Footer */}
        <div className="juryModalFooter">
          <div className="juryFooterLeft">
            <button
              className="juryPlaybackBtn"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? "PAUSE" : "PLAY DEMO"}</span>
            </button>
            <button
              className="juryNavBtn"
              onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
              disabled={currentStep === 0}
            >
              <SkipBack size={13} />
              <span>PREV SCENE</span>
            </button>
            <button
              className="juryNavBtn"
              onClick={() => setCurrentStep((c) => Math.min(demoScenes.length - 1, c + 1))}
              disabled={currentStep === demoScenes.length - 1}
            >
              <span>NEXT SCENE</span>
              <SkipForward size={13} />
            </button>
          </div>

          <div className="juryFooterRight">
            <button
              className="juryLaunchConsoleBtn"
              onClick={() => {
                if (setSelectedModule) setSelectedModule("dashboard");
                onClose();
              }}
            >
              <span>EXPLORE PLATFORM NOW</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
