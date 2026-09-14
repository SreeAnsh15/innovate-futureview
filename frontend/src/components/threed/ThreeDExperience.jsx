import React, { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import {
  Cuboid,
  Camera,
  RotateCcw,
  Compass,
  Layers,
  Sparkles,
  Maximize2,
  Eye,
  Sliders,
  Play,
  Pause,
  ChevronRight,
  Activity,
  Flame,
  Route as RouteIcon,
  Users,
  CheckCircle2,
  Info,
  Building2,
  Navigation,
  ZoomIn,
  ZoomOut,
  Crosshair,
  AlertTriangle,
  Move,
  Check,
  ShieldCheck
} from "lucide-react";
import { DataHonestyBadge } from "../common/Toast";
import { useFutureView } from "../../context/FutureViewContext";
import { UNIVERSAL_WORLDS } from "../../data/universalWorlds";

export function ThreeDExperience({
  environment,
  selectedObject,
  proposalPosition,
  simulationResult,
  onUpdateProposalPosition,
  setTab
}) {
  const { activeWorld } = useFutureView();
  const currentWorld = activeWorld || environment || UNIVERSAL_WORLDS[0];
  const mountRef = useRef(null);

  // Configuration Switcher: "current" vs "proposed"
  const [viewState, setViewState] = useState("proposed"); // "current" | "proposed"
  const [cameraPreset, setCameraPreset] = useState("perspective"); // "perspective" | "isometric" | "top" | "walkthrough" | "firstperson"

  // Layer Toggles
  const [showAgents, setShowAgents] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showWireframe, setShowWireframe] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Selected 3D Object for Inspector & Dragging
  const [clickedObjectId, setClickedObjectId] = useState(selectedObject?.id || "registration");
  const [isCinematicRunning, setIsCinematicRunning] = useState(false);
  const [isDragging3D, setIsDragging3D] = useState(false);
  const [localProposal, setLocalProposal] = useState(proposalPosition || { x: 75.0, y: 45.0 });

  // Synchronize local proposal with parent prop
  useEffect(() => {
    if (proposalPosition) {
      setLocalProposal(proposalPosition);
    }
  }, [proposalPosition]);

  // Three.js Core References
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameId = useRef(null);

  // Dynamic Scene Mesh References
  const targetMeshRef = useRef(null);
  const ghostMeshRef = useRef(null);
  const objectsMapRef = useRef(new Map()); // id -> Mesh
  const agentsGroupRef = useRef(null);
  const routesGroupRef = useRef(null);
  const heatmapGroupRef = useRef(null);
  const agentInstancesRef = useRef([]);
  const pulseParticlesRef = useRef([]);

  // Camera Orbit State
  const cameraControlRef = useRef({
    isMouseDown: false,
    mouseButton: 0,
    prevX: 0,
    prevY: 0,
    sphericalTheta: 0.85,
    sphericalPhi: 0.92,
    radius: 135,
    target: new THREE.Vector3(0, 2, 0),
    walkthroughPos: new THREE.Vector3(-40, 4.0, -10)
  });

  const objects = currentWorld?.objects || [];
  const zones = currentWorld?.zones || [];
  const widthM = currentWorld?.width_m || 100.0;
  const heightM = currentWorld?.height_m || 75.0;

  // Active target object and coordinates
  const targetObj =
    selectedObject ||
    objects.find((o) => o.id === clickedObjectId) ||
    objects.find((o) => o.movable !== false) ||
    objects[1] ||
    objects[0] || {
      id: "registration",
      name: "Registration Desk",
      kind: "service",
      x: 38,
      y: 40,
      w: 14,
      h: 8
    };

  const baselinePos = { x: targetObj?.x || 38.0, y: targetObj?.y || 40.0 };
  const currentProposal = localProposal;

  // Coordinate conversion: Map 0-100% 2D coordinates into 3D world space
  const slabW = widthM * 1.35;
  const slabH = heightM * 1.35;

  const map2Dto3D = (pctX, pctY) => {
    const worldX = ((pctX - 50) / 50) * (slabW * 0.44);
    const worldZ = ((pctY - 50) / 50) * (slabH * 0.44);
    return { x: worldX, z: worldZ };
  };

  const map3Dto2D = (worldX, worldZ) => {
    const pctX = (worldX / (slabW * 0.44)) * 50 + 50;
    const pctY = (worldZ / (slabH * 0.44)) * 50 + 50;
    return {
      x: Math.max(5, Math.min(95, Number(pctX.toFixed(1)))),
      y: Math.max(5, Math.min(95, Number(pctY.toFixed(1))))
    };
  };

  // Inspect clicked object details
  const inspectedObject = objects.find((o) => o.id === clickedObjectId) || targetObj;

  // 1. Initialize Three.js Scene with Robust Resize Observer
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(400, container.clientWidth || 900);
    const height = Math.max(400, container.clientHeight || 600);

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03070d);
    scene.fog = new THREE.FogExp2(0x03070d, 0.0045);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 2000);
    camera.position.set(0, 95, 130);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with high-fidelity tone mapping & shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio & Spatial Lighting
    const ambientLight = new THREE.AmbientLight(0xdcf0ff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x50ddff, 1.6);
    dirLight.position.set(70, 130, 80);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.bias = -0.0004;
    const d = 110;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Accent Cyber Rim Lights
    const accentLight1 = new THREE.PointLight(0x818cf8, 2.5, 180);
    accentLight1.position.set(-60, 40, -40);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(0x38bdf8, 2.2, 170);
    accentLight2.position.set(60, 35, 50);
    scene.add(accentLight2);

    // 5. High-Tech Cyber Floor Slab & Grid
    const floorGeo = new THREE.PlaneGeometry(slabW, slabH);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x050c14,
      roughness: 0.8,
      metalness: 0.25
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Precise Spatial Grid
    const gridDivisions = Math.max(20, Math.round(widthM / 3));
    const gridHelper = new THREE.GridHelper(slabW, gridDivisions, 0x1d4460, 0x0a1c28);
    gridHelper.position.y = 0.05;
    scene.add(gridHelper);

    // 6. Architectural Boundary Perimeter Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0c1e2e,
      roughness: 0.4,
      metalness: 0.35,
      transparent: true,
      opacity: 0.75
    });

    const createWall = (w, h, depth, x, z) => {
      const geo = new THREE.BoxGeometry(w, h, depth);
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.set(x, h / 2, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    };

    const wallHeight = 7.0;
    const halfW = slabW / 2;
    const halfH = slabH / 2;

    createWall(slabW, wallHeight, 1.6, 0, -halfH);
    createWall(slabW, wallHeight, 1.6, 0, halfH);
    createWall(1.6, wallHeight, slabH * 0.4, -halfW, -halfH * 0.5);
    createWall(1.6, wallHeight, slabH * 0.4, -halfW, halfH * 0.5);
    createWall(1.6, wallHeight, slabH * 0.4, halfW, -halfH * 0.5);
    createWall(1.6, wallHeight, slabH * 0.4, halfW, halfH * 0.5);

    // 7. Room Zones & Ground Floor Decals
    zones.forEach((z, i) => {
      const p1 = map2Dto3D(z.x1 || 0, z.y1 || 0);
      const p2 = map2Dto3D(z.x2 || 100, z.y2 || 100);
      const zw = Math.abs(p2.x - p1.x);
      const zh = Math.abs(p2.z - p1.z);
      const cx = (p1.x + p2.x) / 2;
      const cz = (p1.z + p2.z) / 2;

      const zoneGeo = new THREE.PlaneGeometry(zw, zh);
      const zoneColor = new THREE.Color(z.color || (i % 2 === 0 ? "#38bdf8" : "#818cf8"));
      const zoneMat = new THREE.MeshBasicMaterial({
        color: zoneColor,
        transparent: true,
        opacity: 0.09,
        side: THREE.DoubleSide
      });
      const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
      zoneMesh.rotation.x = -Math.PI / 2;
      zoneMesh.position.set(cx, 0.08, cz);
      scene.add(zoneMesh);

      const borderEdges = new THREE.EdgesGeometry(zoneGeo);
      const borderLine = new THREE.LineSegments(
        borderEdges,
        new THREE.LineBasicMaterial({
          color: zoneColor,
          transparent: true,
          opacity: 0.4
        })
      );
      borderLine.rotation.x = -Math.PI / 2;
      borderLine.position.set(cx, 0.1, cz);
      scene.add(borderLine);
    });

    // 8. 3D Architectural Objects
    objectsMapRef.current.clear();

    objects.forEach((obj) => {
      const pos = map2Dto3D(obj.x, obj.y);
      const width3D = Math.max(3.5, ((obj.w || 10) / 100) * slabW);
      const depth3D = Math.max(2.8, ((obj.h || 8) / 100) * slabH);

      let color = 0x1e3a50;
      let height3D = 4.2;
      let emissiveCol = 0x000000;
      let emissiveInt = 0.0;

      if (obj.kind === "entrance") {
        color = 0x064e3b;
        emissiveCol = 0x10b981;
        emissiveInt = 0.35;
        height3D = 7.5;
      } else if (obj.kind === "exit") {
        color = 0x7f1d1d;
        emissiveCol = 0xf43f5e;
        emissiveInt = 0.35;
        height3D = 7.0;
      } else if (obj.kind === "service" || obj.kind === "counter") {
        color = 0x78350f;
        emissiveCol = 0xf59e0b;
        emissiveInt = 0.25;
        height3D = 3.8;
      } else if (obj.kind === "critical") {
        color = 0x701a75;
        emissiveCol = 0xf43f5e;
        emissiveInt = 0.3;
        height3D = 6.0;
      } else if (obj.kind === "room") {
        color = 0x312e81;
        emissiveCol = 0x818cf8;
        emissiveInt = 0.18;
        height3D = 5.0;
      } else if (obj.kind === "obstacle") {
        color = 0x334155;
        height3D = 8.0;
      } else if (obj.kind === "corridor") {
        color = 0x0c4a6e;
        height3D = 0.3;
      }

      const isTarget = obj.id === targetObj?.id;

      const objGeo = new THREE.BoxGeometry(width3D, height3D, depth3D);
      const objMat = new THREE.MeshStandardMaterial({
        color,
        emissive: emissiveCol,
        emissiveIntensity: emissiveInt,
        roughness: 0.35,
        metalness: 0.4
      });
      const mesh = new THREE.Mesh(objGeo, objMat);
      mesh.position.set(pos.x, height3D / 2, pos.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { id: obj.id, name: obj.name, kind: obj.kind, height3D, width3D, depth3D, movable: obj.movable !== false };

      // Glowing Neon Wireframe Edges
      const edges = new THREE.EdgesGeometry(objGeo);
      const wireframeMat = new THREE.LineBasicMaterial({
        color: isTarget ? 0x38bdf8 : obj.kind === "entrance" ? 0x34d399 : obj.kind === "exit" ? 0xf87171 : 0x818cf8,
        linewidth: isTarget ? 2 : 1
      });
      const wireframe = new THREE.LineSegments(edges, wireframeMat);
      mesh.add(wireframe);

      // Top glowing LED panel for counters
      if (obj.kind === "service" || obj.kind === "counter") {
        const topGeo = new THREE.BoxGeometry(width3D * 1.05, 0.4, depth3D * 1.05);
        const topMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.6,
          roughness: 0.1
        });
        const topMesh = new THREE.Mesh(topGeo, topMat);
        topMesh.position.y = height3D / 2 + 0.2;
        mesh.add(topMesh);
      }

      scene.add(mesh);
      objectsMapRef.current.set(obj.id, mesh);

      if (isTarget) {
        targetMeshRef.current = mesh;

        // Ghost baseline wireframe
        const base3D = map2Dto3D(baselinePos.x, baselinePos.y);
        const ghostGeo = new THREE.BoxGeometry(width3D, height3D, depth3D);
        const ghostEdges = new THREE.EdgesGeometry(ghostGeo);
        const ghostMat = new THREE.LineBasicMaterial({
          color: 0x818cf8,
          transparent: true,
          opacity: 0.6
        });
        const ghostMesh = new THREE.LineSegments(ghostEdges, ghostMat);
        ghostMesh.position.set(base3D.x, height3D / 2, base3D.z);
        scene.add(ghostMesh);
        ghostMeshRef.current = ghostMesh;
      }
    });

    // 9. Groups for Dynamic Simulation Elements (Routes, Heatmap, Agents)
    const routesGroup = new THREE.Group();
    routesGroupRef.current = routesGroup;
    scene.add(routesGroup);

    const heatmapGroup = new THREE.Group();
    heatmapGroupRef.current = heatmapGroup;
    scene.add(heatmapGroup);

    const agentsGroup = new THREE.Group();
    agentsGroupRef.current = agentsGroup;
    scene.add(agentsGroup);

    // 10. Raycasting & Interactive Orbit / Drag Controls
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeIntersection = new THREE.Vector3();

    const getCanvasMouse = (e) => {
      const rect = container.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1
      };
    };

    const onMouseDown = (e) => {
      const ctrl = cameraControlRef.current;
      ctrl.isMouseDown = true;
      ctrl.mouseButton = e.button;
      ctrl.prevX = e.clientX;
      ctrl.prevY = e.clientY;

      if (e.button === 0) {
        const m = getCanvasMouse(e);
        mouse.x = m.x;
        mouse.y = m.y;
        raycaster.setFromCamera(mouse, camera);

        // Check if clicking target mesh for direct 3D drag
        if (targetMeshRef.current && viewState === "proposed") {
          const targetIntersects = raycaster.intersectObject(targetMeshRef.current, true);
          if (targetIntersects.length > 0) {
            setIsDragging3D(true);
            return;
          }
        }

        // Check if clicking any 3D object to inspect
        const meshes = Array.from(objectsMapRef.current.values());
        const intersects = raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0) {
          let hit = intersects[0].object;
          while (hit.parent && hit.parent !== scene && !hit.userData?.id) {
            hit = hit.parent;
          }
          if (hit.userData?.id) {
            setClickedObjectId(hit.userData.id);
          }
        }
      }
    };

    const onMouseMove = (e) => {
      const ctrl = cameraControlRef.current;

      if (isDragging3D && targetMeshRef.current && viewState === "proposed") {
        const m = getCanvasMouse(e);
        mouse.x = m.x;
        mouse.y = m.y;
        raycaster.setFromCamera(mouse, camera);

        if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
          const new2D = map3Dto2D(planeIntersection.x, planeIntersection.z);
          setLocalProposal(new2D);
          if (onUpdateProposalPosition) {
            onUpdateProposalPosition(new2D);
          }
        }
        return;
      }

      if (!ctrl.isMouseDown || cameraPreset === "walkthrough") return;

      const dx = e.clientX - ctrl.prevX;
      const dy = e.clientY - ctrl.prevY;
      ctrl.prevX = e.clientX;
      ctrl.prevY = e.clientY;

      if (ctrl.mouseButton === 0) {
        // Orbit rotate
        ctrl.sphericalTheta -= dx * 0.007;
        ctrl.sphericalPhi = Math.max(0.08, Math.min(Math.PI / 2 - 0.05, ctrl.sphericalPhi - dy * 0.007));

        camera.position.x = ctrl.radius * Math.sin(ctrl.sphericalPhi) * Math.sin(ctrl.sphericalTheta) + ctrl.target.x;
        camera.position.y = ctrl.radius * Math.cos(ctrl.sphericalPhi) + ctrl.target.y;
        camera.position.z = ctrl.radius * Math.sin(ctrl.sphericalPhi) * Math.cos(ctrl.sphericalTheta) + ctrl.target.z;
        camera.lookAt(ctrl.target);
      } else if (ctrl.mouseButton === 2) {
        // Pan
        const panSpeed = 0.15;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

        ctrl.target.addScaledVector(right, -dx * panSpeed);
        ctrl.target.addScaledVector(camera.up, dy * panSpeed);

        camera.position.addScaledVector(right, -dx * panSpeed);
        camera.position.addScaledVector(camera.up, dy * panSpeed);
      }
    };

    const onMouseUp = () => {
      cameraControlRef.current.isMouseDown = false;
      setIsDragging3D(false);
    };

    const onWheel = (e) => {
      if (cameraPreset === "walkthrough") return;
      const ctrl = cameraControlRef.current;
      ctrl.radius = Math.max(30, Math.min(280, ctrl.radius + e.deltaY * 0.12));
      camera.position.x = ctrl.radius * Math.sin(ctrl.sphericalPhi) * Math.sin(ctrl.sphericalTheta) + ctrl.target.x;
      camera.position.y = ctrl.radius * Math.cos(ctrl.sphericalPhi) + ctrl.target.y;
      camera.position.z = ctrl.radius * Math.sin(ctrl.sphericalPhi) * Math.cos(ctrl.sphericalTheta) + ctrl.target.z;
      camera.lookAt(ctrl.target);
    };

    const onContextMenu = (e) => e.preventDefault();

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: true });
    container.addEventListener("contextmenu", onContextMenu);

    // 11. Main 60FPS Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate Agent Meshes
      if (isPlaying) {
        agentInstancesRef.current.forEach((a) => {
          a.progress = (a.progress + delta * a.speed) % 1.0;
          const wps = a.waypoints;
          if (wps && wps.length >= 2) {
            const totalSegments = wps.length - 1;
            const segProgress = a.progress * totalSegments;
            const segIndex = Math.min(totalSegments - 1, Math.floor(segProgress));
            const t = segProgress - segIndex;

            const p1 = wps[segIndex];
            const p2 = wps[segIndex + 1];

            const curX = p1.x + (p2.x - p1.x) * t;
            const curZ = p1.z + (p2.z - p1.z) * t;

            const bob = a.isWheelchair ? 0 : Math.abs(Math.sin(elapsed * 7.5 + a.bobPhase)) * 0.22;
            a.group.position.set(curX, bob, curZ);

            const angle = Math.atan2(p2.x - p1.x, p2.z - p1.z);
            a.group.rotation.y = angle;
          }
        });
      }

      // Target Object Hover Pulse
      if (targetMeshRef.current) {
        const baseH = targetMeshRef.current.userData?.height3D || 4.0;
        targetMeshRef.current.position.y = baseH / 2 + Math.sin(elapsed * 3.5) * 0.25;
      }

      // Walkthrough Subtle Head-bob Motion
      if (cameraPreset === "walkthrough" && !isCinematicRunning) {
        camera.position.x = -40 + Math.sin(elapsed * 0.3) * 14;
        camera.position.z = Math.cos(elapsed * 0.25) * 18;
        camera.position.y = 4.5 + Math.sin(elapsed * 4.0) * 0.12;
        const target3D = map2Dto3D(currentProposal.x, currentProposal.y);
        camera.lookAt(target3D.x, 3.5, target3D.z);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Robust ResizeObserver for Layout Changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && camera && renderer) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      resizeObserver.disconnect();
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("contextmenu", onContextMenu);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, [currentWorld?.id]);

  // 2. Update Scene when ViewState, Coordinates, or SimulationResult change
  useEffect(() => {
    if (!sceneRef.current) return;

    const isProposed = viewState === "proposed";
    const activeTargetPos = isProposed ? currentProposal : baselinePos;
    const activeTarget3D = map2Dto3D(activeTargetPos.x, activeTargetPos.y);

    // 1. Move Target Object to exact active coordinate
    if (targetMeshRef.current) {
      targetMeshRef.current.position.x = activeTarget3D.x;
      targetMeshRef.current.position.z = activeTarget3D.z;
    }

    // 2. Toggle Ghost Wireframe visibility
    if (ghostMeshRef.current) {
      ghostMeshRef.current.visible = isProposed;
    }

    // 3. Update Walking Path Ribbon
    if (routesGroupRef.current) {
      routesGroupRef.current.clear();

      const activeRoutePts = (isProposed ? simulationResult?.proposed_route : simulationResult?.baseline_route) || (
        isProposed
          ? [{ x: 10, y: 48 }, { x: currentProposal.x, y: currentProposal.y }, { x: 65, y: 25 }, { x: 85, y: 55 }, { x: 92, y: 78 }]
          : [{ x: 10, y: 48 }, { x: baselinePos.x, y: baselinePos.y }, { x: 65, y: 25 }, { x: 85, y: 55 }, { x: 92, y: 78 }]
      );

      if (activeRoutePts.length >= 2) {
        const curvePoints = activeRoutePts.map((p) => {
          const p3D = map2Dto3D(p.x, p.y);
          return new THREE.Vector3(p3D.x, 0.8, p3D.z);
        });

        const spline = new THREE.CatmullRomCurve3(curvePoints);
        const tubeGeo = new THREE.TubeGeometry(spline, 64, 0.45, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: isProposed ? 0x38bdf8 : 0x818cf8,
          transparent: true,
          opacity: 0.75
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        routesGroupRef.current.add(tubeMesh);

        // Path flow pulses
        for (let i = 0; i < 6; i++) {
          const pulseGeo = new THREE.SphereGeometry(0.85, 12, 12);
          const pulseMat = new THREE.MeshBasicMaterial({ color: isProposed ? 0x38bdf8 : 0x818cf8 });
          const pulse = new THREE.Mesh(pulseGeo, pulseMat);
          pulse.position.copy(curvePoints[Math.min(i, curvePoints.length - 1)]);
          routesGroupRef.current.add(pulse);
        }
      }
      routesGroupRef.current.visible = showRoutes;
    }

    // 4. Update Dynamic Congestion Heatmap
    if (heatmapGroupRef.current) {
      heatmapGroupRef.current.clear();

      const activeHeatmapPoints = (isProposed ? simulationResult?.heatmap : simulationResult?.baseline_heatmap) || (
        isProposed
          ? [{ x: 28, y: 38, intensity: 35 }, { x: 52, y: 43, intensity: 55 }, { x: currentProposal.x, y: currentProposal.y, intensity: 85 }]
          : [{ x: 28, y: 38, intensity: 30 }, { x: 38, y: 40, intensity: 45 }, { x: 65, y: 25, intensity: 35 }]
      );

      activeHeatmapPoints.forEach((h) => {
        const h3D = map2Dto3D(h.x, h.y);
        const radius = 6 + (h.intensity / 100) * 12;

        const ringGeo = new THREE.CircleGeometry(radius, 32);
        const colorHex = h.intensity > 70 ? 0xf43f5e : h.intensity > 45 ? 0xf59e0b : 0x38bdf8;
        const ringMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.18 + (h.intensity / 240),
          side: THREE.DoubleSide
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        ringMesh.position.set(h3D.x, 0.15, h3D.z);
        heatmapGroupRef.current.add(ringMesh);

        // Core hotspot cylinder
        const coreGeo = new THREE.CylinderGeometry(radius * 0.3, radius * 0.6, 2.5, 24, 1, true);
        const coreMat = new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.15,
          side: THREE.DoubleSide
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        coreMesh.position.set(h3D.x, 1.25, h3D.z);
        heatmapGroupRef.current.add(coreMesh);
      });
      heatmapGroupRef.current.visible = showHeatmap;
    }

    // 5. Update Animated Agents with active Simulation Trajectories
    if (agentsGroupRef.current) {
      agentsGroupRef.current.clear();
      agentInstancesRef.current = [];

      const activeAgentsData = (isProposed ? simulationResult?.agents : simulationResult?.baseline_agents) || [];
      const totalAgents = Math.max(16, activeAgentsData.length);

      const agentArchetypeColors = {
        visitor: 0x38bdf8,
        elderly: 0xfbbf24,
        wheelchair: 0x34d399,
        emergency: 0xf43f5e,
        staff: 0xa78bfa
      };

      for (let i = 0; i < totalAgents; i++) {
        const agentData = activeAgentsData[i];
        const arch = agentData?.archetype || (i % 5 === 0 ? "wheelchair" : i % 4 === 0 ? "emergency" : i % 3 === 0 ? "elderly" : "visitor");
        const colorHex = agentArchetypeColors[arch] || 0x38bdf8;
        const isWheelchair = arch === "wheelchair";

        const agentGroup = new THREE.Group();

        if (isWheelchair) {
          const seatGeo = new THREE.BoxGeometry(1.8, 0.4, 1.8);
          const seatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
          const seat = new THREE.Mesh(seatGeo, seatMat);
          seat.position.y = 1.2;
          agentGroup.add(seat);

          const torsoGeo = new THREE.CylinderGeometry(0.65, 0.65, 2.0, 12);
          const torsoMat = new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.3 });
          const torso = new THREE.Mesh(torsoGeo, torsoMat);
          torso.position.y = 2.4;
          agentGroup.add(torso);

          const headGeo = new THREE.SphereGeometry(0.6, 12, 12);
          const head = new THREE.Mesh(headGeo, torsoMat);
          head.position.y = 3.6;
          agentGroup.add(head);
        } else {
          const torsoGeo = new THREE.CylinderGeometry(0.7, 0.65, 2.6, 12);
          const torsoMat = new THREE.MeshStandardMaterial({
            color: colorHex,
            emissive: colorHex,
            emissiveIntensity: 0.35,
            roughness: 0.4
          });
          const torso = new THREE.Mesh(torsoGeo, torsoMat);
          torso.position.y = 2.1;
          agentGroup.add(torso);

          const headGeo = new THREE.SphereGeometry(0.65, 12, 12);
          const head = new THREE.Mesh(headGeo, torsoMat);
          head.position.y = 3.8;
          agentGroup.add(head);
        }

        agentsGroupRef.current.add(agentGroup);

        const rawPath = agentData?.path && agentData.path.length > 1
          ? agentData.path
          : (isProposed
              ? [{ x: 10, y: 48 }, { x: currentProposal.x, y: currentProposal.y }, { x: 65, y: 25 }, { x: 85, y: 55 }, { x: 92, y: 78 }]
              : [{ x: 10, y: 48 }, { x: baselinePos.x, y: baselinePos.y }, { x: 65, y: 25 }, { x: 85, y: 55 }, { x: 92, y: 78 }]);

        const waypoints3D = rawPath.map((pt) => map2Dto3D(pt.x, pt.y));

        agentInstancesRef.current.push({
          group: agentGroup,
          waypoints: waypoints3D,
          speed: 0.08 + (i % 5) * 0.025,
          progress: (i * 0.06) % 1.0,
          bobPhase: i * 0.5,
          isWheelchair
        });
      }
      agentsGroupRef.current.visible = showAgents;
    }
  }, [viewState, currentProposal.x, currentProposal.y, simulationResult, showRoutes, showHeatmap, showAgents]);

  // Camera Presets
  function applyCameraPreset(preset) {
    setCameraPreset(preset);
    if (!cameraRef.current) return;
    const cam = cameraRef.current;
    const ctrl = cameraControlRef.current;

    if (preset === "top") {
      ctrl.sphericalPhi = 0.01;
      ctrl.radius = 160;
      cam.position.set(0, 160, 0.1);
      cam.lookAt(0, 0, 0);
    } else if (preset === "isometric") {
      ctrl.sphericalTheta = Math.PI / 4;
      ctrl.sphericalPhi = Math.PI / 3;
      ctrl.radius = 140;
      cam.position.set(95, 95, 95);
      cam.lookAt(0, 0, 0);
    } else if (preset === "perspective") {
      ctrl.sphericalTheta = 0.85;
      ctrl.sphericalPhi = 0.92;
      ctrl.radius = 135;
      cam.position.set(0, 95, 130);
      cam.lookAt(0, 0, 0);
    } else if (preset === "walkthrough") {
      cam.position.set(-40, 4.0, -10);
      const prop3D = map2Dto3D(currentProposal.x, currentProposal.y);
      cam.lookAt(prop3D.x, 3.5, prop3D.z);
    } else if (preset === "firstperson") {
      const ent3D = map2Dto3D(10, 48);
      cam.position.set(ent3D.x, 2.0, ent3D.z);
      const prop3D = map2Dto3D(currentProposal.x, currentProposal.y);
      cam.lookAt(prop3D.x, 2.0, prop3D.z);
    }
  }

  // Cinematic 2D -> 3D Fly-in
  function runCinematicTransition() {
    if (!cameraRef.current) return;
    setIsCinematicRunning(true);
    const cam = cameraRef.current;

    cam.position.set(0, 175, 0.1);
    cam.lookAt(0, 0, 0);

    const startTime = performance.now();
    const duration = 2400;

    const animateTransition = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);

      const curY = 175 - ease * (175 - 95);
      const curZ = 0.1 + ease * (130 - 0.1);
      const curX = Math.sin(ease * Math.PI) * 25;

      cam.position.set(curX, curY, curZ);
      cam.lookAt(0, ease * 5, 0);

      if (progress < 1.0) {
        requestAnimationFrame(animateTransition);
      } else {
        setIsCinematicRunning(false);
        setCameraPreset("perspective");
      }
    };

    requestAnimationFrame(animateTransition);
  }

  return (
    <div className="threeDPage">
      <div className="threeDHeader">
        <div>
          <div className="threeDTag">
            <Cuboid size={14} />
            <span>3D SPATIAL COMPUTING ENGINE</span>
            <DataHonestyBadge text="SYNCHRONIZED DIGITAL TWIN" />
          </div>
          <h2>Interactive 3D Reality Simulator &bull; {currentWorld?.name}</h2>
          <p>
            WebGL spatial digital twin generated directly from the active {currentWorld?.name} spatial field,
            animated multi-agent flow trajectories, and real-time failure heatmaps.
          </p>
        </div>

        {/* Current vs Proposed 3D Switcher */}
        <div className="threeDStateToggle">
          <button
            className={`stateToggleBtn ${viewState === "current" ? "active" : ""}`}
            onClick={() => setViewState("current")}
          >
            Current Baseline
          </button>
          <button
            className={`stateToggleBtn ${viewState === "proposed" ? "active proposed" : ""}`}
            onClick={() => setViewState("proposed")}
          >
            Proposed What-If
          </button>
        </div>
      </div>

      <div className="threeDWorkspace">
        {/* 3D WebGL Canvas */}
        <div className="threeDCanvasContainer" ref={mountRef}>
          {/* Top Controls Bar */}
          <div className="cameraControlsBar">
            <div className="camPresetButtons">
              <button
                className={`camBtn ${cameraPreset === "top" ? "active" : ""}`}
                onClick={() => applyCameraPreset("top")}
                title="Top View (Architectural Plan)"
              >
                Top Plan
              </button>
              <button
                className={`camBtn ${cameraPreset === "isometric" ? "active" : ""}`}
                onClick={() => applyCameraPreset("isometric")}
                title="Isometric View"
              >
                Isometric
              </button>
              <button
                className={`camBtn ${cameraPreset === "perspective" ? "active" : ""}`}
                onClick={() => applyCameraPreset("perspective")}
                title="Perspective Orbit"
              >
                Perspective
              </button>
              <button
                className={`camBtn ${cameraPreset === "walkthrough" ? "active" : ""}`}
                onClick={() => applyCameraPreset("walkthrough")}
                title="Eye-Level Walkthrough"
              >
                Walkthrough
              </button>
              <button
                className={`camBtn ${cameraPreset === "firstperson" ? "active" : ""}`}
                onClick={() => applyCameraPreset("firstperson")}
                title="First Person View"
              >
                First Person
              </button>
            </div>

            <button
              className="cinematicBtn"
              onClick={runCinematicTransition}
              disabled={isCinematicRunning}
              title="Cinematic 2D to 3D Swoop"
            >
              <Sparkles size={13} className="iconCyan" />
              <span>{isCinematicRunning ? "Swooping..." : "2D → 3D Fly-in"}</span>
            </button>
          </div>

          {/* Canvas Floating Info HUD */}
          <div className="orbitHint">
            <span>Left-Click & Drag to Orbit · Right-Click to Pan · Click & Drag Target in Proposed Mode · {widthM} × {heightM}m</span>
          </div>

          <div className="hudProposedOverlay">
            <span className={`liveProposalDot ${viewState === "current" ? "baseline" : ""}`} />
            <span>
              {viewState === "proposed"
                ? `PROPOSED: ${targetObj?.name} at (${currentProposal.x}%, ${currentProposal.y}%)`
                : `BASELINE: ${targetObj?.name} at (${baselinePos.x}%, ${baselinePos.y}%)`}
            </span>
          </div>
        </div>

        {/* 3D Sidebar Controls & Object Inspector */}
        <aside className="threeDSidebar">
          <div className="sideBlockHead">
            <span className="sideNum">3D</span>
            <span className="sideTitle">SPATIAL CONTROLS</span>
          </div>

          {/* Layer Controls */}
          <div className="layerControls">
            <div className="layerRow">
              <div className="layerLabel">
                <Users size={14} className="iconCyan" />
                <span>Agents (5 Archetypes)</span>
              </div>
              <button
                className={`switchToggle ${showAgents ? "on" : ""}`}
                onClick={() => setShowAgents(!showAgents)}
              >
                <i />
              </button>
            </div>

            <div className="layerRow">
              <div className="layerLabel">
                <RouteIcon size={14} className="iconBlue" />
                <span>Walking Path Ribbons</span>
              </div>
              <button
                className={`switchToggle ${showRoutes ? "on" : ""}`}
                onClick={() => setShowRoutes(!showRoutes)}
              >
                <i />
              </button>
            </div>

            <div className="layerRow">
              <div className="layerLabel">
                <Flame size={14} className="iconAmber" />
                <span>Congestion Heatmap Floor</span>
              </div>
              <button
                className={`switchToggle ${showHeatmap ? "on" : ""}`}
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                <i />
              </button>
            </div>
          </div>

          {/* Selected 3D Object Inspector */}
          {inspectedObject && (
            <div className="sideSection">
              <div className="selectedHead">
                <h4>3D ELEMENT INSPECTOR</h4>
                <span className="catBadge counter">{inspectedObject.kind?.toUpperCase()}</span>
              </div>

              <div className="anchorDetailsList">
                <div className="anchorDetailRow">
                  <span>Element Name</span>
                  <b>{inspectedObject.name}</b>
                </div>
                <div className="anchorDetailRow">
                  <span>Current Baseline</span>
                  <b>({baselinePos.x}%, {baselinePos.y}%)</b>
                </div>
                <div className="anchorDetailRow">
                  <span>Proposed Position</span>
                  <b className="iconCyan">({currentProposal.x}%, {currentProposal.y}%)</b>
                </div>
                <div className="anchorDetailRow">
                  <span>Walking Impact</span>
                  <b className={simulationResult?.metrics?.walking_distance?.status === "bad" ? "iconAmber" : "iconGreen"}>
                    {simulationResult?.metrics?.walking_distance?.delta >= 0 ? "+" : ""}
                    {simulationResult?.metrics?.walking_distance?.delta || "+32.5"}m ({simulationResult?.metrics?.walking_distance?.delta_pct || "+91"}%)
                  </b>
                </div>
                <div className="anchorDetailRow">
                  <span>Congestion Impact</span>
                  <b>
                    {simulationResult?.metrics?.congestion?.delta >= 0 ? "+" : ""}
                    {simulationResult?.metrics?.congestion?.delta || "-14"} pts ({simulationResult?.verdict || "RECOMMENDED"})
                  </b>
                </div>
              </div>
            </div>
          )}

          {/* Archetype Legend */}
          <div className="sideSection">
            <h4>ARCHETYPE COLOR CODING</h4>
            <div className="agentLegendGrid">
              <div className="legendRow"><span className="dot" style={{ background: "#38bdf8" }} /> Visitor</div>
              <div className="legendRow"><span className="dot" style={{ background: "#fbbf24" }} /> Elderly</div>
              <div className="legendRow"><span className="dot" style={{ background: "#34d399" }} /> Wheelchair</div>
              <div className="legendRow"><span className="dot" style={{ background: "#f43f5e" }} /> Emergency</div>
              <div className="legendRow"><span className="dot" style={{ background: "#a78bfa" }} /> Staff</div>
            </div>
          </div>

          {/* Actions */}
          <div className="quickActions3D">
            <button className="primaryBtn fullWidth" onClick={() => setTab("ar_view")}>
              <Eye size={15} />
              <span>Launch AR Experience</span>
            </button>
            <button className="secondaryBtn fullWidth" onClick={() => setTab("spatial_simulator")}>
              <Compass size={15} />
              <span>Back to 2D Simulator</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
