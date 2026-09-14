export const AGENT_ARCHETYPES = {
  visitor: {
    id: "visitor",
    name: "Regular Visitor",
    speed: 1.35,
    color: "#50ddff",
    ringColor: "rgba(80, 221, 255, 0.4)",
    symbol: "V",
    desc: "Standard adult walking at normal speed."
  },
  elderly: {
    id: "elderly",
    name: "Elderly Visitor",
    speed: 0.85,
    color: "#ffc765",
    ringColor: "rgba(255, 199, 101, 0.4)",
    symbol: "E",
    desc: "Slower walking pace, sensitive to distance."
  },
  wheelchair: {
    id: "wheelchair",
    name: "Wheelchair User",
    speed: 1.0,
    color: "#4fe0a4",
    ringColor: "rgba(79, 224, 164, 0.4)",
    symbol: "W",
    desc: "Requires wide unobstructed corridors."
  },
  emergency: {
    id: "emergency",
    name: "Emergency / Priority",
    speed: 2.1,
    color: "#ff647b",
    ringColor: "rgba(255, 100, 123, 0.5)",
    symbol: "!",
    desc: "Urgent high-speed movement to critical care."
  },
  staff: {
    id: "staff",
    name: "Staff Member",
    speed: 1.55,
    color: "#a78bfa",
    ringColor: "rgba(167, 139, 250, 0.4)",
    symbol: "S",
    desc: "Frequent service circulation between hubs."
  }
};
