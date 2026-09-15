export type Position = { x: number; y?: number; z: number };

export type Dimensions = { width: number; depth: number; height?: number };

export type Bounds = { min_x: number; min_z: number; max_x: number; max_z: number };

export type SpatialObject = {
  id: string;
  type: string;
  position: Position;
  dimensions: Dimensions;
  blocking: boolean;
  rotation_y: number;
  attributes: Record<string, unknown>;
};

export type Door = {
  id: string;
  name?: string | null;
  position: Position;
  width: number;
  is_open: boolean;
  blocking_when_closed: boolean;
};

export type AccessPoint = {
  id: string;
  position: Position;
  semantic_type: string;
  door_id?: string | null;
};

export type SpatialWorld = {
  id: string;
  name: string;
  dimensions: Dimensions;
  rooms: Array<{ id: string; name: string; bounds: Bounds }>;
  walls: Array<{ id: string; start: Position; end: Position; blocking: boolean }>;
  doors: Door[];
  objects: SpatialObject[];
  zones: Array<{ id: string; name: string; bounds: Bounds; purpose?: string | null }>;
  entrances: AccessPoint[];
  exits: AccessPoint[];
};
