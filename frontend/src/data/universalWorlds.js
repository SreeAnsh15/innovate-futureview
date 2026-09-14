export const UNIVERSAL_WORLDS = [
  {
    id: "spatial-lab",
    name: "Metropolitan Architectural & Spatial Lab",
    domain: "spatial",
    domain_name: "Spatial Intelligence",
    supported_domains: ["spatial", "healthcare", "crowd"],
    type: "Architectural Complex",
    size: "100 × 75 m",
    width_m: 100.0,
    height_m: 75.0,
    accent_color: "#38bdf8",
    tagline: "What if the physical world changes?",
    summary: "High-throughput civic concourse with modular partitions, movable service desks, ADA access ramps, and primary ingress/egress corridors.",
    primary_what_if: "What if the central service desk is relocated 15m east to expand ADA access?",
    what_if_pills: [
      "What if central desk shifts 15m East?",
      "What if main concourse narrows by 2.5m?",
      "What if ADA ramp gradient is adjusted to 1:12?",
      "What if secondary egress door is locked?"
    ],
    what_breaks_first: {
      target: "Central Circulation Spine",
      time_min: 14,
      impact: "HIGH",
      severity_pct: 78,
      reason: "Concourse narrowing exceeds peak pedestrian density threshold, inducing turbulent counterflow."
    },
    zones: [
      { id: "z_foyer", name: "Main Civic Foyer", color: "#38bdf8", x1: 5, y1: 25, x2: 30, y2: 65 },
      { id: "z_spine", name: "Central Circulation Spine", color: "#f43f5e", x1: 30, y1: 30, x2: 65, y2: 60 },
      { id: "z_services", name: "Modular Service Pods", color: "#10b981", x1: 65, y1: 15, x2: 95, y2: 45 },
      { id: "z_lounge", name: "Public Waiting Gallery", color: "#a855f7", x1: 65, y1: 50, x2: 95, y2: 80 }
    ],
    objects: [
      { id: "entrance_main", name: "Main Glass Portico", kind: "entrance", x: 10, y: 45, w: 12, h: 14, movable: false },
      { id: "registration", name: "Central Service Desk", kind: "service", x: 42, y: 45, w: 14, h: 8, movable: true },
      { id: "info_kiosk", name: "Wayfinding Info Hub", kind: "service", x: 28, y: 35, w: 8, h: 8, movable: true },
      { id: "ada_ramp", name: "ADA Accessible Ramp", kind: "service", x: 20, y: 60, w: 16, h: 6, movable: false },
      { id: "egress_east", name: "East Emergency Egress", kind: "exit", x: 92, y: 70, w: 10, h: 12, movable: false }
    ],
    cascade_nodes: [
      { id: "c1", title: "Desk Repositioned 15m", time: "T+0m", status: "MUTATION", desc: "Core spatial configuration altered." },
      { id: "c2", title: "Spine Density +42%", time: "T+6m", status: "WARNING", desc: "Pedestrian bottleneck forms at narrow junction." },
      { id: "c3", title: "ADA Route Cleared", time: "T+12m", status: "POSITIVE", desc: "Wheelchair traversal time reduced by 34%." },
      { id: "c4", title: "Peak Flow Stabilized", time: "T+25m", status: "RECOMMENDED", desc: "Concourse counterflow reaches steady state." }
    ],
    pareto_alternatives: [
      { id: "alt_a", name: "Option A: Split Twin Kiosks", score: 89, delta: "+18 pts", risk: "Low", cost: "$12k", desc: "Replaces single desk with 2 perimeter service pods." },
      { id: "alt_b", name: "Option B: Recessed Alcove", score: 84, delta: "+13 pts", risk: "Low", cost: "$8k", desc: "Nests service counter into North wall boundary." },
      { id: "alt_c", name: "Option C: Dynamic Digital Wayfinding", score: 79, delta: "+8 pts", risk: "Med", cost: "$24k", desc: "Automates check-in via 4 spatial mobile beacons." }
    ]
  },
  {
    id: "hospital-demo",
    name: "MetroCare Emergency Department",
    domain: "healthcare",
    domain_name: "Healthcare Operations",
    supported_domains: ["spatial", "healthcare", "disaster", "rescue"],
    type: "Healthcare Facility",
    size: "120 × 80 m",
    width_m: 120.0,
    height_m: 80.0,
    accent_color: "#06b6d4",
    tagline: "What happens under operational pressure?",
    summary: "Full-scale tertiary hospital outpatient wing, triage bays, ICU wards, CT imaging lab, and emergency ambulance dock.",
    primary_what_if: "What if emergency arrivals surge by 45% and CT Scanner 1 goes offline?",
    what_if_pills: [
      "What if arrivals surge by +45%?",
      "What if CT Scanner 1 goes offline?",
      "What if Fast-Track Triage pod is added?",
      "What if ICU bed capacity drops by 20%?"
    ],
    what_breaks_first: {
      target: "Triage Assessment Corridor",
      time_min: 18,
      impact: "CRITICAL",
      severity_pct: 92,
      reason: "Inflow exceeds 7.2 patients/min triage capacity, spilling into ambulance bay."
    },
    zones: [
      { id: "z_ent", name: "Main Ingress Foyer", color: "#38bdf8", x1: 5, y1: 35, x2: 25, y2: 55 },
      { id: "z_triage", name: "Emergency Triage Spine", color: "#f43f5e", x1: 25, y1: 35, x2: 50, y2: 65 },
      { id: "z_icu", name: "Critical Care ICU", color: "#a855f7", x1: 65, y1: 15, x2: 95, y2: 45 },
      { id: "z_pharma", name: "Outpatient Pharmacy", color: "#10b981", x1: 65, y1: 50, x2: 95, y2: 75 }
    ],
    objects: [
      { id: "entrance_main", name: "Main Entrance Ramp", kind: "entrance", x: 10, y: 45, w: 12, h: 14, movable: false },
      { id: "registration", name: "Registration Desk", kind: "service", x: 38, y: 40, w: 14, h: 8, movable: true },
      { id: "triage_bay", name: "Triage Assessment Bay", kind: "critical", x: 42, y: 55, w: 14, h: 10, movable: true },
      { id: "ct_scanner", name: "CT Scanner Lab 01", kind: "service", x: 68, y: 30, w: 14, h: 12, movable: false },
      { id: "icu_ward", name: "Inpatient ICU Beds", kind: "room", x: 82, y: 28, w: 18, h: 14, movable: false },
      { id: "emergency_exit", name: "Emergency Egress Port", kind: "exit", x: 90, y: 75, w: 10, h: 12, movable: false }
    ],
    cascade_nodes: [
      { id: "hc1", title: "Surge +45% Initiated", time: "T+0m", status: "MUTATION", desc: "Arrival volume rises from 4.2 to 7.8/min." },
      { id: "hc2", title: "Triage Queue Saturation", time: "T+18m", status: "CRITICAL", desc: "Wait times jump from 4.5m to 28.0m." },
      { id: "hc3", title: "CT Imaging Backlog", time: "T+35m", status: "WARNING", desc: "Imaging queue exceeds physical hallway holding." },
      { id: "hc4", title: "Ambulance Diversion", time: "T+50m", status: "CRITICAL", desc: "Level 1 Trauma cases rerouted to adjacent county." }
    ],
    pareto_alternatives: [
      { id: "hc_alt1", name: "Option A: Fast-Track Ingress Pod", score: 91, delta: "+24 pts", risk: "Low", cost: "$15k", desc: "Deploys rapid ambulatory screening triage pod at main foyer." },
      { id: "hc_alt2", name: "Option B: Decouple CT Pre-Auth", score: 85, delta: "+18 pts", risk: "Low", cost: "$5k", desc: "Parallelizes scan consent with mobile registration cart." },
      { id: "hc_alt3", name: "Option C: Overflow Surge Bay", score: 82, delta: "+15 pts", risk: "Med", cost: "$40k", desc: "Converts outpatient waiting lounge into 6 flex beds." }
    ]
  },
  {
    id: "urban-disaster",
    name: "Riverfront Metropolitan Crisis Zone",
    domain: "disaster",
    domain_name: "Disaster Intelligence",
    supported_domains: ["disaster", "rescue", "road", "spatial"],
    type: "Urban River Basin",
    size: "250 × 180 m",
    width_m: 250.0,
    height_m: 180.0,
    accent_color: "#ef4444",
    tagline: "What breaks next?",
    summary: "Dense urban arterial river basin with low-elevation floodplains, bridges, medical centers, and emergency relief shelters.",
    primary_what_if: "What if river rises 1.8m and North River Bridge access is severed?",
    what_if_pills: [
      "What if North Bridge is severed by 1.8m flood?",
      "What if 10,000 citizens evacuate via Sector B?",
      "What if emergency generator fuel runs out in 6h?",
      "What if high-capacity hover rescue craft is staged?"
    ],
    what_breaks_first: {
      target: "North River Causeway",
      time_min: 22,
      impact: "CRITICAL",
      severity_pct: 95,
      reason: "Water velocity reaches 3.2 m/s overtopping barrier; cuts off primary evacuation artery for 4,200 residents."
    },
    zones: [
      { id: "z_basin", name: "River Inundation Basin", color: "#0284c7", x1: 10, y1: 40, x2: 90, y2: 60 },
      { id: "z_civic", name: "High-Ground Civic Shelter", color: "#10b981", x1: 60, y1: 10, x2: 95, y2: 35 },
      { id: "z_trauma", name: "Regional Trauma Center", color: "#f43f5e", x1: 10, y1: 65, x2: 45, y2: 95 }
    ],
    objects: [
      { id: "bridge_north", name: "North River Bridge", kind: "service", x: 50, y: 50, w: 18, h: 10, movable: true },
      { id: "shelter_a", name: "Civic Relief Shelter A", kind: "room", x: 78, y: 22, w: 16, h: 12, movable: false },
      { id: "shelter_b", name: "East High School Shelter", kind: "room", x: 82, y: 80, w: 16, h: 12, movable: false },
      { id: "hospital_dock", name: "Hospital Ambulance Ingress", kind: "entrance", x: 28, y: 80, w: 14, h: 10, movable: false }
    ],
    cascade_nodes: [
      { id: "dis1", title: "Flood Surge +1.8m", time: "T+0m", status: "MUTATION", desc: "Basin inundation begins." },
      { id: "dis2", title: "North Bridge Inundated", time: "T+22m", status: "CRITICAL", desc: "4,200 citizens lose primary escape corridor." },
      { id: "dis3", title: "South Ferry Overloaded", time: "T+38m", status: "WARNING", desc: "Queue grows to 2,800 persons at dock." },
      { id: "dis4", title: "High-Ground Shelter Safe", time: "T+60m", status: "RECOMMENDED", desc: "Secondary arterial reroutes successfully." }
    ],
    pareto_alternatives: [
      { id: "dis_alt1", name: "Option A: Deploy Modular Pontoon", score: 93, delta: "+31 pts", risk: "Low", cost: "$50k", desc: "Deploys rapid army pontoon bridge 300m upstream." },
      { id: "dis_alt2", name: "Option B: Staggered Sector Evacuation", score: 87, delta: "+25 pts", risk: "Low", cost: "$0k", desc: "Phases evacuation sirens by 15-minute neighborhood blocks." },
      { id: "dis_alt3", name: "Option C: Counter-Current Water Barrier", score: 80, delta: "+18 pts", risk: "Med", cost: "$85k", desc: "Erects rapid pneumatic inflatable water dam." }
    ]
  },
  {
    id: "city-intersection",
    name: "Grand Avenue Multi-Modal Junction",
    domain: "road",
    domain_name: "Road Safety",
    supported_domains: ["road", "environmental", "spatial"],
    type: "Urban Arterial Intersection",
    size: "100 × 100 m",
    width_m: 100.0,
    height_m: 100.0,
    accent_color: "#f59e0b",
    tagline: "The road network that simulates near-misses.",
    summary: "High-volume dual-carriageway crossing with high-density pedestrian zebra crossings, dedicated cycleways, and transit bus lanes.",
    primary_what_if: "What if vehicle traffic surges 40% during heavy rain with 45s signal cycle?",
    what_if_pills: [
      "What if traffic surges 40% in rain?",
      "What if signal cycle changes from 45s to 75s?",
      "What if dedicated protected bike lane is added?",
      "What if left turns are restricted during rush hour?"
    ],
    what_breaks_first: {
      target: "West Crosswalk Conflict Zone",
      time_min: 8,
      impact: "HIGH",
      severity_pct: 88,
      reason: "Right-turning vehicles conflict with pedestrian walk phase in reduced braking distance conditions."
    },
    zones: [
      { id: "z_cross", name: "Pedestrian Crosswalk Spine", color: "#fbbf24", x1: 35, y1: 35, x2: 65, y2: 65 },
      { id: "z_bike", name: "Protected Cycle Track", color: "#34d399", x1: 5, y1: 5, x2: 95, y2: 25 }
    ],
    objects: [
      { id: "crosswalk_west", name: "West Pedestrian Crossing", kind: "service", x: 35, y: 50, w: 10, h: 20, movable: true },
      { id: "signal_controller", name: "Master Signal Controller", kind: "service", x: 65, y: 35, w: 8, h: 8, movable: true },
      { id: "bus_stop", name: "Grand Transit Bus Bay", kind: "room", x: 20, y: 20, w: 16, h: 8, movable: false }
    ],
    cascade_nodes: [
      { id: "rd1", title: "Traffic Surge +40%", time: "T+0m", status: "MUTATION", desc: "Inflow reaches 2,400 vehicles/hr." },
      { id: "rd2", title: "Near-Miss Spike (4.8x)", time: "T+8m", status: "WARNING", desc: "Conflict points multiply at West Zebra." },
      { id: "rd3", title: "Bus Lane Encroachment", time: "T+18m", status: "CRITICAL", desc: "Transit delays propagate through entire route 4." },
      { id: "rd4", title: "Adaptive Split Active", time: "T+30m", status: "RECOMMENDED", desc: "Smart phase timing reduces queue spillover." }
    ],
    pareto_alternatives: [
      { id: "rd_alt1", name: "Option A: Protected Leading Pedestrian Interval", score: 94, delta: "+28 pts", risk: "Low", cost: "$5k", desc: "Gives pedestrians a 6-second head start before vehicle green." },
      { id: "rd_alt2", name: "Option B: Diagonal Scramble Crossing", score: 88, delta: "+22 pts", risk: "Low", cost: "$15k", desc: "Halts all vehicles for 30s for complete pedestrian crossing." },
      { id: "rd_alt3", name: "Option C: Speed Cushion Table", score: 81, delta: "+15 pts", risk: "Low", cost: "$20k", desc: "Physically calms vehicle approach velocity to 25 km/h." }
    ]
  },
  {
    id: "stadium-arena",
    name: "National Sports & Festival Arena",
    domain: "crowd",
    domain_name: "Crowd Safety",
    supported_domains: ["crowd", "spatial", "disaster", "rescue"],
    type: "Mega Event Arena",
    size: "200 × 150 m",
    width_m: 200.0,
    height_m: 150.0,
    accent_color: "#ec4899",
    tagline: "The crowd that warns before danger starts.",
    summary: "35,000 capacity stadium bowl, perimeter security turnstile gates, central concourse ring, and emergency egress aprons.",
    primary_what_if: "What if Gate A turnstiles close during 850 visitors/min peak surge?",
    what_if_pills: [
      "What if Gate A closes during 850/min surge?",
      "What if egress width is widened by 4m?",
      "What if staggered departure protocol is enacted?",
      "What if central food plaza creates bottleneck?"
    ],
    what_breaks_first: {
      target: "Gate A Turnstile Funnel",
      time_min: 5,
      impact: "CRITICAL",
      severity_pct: 98,
      reason: "Crowd compression exceeds 5.4 persons/m²; dangerous shockwave pressure builds within 300 seconds."
    },
    zones: [
      { id: "z_concourse", name: "Main Circular Concourse", color: "#38bdf8", x1: 20, y1: 20, x2: 80, y2: 80 },
      { id: "z_gate_a", name: "Gate A Security Plaza", color: "#f43f5e", x1: 5, y1: 40, x2: 20, y2: 60 },
      { id: "z_gate_b", name: "Gate B Auxiliary Plaza", color: "#10b981", x1: 80, y1: 40, x2: 95, y2: 60 }
    ],
    objects: [
      { id: "gate_a", name: "Gate A Primary Turnstiles", kind: "entrance", x: 12, y: 50, w: 10, h: 18, movable: true },
      { id: "gate_b", name: "Gate B Turnstiles", kind: "entrance", x: 88, y: 50, w: 10, h: 18, movable: true },
      { id: "stadium_bowl", name: "Central Arena Seating", kind: "room", x: 50, y: 50, w: 40, h: 30, movable: false }
    ],
    cascade_nodes: [
      { id: "cr1", title: "Gate A Ingress Interrupted", time: "T+0m", status: "MUTATION", desc: "Turnstile throughput drops to zero." },
      { id: "cr2", title: "Density Hits 5.4 p/m²", time: "T+5m", status: "CRITICAL", desc: "Severe compressive forces at plaza entrance." },
      { id: "cr3", title: "Concourse Back-Pressure", time: "T+14m", status: "WARNING", desc: "Upstream ingress halted by safety marshals." },
      { id: "cr4", title: "Gate B Diversion Clear", time: "T+26m", status: "RECOMMENDED", desc: "Active dynamic signage redistributes 70% flow." }
    ],
    pareto_alternatives: [
      { id: "cr_alt1", name: "Option A: Dynamic Gate B Rerouting", score: 96, delta: "+34 pts", risk: "Low", cost: "$2k", desc: "Activates digital LED overhead wayfinding and opens Gate B auxiliary aprons." },
      { id: "cr_alt2", name: "Option B: Surge Retention Buffer", score: 89, delta: "+27 pts", risk: "Low", cost: "$12k", desc: "Deploys serpentine retractable queuing barriers to throttle velocity." },
      { id: "cr_alt3", name: "Option C: Perimeter Bypass Corridor", score: 83, delta: "+21 pts", risk: "Med", cost: "$60k", desc: "Opens external perimeter bypass fence to drain plaza pressure." }
    ]
  },
  {
    id: "highrise-rescue",
    name: "SkyTower Commercial & Residential Complex",
    domain: "rescue",
    domain_name: "Rescue Intelligence",
    supported_domains: ["rescue", "spatial", "disaster"],
    type: "High-Rise Mixed-Use",
    size: "80 × 80 m",
    width_m: 80.0,
    height_m: 80.0,
    accent_color: "#ea580c",
    tagline: "Simulate the rescue before entering the danger.",
    summary: "45-story commercial tower with central atrium, pressurized stairwells, refuge floors, and rooftop helipad.",
    primary_what_if: "What if Staircase B is compromised by rapid smoke spread on Floor 3?",
    what_if_pills: [
      "What if Staircase B fills with smoke?",
      "What if Floor 4 Refuge Door fails to seal?",
      "What if positive pressure fans activate in Stairwell A?",
      "What if 340 occupants evacuate simultaneously?"
    ],
    what_breaks_first: {
      target: "Stairwell B Smoke Damper",
      time_min: 7,
      impact: "CRITICAL",
      severity_pct: 94,
      reason: "HVAC backdraft carries heavy particulates, dropping visibility below 1.5m in secondary escape route."
    },
    zones: [
      { id: "z_atrium", name: "Central Atrium Void", color: "#f97316", x1: 35, y1: 35, x2: 65, y2: 65 },
      { id: "z_stair_a", name: "Pressurized Stairwell A", color: "#10b981", x1: 20, y1: 20, x2: 32, y2: 35 },
      { id: "z_stair_b", name: "Secondary Stairwell B", color: "#ef4444", x1: 68, y1: 65, x2: 80, y2: 80 }
    ],
    objects: [
      { id: "stair_a", name: "Stairwell A Core", kind: "exit", x: 26, y: 28, w: 10, h: 12, movable: false },
      { id: "stair_b", name: "Stairwell B Core", kind: "service", x: 74, y: 72, w: 10, h: 12, movable: true },
      { id: "refuge_zone", name: "Floor 4 Refuge Compartment", kind: "room", x: 50, y: 20, w: 18, h: 10, movable: false }
    ],
    cascade_nodes: [
      { id: "rs1", title: "Floor 3 Smoke Ignition", time: "T+0m", status: "MUTATION", desc: "Thermal plume initiates." },
      { id: "rs2", title: "Stairwell B Infiltration", time: "T+7m", status: "CRITICAL", desc: "Toxicity reaches 450 ppm CO." },
      { id: "rs3", title: "Refuge Floor Pressurization", time: "T+15m", status: "POSITIVE", desc: "Floor 4 compartment seals with 2h fire barrier." },
      { id: "rs4", title: "Helipad Egress Active", time: "T+28m", status: "RECOMMENDED", desc: "Rooftop extraction path established for top 6 floors." }
    ],
    pareto_alternatives: [
      { id: "rs_alt1", name: "Option A: Dynamic Overpressure Fan Activation", score: 95, delta: "+36 pts", risk: "Low", cost: "$10k", desc: "Injects 50 Pa positive air pressure to repel smoke from Stair A." },
      { id: "rs_alt2", name: "Option B: Auto-Isolating Magnetic Fire Doors", score: 90, delta: "+31 pts", risk: "Low", cost: "$18k", desc: "Instantly divides atrium floorplate into 3 smoke-sealed sectors." },
      { id: "rs_alt3", name: "Option C: Tactical Drone Interior Recon", score: 84, delta: "+25 pts", risk: "Med", cost: "$25k", desc: "Dispatches thermal LiDAR micro-drones for real-time occupant mapping." }
    ]
  },
  {
    id: "industrial-district",
    name: "East Industrial & Academic Buffer District",
    domain: "environmental",
    domain_name: "Environmental Exposure",
    supported_domains: ["environmental", "road", "spatial"],
    type: "Urban Industrial Perimeter",
    size: "300 × 200 m",
    width_m: 300.0,
    height_m: 200.0,
    accent_color: "#10b981",
    tagline: "The environmental exposure twin.",
    summary: "Mixed industrial manufacturing plants adjacent to school transit corridors, residential greenways, and logistics yards.",
    primary_what_if: "What if industrial plume disperses with East wind under +50% diesel truck emissions?",
    what_if_pills: [
      "What if East wind blows industrial plume toward school?",
      "What if diesel freight increases by 50%?",
      "What if a 15m vegetative bioswale buffer is planted?",
      "What if school recess schedule shifts by 45 mins?"
    ],
    what_breaks_first: {
      target: "School Ingress Walkway Zone",
      time_min: 16,
      impact: "HIGH",
      severity_pct: 86,
      reason: "PM2.5 concentration spikes to 148 µg/m³ along the unshielded student arrival corridor."
    },
    zones: [
      { id: "z_plant", name: "Manufacturing Complex", color: "#64748b", x1: 10, y1: 20, x2: 45, y2: 60 },
      { id: "z_school", name: "Public School & Campus", color: "#38bdf8", x1: 65, y1: 40, x2: 95, y2: 85 },
      { id: "z_green", name: "Civic Buffer Parkland", color: "#22c55e", x1: 45, y1: 20, x2: 65, y2: 90 }
    ],
    objects: [
      { id: "exhaust_stack", name: "Primary Industrial Chimney", kind: "service", x: 25, y: 40, w: 12, h: 12, movable: true },
      { id: "school_gate", name: "School Ingress Walkway", kind: "entrance", x: 75, y: 60, w: 12, h: 10, movable: false },
      { id: "freight_corridor", name: "Heavy Vehicle Freight Road", kind: "service", x: 50, y: 50, w: 10, h: 30, movable: false }
    ],
    cascade_nodes: [
      { id: "env1", title: "Wind Direction Shifts East", time: "T+0m", status: "MUTATION", desc: "Plume trajectory points toward school campus." },
      { id: "env2", title: "PM2.5 Exceeds 140 µg/m³", time: "T+16m", status: "WARNING", desc: "Air quality index enters Unhealthy range." },
      { id: "env3", title: "Greenway Buffer Absorption", time: "T+30m", status: "POSITIVE", desc: "Canopy trees reduce particulate load by 38%." },
      { id: "env4", title: "Safe Perimeter Achieved", time: "T+48m", status: "RECOMMENDED", desc: "Rerouted student path maintains low exposure." }
    ],
    pareto_alternatives: [
      { id: "env_alt1", name: "Option A: 20m Canopy Bioswale Buffer", score: 92, delta: "+26 pts", risk: "Low", cost: "$35k", desc: "Installs high-density pine and birch tree barrier along perimeter." },
      { id: "env_alt2", name: "Option B: Freight Rerouting Schedule", score: 88, delta: "+22 pts", risk: "Low", cost: "$0k", desc: "Restricts diesel trucks between 07:30-09:00 and 14:30-16:00." },
      { id: "env_alt3", name: "Option C: Electrostatic Mist Canopy", score: 81, delta: "+15 pts", risk: "Med", cost: "$45k", desc: "Deploys atomized water mist cannons during atmospheric inversion." }
    ]
  },
  {
    id: "power-water-grid",
    name: "Metropolitan Power & Municipal Utility Grid",
    domain: "infrastructure",
    domain_name: "Infrastructure Resilience",
    supported_domains: ["infrastructure", "disaster", "spatial"],
    type: "Connected Infrastructure Network",
    size: "500 × 400 m",
    width_m: 500.0,
    height_m: 400.0,
    accent_color: "#8b5cf6",
    tagline: "Infrastructure that simulates its own failure.",
    summary: "Interconnected high-voltage power transmission substations, water pumping mains, telemetry towers, and hospital backup feeders.",
    primary_what_if: "What if Substation 4 trips under +35% grid load with deferred maintenance?",
    what_if_pills: [
      "What if Substation 4 trips under 35% overload?",
      "What if Water Treatment Plant 2 loses primary power?",
      "What if hospital backup feeder auto-switches in 400ms?",
      "What if battery energy storage injects 50MW peak shaving?"
    ],
    what_breaks_first: {
      target: "Substation 04 Transformer Core",
      time_min: 11,
      impact: "CRITICAL",
      severity_pct: 96,
      reason: "Thermal overload exceeds 118°C dielectric limit, triggering cascade breaker trip across 4 feeder loops."
    },
    zones: [
      { id: "z_grid_north", name: "Northern Power Grid Ring", color: "#f59e0b", x1: 10, y1: 10, x2: 50, y2: 50 },
      { id: "z_water_south", name: "Southern Water Treatment Core", color: "#06b6d4", x1: 50, y1: 50, x2: 95, y2: 95 }
    ],
    objects: [
      { id: "substation_4", name: "Primary Substation 04", kind: "critical", x: 30, y: 30, w: 14, h: 14, movable: true },
      { id: "pumping_station_2", name: "Water Pumping Station 02", kind: "service", x: 70, y: 70, w: 16, h: 12, movable: false },
      { id: "hospital_feeder", name: "Emergency Hospital Power Feeder", kind: "service", x: 45, y: 65, w: 12, h: 10, movable: false }
    ],
    cascade_nodes: [
      { id: "inf1", title: "Substation 04 Overload +35%", time: "T+0m", status: "MUTATION", desc: "Load surges to 142 MW." },
      { id: "inf2", title: "Feeder 2 & 4 Cascade Trip", time: "T+11m", status: "CRITICAL", desc: "42,000 households lose power." },
      { id: "inf3", title: "Water Pumping Disruption", time: "T+24m", status: "WARNING", desc: "Pressure in municipal mains drops below 20 PSI." },
      { id: "inf4", title: "Hospital Microgrid Islanded", time: "T+35m", status: "RECOMMENDED", desc: "Critical healthcare operations preserved via solar+BESS." }
    ],
    pareto_alternatives: [
      { id: "inf_alt1", name: "Option A: Automated Fast Load-Shedding", score: 94, delta: "+30 pts", risk: "Low", cost: "$15k", desc: "Instantly sheds non-critical industrial loads to protect main transformers." },
      { id: "inf_alt2", name: "Option B: 50MW Battery Storage Injection", score: 89, delta: "+25 pts", risk: "Low", cost: "$120k", desc: "Discharges stored clean power during top 45-minute peak demand." },
      { id: "inf_alt3", name: "Option C: Dual-Feed Ring Redundancy", score: 85, delta: "+21 pts", risk: "Med", cost: "$250k", desc: "Builds a physical secondary intertie to the East Regional Substation." }
    ]
  }
];

export function getWorldById(worldId) {
  if (!worldId) return UNIVERSAL_WORLDS[0];
  return UNIVERSAL_WORLDS.find((w) => w.id === worldId) || UNIVERSAL_WORLDS[0];
}
