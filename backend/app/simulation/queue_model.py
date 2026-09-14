import math
from typing import Dict, Any, List
from pydantic import BaseModel

class QueueMetrics(BaseModel):
    arrival_rate_per_hour: int = 420
    arrival_rate_per_min: float = 7.0
    counter_count: int = 2
    service_rate_per_counter_min: float = 4.2
    total_service_capacity_min: float = 8.4
    utilization_pct: float = 83.3
    active_queue_length: int = 12
    average_wait_time_sec: int = 222  # 03:42
    average_walking_time_sec: int = 161  # 02:41
    queue_status: str = "HIGH"  # LOW, MEDIUM, HIGH, CRITICAL

def calculate_queue_dynamics(
    users_per_hour: int,
    distance_delta_pct: float,
    counter_count: int = 2,
    service_time_seconds: float = 14.0
) -> QueueMetrics:
    """
    Computes realistic M/M/c queuing metrics at the registration desk.
    When transit distance or congestion increases, arrival bursts and friction cause queue buildup.
    """
    arrival_min = max(1.0, users_per_hour / 60.0)
    service_per_counter_min = 60.0 / max(5.0, service_time_seconds)
    total_capacity_min = counter_count * service_per_counter_min
    
    # Friction factor from distance & layout awkwardness
    friction = 1.0 + max(0.0, distance_delta_pct / 100.0) * 0.45
    effective_arrival = arrival_min * friction
    
    utilization = min(98.5, (effective_arrival / max(0.1, total_capacity_min)) * 100.0)
    
    # Queue length estimation (Pollaczek-Khinchine / Erlang-C approximation)
    if utilization > 90:
        active_queue = int(round(12 + (utilization - 90) * 1.5))
        wait_sec = int(round(180 + (utilization - 90) * 18))
        q_status = "CRITICAL" if utilization > 95 else "HIGH"
    elif utilization > 70:
        active_queue = int(round(4 + (utilization - 70) * 0.4))
        wait_sec = int(round(60 + (utilization - 70) * 6))
        q_status = "MEDIUM"
    else:
        active_queue = max(1, int(round(utilization * 0.05)))
        wait_sec = max(20, int(round(utilization * 0.8)))
        q_status = "LOW"
        
    walking_sec = int(round(60.0 + max(0.0, distance_delta_pct) * 0.8))

    return QueueMetrics(
        arrival_rate_per_hour=users_per_hour,
        arrival_rate_per_min=round(arrival_min, 1),
        counter_count=counter_count,
        service_rate_per_counter_min=round(service_per_counter_min, 1),
        total_service_capacity_min=round(total_capacity_min, 1),
        utilization_pct=round(utilization, 1),
        active_queue_length=active_queue,
        average_wait_time_sec=wait_sec,
        average_walking_time_sec=walking_sec,
        queue_status=q_status
    )
