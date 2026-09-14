export const DOMAINS_LIST = [
  {
    id: "spatial",
    num: "01",
    name: "Spatial Intelligence",
    tagline: "Counterfactual Circulation & Space Optimization",
    badge: "FLAGSHIP CORE",
    badgeType: "badgeCyan",
    color: "#38bdf8",
    description: "Multi-agent physics, ADA Title III accessibility compliance, and M/M/c queueing simulator.",
    defaultWorldId: "hospital-demo",
    sampleQueries: [
      "What if we move registration to east wing?",
      "What if we widen the main corridor by 30%?",
      "What if visitor demand increases by 40%?",
      "What if we add a secondary entrance?"
    ]
  },
  {
    id: "disaster",
    num: "02",
    name: "Disaster Intelligence",
    tagline: "Lifeline AI & Crisis Cascade Simulator",
    badge: "LIFELINE AI",
    badgeType: "badgeRed",
    color: "#f43f5e",
    description: "Simulates flood propagation, bridge cutoffs, emergency ambulance rerouting, and shelter overflow cascades.",
    defaultWorldId: "urban-disaster",
    sampleQueries: [
      "What if river rises 1.8m and North River Bridge is severed?",
      "What if Civic Shelter B reaches 100% capacity?",
      "What if hospital power grid fails during flood surge?"
    ]
  },
  {
    id: "healthcare",
    num: "03",
    name: "Healthcare Operations",
    tagline: "MedFlow Hospital Stress & Capacity Engine",
    badge: "MEDFLOW",
    badgeType: "badgeAmber",
    color: "#fbbf24",
    description: "Simulates emergency patient arrival surges, CT scanner downtime, nurse shortages, and ICU saturation.",
    defaultWorldId: "hospital-demo",
    sampleQueries: [
      "What if ER arrival surge increases by 45%?",
      "What if CT Scanner 1 becomes unavailable?",
      "What if ICU occupancy reaches 95% with 2 nurse shortage?"
    ]
  },
  {
    id: "road",
    num: "04",
    name: "Road Safety",
    tagline: "RoadShadow Digital Near-Miss Engine",
    badge: "ROADSHADOW",
    badgeType: "badgeGreen",
    color: "#34d399",
    description: "Simulates vehicle-pedestrian conflict zones, near-miss risk indices in rain/fog, and adaptive signal timing.",
    defaultWorldId: "city-intersection",
    sampleQueries: [
      "What if traffic volume increases 40% in heavy rain?",
      "What if pedestrian walk signal cycle is shortened to 30s?",
      "What if we install a raised pedestrian refuge island?"
    ]
  },
  {
    id: "crowd",
    num: "05",
    name: "Crowd Safety",
    tagline: "CrowdGuard 5-Phase State Transition Engine",
    badge: "CROWDGUARD",
    badgeType: "badgeCyan",
    color: "#06b6d4",
    description: "Analyzes crowd phase transitions from Normal Flow to Flow Instability & Compression Risk with gate interventions.",
    defaultWorldId: "stadium-arena",
    sampleQueries: [
      "What if Gate A turnstiles close during 850 visitors/min surge?",
      "What if we open emergency surge bypass Gate B2?",
      "What if ingress rate doubles to 1500 visitors/min?"
    ]
  },
  {
    id: "rescue",
    num: "06",
    name: "Rescue Intelligence",
    tagline: "RescueVision Pre-Rescue Simulation Lab",
    badge: "RESCUEVISION",
    badgeType: "badgePurple",
    color: "#a855f7",
    description: "Computes the safest feasible rescue extraction vector considering toxic smoke spread, stairwell blockages, and responder risk.",
    defaultWorldId: "highrise-rescue",
    sampleQueries: [
      "What if Staircase B is blocked by smoke with 14 trapped occupants?",
      "What if Team Alpha is delayed by flashover?",
      "What if we deploy positive-pressure stairwell ventilation?"
    ]
  },
  {
    id: "environmental",
    num: "07",
    name: "Environmental Exposure",
    tagline: "AirShield Personal Exposure Twin",
    badge: "AIRSHIELD",
    badgeType: "badgeGreen",
    color: "#10b981",
    description: "Simulates dynamic PM2.5/NO2 particulate plume dispersion and tracks accumulated pedestrian respiratory dosage.",
    defaultWorldId: "industrial-district",
    sampleQueries: [
      "What if wind shifts East carrying industrial plume over school?",
      "What if diesel freight traffic surges by 50%?",
      "What if pedestrians are rerouted via shielded interior arcade?"
    ]
  },
  {
    id: "infrastructure",
    num: "08",
    name: "Infrastructure Resilience",
    tagline: "Infrastructure Oracle Failure Propagation DAG",
    badge: "ORACLE DAG",
    badgeType: "badgeAmber",
    color: "#f59e0b",
    description: "Evaluates dependency graphs across power substations, water treatment mains, and transit networks to test cascade isolation.",
    defaultWorldId: "power-water-grid",
    sampleQueries: [
      "What if Substation 4 trips under +35% grid load surge?",
      "What if Water Pumping Station 2 loses feeder power?",
      "What if automated isolation switch is deployed at Substation 4?"
    ]
  }
];

export const DOMAINS = DOMAINS_LIST;
export const DEFAULT_DOMAINS = DOMAINS_LIST;
