import math
from typing import List, Dict, Tuple
from ..schemas import HeatmapPoint, Point

def generate_dynamic_heatmap(
    agent_paths: List[List[Point]],
    base_congestion: float,
    grid_cols: int = 10,
    grid_rows: int = 8
) -> List[HeatmapPoint]:
    """
    Computes a realistic 2D congestion heatmap by tracking spatial grid traversal frequencies.
    """
    # Create accumulator grid
    grid = [[0.0 for _ in range(grid_cols)] for _ in range(grid_rows)]
    
    # Accumulate visits across all agent paths
    for path in agent_paths:
        for pt in path:
            col = int(min(grid_cols - 1, max(0, (pt.x / 100.0) * grid_cols)))
            row = int(min(grid_rows - 1, max(0, (pt.y / 100.0) * grid_rows)))
            grid[row][col] += 1.5

    # Find maximum cell value to normalize
    max_val = max(1.0, max(max(r) for r in grid))
    
    heat_points: List[HeatmapPoint] = []
    
    # Convert active grid cells into gaussian-like hotspot points
    for r in range(grid_rows):
        for c in range(grid_cols):
            val = grid[r][c]
            if val > 0.5:
                norm_intensity = int(min(100, max(15, (val / max_val) * (base_congestion * 1.15))))
                center_x = round(((c + 0.5) / grid_cols) * 100.0, 1)
                center_y = round(((r + 0.5) / grid_rows) * 100.0, 1)
                heat_points.append(HeatmapPoint(x=center_x, y=center_y, intensity=norm_intensity))

    # Sort descending by intensity
    heat_points.sort(key=lambda p: p.intensity, reverse=True)
    return heat_points[:16]
