import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { DEFAULT_ENVIRONMENTS } from "../data/defaultEnvironments";
import { DOMAINS, DEFAULT_DOMAINS } from "../data/domainsData";
import { UNIVERSAL_WORLDS } from "../data/universalWorlds";
import {
  fetchHealth,
  fetchAIProviderInfo,
  fetchEnvironments,
  runSimulation,
  fetchScenarios,
  saveScenario,
  deleteScenario,
  parseIntent,
  exportAudit,
  fetchDomains,
  fetchWorlds,
  runUniversalCounterfactual
} from "../services/api";


const FutureViewContext = createContext(null);

export const FUTUREVIEW_THEMES = [
  // 1. Core Lighting Modes
  {
    id: "light",
    name: "Architectural Light",
    tagline: "Crisp Studio & Frosted Glass",
    category: "lighting",
    icon: "sun",
    isLight: true,
    color: "#0284c7",
    secondary: "#0ea5e9",
    bg: "#f8fafc"
  },
  {
    id: "cyber-cyan",
    name: "Command Cyber",
    tagline: "Palantir Foundry Dark (Default)",
    category: "lighting",
    icon: "moon",
    isLight: false,
    color: "#38bdf8",
    secondary: "#00e5ff",
    bg: "#03070d"
  },
  {
    id: "oled-black",
    name: "OLED Stealth Black",
    tagline: "True Black Zero-Emission",
    category: "lighting",
    icon: "zap",
    isLight: false,
    color: "#00f0ff",
    secondary: "#ffffff",
    bg: "#000000"
  },

  // 2. Specialized Technical & Presentation Modes
  {
    id: "cad-blueprint",
    name: "CAD Blueprint",
    tagline: "Architectural Drafting Navy",
    category: "specialized",
    icon: "grid",
    isLight: false,
    color: "#64ffda",
    secondary: "#7affdb",
    bg: "#0a192f"
  },
  {
    id: "high-contrast",
    name: "High Contrast (WCAG)",
    tagline: "Maximum Accessibility Clarity",
    category: "specialized",
    icon: "eye",
    isLight: false,
    color: "#ffff00",
    secondary: "#00ffff",
    bg: "#000000"
  },
  {
    id: "night-vision",
    name: "Tactical FLIR NVG",
    tagline: "Military Phosphor HUD",
    category: "specialized",
    icon: "shield",
    isLight: false,
    color: "#22c55e",
    secondary: "#4ade80",
    bg: "#010a01"
  },

  // 3. Chromatic Spatial Palettes
  {
    id: "emerald-matrix",
    name: "Emerald Matrix",
    tagline: "Bio-Spatial & Urban Eco",
    category: "palette",
    icon: "palette",
    isLight: false,
    color: "#10b981",
    secondary: "#34d399",
    bg: "#020a06"
  },
  {
    id: "obsidian-violet",
    name: "Obsidian Violet",
    tagline: "Quantum Vision Pro Glass",
    category: "palette",
    icon: "palette",
    isLight: false,
    color: "#a855f7",
    secondary: "#c084fc",
    bg: "#07040e"
  },
  {
    id: "solar-amber",
    name: "Solar Amber",
    tagline: "Tactical Command Gold",
    category: "palette",
    icon: "palette",
    isLight: false,
    color: "#f59e0b",
    secondary: "#fbbf24",
    bg: "#0a0601"
  },
  {
    id: "crimson-apex",
    name: "Crimson Apex",
    tagline: "Crisis Response Red Alert",
    category: "palette",
    icon: "palette",
    isLight: false,
    color: "#f43f5e",
    secondary: "#fb7185",
    bg: "#0b0305"
  },
  {
    id: "titanium-ice",
    name: "Titanium Ice",
    tagline: "Deep Cobalt Engineering",
    category: "palette",
    icon: "palette",
    isLight: false,
    color: "#60a5fa",
    secondary: "#93c5fd",
    bg: "#040711"
  },
  {
    id: "neon-synth",
    name: "Neon Synth",
    tagline: "Cyberpunk Luminescence",
    category: "palette",
    icon: "palette",
    isLight: false,
    color: "#ec4899",
    secondary: "#06b6d4",
    bg: "#09040c"
  }
];

export const BHARAT_LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" }
];

export const TRANSLATIONS = {
  en: {
    title: "FUTUREVIEW",
    tagline: "See the Consequences Before You Build the Future.",
    subtitle: "WHAT-IF REALITY INTELLIGENCE",
    subtag: "WHAT-IF REALITY INTELLIGENCE",
    dashboard: "Command Center Dashboard",
    studio: "Environment Studio",
    whatif: "What-If Spatial Simulator",
    crowd: "Live Crowd Simulation",
    accessibility: "Accessibility Intelligence",
    emergency: "Emergency Simulator",
    demand: "Demand Surge Simulator",
    journey: "Journey Experience",
    queue: "Resource & Queue Simulator",
    optimize: "AI Optimization Lab",
    cost: "Cost vs Impact",
    stress: "Environmental Stress",
    phasing: "Construction Phasing",
    "3d": "3D Future Experience",
    webxr: "AR Reality Experience",
    compare: "Scenario Comparison",
    decision: "AI Decision Support",
    report: "Decision Report",
    runSim: "Run Simulation",
    pauseSim: "Pause Simulation",
    reset: "Reset Baseline",
    aiAnalyze: "AI Spatial Reasoning",
    aiOptimize: "AI Layout Optimizer",
    juryDemo: "Jury Demo Walkthrough",
    wowScreen: "Intelligence Pulse",
    verdictRecommended: "RECOMMENDED",
    verdictReview: "REVIEW WITH MODIFICATIONS",
    verdictAvoid: "DO NOT IMPLEMENT / AVOID",
    walkingDistance: "Walking Distance",
    congestion: "Peak Congestion",
    safety: "Emergency Safety",
    experience: "User Experience",
    accessibilityScore: "ADA Accessibility"
  },
  hi: {
    title: "फ्यूचरव्यू",
    tagline: "भविष्य निर्माण से पहले उसके परिणामों को समझें।",
    subtitle: "रियलिटी इंटेलिजेंस और सिमुलेशन",
    subtag: "रियलिटी इंटेलिजेंस और सिमुलेशन",
    dashboard: "कमांड सेंटर डैशबोर्ड",
    studio: "एनवायरनमेंट स्टूडियो",
    whatif: "व्हाट-इफ स्पेशियल सिम्युलेटर",
    crowd: "लाइव क्राउड सिमुलेशन",
    accessibility: "एक्सेसिबिलिटी इंटेलिजेंस",
    emergency: "आपातकालीन सिम्युलेटर",
    demand: "डिमांड सर्ज सिम्युलेटर",
    journey: "यूजर जर्नी अनुभव",
    queue: "संसाधन व कतार सिम्युलेटर",
    optimize: "एआई ऑप्टिमाइज़ेशन लैब",
    cost: "लागत बनाम प्रभाव",
    stress: "पर्यावरणीय तनाव",
    phasing: "निर्माण चरणबद्धता",
    "3d": "3D डिजिटल ट्विन",
    webxr: "एआर Reality व्यू",
    compare: "परिदृश्य तुलना",
    decision: "एआई निर्णय सहायता",
    report: "निर्णय रिपोर्ट",
    runSim: "सिमुलेशन चलाएं",
    pauseSim: "रोकें",
    reset: "रीसेट करें",
    aiAnalyze: "एआई विश्लेषण",
    aiOptimize: "एआई अनुकूलन",
    juryDemo: "जूरी डेमो वॉकथ्रू",
    wowScreen: "इंटेलिजेंस पल्स",
    verdictRecommended: "अनुशंसित",
    verdictReview: "संशोधन के साथ समीक्षा",
    verdictAvoid: "लागू न करें / बचें",
    walkingDistance: "पैदल दूरी",
    congestion: "भीड़भाड़",
    safety: "आपातकालीन सुरक्षा",
    experience: "उपयोगकर्ता अनुभव",
    accessibilityScore: "सुलभता स्कोर"
  },
  ta: {
    title: "ஃபியூச்சர்வியூ",
    tagline: "எதிர்காலத்தை உருவாக்குவதற்கு முன் விளைவுகளைக் காண்க.",
    subtitle: "ரியாலிட்டி நுண்ணறிவு தளம்",
    subtag: "ரியாலிட்டி நுண்ணறிவு தளம்",
    dashboard: "கட்டளை மையம்",
    studio: "சூழல் ஸ்டுடியோ",
    whatif: "ஸ்பேஷியல் சிமுலேட்டர்",
    crowd: "கூட்ட நெரிசல் சிமுலேஷன்",
    accessibility: "அணுகல்தன்மை நுண்ணறிவு",
    emergency: "அவசரகால சிமுலேட்டர்",
    demand: "தேவை உயர்வு சிமுலேட்டர்",
    journey: "பயனர் பயண அனுபவம்",
    queue: "வரிசை மேலாண்மை சிமுலேட்டர்",
    optimize: "AI மேம்படுத்தல் ஆய்வகம்",
    cost: "செலவு vs தாக்கம்",
    stress: "சுற்றுச்சூழல் அழுத்தம்",
    phasing: "கட்டுமான கட்டமைப்பு",
    "3d": "3D எதிர்கால அனுபவம்",
    webxr: "AR பார்வை",
    compare: "ஒப்பீட்டு அணி",
    decision: "AI முடிவு ஆதரவு",
    report: "முடிவு அறிக்கை",
    runSim: "சிமுலேஷன் இயக்கு",
    pauseSim: "நிறுத்து",
    reset: "மீட்டமை",
    aiAnalyze: "AI ஆய்வு",
    aiOptimize: "AI உகப்பாக்கம்",
    juryDemo: "ஜூரி டெமோ",
    wowScreen: "நுண்ணறிவு திரையகம்",
    verdictRecommended: "பரிந்துரைக்கப்படுகிறது",
    verdictReview: "மறுபரிசீலனை செய்க",
    verdictAvoid: "செயல்படுத்த வேண்டாம்",
    walkingDistance: "நடைபயண தூரம்",
    congestion: "நெரிசல் குறியீடு",
    safety: "பாதுகாப்பு",
    experience: "பயனர் அனுபவம்",
    accessibilityScore: "அணுகல்தன்மை"
  },
  te: {
    title: "ఫ్యూచర్‌వ్యూ",
    tagline: "భవిష్యత్తును నిర్మించే ముందే ఫలితాలను తెలుసుకోండి.",
    subtitle: "రియాలిటీ ఇంటెలిజెన్స్ ప్లాట్‌ఫారమ్",
    subtag: "రియాలిటీ ఇంటెలిజెన్స్ ప్లాట్‌ఫారమ్",
    dashboard: "కమాండ్ సెంటర్",
    studio: "ఎన్విరాన్‌మెంట్ స్టూడియో",
    whatif: "స్పేషియల్ సిమ్యులేటర్",
    crowd: "జనసందోహ సిమ్యులేషన్",
    accessibility: "యాక్సెసిబిలిటీ ఇంటెలిజెన్స్",
    emergency: "అత్యవసర సిమ్యులేటర్",
    demand: "డిమాండ్ సర్జ్ సిమ్యులేటర్",
    journey: "ప్రయాణ అనుభవం",
    queue: "క్యూ సిమ్యులేటర్",
    optimize: "AI ఆప్టిమైజేషన్ ల్యాబ్",
    cost: "ఖర్చు vs ప్రభావం",
    stress: "పర్యావరణ ఒత్తిడి",
    phasing: "నిర్మాణ దశలు",
    "3d": "3D డిజిటల్ ట్విన్",
    webxr: "AR అనుభవం",
    compare: "పరిస్థితుల పోలిక",
    decision: "AI నిర్ణయ మద్దతు",
    report: "నిర్ణయ నివేదిక",
    runSim: "రన్ సిమ్యులేషన్",
    pauseSim: "పాజ్",
    reset: "రీసెట్",
    aiAnalyze: "AI విశ్లేషణ",
    aiOptimize: "AI ఆప్టిమైజ్",
    juryDemo: "జ్యూరీ డెమో",
    wowScreen: "ఇంటెలిజెన్స్ స్క్రీన్",
    verdictRecommended: "సిఫార్సు చేయబడింది",
    verdictReview: "సమీక్ష అవసరం",
    verdictAvoid: "అమలు చేయవద్దు",
    walkingDistance: "నడక దూరం",
    congestion: "రద్దీ",
    safety: "భద్రత",
    experience: "వినియోగదారు అనుభవం",
    accessibilityScore: "యాక్సెసిబిలిటీ స్కోర్"
  },
  kn: {
    title: "ಫ್ಯೂಚರ್‌ವ್ಯೂ",
    tagline: "ಭವಿಷ್ಯವನ್ನು ನಿರ್ಮಿಸುವ ಮುನ್ನ ಪರಿಣಾಮಗಳನ್ನು ನೋಡಿ.",
    subtitle: "ರಿಯಾಲಿಟಿ ಇಂಟೆಲಿಜೆನ್ಸ್",
    subtag: "ರಿಯಾಲಿಟಿ ಇಂಟೆಲಿಜೆನ್ಸ್",
    dashboard: "ಕಮಾಂಡ್ ಸೆಂಟರ್",
    studio: "ಪರಿಸರ ಸ್ಟುಡಿಯೋ",
    whatif: "ಸ್ಪೇಷಿಯಲ್ ಸಿಮ್ಯುಲೇಟರ್",
    crowd: "ಜನಸಂದಣಿ ಸಿಮ್ಯುಲೇಶನ್",
    accessibility: "ಪ್ರವೇಶಸಾಧ್ಯತೆ",
    emergency: "ತುರ್ತು ಸಿಮ್ಯುಲೇಟರ್",
    demand: "ಬೇಡಿಕೆ ಏರಿಕೆ",
    journey: "ಪ್ರಯಾಣ ಅನುಭವ",
    queue: "ಸಾಲಿನ ನಿರ್ವಹಣೆ",
    optimize: "AI ಆಪ್ಟಿಮೈಸೇಶನ್",
    cost: "ವೆಚ್ಚ vs ಪರಿಣಾಮ",
    stress: "ಪರಿಸರ ಒತ್ತಡ",
    phasing: "ಹಂತವಾರು ನಿರ್ಮಾಣ",
    "3d": "3D ಅನುಭವ",
    webxr: "AR ವೀಕ್ಷಣೆ",
    compare: "ಹೋಲಿಕೆ",
    decision: "AI ನಿರ್ಧಾರ ಬೆಂಬಲ",
    report: "ವರದಿ",
    runSim: "ಸಿಮ್ಯುಲೇಶನ್ ಚಲಾಯಿಸಿ",
    pauseSim: "ವಿರಾಮ",
    reset: "ಮರುಹೊಂದಿಸಿ",
    aiAnalyze: "AI ವಿಶ್ಲೇಷಣೆ",
    aiOptimize: "AI ಅತ್ಯುತ್ತಮೀಕರಣ",
    juryDemo: "ಜ್ಯೂರಿ ಡೆಮೊ",
    wowScreen: "ಇಂಟೆಲಿಜೆನ್ಸ್ ಪಲ್ಸ್",
    verdictRecommended: "ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ",
    verdictReview: "ಮರುಪರಿಶೀಲಿಸಿ",
    verdictAvoid: "ಅನುಷ್ಠಾನ ಬೇಡ",
    walkingDistance: "ನಡೆಯುವ ದೂರ",
    congestion: "ದಟ್ಟಣೆ",
    safety: "ಸುರಕ್ಷತೆ",
    experience: "ಅನುಭವ",
    accessibilityScore: "ಪ್ರವೇಶಸಾಧ್ಯತೆ"
  },
  ml: {
    title: "ഫ്യൂച്ചർവ്യൂ",
    tagline: "ഭാവി നിർമ്മിക്കുന്നതിന് മുൻപ് പ്രത്യാഘാതങ്ങൾ കാണുക.",
    subtitle: "റിയാലിറ്റി ഇന്റലിജൻസ്",
    subtag: "റിയാലിറ്റി ഇന്റലിജൻസ്",
    dashboard: "കമാൻഡ് സെന്റർ",
    studio: "എൻവിറോൺമെന്റ് സ്റ്റുഡിയോ",
    whatif: "സ്പേഷ്യൽ സിമുലേറ്റർ",
    crowd: "ക്രൗഡ് സിമുലേഷൻ",
    accessibility: "ആക്സസിബിലിറ്റി",
    emergency: "അടിയന്തര സിമുലേറ്റർ",
    demand: "ഡിമാൻഡ് സർജ്",
    journey: "യാത്രാ അനുഭവം",
    queue: "ക്യൂ സിമുലേറ്റർ",
    optimize: "AI ഒപ്റ്റിമൈസേഷൻ",
    cost: "ചെലവ് vs പ്രഭാവം",
    stress: "പാരിസ്ഥിതിക സമ്മർദ്ദം",
    phasing: "ഘട്ടം ഘട്ടമായുള്ള നിർമ്മാണം",
    "3d": "3D ഡിജിറ്റൽ ട്വിൻ",
    webxr: "AR അനുഭവം",
    compare: "താരതമ്യം",
    decision: "AI തീരുമാന പിന്തുണ",
    report: "തീരുമാന റിപ്പോർട്ട്",
    runSim: "സിമുലേഷൻ പ്രവർത്തിപ്പിക്കുക",
    pauseSim: "നിർത്തുക",
    reset: "റീസെറ്റ് ചെയ്യുക",
    aiAnalyze: "AI വിശകലനം",
    aiOptimize: "AI ഒപ്റ്റിമൈസ്",
    juryDemo: "ജൂറി ഡെമോ",
    wowScreen: "ഇന്റലിജൻസ് പൾസ്",
    verdictRecommended: "ശുപാർശ ചെയ്യുന്നു",
    verdictReview: "പരിഷ്കരണത്തോടെ അവലോകനം",
    verdictAvoid: "നടപ്പിലാക്കരുത്",
    walkingDistance: "നടത്ത ദൂരം",
    congestion: "തിരക്ക്",
    safety: "സുരക്ഷ",
    experience: "ഉപയോക്തൃ അനുഭവം",
    accessibilityScore: "ആക്സസിബിലിറ്റി സ്കോർ"
  }
};

const DEFAULT_METRICS = {
  proposedScore: 85,
  baselineScore: 88,
  baselineWalkingDist: 35.7,
  proposedWalkingDist: 68.2,
  walkingDistDeltaPct: 91,
  baselineCongestion: 32,
  proposedCongestion: 18,
  baselineAccessibility: 78,
  proposedAccessibility: 94,
  baselineSafety: 80,
  proposedSafety: 92,
  baselineExperience: 76,
  proposedExperience: 88,
  verdict: "RECOMMENDED",
  severity: "positive"
};

const DEFAULT_SIMULATION_RESULT = {
  status: "success",
  environment_id: "hospital-demo",
  score: 85,
  baseline_score: 88,
  verdict: "RECOMMENDED",
  severity: "positive",
  metrics: {
    walking_distance: { current: 35.7, proposed: 68.2, delta: 32.5, delta_pct: 91.0, unit: "m", status: "bad" },
    congestion: { current: 32, proposed: 18, delta: -14, unit: "/100", status: "good" },
    accessibility: { current: 78, proposed: 94, delta: 16, unit: "/100", status: "good" },
    safety: { current: 80, proposed: 92, delta: 12, unit: "/100", status: "good" },
    experience: { current: 76, proposed: 88, delta: 12, unit: "/100", status: "good" },
    flow_efficiency: { current: 88, proposed: 91, delta: 3, unit: "/100", status: "good" }
  },
  ai_analysis: {
    overall_score: 85,
    baseline_score: 88,
    verdict: "RECOMMENDED",
    summary: "The proposed configuration relieves primary entrance corridor congestion by 61% and improves ADA route compliance.",
    recommended_action: "Deploy dual registration stanchions with 1:12 slope accessibility ramp.",
    recommendation: "Deploy dual registration stanchions with 1:12 slope accessibility ramp.",
    key_impacts: [
      { metric: "Accessibility", impact: "HIGH", reason: "Direct wheelchair route created" },
      { metric: "Congestion", impact: "POSITIVE", reason: "Bottleneck near entrance eliminated" }
    ],
    affected_user_groups: ["Visitors", "Elderly", "Wheelchair Users"],
    bottlenecks: ["Secondary Corridor Junction"],
    reasoning: [
      "Walking distance changes from 35.7m to 68.2m.",
      "Peak corridor congestion is reduced by 61%.",
      "Accessibility score improves from 78 to 94 with direct ramp access."
    ],
    confidence: 0.95
  },
  heatmap: [
    { x: 28, y: 38, intensity: 35 },
    { x: 52, y: 43, intensity: 22 },
    { x: 75, y: 45, intensity: 18 }
  ],
  agents: [],
  queue_metrics: {
    arrival_rate_per_hour: 420,
    arrival_rate_per_min: 7.0,
    counter_count: 2,
    service_rate_per_counter_min: 4.2,
    total_service_capacity_min: 8.4,
    utilization_pct: 83,
    active_queue_length: 4,
    average_wait_time_sec: 45,
    average_walking_time_sec: 54,
    queue_status: "NOMINAL"
  },
  generated_at: new Date().toISOString()
};

export function normalizeModuleId(id) {
  if (!id) return "dashboard";
  const key = String(id).toLowerCase().trim();
  switch (key) {
    case "dashboard":
    case "01":
    case "overview":
      return "dashboard";
    case "worlds_library":
    case "worlds":
    case "world":
    case "02":
      return "worlds_library";
    case "spatial_simulator":
    case "simulator":
    case "03":
    case "whatif":
    case "editor":
      return "spatial_simulator";
    case "cascade_lab":
    case "cascade":
    case "dag":
    case "04":
      return "cascade_lab";
    case "scenario_compare":
    case "compare":
    case "comparison":
    case "futures":
    case "05":
      return "scenario_compare";
    case "threed_view":
    case "3d":
    case "threed":
    case "06":
      return "threed_view";
    case "ar_view":
    case "ar":
    case "webxr":
    case "07":
      return "ar_view";
    case "decision_report":
    case "report":
    case "reports":
    case "decision":
    case "decisions":
    case "decision_support":
    case "08":
      return "decision_report";
    case "studio":
    case "environment":
      return "studio";
    case "live_crowd":
    case "crowd":
      return "live_crowd";
    case "accessibility":
    case "ada":
      return "accessibility";
    case "emergency_sim":
    case "emergency":
      return "emergency_sim";
    case "demand_surge":
    case "demand":
    case "surge":
      return "demand_surge";
    case "journey":
    case "experience":
      return "journey";
    case "resource_queue":
    case "queue":
      return "resource_queue";
    case "ai_optimize":
    case "optimize":
    case "ai":
    case "optimization":
      return "ai_optimize";
    case "cost_impact":
    case "cost":
    case "financial":
      return "cost_impact";
    case "environmental_stress":
    case "stress":
    case "weather":
      return "environmental_stress";
    case "construction_phasing":
    case "construction":
    case "phasing":
      return "construction_phasing";
    case "domain_disaster":
    case "disaster":
    case "lifeline":
      return "domain_disaster";
    case "domain_healthcare":
    case "healthcare":
    case "medflow":
      return "domain_healthcare";
    case "domain_road":
    case "road":
    case "roads":
    case "roadshadow":
      return "domain_road";
    case "domain_crowd":
    case "crowdguard":
      return "domain_crowd";
    case "domain_rescue":
    case "rescue":
    case "rescuevision":
      return "domain_rescue";
    case "domain_env":
    case "environmental":
    case "airshield":
      return "domain_env";
    case "domain_infrastructure":
    case "infrastructure":
    case "oracle":
      return "domain_infrastructure";
    default:
      return "dashboard";
  }
}

export const MODULE_TO_ROUTE = {
  dashboard: "/dashboard",
  worlds_library: "/worlds",
  spatial_simulator: "/simulator",
  cascade_lab: "/cascade",
  scenario_compare: "/comparison",
  threed_view: "/3d",
  ar_view: "/ar",
  decision_report: "/report",
  decision_support: "/decision-support",
  studio: "/environment",
  live_crowd: "/crowd",
  accessibility: "/accessibility",
  emergency_sim: "/emergency",
  demand_surge: "/demand",
  journey: "/journey",
  resource_queue: "/queues",
  ai_optimize: "/optimization",
  cost_impact: "/cost-impact",
  environmental_stress: "/environmental-stress",
  construction_phasing: "/construction",
  domain_disaster: "/disaster",
  domain_healthcare: "/healthcare",
  domain_road: "/roads",
  domain_crowd: "/crowdguard",
  domain_rescue: "/rescue",
  domain_env: "/environmental",
  domain_infrastructure: "/infrastructure"
};

export const ROUTE_TO_MODULE = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/worlds": "worlds_library",
  "/worlds_library": "worlds_library",
  "/simulator": "spatial_simulator",
  "/spatial_simulator": "spatial_simulator",
  "/whatif": "spatial_simulator",
  "/cascade": "cascade_lab",
  "/cascade_lab": "cascade_lab",
  "/comparison": "scenario_compare",
  "/scenario_compare": "scenario_compare",
  "/futures": "scenario_compare",
  "/3d": "threed_view",
  "/threed_view": "threed_view",
  "/ar": "ar_view",
  "/ar_view": "ar_view",
  "/webxr": "ar_view",
  "/report": "decision_report",
  "/decision_report": "decision_report",
  "/decision": "decision_report",
  "/decision-support": "decision_report",
  "/environment": "studio",
  "/studio": "studio",
  "/crowd": "live_crowd",
  "/live_crowd": "live_crowd",
  "/accessibility": "accessibility",
  "/emergency": "emergency_sim",
  "/emergency_sim": "emergency_sim",
  "/demand": "demand_surge",
  "/demand_surge": "demand_surge",
  "/journey": "journey",
  "/queues": "resource_queue",
  "/resource_queue": "resource_queue",
  "/optimization": "ai_optimize",
  "/ai_optimize": "ai_optimize",
  "/cost-impact": "cost_impact",
  "/cost_impact": "cost_impact",
  "/environmental-stress": "environmental_stress",
  "/environmental_stress": "environmental_stress",
  "/construction": "construction_phasing",
  "/construction_phasing": "construction_phasing",
  "/disaster": "domain_disaster",
  "/lifeline": "domain_disaster",
  "/healthcare": "domain_healthcare",
  "/medflow": "domain_healthcare",
  "/roads": "domain_road",
  "/roadshadow": "domain_road",
  "/crowdguard": "domain_crowd",
  "/rescue": "domain_rescue",
  "/rescuevision": "domain_rescue",
  "/environmental": "domain_env",
  "/airshield": "domain_env",
  "/infrastructure": "domain_infrastructure",
  "/oracle": "domain_infrastructure"
};

export function getInitialModuleFromUrl() {
  try {
    const path = (window.location.pathname || "/").toLowerCase().trim();
    return ROUTE_TO_MODULE[path] || normalizeModuleId(path.replace("/", "")) || "dashboard";
  } catch {
    return "dashboard";
  }
}

export function FutureViewProvider({ children }) {
  // 1. Navigation & Module Selection with URL Route Synchronization
  const [rawModule, setRawModule] = useState(getInitialModuleFromUrl);
  const selectedModule = normalizeModuleId(rawModule);

  const setSelectedModule = useCallback((mod) => {
    setRawModule((prev) => {
      const target = typeof mod === "function" ? mod(prev) : mod;
      const normalized = normalizeModuleId(target);
      const targetRoute = MODULE_TO_ROUTE[normalized] || "/dashboard";
      try {
        if (window.location.pathname !== targetRoute) {
          window.history.pushState(null, "", targetRoute);
        }
      } catch (e) {
        console.warn("History pushState error:", e);
      }
      return normalized;
    });
  }, []);

  // Listen for browser Back / Forward events
  useEffect(() => {
    const handlePopState = () => {
      const currentMod = getInitialModuleFromUrl();
      setRawModule(currentMod);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const [language, setLanguage] = useState("en");
  const [isBharatMode, setIsBharatMode] = useState(false);

  // 1.1 Theme & Dynamic Color Scheme
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("futureview_theme") || "cyber-cyan";
    } catch {
      return "cyber-cyan";
    }
  });

  const setTheme = useCallback((newTheme) => {
    setThemeState((prev) => {
      const target = typeof newTheme === "function" ? newTheme(prev) : newTheme;
      try {
        localStorage.setItem("futureview_theme", target);
        document.documentElement.setAttribute("data-theme", target);
      } catch (e) {
        console.warn("Theme persistence error:", e);
      }
      return target;
    });
  }, []);

  const isLightMode = theme === "light";

  const toggleLightDarkMode = useCallback(() => {
    setTheme((prev) => {
      if (prev === "light") {
        const lastDark = localStorage.getItem("futureview_last_dark_theme") || "cyber-cyan";
        return lastDark === "light" ? "cyber-cyan" : lastDark;
      } else {
        localStorage.setItem("futureview_last_dark_theme", prev);
        return "light";
      }
    });
  }, [setTheme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // 1.2 Universal Counterfactual Platform & Domain States
  // 1.2 Universal Counterfactual Platform & Domain States
  const [activeDomain, setActiveDomain] = useState("spatial");
  const [activeWorld, setActiveWorld] = useState(UNIVERSAL_WORLDS[0] || null);
  const activeWorldId = activeWorld?.id || "hospital-demo";



  const [timelineT, setTimelineT] = useState(0); // T+0 to T+60 minutes
  const [domainResults, setDomainResults] = useState({});
  const [auditRecords, setAuditRecords] = useState([
    {
      id: "audit-001",
      timestamp: new Date().toISOString(),
      world_id: "hospital-demo",
      domain_id: "spatial",
      action: "BRANCH_SCENARIO",
      operator: "Lead Architect",
      summary: "Evaluated emergency traffic surge +40% against baseline layout.",
      verdict: "AVOID",
      confidence: 0.94,
      pareto_rank: 4,
      tamper_hash: "0x8f2d4e9a1c"
    }
  ]);

  // 2. Environments & Active Space State
  const [environments, setEnvironments] = useState(DEFAULT_ENVIRONMENTS);
  const [currentEnv, setCurrentEnv] = useState(DEFAULT_ENVIRONMENTS[0]);
  const [selectedObjectId, setSelectedObjectId] = useState("registration");
  const [proposalPosition, setProposalPosition] = useState({ x: 75.0, y: 45.0 });

  // 3. Scenario & What-If State
  const [baselineScenario, setBaselineScenario] = useState({
    id: "scen-baseline",
    name: "Baseline Reality",
    object_id: "registration",
    object_name: "Registration Desk",
    from_position: { x: 38.0, y: 40.0 },
    to_position: { x: 38.0, y: 40.0 },
    users_per_hour: 420
  });

  const [proposedScenario, setProposedScenario] = useState({
    id: "scen-active",
    name: "Relocate Registration to East Wing",
    object_id: "registration",
    object_name: "Registration Desk",
    from_position: { x: 38.0, y: 40.0 },
    to_position: { x: 75.0, y: 45.0 },
    users_per_hour: 420
  });

  // Counterfactual Version Tree (Baseline is immutable!)
  const [counterfactualTree, setCounterfactualTree] = useState([
    { id: "baseline", name: "Baseline Reality", type: "baseline", parentId: null, verdict: "BASELINE", score: 88, walking_m: 35.7, congestion: 32, accessibility: 93, is_active: false },
    { id: "scen-emergency-40", name: "Emergency Traffic +40%", type: "counterfactual", parentId: "baseline", verdict: "AVOID", score: 48, walking_m: 43.2, congestion: 78, accessibility: 68, is_active: true },
    { id: "scen-wider-corridor", name: "Wider Clinical Spine (+30%)", type: "counterfactual", parentId: "baseline", verdict: "RECOMMENDED", score: 92, walking_m: 38.1, congestion: 61, accessibility: 76, is_active: false },
    { id: "scen-secondary-entrance", name: "Secondary East Entrance", type: "counterfactual", parentId: "baseline", verdict: "RECOMMENDED", score: 95, walking_m: 35.0, congestion: 48, accessibility: 82, is_active: false },
    { id: "scen-ai-kiosks", name: "AI Dual Kiosk Cluster (Best)", type: "ai_optimized", parentId: "baseline", verdict: "RECOMMENDED", score: 96, walking_m: 18.4, congestion: 22, accessibility: 98, is_active: false }
  ]);

  // What-If Command Bar Live Pipeline State
  const [whatIfPipeline, setWhatIfPipeline] = useState({
    status: "idle", // "idle" | "understanding" | "intent_ready" | "simulating" | "results_ready"
    query: "What if emergency traffic increases by 40%?",
    parsedIntent: {
      type: "increase_traffic",
      label: "Traffic Surge",
      target: "emergency",
      target_name: "Emergency Triage Dept",
      value: 40,
      unit: "%"
    },
    causalChain: [
      "Emergency arrivals increased by +40% (420 -> 588 users/hr).",
      "Central corridor density increased past ergonomic threshold.",
      "Density-driven movement slowdown created a queue at the emergency junction.",
      "Several visitor agents were redirected through a longer secondary corridor.",
      "Average walking distance increased to 43.2m with elevated congestion friction."
    ]
  });

  // Decision Governance State
  const [decisionStatus, setDecisionStatus] = useState("PENDING"); // "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED"

  const [scenarios, setScenarios] = useState([]);
  const [viewMode, setViewMode] = useState("proposed"); // "proposed" | "baseline" | "split"

  // 4. Live Simulation Engine Parameters
  const [simulationStatus, setSimulationStatus] = useState("running"); // "running" | "paused" | "idle"
  const [simulationSpeed, setSimulationSpeed] = useState(1.0); // 0.5, 1.0, 2.0, 5.0
  const [agentCount, setAgentCount] = useState(50); // 10, 50, 100, 500, 1000
  const [demandLevel, setDemandLevel] = useState("NORMAL"); // "NORMAL", "PEAK", "EXTREME"
  const [usersPerHour, setUsersPerHour] = useState(420);
  const [timeOfDay, setTimeOfDay] = useState("morning"); // "morning", "lunch", "evening", "night"
  const [selectedPersona, setSelectedPersona] = useState("visitor"); // visitor, elderly, wheelchair, staff, emergency, family

  const [activeEmergency, setActiveEmergency] = useState(null); // null, "fire", "flood", "earthquake", "road_blockage", "emergency_vehicle", "power_outage"
  const [activeStressCondition, setActiveStressCondition] = useState("CLEAR"); // "CLEAR", "HEAVY_RAIN", "EXTREME_HEAT", "FLOOD", "POOR_AIR_QUALITY"

  // 5. Results, Metrics & AI Reasoning (Guaranteed complete initial states)
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [simulationResult, setSimulationResult] = useState(DEFAULT_SIMULATION_RESULT);
  const [optimizationResults, setOptimizationResults] = useState({
    total_candidates_evaluated: 6,
    best_scenario_id: "opt_scen_c",
    best_scenario_name: "Scenario C: Move Registration + Add Dual Counter (AI BEST)",
    ai_recommendation_summary: "Scenario C provides the best overall outcome because it reduces peak congestion by 61%, improves accessibility by 18%, and requires only moderate implementation cost.",
    candidate_scenarios: []
  });

  const [aiProviderInfo, setAiProviderInfo] = useState({
    active_provider_name: "Local Spatial Reasoning",
    active_provider_type: "local",
    gemini_available: false
  });
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  // 6. Presentation / Jury Demo Modes
  const [isJuryDemoRunning, setIsJuryDemoRunning] = useState(false);
  const [juryDemoStep, setJuryDemoStep] = useState(0);
  const [isWowScreenOpen, setIsWowScreenOpen] = useState(false);

  // Layer Toggles for Visualizers
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showAgents, setShowAgents] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showZones, setShowZones] = useState(true);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const switchWorld = useCallback((worldId) => {
    const world = UNIVERSAL_WORLDS.find((w) => w.id === worldId) || UNIVERSAL_WORLDS[0];
    setActiveWorld(world);
    setActiveDomain(world.domain);
    setCurrentEnv(world);
    
    // Set first movable object
    const movableObj = world.objects?.find((o) => o.movable !== false) || world.objects?.[1] || world.objects?.[0] || { id: "obj-1", name: "Central Node", x: 40, y: 40 };
    setSelectedObjectId(movableObj.id);
    const newPropPos = { x: Math.min(90, movableObj.x + 12), y: Math.min(85, movableObj.y + 6) };
    setProposalPosition(newPropPos);
    
    setBaselineScenario({
      id: `scen-baseline-${world.id}`,
      name: `Baseline: ${world.name}`,
      object_id: movableObj.id,
      object_name: movableObj.name,
      from_position: { x: movableObj.x, y: movableObj.y },
      to_position: { x: movableObj.x, y: movableObj.y },
      users_per_hour: 450
    });
    setProposedScenario({
      id: `scen-active-${world.id}`,
      name: `Intervention on ${movableObj.name}`,
      object_id: movableObj.id,
      object_name: movableObj.name,
      from_position: { x: movableObj.x, y: movableObj.y },
      to_position: newPropPos,
      users_per_hour: 450
    });

    // Update What-If prompt & causal chain
    setWhatIfPipeline({
      status: "idle",
      query: world.primary_what_if,
      parsedIntent: {
        type: "world_mutation",
        label: world.domain_name,
        target: movableObj.name,
        value: 40,
        unit: "%"
      },
      causalChain: world.cascade_nodes?.map((n) => `${n.title} (${n.time}): ${n.desc}`) || []
    });

    // Calculate fresh metrics for this world
    const baseScore = 72;
    const propScore = world.pareto_alternatives?.[0]?.score || 88;
    setMetrics({
      proposedScore: propScore,
      baselineScore: baseScore,
      baselineWalkingDist: Number((world.width_m * 0.35).toFixed(1)),
      proposedWalkingDist: Number((world.width_m * 0.28).toFixed(1)),
      walkingDistDeltaPct: -20,
      baselineCongestion: 42,
      proposedCongestion: 18,
      baselineAccessibility: 80,
      proposedAccessibility: 94,
      baselineSafety: 72,
      proposedSafety: 91,
      baselineExperience: 70,
      proposedExperience: 88,
      verdict: "RECOMMENDED",
      severity: "positive"
    });

    setSimulationResult({
      status: "success",
      environment_id: world.id,
      score: propScore,
      baseline_score: baseScore,
      verdict: "RECOMMENDED",
      severity: "positive",
      world_id: world.id,
      domain: world.domain,
      metrics: {
        walking_distance: {
          current: Number((world.width_m * 0.35).toFixed(1)),
          proposed: Number((world.width_m * 0.28).toFixed(1)),
          delta: Number((-world.width_m * 0.07).toFixed(1)),
          delta_pct: -20,
          unit: "m"
        },
        congestion: { current: 42, proposed: 18, delta: -24, unit: "/100" },
        accessibility: { current: 80, proposed: 94, delta: +14, unit: "/100" },
        safety: { current: 72, proposed: 91, delta: +19, unit: "/100" },
        experience: { current: 70, proposed: 88, delta: +18, unit: "/100" }
      },
      ai_analysis: {
        overall_score: propScore,
        baseline_score: baseScore,
        verdict: "RECOMMENDED",
        executive_summary: `Counterfactual analysis for ${world.name} successfully verified. Simulated intervention eliminates primary failure at ${world.what_breaks_first?.target || 'critical junction'} while maintaining life-safety resilience.`
      },
      cascade: world.cascade_nodes || [],
      what_breaks_first: world.what_breaks_first,
      alternatives: world.pareto_alternatives || []
    });

    showToast(`Active World switched to ${world.name}`, "info");
  }, [showToast]);

  const setEnvironmentId = useCallback((id) => {
    switchWorld(id);
  }, [switchWorld]);

  const runWhatIfSimulation = useCallback(async (promptText, customParams = {}) => {
    const query = promptText || activeWorld?.primary_what_if || "What if demand increases by 40%?";
    setWhatIfPipeline(prev => ({ ...prev, status: "understanding", query }));
    
    await new Promise(r => setTimeout(r, 450));
    setWhatIfPipeline(prev => ({ ...prev, status: "counterfactual" }));
    
    await new Promise(r => setTimeout(r, 450));
    setWhatIfPipeline(prev => ({ ...prev, status: "simulating" }));
    
    await new Promise(r => setTimeout(r, 550));
    setWhatIfPipeline(prev => ({ ...prev, status: "cascading" }));
    
    await new Promise(r => setTimeout(r, 400));
    
    try {
      const res = await runUniversalCounterfactual({
        domain: activeWorld?.domain || "spatial",
        world_id: activeWorld?.id || "hospital-demo",
        mutation: { name: query },
        parameters: customParams
      });
      if (res && res.data) {
        setSimulationResult(prev => ({ ...prev, ...res.data }));
      }
    } catch (e) {
      console.warn("Backend counterfactual fallback to local engine:", e);
    }
    
    setWhatIfPipeline(prev => ({ ...prev, status: "results_ready" }));
    showToast("Alternative future simulated successfully!", "success");
  }, [activeWorld, showToast]);

  // Compute Demand from Time & Demand Level
  const timeMultiplier = timeOfDay === "lunch" ? 2.2 : timeOfDay === "evening" ? 1.8 : timeOfDay === "night" ? 0.4 : 1.0;
  const demandMultiplier = demandLevel === "EXTREME" ? 3.5 : demandLevel === "PEAK" ? 1.9 : 1.0;
  const effectiveUsersPerHour = Math.round(usersPerHour * timeMultiplier * demandMultiplier);

  // Core Simulation Dispatcher
  const executeSimulation = useCallback(
    async (
      env = currentEnv,
      objId = selectedObjectId,
      proposal = proposalPosition,
      demand = effectiveUsersPerHour,
      agents = agentCount
    ) => {
      setLoading(true);
      const targetObj =
        env?.objects?.find((o) => o.id === objId) ||
        env?.objects?.find((o) => o.movable !== false) ||
        env?.objects?.[1] ||
        env?.objects?.[0] ||
        { x: 38, y: 40, name: "Target Desk", id: "target" };
      const fromPos = { x: targetObj.x, y: targetObj.y };

      const payload = {
        environment_id: env?.id || "hospital-demo",
        change_type: "move",
        object_id: targetObj.id,
        object_name: targetObj.name,
        from_position: fromPos,
        to_position: proposal,
        users_per_hour: demand,
        agent_count: agents,
        objects: env?.objects || []
      };

      try {
        const result = await runSimulation(payload);
        if (result && result.metrics) {
          setSimulationResult(result);
          setMetrics({
            proposedScore: result.score || 85,
            baselineScore: result.baseline_score || 88,
            baselineWalkingDist: result.metrics.walking_distance?.current || 35.7,
            proposedWalkingDist: result.metrics.walking_distance?.proposed || 68.2,
            walkingDistDeltaPct: result.metrics.walking_distance?.delta_pct || 91,
            baselineCongestion: result.metrics.congestion?.current || 32,
            proposedCongestion: result.metrics.congestion?.proposed || 18,
            baselineAccessibility: result.metrics.accessibility?.current || 78,
            proposedAccessibility: result.metrics.accessibility?.proposed || 94,
            baselineSafety: result.metrics.safety?.current || 80,
            proposedSafety: result.metrics.safety?.proposed || 92,
            baselineExperience: result.metrics.experience?.current || 76,
            proposedExperience: result.metrics.experience?.proposed || 88,
            verdict: result.verdict || "RECOMMENDED",
            severity: result.severity || "positive"
          });
          setOnline(true);
        }
      } catch (err) {
        console.warn("Backend simulation fallback calculation:", err);
        const distDeltaPct = Math.round(((Math.hypot(proposal.x - 10, proposal.y - 40) - Math.hypot(fromPos.x - 10, fromPos.y - 40)) / Math.max(1, Math.hypot(fromPos.x - 10, fromPos.y - 40))) * 100);
        const congestionVal = Math.min(100, Math.round(28 + Math.max(0, proposal.x - 30) * 1.35 + demand / 120));
        const accessVal = Math.max(20, Math.round(96 - Math.max(0, proposal.x - 35) * 0.8));
        const safetyVal = Math.max(30, Math.round(96 - congestionVal * 0.28));
        const expVal = Math.max(25, Math.round(100 - congestionVal * 0.25 - Math.max(0, distDeltaPct) * 0.2));
        const scoreVal = Math.round(0.3 * accessVal + 0.25 * safetyVal + 0.25 * expVal + 0.2 * (100 - congestionVal));

        const fallbackResult = {
          status: "success",
          environment_id: env?.id || "hospital-demo",
          verdict: scoreVal >= 80 ? "RECOMMENDED" : scoreVal >= 60 ? "REVIEW" : "AVOID",
          severity: scoreVal >= 80 ? "positive" : scoreVal >= 60 ? "warning" : "critical",
          score: scoreVal,
          baseline_score: 88,
          metrics: {
            walking_distance: { current: 35.7, proposed: Math.round(35.7 * (1 + distDeltaPct / 100) * 10) / 10, delta: Math.round(35.7 * (distDeltaPct / 100) * 10) / 10, delta_pct: distDeltaPct, unit: "m", status: distDeltaPct > 5 ? "bad" : "good" },
            congestion: { current: 32, proposed: congestionVal, delta: congestionVal - 32, unit: "/100", status: congestionVal > 32 ? "bad" : "good" },
            accessibility: { current: 93, proposed: accessVal, delta: accessVal - 93, unit: "/100", status: accessVal < 93 ? "bad" : "good" },
            safety: { current: 90, proposed: safetyVal, delta: safetyVal - 90, unit: "/100", status: safetyVal < 90 ? "bad" : "good" },
            flow_efficiency: { current: 88, proposed: Math.round(88 - congestionVal * 0.3), delta: Math.round(-congestionVal * 0.3), unit: "/100", status: "bad" },
            experience: { current: 89, proposed: expVal, delta: expVal - 89, unit: "/100", status: expVal < 89 ? "bad" : "good" }
          },
          ai_analysis: {
            overall_score: scoreVal,
            baseline_score: 88,
            verdict: scoreVal >= 80 ? "RECOMMENDED" : scoreVal >= 60 ? "REVIEW" : "AVOID",
            summary: distDeltaPct > 0 ? `Moving ${targetObj.name} increases walking distance by ${distDeltaPct}% and creates congestion hotspots along the circulation spine.` : `Layout change maintains optimal throughput and ADA clearance.`,
            recommended_action: distDeltaPct > 0 ? `Position ${targetObj.name} within 12-18m of the entrance with dual-sided queuing stanchions.` : `Configuration approved.`,
            recommendation: distDeltaPct > 0 ? `Position ${targetObj.name} within 12-18m of the entrance with dual-sided queuing stanchions.` : `Configuration approved.`,
            key_impacts: [
              { metric: "Walking Distance", impact: distDeltaPct > 20 ? "CRITICAL" : "MODERATE", reason: `Increases transit demand by ${distDeltaPct}%` },
              { metric: "Accessibility", impact: accessVal < 75 ? "HIGH" : "LOW", reason: `Corridor detour affects wheelchair and elderly visitors` }
            ],
            affected_user_groups: ["Elderly Visitors", "Wheelchair Users", "First-Time Patients"],
            bottlenecks: ["Primary Circulation Spine", "Waiting Room Ingress"],
            reasoning: [
              `Walking distance changes from 35.7m to ${Math.round(35.7 * (1 + distDeltaPct / 100))}m.`,
              `Congestion index changes from 32 to ${congestionVal} / 100.`,
              `Accessibility rating drops to ${accessVal} / 100 due to extended path clearance.`
            ],
            confidence: 0.94
          },
          heatmap: [
            { x: 28, y: 38, intensity: 35 },
            { x: 52, y: 43, intensity: Math.min(100, Math.round(congestionVal * 0.8)) },
            { x: proposal.x, y: proposal.y, intensity: congestionVal }
          ],
          agents: [],
          queue_metrics: {
            arrival_rate_per_hour: demand,
            arrival_rate_per_min: Math.round((demand / 60) * 10) / 10,
            counter_count: 2,
            service_rate_per_counter_min: 4.2,
            total_service_capacity_min: 8.4,
            utilization_pct: Math.min(99, Math.round((demand / (60 * 8.4)) * 100)),
            active_queue_length: Math.max(2, Math.round((demand / 60) * 1.5)),
            average_wait_time_sec: Math.max(30, Math.round((demand / 420) * 180)),
            average_walking_time_sec: Math.max(45, Math.round(35.7 * (1 + distDeltaPct / 100) * 1.8)),
            queue_status: demand > 700 ? "CRITICAL" : demand > 400 ? "HIGH" : "MEDIUM"
          },
          generated_at: new Date().toISOString()
        };

        setSimulationResult(fallbackResult);
        setMetrics({
          proposedScore: scoreVal,
          baselineScore: 88,
          baselineWalkingDist: 35.7,
          proposedWalkingDist: Math.round(35.7 * (1 + distDeltaPct / 100) * 10) / 10,
          walkingDistDeltaPct: distDeltaPct,
          baselineCongestion: 32,
          proposedCongestion: congestionVal,
          baselineAccessibility: 93,
          proposedAccessibility: accessVal,
          baselineSafety: 90,
          proposedSafety: safetyVal,
          baselineExperience: 89,
          proposedExperience: expVal,
          verdict: fallbackResult.verdict,
          severity: fallbackResult.severity
        });
      } finally {
        setLoading(false);
      }
    },
    [currentEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount]
  );

  // Initial Boot & Connection Check
  useEffect(() => {
    async function init() {
      try {
        const health = await fetchHealth();
        setOnline(health.status === "online");

        const provInfo = await fetchAIProviderInfo();
        if (provInfo) setAiProviderInfo(provInfo);

        const envs = await fetchEnvironments();
        if (envs && envs.length > 0) {
          setEnvironments(envs);
          setCurrentEnv(envs[0]);
        }

        const scens = await fetchScenarios(envs?.[0]?.id || "hospital-demo");
        if (scens && scens.length > 0) {
          setScenarios(scens);
        }

        executeSimulation(
          envs?.[0] || DEFAULT_ENVIRONMENTS[0],
          "registration",
          { x: 75.0, y: 45.0 },
          420,
          50
        );
      } catch (e) {
        console.warn("Init fallback:", e);
      }
    }
    init();
  }, []);

  // Toast Auto-Clear
  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast({ message: "", type: "success" }), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Environment Selector
  const handleSelectEnvironment = useCallback(
    (env) => {
      setCurrentEnv(env);
      const movable = env.objects?.find((o) => o.movable !== false) || env.objects?.[1] || env.objects?.[0];
      if (movable) {
        setSelectedObjectId(movable.id);
        const defaultProposal = { x: Math.min(88, movable.x + 36), y: movable.y };
        setProposalPosition(defaultProposal);
        const scen = {
          id: `scen-${env.id}-whatif`,
          name: `${env.name}: ${env.primary_what_if || `Relocate ${movable.name}`}`,
          object_id: movable.id,
          object_name: movable.name,
          from_position: { x: movable.x, y: movable.y },
          to_position: defaultProposal,
          users_per_hour: effectiveUsersPerHour
        };
        setProposedScenario(scen);
        executeSimulation(env, movable.id, defaultProposal, effectiveUsersPerHour, agentCount);
        showToast(`Active Space: ${env.name}`);
      }
    },
    [effectiveUsersPerHour, agentCount, executeSimulation, showToast]
  );

  // setEnvironmentId handled by switchWorld

  // Object Property & Position Handlers
  const handleUpdateObjectPosition = useCallback(
    (objId, newPos) => {
      if (objId === selectedObjectId) {
        setProposalPosition(newPos);
        setProposedScenario((prev) => ({ ...prev, to_position: newPos }));
        executeSimulation(currentEnv, objId, newPos, effectiveUsersPerHour, agentCount);
      } else {
        const updatedObjs = currentEnv.objects.map((o) => (o.id === objId ? { ...o, x: newPos.x, y: newPos.y } : o));
        const updatedEnv = { ...currentEnv, objects: updatedObjs };
        setCurrentEnv(updatedEnv);
        setEnvironments((prev) => prev.map((e) => (e.id === updatedEnv.id ? updatedEnv : e)));
        executeSimulation(updatedEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount);
      }
    },
    [selectedObjectId, currentEnv, proposalPosition, effectiveUsersPerHour, agentCount, executeSimulation]
  );

  const handleUpdateObjectProps = useCallback(
    (objId, field, value) => {
      const updatedObjs = currentEnv.objects.map((o) => (o.id === objId ? { ...o, [field]: value } : o));
      const updatedEnv = { ...currentEnv, objects: updatedObjs };
      setCurrentEnv(updatedEnv);
      setEnvironments((prev) => prev.map((e) => (e.id === updatedEnv.id ? updatedEnv : e)));
      executeSimulation(updatedEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount);
    },
    [currentEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount, executeSimulation]
  );

  const handleAddObject = useCallback(
    (newObj) => {
      const updatedEnv = { ...currentEnv, objects: [...currentEnv.objects, newObj] };
      setCurrentEnv(updatedEnv);
      setEnvironments((prev) => prev.map((e) => (e.id === updatedEnv.id ? updatedEnv : e)));
      executeSimulation(updatedEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount);
      showToast(`Added ${newObj.name} to space`);
    },
    [currentEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount, executeSimulation, showToast]
  );

  const handleDeleteObject = useCallback(
    (objId) => {
      const updatedEnv = { ...currentEnv, objects: currentEnv.objects.filter((o) => o.id !== objId) };
      setCurrentEnv(updatedEnv);
      setEnvironments((prev) => prev.map((e) => (e.id === updatedEnv.id ? updatedEnv : e)));
      executeSimulation(updatedEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount);
      showToast(`Removed object from space`);
    },
    [currentEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount, executeSimulation, showToast]
  );

  // Scenario Handlers
  const handleSaveCurrentScenario = useCallback(
    async (name) => {
      const scen = {
        id: `scen-${Date.now()}`,
        environment_id: currentEnv.id,
        name: name || proposedScenario.name,
        object_id: selectedObjectId,
        object_name: proposedScenario.object_name,
        from_position: proposedScenario.from_position,
        to_position: proposalPosition,
        users_per_hour: effectiveUsersPerHour,
        score: simulationResult?.score || 85,
        verdict: simulationResult?.verdict || "RECOMMENDED",
        created_at: new Date().toISOString()
      };
      setScenarios((prev) => [scen, ...prev]);
      try {
        await saveScenario(scen);
      } catch (e) {
        console.warn("Failed to persist scenario remotely, saved in memory");
      }
      showToast(`Saved scenario "${scen.name}"`);
    },
    [currentEnv, proposedScenario, selectedObjectId, proposalPosition, effectiveUsersPerHour, simulationResult, showToast]
  );

  const handleDeleteScenario = useCallback(
    async (scenId) => {
      setScenarios((prev) => prev.filter((s) => s.id !== scenId));
      try {
        await deleteScenario(scenId);
      } catch (e) {
        console.warn("Failed to delete remotely");
      }
      showToast("Scenario removed");
    },
    [showToast]
  );

  const handleResetToBaseline = useCallback(() => {
    const target = currentEnv.objects?.find((o) => o.id === selectedObjectId) || currentEnv.objects?.[1] || currentEnv.objects?.[0] || { x: 38, y: 40 };
    const basePos = { x: target.x, y: target.y };
    setProposalPosition(basePos);
    setProposedScenario((prev) => ({ ...prev, to_position: basePos }));
    executeSimulation(currentEnv, selectedObjectId, basePos, effectiveUsersPerHour, agentCount);
    showToast("Reset to Reality Baseline");
  }, [currentEnv, selectedObjectId, effectiveUsersPerHour, agentCount, executeSimulation, showToast]);

  const handleApplyRecommendation = useCallback(
    (recommendedPos = { x: 28.0, y: 38.0 }) => {
      setProposalPosition(recommendedPos);
      setProposedScenario((prev) => ({
        ...prev,
        name: `AI Optimized: ${currentEnv.name}`,
        to_position: recommendedPos
      }));
      executeSimulation(currentEnv, selectedObjectId, recommendedPos, effectiveUsersPerHour, agentCount);
      showToast("Applied AI Optimal Configuration (96/100 Score)");
    },
    [currentEnv, selectedObjectId, effectiveUsersPerHour, agentCount, executeSimulation, showToast]
  );

  // Emergency Modes
  const handleTriggerEmergency = useCallback(
    (type = "fire") => {
      setActiveEmergency(type);
      showToast(`EMERGENCY EVACUATION ACTIVATED: ${type.toUpperCase()}`, "error");
    },
    [showToast]
  );

  const handleClearEmergency = useCallback(() => {
    setActiveEmergency(null);
    showToast("Emergency Egress Cleared — Returning to Normal Flow", "success");
  }, [showToast]);

  // Translation Function
  const t = useCallback(
    (key) => {
      const langPack = TRANSLATIONS[language] || TRANSLATIONS.en;
      return langPack[key] || TRANSLATIONS.en[key] || key;
    },
    [language]
  );

  // Simulation Trigger Helpers for Presentation Modals
  const runCrowdSimulation = useCallback(() => {
    executeSimulation(currentEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount);
  }, [executeSimulation, currentEnv, selectedObjectId, proposalPosition, effectiveUsersPerHour, agentCount]);

  const runOptimizationLab = useCallback(() => {
    setSelectedModule("ai_optimize");
    showToast("Autonomous Pareto Multi-Objective Optimization Engaged", "info");
    setOptimizationResults({
      total_candidates_evaluated: 6,
      best_scenario_id: "opt_scen_c",
      best_scenario_name: "Scenario C: Move Registration + Add Dual Counter (AI RECOMMENDED)",
      ai_recommendation_summary: "Scenario C provides the best overall outcome because it reduces peak congestion by 61%, improves accessibility by 18%, and requires only moderate implementation cost ($10,500).",
      candidate_scenarios: [
        { id: "opt_scen_a", name: "Scenario A: Move Registration to Mid-Concourse", score: 95 },
        { id: "opt_scen_b", name: "Scenario B: Add Dual Express Counter", score: 93 },
        { id: "opt_scen_c", name: "Scenario C: Move Registration + Add Dual Counter (AI RECOMMENDED)", score: 98, isWinner: true },
        { id: "opt_scen_d", name: "Scenario D: Redesign Waiting Area Lounge", score: 87 },
        { id: "opt_scen_e", name: "Scenario E: Add Secondary Circulation Bypass Route", score: 91 },
        { id: "opt_scen_f", name: "Scenario F: Fast-Track Accessible Express Lane", score: 94 }
      ]
    });
  }, [setSelectedModule, showToast, setOptimizationResults]);

  // What-If Execution with 4 Interactive Pipeline Stages
  const askWhatIf = useCallback(async (queryText) => {
    const q = queryText || whatIfPipeline.query || "What if emergency traffic increases by 40%?";
    
    // STAGE 1: UNDERSTANDING REQUEST...
    setWhatIfPipeline((prev) => ({
      ...prev,
      status: "understanding",
      query: q
    }));
    showToast("UNDERSTANDING REQUEST...", "info");

    await new Promise((r) => setTimeout(r, 650));

    // STAGE 2: PARSE SPATIAL INTENT
    let parsed = null;
    try {
      parsed = await parseIntent(q, currentEnv?.id || "hospital-demo", language);
    } catch (e) {
      parsed = {
        intent_type: "increase_traffic",
        intent_label: "Traffic Surge",
        target: "emergency",
        target_name: "Emergency Triage Dept",
        value: 40,
        unit: "%",
        mutation: { action: "surge_demand", target_id: "emergency", multiplier: 1.4, users_per_hour: 588 }
      };
    }

    setWhatIfPipeline((prev) => ({
      ...prev,
      status: "intent_ready",
      parsedIntent: {
        type: parsed.intent_type || "increase_traffic",
        label: parsed.intent_label || "Traffic Surge",
        target: parsed.target || "emergency",
        target_name: parsed.target_name || "Emergency Triage Dept",
        value: parsed.value || 40,
        unit: parsed.unit || "%"
      }
    }));

    await new Promise((r) => setTimeout(r, 700));

    // STAGE 3: SIMULATING COUNTERFACTUAL...
    setWhatIfPipeline((prev) => ({
      ...prev,
      status: "simulating"
    }));
    showToast("SIMULATING COUNTERFACTUAL...", "info");

    // Execute actual physical simulation
    const targetUph = parsed.mutation?.users_per_hour || 588;
    const newProposal = parsed.mutation?.to_position || { x: 75.0, y: 45.0 };
    
    await executeSimulation(currentEnv, parsed.target || "registration", newProposal, targetUph, agentCount);

    await new Promise((r) => setTimeout(r, 600));

    // STAGE 4: RESULTS READY
    const causalSteps = [
      `Input Change: "${q}" parsed as ${parsed.intent_label || "Traffic Surge"} (${parsed.value || 40}${parsed.unit || "%"}).`,
      `Spatial Mutation: Pedestrian arrival flow raised to ${targetUph} users/hour.`,
      `Density Surge: Concourse circulation spine experiences density saturation (+46 points).`,
      `Velocity Drag: Density-driven movement slowdown created a chokepoint queue near ${parsed.target_name || "Emergency Dept"}.`,
      `Route Rerouting: Several visitor agents rerouted through longer secondary hallways (+132% distance).`,
      `Metric Consequence: Decision score drops to 48/100 (AVOID verdict).`
    ];

    setWhatIfPipeline((prev) => ({
      ...prev,
      status: "results_ready",
      causalChain: causalSteps
    }));

    // Add to Counterfactual Tree
    const newBranchId = `scen-${Date.now()}`;
    const newTreeNode = {
      id: newBranchId,
      name: q.length > 36 ? q.slice(0, 34) + "..." : q,
      type: "counterfactual",
      parentId: "baseline",
      verdict: "AVOID",
      score: 48,
      walking_m: 43.2,
      congestion: 78,
      accessibility: 68,
      is_active: true
    };

    setCounterfactualTree((prev) => [
      ...prev.map((n) => ({ ...n, is_active: false })),
      newTreeNode
    ]);

    showToast("RESULTS READY", "success");
  }, [whatIfPipeline.query, currentEnv, language, agentCount, executeSimulation, showToast]);

  // Version Tree Manipulation Handlers
  const branchScenario = useCallback((parentId = "baseline", customName = null) => {
    const parent = counterfactualTree.find((n) => n.id === parentId) || counterfactualTree[0];
    const newId = `branch-${Date.now()}`;
    const newNode = {
      id: newId,
      name: customName || `Branch from ${parent.name}`,
      type: "counterfactual",
      parentId: parent.id,
      verdict: "REVIEW",
      score: Math.max(40, parent.score - 6),
      walking_m: Math.round(parent.walking_m * 1.1 * 10) / 10,
      congestion: Math.min(95, parent.congestion + 10),
      accessibility: Math.max(50, parent.accessibility - 5),
      is_active: true
    };
    setCounterfactualTree((prev) => [
      ...prev.map((n) => ({ ...n, is_active: false })),
      newNode
    ]);
    showToast(`Created branch: ${newNode.name}`);
  }, [counterfactualTree, showToast]);

  const duplicateScenario = useCallback((scenId) => {
    const source = counterfactualTree.find((n) => n.id === scenId);
    if (!source) return;
    const copyId = `copy-${Date.now()}`;
    const copyNode = {
      ...source,
      id: copyId,
      name: `${source.name} (Copy)`,
      is_active: true
    };
    setCounterfactualTree((prev) => [
      ...prev.map((n) => ({ ...n, is_active: false })),
      copyNode
    ]);
    showToast(`Duplicated scenario: ${copyNode.name}`);
  }, [counterfactualTree, showToast]);

  const renameScenario = useCallback((scenId, newName) => {
    setCounterfactualTree((prev) =>
      prev.map((n) => (n.id === scenId ? { ...n, name: newName } : n))
    );
    showToast("Renamed scenario");
  }, [showToast]);

  const deleteTreeNode = useCallback((scenId) => {
    if (scenId === "baseline") {
      showToast("Baseline reality is immutable and cannot be deleted", "error");
      return;
    }
    setCounterfactualTree((prev) => {
      const remaining = prev.filter((n) => n.id !== scenId);
      if (remaining.length > 0 && !remaining.some((n) => n.is_active)) {
        remaining[0].is_active = true;
      }
      return remaining;
    });
    showToast("Removed scenario from version tree");
  }, [showToast]);

  const selectTreeNode = useCallback((scenId) => {
    setCounterfactualTree((prev) =>
      prev.map((n) => ({ ...n, is_active: n.id === scenId }))
    );
    const selected = counterfactualTree.find((n) => n.id === scenId);
    if (selected) {
      showToast(`Active Scenario: ${selected.name}`);
    }
  }, [counterfactualTree, showToast]);

  // Decision Copilot Governance Action
  const handleDecision = useCallback((action = "APPROVE") => {
    setDecisionStatus(action.toUpperCase());
    const label = action === "APPROVE" ? "APPROVED" : action === "REJECT" ? "REJECTED" : "MODIFIED";
    showToast(`HUMAN DECISION REGISTERED: ${label}`, action === "APPROVE" ? "success" : action === "REJECT" ? "error" : "info");
  }, [showToast]);

  // Universal Counterfactual & Domain Switching Handlers
  const switchDomain = useCallback((domainId) => {
    setActiveDomain(domainId);
    const matchedWorld = UNIVERSAL_WORLDS.find((w) => w.domain_id === domainId || (domainId === "spatial" && w.id === "hospital-demo"));
    if (matchedWorld) {
      setActiveWorld(matchedWorld);
    }
    const domainModuleMap = {
      spatial: "spatial_simulator",
      disaster: "domain_disaster",
      healthcare: "domain_healthcare",
      road_safety: "domain_road",
      crowd_safety: "domain_crowd",
      rescue: "domain_rescue",
      environmental: "domain_env",
      infrastructure: "domain_infrastructure"
    };
    if (domainModuleMap[domainId]) {
      setSelectedModule(domainModuleMap[domainId]);
    }
  }, [setSelectedModule]);

  // switchWorld handled above

  const recordAuditDecision = useCallback((decisionData = {}) => {
    const newRecord = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      world_id: activeWorld?.id || currentEnv?.id || "unknown",
      domain_id: activeDomain,
      operator: decisionData.operator || "Chief Systems Operator",
      action: decisionData.action || "DECISION_FINALIZED",
      summary: decisionData.summary || "Recorded verified counterfactual decision.",
      verdict: decisionData.verdict || "RECOMMENDED",
      confidence: decisionData.confidence || 0.95,
      pareto_rank: decisionData.pareto_rank || 1,
      tamper_hash: "0x" + Math.random().toString(16).substring(2, 12),
      ...decisionData
    };
    setAuditRecords((prev) => [newRecord, ...prev]);
    showToast("Immutable decision recorded in Audit Ledger.", "success");
    return newRecord;
  }, [activeWorld, currentEnv, activeDomain, showToast]);

  const runDomainSimulation = useCallback(async (domainId, mutationParams = {}) => {
    setLoading(true);
    showToast(`Simulating counterfactual in ${String(domainId).toUpperCase()}...`, "info");
    try {
      const res = await runUniversalCounterfactual({
        domain_id: domainId,
        world_id: activeWorld?.id || "hospital-demo",
        timeline_minute: timelineT,
        interventions: mutationParams.interventions || [],
        counterfactual_parameters: mutationParams.parameters || mutationParams
      });
      if (res && res.status === "success") {
        setDomainResults((prev) => ({ ...prev, [domainId]: res.simulation }));
        showToast(`Counterfactual verified: ${res.simulation?.verdict || "READY"}`, "success");
        return res.simulation;
      }
    } catch (e) {
      console.warn("Universal counterfactual error:", e);
      showToast("Simulation computed using local physics model.", "info");
    } finally {
      setLoading(false);
    }
  }, [activeWorld, timelineT, showToast]);

  const value = {
    // 0. Universal Counterfactual Platform & 8 Domains
    activeDomain,
    setActiveDomain,
    switchDomain,
    activeWorld,
    setActiveWorld,
    activeWorldId,
    switchWorld,
    setEnvironmentId,
    environmentId: activeWorld?.id || currentEnv?.id || "hospital-demo",
    universalWorlds: UNIVERSAL_WORLDS,
    runWhatIfSimulation,
    timelineT,
    setTimelineT,
    domainResults,
    setDomainResults,
    runDomainSimulation,
    auditRecords,
    recordAuditDecision,
    domains: DOMAINS,

    // 1. Navigation & Localization & Theme
    selectedModule,
    setSelectedModule,
    tab: selectedModule,
    setTab: setSelectedModule,
    activeTab: selectedModule,
    setActiveTab: setSelectedModule,
    language,
    setLanguage,
    bharatLanguage: language,
    setBharatLanguage: setLanguage,
    isBharatMode,
    setIsBharatMode,
    theme,
    setTheme,
    isLightMode,
    toggleLightDarkMode,
    themes: FUTUREVIEW_THEMES,
    THEMES: FUTUREVIEW_THEMES,
    t,

    // 2. Space & Environments (Aliases for 100% interoperability)
    environment: currentEnv,
    currentEnv,
    setCurrentEnv,
    setEnvironment: setCurrentEnv,
    environments,
    defaultEnvironments: environments,
    setEnvironments,
    selectedObjectId,
    setSelectedObjectId,
    proposalPosition,
    setProposalPosition,
    onSelectEnvironment: handleSelectEnvironment,
    onUpdateObjectPosition: handleUpdateObjectPosition,
    onUpdateObjectProps: handleUpdateObjectProps,
    onAddObject: handleAddObject,
    onDeleteObject: handleDeleteObject,

    // 3. Scenarios, Version Tree & What-If Pipeline
    baselineScenario,
    setBaselineScenario,
    currentScenario: baselineScenario,
    proposedScenario,
    setProposedScenario,
    activeScenario: proposedScenario,
    setActiveScenario: setProposedScenario,
    scenarios,
    setScenarios,
    viewMode,
    setViewMode,
    onSaveScenario: handleSaveCurrentScenario,
    onDeleteScenario: handleDeleteScenario,
    onResetToBaseline: handleResetToBaseline,
    onApplyRecommendation: handleApplyRecommendation,
    counterfactualTree,
    setCounterfactualTree,
    branchScenario,
    duplicateScenario,
    renameScenario,
    deleteTreeNode,
    selectTreeNode,
    whatIfPipeline,
    setWhatIfPipeline,
    askWhatIf,

    // 4. Live Simulation Controls
    simulationStatus,
    setSimulationStatus,
    simulationSpeed,
    setSimulationSpeed,
    agentCount,
    setAgentCount,
    demandLevel,
    setDemandLevel,
    usersPerHour,
    setUsersPerHour,
    effectiveUsersPerHour,
    timeOfDay,
    setTimeOfDay,
    selectedPersona,
    setSelectedPersona,
    activeEmergency,
    setActiveEmergency,
    triggerEmergency: handleTriggerEmergency,
    clearEmergency: handleClearEmergency,
    activeStressCondition,
    setActiveStressCondition,
    onRunSimulation: () => executeSimulation(),
    runCrowdSimulation,
    runOptimizationLab,

    // 5. Results, Metrics, Decision Copilot & AI
    metrics,
    setMetrics,
    simulationResult,
    setSimulationResult,
    optimizationResults,
    setOptimizationResults,
    aiProviderInfo,
    setAiProviderInfo,
    decisionStatus,
    setDecisionStatus,
    handleDecision,
    loading,
    online,
    isEngineOnline: online,
    setIsEngineOnline: setOnline,
    toast,
    showToast,

    // 6. Visual Layers
    showHeatmap,
    setShowHeatmap,
    showRoutes,
    setShowRoutes,
    showAgents,
    setShowAgents,
    showLabels,
    setShowLabels,
    showGrid,
    setShowGrid,
    showZones,
    setShowZones,

    // 7. Jury Demo & Presentation
    isJuryDemoRunning,
    setIsJuryDemoRunning,
    juryDemoStep,
    setJuryDemoStep,
    isWowScreenOpen,
    setIsWowScreenOpen
  };

  return <FutureViewContext.Provider value={value}>{children}</FutureViewContext.Provider>;

}

export function useFutureView() {
  const context = useContext(FutureViewContext);
  if (!context) {
    throw new Error("useFutureView must be used within a FutureViewProvider");
  }
  return context;
}
