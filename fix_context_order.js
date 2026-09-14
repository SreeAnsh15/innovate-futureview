const fs = require('fs');
const path = 'frontend/src/context/FutureViewContext.jsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Find the start of switchWorld block and remove it from its current position
const switchWorldBlock = `  const switchWorld = useCallback((worldId) => {
    const world = UNIVERSAL_WORLDS.find((w) => w.id === worldId) || UNIVERSAL_WORLDS[0];
    setActiveWorld(world);
    setActiveDomain(world.domain);
    setCurrentEnv(world);
    
    // Set first movable object
    const movableObj = world.objects?.find((o) => o.movable !== false) || world.objects?.[1] || world.objects?.[0] || { id: "obj-1", name: "Central Node", x: 40, y: 40 };
    setSelectedObjectId(movableObj.id);
    const newPropPos = { x: Math.min(90, movableObj.x + 12), y: Math.min(85, movableObj.y + 6) };
    setProposalPosition(newPropPos);
    
    setBaselineScenario({
      id: \`scen-baseline-\${world.id}\`,
      name: \`Baseline: \${world.name}\`,
      object_id: movableObj.id,
      object_name: movableObj.name,
      from_position: { x: movableObj.x, y: movableObj.y },
      to_position: { x: movableObj.x, y: movableObj.y },
      users_per_hour: 450
    });
    setProposedScenario({
      id: \`scen-active-\${world.id}\`,
      name: \`Intervention on \${movableObj.name}\`,
      object_id: movableObj.id,
      object_name: movableObj.name,
      from_position: { x: movableObj.x, y: movableObj.y },
      to_position: newPropPos,
      users_per_hour: 450
    });

    // Update What-If prompt & causal chain
    setWhatIfPipeline({
      status: "idle",
      query: world.primary_what_if,
      parsedIntent: {
        type: "world_mutation",
        label: world.domain_name,
        target: movableObj.name,
        value: 40,
        unit: "%"
      },
      causalChain: world.cascade_nodes?.map((n) => \`\${n.title} (\${n.time}): \${n.desc}\`) || []
    });

    // Calculate fresh metrics for this world
    const baseScore = 72;
    const propScore = world.pareto_alternatives?.[0]?.score || 88;
    setMetrics({
      proposedScore: propScore,
      baselineScore: baseScore,
      baselineWalkingDist: Number((world.width_m * 0.35).toFixed(1)),
      proposedWalkingDist: Number((world.width_m * 0.28).toFixed(1)),
      walkingDistDeltaPct: -20,
      baselineCongestion: 42,
      proposedCongestion: 18,
      baselineAccessibility: 80,
      proposedAccessibility: 94,
      baselineSafety: 72,
      proposedSafety: 91,
      baselineExperience: 70,
      proposedExperience: 88,
      verdict: "RECOMMENDED",
      severity: "positive"
    });

    setSimulationResult({
      status: "success",
      environment_id: world.id,
      score: propScore,
      baseline_score: baseScore,
      verdict: "RECOMMENDED",
      severity: "positive",
      world_id: world.id,
      domain: world.domain,
      metrics: {
        walking_distance: {
          current: Number((world.width_m * 0.35).toFixed(1)),
          proposed: Number((world.width_m * 0.28).toFixed(1)),
          delta: Number((-world.width_m * 0.07).toFixed(1)),
          delta_pct: -20,
          unit: "m"
        },
        congestion: { current: 42, proposed: 18, delta: -24, unit: "/100" },
        accessibility: { current: 80, proposed: 94, delta: +14, unit: "/100" },
        safety: { current: 72, proposed: 91, delta: +19, unit: "/100" },
        experience: { current: 70, proposed: 88, delta: +18, unit: "/100" }
      },
      ai_analysis: {
        overall_score: propScore,
        baseline_score: baseScore,
        verdict: "RECOMMENDED",
        executive_summary: \`Counterfactual analysis for \${world.name} successfully verified. Simulated intervention eliminates primary failure at \${world.what_breaks_first?.target || 'critical junction'} while maintaining life-safety resilience.\`
      },
      cascade: world.cascade_nodes || [],
      what_breaks_first: world.what_breaks_first,
      alternatives: world.pareto_alternatives || []
    });

    showToast(\`Active World switched to \${world.name}\`, "info");
  }, [showToast]);

  const setEnvironmentId = useCallback((id) => {
    switchWorld(id);
  }, [switchWorld]);

  const runWhatIfSimulation = useCallback(async (promptText, customParams = {}) => {
    const query = promptText || activeWorld?.primary_what_if || "What if demand increases by 40%?";
    setWhatIfPipeline(prev => ({ ...prev, status: "understanding", query }));
    
    await new Promise(r => setTimeout(r, 450));
    setWhatIfPipeline(prev => ({ ...prev, status: "counterfactual" }));
    
    await new Promise(r => setTimeout(r, 450));
    setWhatIfPipeline(prev => ({ ...prev, status: "simulating" }));
    
    await new Promise(r => setTimeout(r, 550));
    setWhatIfPipeline(prev => ({ ...prev, status: "cascading" }));
    
    await new Promise(r => setTimeout(r, 400));
    
    try {
      const res = await runUniversalCounterfactual({
        domain: activeWorld?.domain || "spatial",
        world_id: activeWorld?.id || "hospital-demo",
        mutation: { name: query },
        parameters: customParams
      });
      if (res && res.data) {
        setSimulationResult(prev => ({ ...prev, ...res.data }));
      }
    } catch (e) {
      console.warn("Backend counterfactual fallback to local engine:", e);
    }
    
    setWhatIfPipeline(prev => ({ ...prev, status: "results_ready" }));
    showToast("Alternative future simulated successfully!", "success");
  }, [activeWorld, showToast]);`;

if (content.includes(switchWorldBlock)) {
  content = content.replace(switchWorldBlock, '');
  console.log('Removed switchWorldBlock from top!');
}

// 2. Now find showToast definition:
const toastTarget = '  const showToast = useCallback((message, type = "success") => {\n    setToast({ message, type });\n  }, []);';

if (content.includes(toastTarget)) {
  content = content.replace(toastTarget, toastTarget + '\n\n' + switchWorldBlock);
  console.log('Placed switchWorldBlock after showToast and all useState definitions!');
}

fs.writeFileSync(path, content, 'utf8');
console.log('FutureViewContext.jsx re-ordered perfectly!');
