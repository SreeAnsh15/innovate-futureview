import math
from typing import List, Tuple, Dict, Any, Optional
from ..schemas import Point, SceneObject

def euclidean_distance(p1: Point, p2: Point) -> float:
    return math.hypot(p1.x - p2.x, p1.y - p2.y)

def point_in_rect(p: Point, obj: SceneObject, padding: float = 2.0) -> bool:
    half_w = (obj.w / 2.0) + padding
    half_h = (obj.h / 2.0) + padding
    return (obj.x - half_w <= p.x <= obj.x + half_w) and (obj.y - half_h <= p.y <= obj.y + half_h)

def generate_smooth_path(
    start: Point,
    target: Point,
    waypoints: List[Point],
    obstacles: List[SceneObject],
    steps: int = 24
) -> List[Point]:
    """
    Generates a deterministic smooth path from start to target via intermediate waypoints,
    steering around obstacle bounding boxes.
    """
    all_nodes = [start] + waypoints + [target]
    full_path: List[Point] = []

    for i in range(len(all_nodes) - 1):
        n1 = all_nodes[i]
        n2 = all_nodes[i + 1]
        
        # Subdivide segment
        sub_steps = max(4, steps // (len(all_nodes) - 1))
        for step in range(sub_steps):
            t = step / float(sub_steps)
            # Linear interpolation
            cur_x = n1.x + (n2.x - n1.x) * t
            cur_y = n1.y + (n2.y - n1.y) * t
            
            p = Point(x=round(cur_x, 2), y=round(cur_y, 2))
            
            # Check obstacle deflection
            for obs in obstacles:
                if obs.kind in ["critical", "obstacle", "room"] and point_in_rect(p, obs, padding=1.5):
                    # Deflect around center
                    dy = cur_y - obs.y
                    deflect = 4.0 if dy >= 0 else -4.0
                    p.y = round(min(95.0, max(5.0, p.y + deflect)), 2)
            
            full_path.append(p)
            
    full_path.append(target)
    return full_path

def compute_route_graph(
    entrance: Point,
    service_desk: Point,
    waiting_area: Point,
    destination: Point,
    exit_point: Point,
    obstacles: List[SceneObject]
) -> List[Point]:
    """
    Creates the main operational flow sequence:
    Entrance -> Service Desk -> Waiting Area -> Destination -> Exit
    """
    waypoints = []
    
    # 1. Entrance to Service Desk corridor midpoint
    mid_entry = Point(x=(entrance.x + service_desk.x) / 2.0, y=(entrance.y + service_desk.y) / 2.0)
    waypoints.append(mid_entry)
    waypoints.append(service_desk)
    
    # 2. Service Desk to Waiting Area transition
    mid_wait = Point(x=(service_desk.x + waiting_area.x) / 2.0, y=min(service_desk.y, waiting_area.y))
    waypoints.append(mid_wait)
    waypoints.append(waiting_area)
    
    # 3. Waiting Area to Destination
    waypoints.append(destination)
    
    return generate_smooth_path(entrance, exit_point, waypoints, obstacles)
