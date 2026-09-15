import { useRef, useState, type PointerEvent, type WheelEvent } from "react";
import type { AccessPoint, SpatialWorld } from "../types/world";

type Viewport = { x: number; z: number; width: number; height: number };

const MIN_ZOOM = 0.45;
const MAX_ZOOM = 2.75;

function labelFor(object: SpatialWorld["objects"][number]) {
  const name = object.attributes.name;
  return typeof name === "string" ? name : object.type.replaceAll("_", " ");
}

function accessLabel(access: AccessPoint) {
  return access.semantic_type.replaceAll("_", " ");
}

export function SpatialCanvas({ world }: { world: SpatialWorld }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStart = useRef<{ clientX: number; clientY: number; viewport: Viewport } | undefined>(undefined);
  const base = { x: 0, z: 0, width: world.dimensions.width, height: world.dimensions.depth };
  const [viewport, setViewport] = useState<Viewport>(base);

  const resetView = () => setViewport(base);
  const onWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const factor = event.deltaY > 0 ? 1.16 : 0.86;
    const currentScale = base.width / viewport.width;
    const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentScale / factor));
    const nextWidth = base.width / scale;
    const nextHeight = base.height / scale;
    const pointX = viewport.x + (event.clientX - bounds.left) / bounds.width * viewport.width;
    const pointZ = viewport.z + (event.clientY - bounds.top) / bounds.height * viewport.height;
    setViewport({ x: pointX - (event.clientX - bounds.left) / bounds.width * nextWidth, z: pointZ - (event.clientY - bounds.top) / bounds.height * nextHeight, width: nextWidth, height: nextHeight });
  };
  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { clientX: event.clientX, clientY: event.clientY, viewport };
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragStart.current || !svgRef.current) return;
    const bounds = svgRef.current.getBoundingClientRect();
    const start = dragStart.current;
    setViewport({ ...start.viewport, x: start.viewport.x - (event.clientX - start.clientX) / bounds.width * start.viewport.width, z: start.viewport.z - (event.clientY - start.clientY) / bounds.height * start.viewport.height });
  };
  const endDrag = () => { dragStart.current = undefined; };

  return (
    <div className="canvas-wrap">
      <div className="canvas-titlebar"><span>Baseline layout</span><span>{world.dimensions.width}m × {world.dimensions.depth}m</span></div>
      <svg
        ref={svgRef}
        className="spatial-canvas"
        viewBox={`${viewport.x} ${viewport.z} ${viewport.width} ${viewport.height}`}
        role="img"
        aria-label={`Interactive plan of ${world.name}. Drag to pan and use the mouse wheel to zoom.`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M 1 0 L 0 0 0 1" fill="none" stroke="currentColor" strokeWidth="0.025" /></pattern>
        </defs>
        <rect x="0" y="0" width={world.dimensions.width} height={world.dimensions.depth} className="world-floor" />
        <rect x="0" y="0" width={world.dimensions.width} height={world.dimensions.depth} className="world-grid" />
        {world.rooms.map((room) => <g key={room.id}><rect x={room.bounds.min_x} y={room.bounds.min_z} width={room.bounds.max_x - room.bounds.min_x} height={room.bounds.max_z - room.bounds.min_z} className="room" /><text x={room.bounds.min_x + 0.3} y={room.bounds.min_z + 0.55} className="room-label">{room.name}</text></g>)}
        {world.zones.map((zone) => <g key={zone.id}><rect x={zone.bounds.min_x} y={zone.bounds.min_z} width={zone.bounds.max_x - zone.bounds.min_x} height={zone.bounds.max_z - zone.bounds.min_z} className="zone" /><text x={zone.bounds.min_x + 0.2} y={zone.bounds.min_z + 0.45} className="zone-label">{zone.name}</text></g>)}
        <rect x="0" y="0" width={world.dimensions.width} height={world.dimensions.depth} className="world-boundary" />
        {world.walls.filter((wall) => wall.blocking).map((wall) => <line key={wall.id} x1={wall.start.x} y1={wall.start.z} x2={wall.end.x} y2={wall.end.z} className="wall" />)}
        {world.objects.map((object) => {
          const swap = object.rotation_y % 180 !== 0;
          const width = swap ? object.dimensions.depth : object.dimensions.width;
          const depth = swap ? object.dimensions.width : object.dimensions.depth;
          return <g key={object.id}><rect x={object.position.x - width / 2} y={object.position.z - depth / 2} width={width} height={depth} rx="0.12" className={object.blocking ? "spatial-object blocking" : "spatial-object"} /><text x={object.position.x} y={object.position.z + 0.08} className="object-label">{labelFor(object)}</text></g>;
        })}
        {world.doors.map((door) => <line key={door.id} x1={door.position.x - door.width / 2} y1={door.position.z} x2={door.position.x + door.width / 2} y2={door.position.z} className={door.is_open ? "door open" : "door closed"} />)}
        {world.entrances.map((access) => <AccessMarker key={access.id} access={access} kind="entrance" />)}
        {world.exits.map((access) => <AccessMarker key={access.id} access={access} kind="exit" />)}
      </svg>
      <button className="reset-view" type="button" onClick={resetView}>Reset view</button>
    </div>
  );
}

function AccessMarker({ access, kind }: { access: AccessPoint; kind: "entrance" | "exit" }) {
  return <g className={`access-marker ${kind}`}><circle cx={access.position.x} cy={access.position.z} r="0.32" /><path d={kind === "entrance" ? `M ${access.position.x - .11} ${access.position.z} H ${access.position.x + .11}` : `M ${access.position.x - .11} ${access.position.z - .1} L ${access.position.x + .11} ${access.position.z + .1} M ${access.position.x + .11} ${access.position.z - .1} L ${access.position.x - .11} ${access.position.z + .1}`} /><text x={access.position.x + 0.42} y={access.position.z - 0.25} className="access-label">{accessLabel(access)}</text></g>;
}
