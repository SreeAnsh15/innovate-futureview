export const DEFAULT_ENVIRONMENTS = [
  {
    id: "hospital-demo",
    name: "MetroCare Emergency Department",
    type: "Healthcare",
    industry_category: "Healthcare & Life Sciences",
    regulatory_standard: "ADA Title III & NFPA 101 Life Safety",
    financial_unit: "Delayed Triage & Violation Cost",
    size: "120 × 80 m",
    width_m: 120,
    height_m: 80,
    primary_what_if: "What if emergency traffic increases by 40%?",
    financial_baseline_cost: "$28,000 / yr",
    financial_proposed_cost: "$168,000 / yr (+$140,000 / yr penalty risk)",
    archetypes: ["Patient", "Doctor", "Nurse", "Wheelchair User", "Stretcher User", "Visitor", "Emergency Responder", "Staff"],
    objects: [
      { id: "entrance", name: "Emergency Ingress Foyer", kind: "entrance", x: 10, y: 40, w: 15, h: 18, movable: false, critical: true, capacity: 120, accessibility_priority: "critical" },
      { id: "registration", name: "Registration Desk", kind: "service", x: 38, y: 40, w: 18, h: 9, movable: true, critical: true, capacity: 45, accessibility_priority: "high" },
      { id: "waiting", name: "Patient Waiting Lounge", kind: "room", x: 68, y: 22, w: 25, h: 20, movable: false, critical: false, capacity: 80, accessibility_priority: "medium" },
      { id: "emergency", name: "Emergency Triage Dept", kind: "critical", x: 68, y: 57, w: 25, h: 16, movable: false, critical: true, capacity: 35, accessibility_priority: "critical" },
      { id: "pharmacy", name: "Outpatient Pharmacy", kind: "service", x: 92, y: 57, w: 18, h: 16, movable: false, critical: false, capacity: 25, accessibility_priority: "medium" },
      { id: "corridor", name: "Main Clinical Spine", kind: "corridor", x: 28, y: 36, w: 70, h: 14, movable: false, critical: false, capacity: 200, accessibility_priority: "high" },
      { id: "triage_kiosk", name: "Self-Check-in Kiosk", kind: "service", x: 30, y: 20, w: 10, h: 8, movable: true, critical: false, capacity: 20, accessibility_priority: "medium" },
      { id: "accessible_ramp", name: "Barrier-Free ADA Ramp", kind: "service", x: 18, y: 28, w: 12, h: 6, movable: true, critical: false, capacity: 30, accessibility_priority: "high" },
      { id: "secondary_exit", name: "East Emergency Egress Gate", kind: "exit", x: 95, y: 24, w: 8, h: 14, movable: false, critical: true, capacity: 150, accessibility_priority: "critical" }
    ],
    zones: [
      { id: "z1", name: "Critical Clinical Zone", color: "#f43f5e", x1: 60, y1: 50, x2: 98, y2: 80 },
      { id: "z2", name: "Barrier-Free Circulation Spine", color: "#38bdf8", x1: 5, y1: 30, x2: 98, y2: 50 }
    ]
  },
  {
    id: "school-demo",
    name: "Bharat Public School",
    type: "Education & Campus",
    industry_category: "Primary & Secondary Education",
    regulatory_standard: "IS 3861 Accessible School Buildings & Fire Safety",
    financial_unit: "Student Circulation Friction & Evacuation Safety",
    size: "100 × 75 m",
    width_m: 100,
    height_m: 75,
    primary_what_if: "What if morning arrival rush doubles through primary gate?",
    financial_baseline_cost: "$12,000 / yr",
    financial_proposed_cost: "$85,000 / yr (Safety & corridor congestion risk)",
    archetypes: ["Student", "Teacher", "Wheelchair Student", "Parent Visitor", "Security Staff"],
    objects: [
      { id: "school_gate", name: "Main Campus Ingress Gate", kind: "entrance", x: 10, y: 45, w: 16, h: 20, movable: false, critical: true, capacity: 300, accessibility_priority: "high" },
      { id: "admin_reception", name: "Administration Helpdesk", kind: "service", x: 36, y: 45, w: 18, h: 12, movable: true, critical: true, capacity: 60, accessibility_priority: "high" },
      { id: "primary_wing", name: "Primary Academic Wing (Grades 1-5)", kind: "room", x: 70, y: 20, w: 26, h: 22, movable: false, critical: false, capacity: 200, accessibility_priority: "high" },
      { id: "secondary_wing", name: "Secondary Science Block", kind: "room", x: 70, y: 62, w: 28, h: 24, movable: false, critical: true, capacity: 250, accessibility_priority: "high" },
      { id: "assembly_ground", name: "Central Morning Assembly Foyer", kind: "corridor", x: 24, y: 38, w: 72, h: 18, movable: false, critical: false, capacity: 400, accessibility_priority: "high" },
      { id: "midday_meal_hall", name: "Midday Dining & Nutrition Hall", kind: "service", x: 92, y: 45, w: 16, h: 16, movable: true, critical: false, capacity: 150, accessibility_priority: "medium" }
    ],
    zones: [
      { id: "z_sch_1", name: "Student Rush Corridor", color: "#f59e0b", x1: 20, y1: 30, x2: 65, y2: 65 },
      { id: "z_sch_2", name: "Quiet Classroom Sanctuary", color: "#10b981", x1: 65, y1: 15, x2: 98, y2: 45 }
    ]
  },
  {
    id: "transit-demo",
    name: "Central Transit Interchange",
    type: "Aviation & Transit",
    industry_category: "Public Transportation & Multi-Modal Transit",
    regulatory_standard: "Urban Transit Safety & NFPA 130 Fixed Guideway Standard",
    financial_unit: "Transfer Delays & Peak Platform Friction",
    size: "150 × 100 m",
    width_m: 150,
    height_m: 100,
    primary_what_if: "What if platform 1-6 transfers increase by 50%?",
    financial_baseline_cost: "$35,000 / mo",
    financial_proposed_cost: "$280,000 / mo in transfer delays",
    archetypes: ["Daily Commuter", "Elderly Traveler", "Luggage Carrier", "Transit Staff", "Security Marshall"],
    objects: [
      { id: "terminal_entry", name: "Passenger Concourse Ingress", kind: "entrance", x: 10, y: 45, w: 14, h: 22, movable: false, critical: true, capacity: 350, accessibility_priority: "high" },
      { id: "tsa_checkpoint", name: "Smart Security Screening Bank", kind: "service", x: 36, y: 45, w: 18, h: 12, movable: true, critical: true, capacity: 150, accessibility_priority: "critical" },
      { id: "duty_free_kiosk", name: "Duty-Free Retail Pavilion", kind: "service", x: 58, y: 22, w: 22, h: 14, movable: true, critical: false, capacity: 80, accessibility_priority: "medium" },
      { id: "gate_cluster_a", name: "Boarding Platforms 1-6", kind: "room", x: 80, y: 22, w: 26, h: 24, movable: false, critical: true, capacity: 450, accessibility_priority: "high" },
      { id: "gate_cluster_b", name: "Boarding Platforms 7-12", kind: "room", x: 80, y: 62, w: 26, h: 24, movable: false, critical: true, capacity: 450, accessibility_priority: "high" },
      { id: "concourse_spine", name: "Central Concourse Interchange Spine", kind: "corridor", x: 24, y: 38, w: 74, h: 20, movable: false, critical: false, capacity: 600, accessibility_priority: "high" }
    ],
    zones: [
      { id: "z_trn_1", name: "High-Frequency Boarding Zone", color: "#38bdf8", x1: 55, y1: 15, x2: 98, y2: 85 },
      { id: "z_trn_2", name: "Ticketing Queue Buffer", color: "#fbbf24", x1: 5, y1: 30, x2: 50, y2: 65 }
    ]
  },
  {
    id: "evac-demo",
    name: "Rapid Fire Evacuation Lab",
    type: "Safety & Emergency Lab",
    industry_category: "Crisis Simulation & Fire Protection",
    regulatory_standard: "NFPA 101 Life Safety Code & Emergency Egress Model",
    financial_unit: "Evacuation Clearance Velocity & Hazard Exposure Risk",
    size: "90 × 65 m",
    width_m: 90,
    height_m: 65,
    primary_what_if: "What if fire blocks the central isolation corridor?",
    financial_baseline_cost: "$15,000 / test",
    financial_proposed_cost: "$350,000 (Hazard breach liability risk)",
    archetypes: ["Lab Researcher", "Hazmat Specialist", "First Responder", "Emergency Medic", "Safety Officer"],
    objects: [
      { id: "lab_entrance", name: "Research Chamber Airlock Entry", kind: "entrance", x: 10, y: 40, w: 14, h: 18, movable: false, critical: true, capacity: 100, accessibility_priority: "high" },
      { id: "test_rig_alpha", name: "High-Pressure Combustion Rig Alpha", kind: "critical", x: 40, y: 40, w: 20, h: 14, movable: false, critical: true, capacity: 20, accessibility_priority: "critical" },
      { id: "control_sanctum", name: "Command & Telemetry Bunker", kind: "room", x: 70, y: 20, w: 24, h: 20, movable: false, critical: true, capacity: 40, accessibility_priority: "high" },
      { id: "hazmat_containment", name: "Hazardous Materials Storage Cell", kind: "room", x: 70, y: 60, w: 24, h: 20, movable: false, critical: true, capacity: 30, accessibility_priority: "critical" },
      { id: "blast_escape_chute", name: "Pressurized Fire Blast Egress Port", kind: "exit", x: 92, y: 40, w: 12, h: 16, movable: false, critical: true, capacity: 200, accessibility_priority: "critical" },
      { id: "isolation_corridor", name: "Reinforced Hazard Isolation Corridor", kind: "corridor", x: 25, y: 36, w: 68, h: 16, movable: false, critical: true, capacity: 150, accessibility_priority: "critical" }
    ],
    zones: [
      { id: "z_evac_1", name: "High-Thermal Hazard Zone", color: "#f43f5e", x1: 30, y1: 30, x2: 60, y2: 60 },
      { id: "z_evac_2", name: "Pressurized Safe Egress Spine", color: "#06b6d4", x1: 60, y1: 15, x2: 98, y2: 85 }
    ]
  },
  {
    id: "campus-demo",
    name: "Apex University & Tech Campus",
    type: "College Campus",
    industry_category: "Higher Education & Research",
    regulatory_standard: "Campus Accessibility & Fire Evacuation Code",
    financial_unit: "Student Congestion & Lecture Delay",
    size: "140 × 90 m",
    width_m: 140,
    height_m: 90,
    primary_what_if: "Relocate Student Helpdesk & Central Plaza Kiosk",
    financial_baseline_cost: "$18,000 / yr",
    financial_proposed_cost: "$142,000 / yr (Lecture transit delays)",
    archetypes: ["Student", "Faculty Professor", "Wheelchair Student", "Campus Visitor", "Staff Member"],
    objects: [
      { id: "campus_gate", name: "Main Campus Gate", kind: "entrance", x: 10, y: 45, w: 16, h: 22, movable: false, critical: true, capacity: 300, accessibility_priority: "high" },
      { id: "student_helpdesk", name: "Student Services Desk", kind: "service", x: 36, y: 45, w: 18, h: 12, movable: true, critical: true, capacity: 60, accessibility_priority: "high" },
      { id: "library_hall", name: "Central Academic Library", kind: "room", x: 70, y: 20, w: 26, h: 22, movable: false, critical: false, capacity: 250, accessibility_priority: "high" },
      { id: "auditorium", name: "Grand Lecture Hall", kind: "room", x: 70, y: 62, w: 28, h: 24, movable: false, critical: true, capacity: 400, accessibility_priority: "high" },
      { id: "cafeteria_plaza", name: "Campus Food Plaza", kind: "service", x: 92, y: 45, w: 16, h: 18, movable: true, critical: false, capacity: 150, accessibility_priority: "medium" },
      { id: "quad_walkway", name: "Central Quad Walkway", kind: "corridor", x: 25, y: 38, w: 72, h: 18, movable: false, critical: false, capacity: 350, accessibility_priority: "high" }
    ],
    zones: [
      { id: "z_cam_1", name: "High-Traffic Quad Zone", color: "#a855f7", x1: 15, y1: 30, x2: 65, y2: 65 },
      { id: "z_cam_2", name: "Quiet Study Sanctuary", color: "#0284c7", x1: 65, y1: 15, x2: 98, y2: 45 }
    ]
  }
];
