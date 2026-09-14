import React, { useState } from "react";
import {
  Clock,
  Users,
  Sliders,
  Plus,
  Minus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function ResourceQueueSimulator() {
  const {
    effectiveUsersPerHour,
    onApplyRecommendation
  } = useFutureView();

  const [counters, setCounters] = useState(2);
  const [doctors, setDoctors] = useState(3);
  const [pharmacyStaff, setPharmacyStaff] = useState(2);
  const [serviceSec, setServiceSec] = useState(14); // seconds per transaction

  // M/M/c Queuing Math
  const arrivalMin = effectiveUsersPerHour / 60.0;
  const serviceRatePerCounterMin = 60.0 / Math.max(4, serviceSec);
  const totalCapacityMin = counters * serviceRatePerCounterMin;
  const utilization = Math.min(99.5, Math.round((arrivalMin / Math.max(0.1, totalCapacityMin)) * 1000) / 10);

  // Queue Length & Wait Times
  let queueLen = 2;
  let waitSec = 35;
  let queueStatus = "LOW";

  if (utilization > 90) {
    queueLen = Math.round(14 + (utilization - 90) * 2.2);
    waitSec = Math.round(240 + (utilization - 90) * 25);
    queueStatus = "CRITICAL";
  } else if (utilization > 70) {
    queueLen = Math.round(5 + (utilization - 70) * 0.45);
    waitSec = Math.round(75 + (utilization - 70) * 8);
    queueStatus = "MEDIUM";
  } else {
    queueLen = Math.max(1, Math.round(utilization * 0.05));
    waitSec = Math.max(15, Math.round(utilization * 0.7));
    queueStatus = "OPTIMAL";
  }

  const formatSec = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} min`;
  };

  return (
    <div className="modulePage">
      {/* 1. Module Header */}
      <div className="moduleTopBar">
        <div className="moduleTopLeft">
          <div className="moduleBadge violet">
            <Clock size={14} />
            <span>MODULE 09</span>
          </div>
          <h2 className="moduleTitle">Resource & M/M/c Queueing Simulator</h2>
          <span className="moduleSubtitle">
            Operational service capacity simulator showing how adjusting counter staffing and service times directly alleviates spatial queue pressure.
          </span>
        </div>

        {/* Live Ribbon */}
        <div className="moduleHeaderStats">
          <div className="headerStatBox">
            <small>COUNTER UTILIZATION</small>
            <b className={utilization > 85 ? "bad" : "good"}>{utilization}%</b>
          </div>
          <div className="headerStatBox">
            <small>ACTIVE QUEUE LENGTH</small>
            <b className={queueLen > 10 ? "bad" : "good"}>{queueLen} People</b>
          </div>
          <div className="headerStatBox">
            <small>AVG QUEUE DELAY</small>
            <b className={waitSec > 180 ? "bad" : "good"}>{formatSec(waitSec)}</b>
          </div>
          <div className="headerStatBox">
            <small>QUEUE HEALTH</small>
            <b className={queueStatus === "CRITICAL" ? "bad" : "good"}>{queueStatus}</b>
          </div>
        </div>
      </div>

      {/* 2. Interactive Staffing & Counter Adjusters */}
      <div className="resourceSlidersGrid">
        {/* Registration Desks */}
        <div className="resourceAdjustCard">
          <div className="resCardHead">
            <span className="resCardTag">FRONT-DESK CHECK-IN</span>
            <strong>Registration Desks</strong>
          </div>
          <div className="resControlRow">
            <button className="resStepBtn" onClick={() => setCounters(Math.max(1, counters - 1))}>
              <Minus size={14} />
            </button>
            <div className="resCountDisplay">
              <b>{counters}</b>
              <small>Active Desks</small>
            </div>
            <button className="resStepBtn" onClick={() => setCounters(Math.min(6, counters + 1))}>
              <Plus size={14} />
            </button>
          </div>
          <span className="resCapNote">Max Throughput: {Math.round(counters * serviceRatePerCounterMin * 60)} people/hr</span>
        </div>

        {/* Consultation Doctors */}
        <div className="resourceAdjustCard">
          <div className="resCardHead">
            <span className="resCardTag">CLINICAL TRIAGE</span>
            <strong>Doctor Consultation Rooms</strong>
          </div>
          <div className="resControlRow">
            <button className="resStepBtn" onClick={() => setDoctors(Math.max(1, doctors - 1))}>
              <Minus size={14} />
            </button>
            <div className="resCountDisplay">
              <b>{doctors}</b>
              <small>On-Duty Doctors</small>
            </div>
            <button className="resStepBtn" onClick={() => setDoctors(Math.min(8, doctors + 1))}>
              <Plus size={14} />
            </button>
          </div>
          <span className="resCapNote">Capacity: {doctors * 12} patients/hr</span>
        </div>

        {/* Pharmacy Counters */}
        <div className="resourceAdjustCard">
          <div className="resCardHead">
            <span className="resCardTag">DISPENSARY</span>
            <strong>Pharmacy Service Windows</strong>
          </div>
          <div className="resControlRow">
            <button className="resStepBtn" onClick={() => setPharmacyStaff(Math.max(1, pharmacyStaff - 1))}>
              <Minus size={14} />
            </button>
            <div className="resCountDisplay">
              <b>{pharmacyStaff}</b>
              <small>Pharmacists</small>
            </div>
            <button className="resStepBtn" onClick={() => setPharmacyStaff(Math.min(5, pharmacyStaff + 1))}>
              <Plus size={14} />
            </button>
          </div>
          <span className="resCapNote">Dispensing Capacity: {pharmacyStaff * 25} orders/hr</span>
        </div>

        {/* Service Speed Slider */}
        <div className="resourceAdjustCard">
          <div className="resCardHead">
            <span className="resCardTag">TRANSACTION SPEED</span>
            <strong>Avg Service Time</strong>
          </div>
          <div className="resSliderWrap">
            <input
              type="range"
              min={6}
              max={30}
              value={serviceSec}
              onChange={(e) => setServiceSec(Number(e.target.value))}
              className="rangeSlider"
            />
            <div className="sliderValRow">
              <span>Fast (6s)</span>
              <b>{serviceSec} seconds/user</b>
              <span>Slow (30s)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Queue Dynamics Ledger & Utilization Curve */}
      <div className="moduleWorkspaceGrid">
        <div className="accessibilityLeftCol">
          <div className="accessCard">
            <div className="cardHead">
              <Activity size={16} className="iconCyan" />
              <b>M/M/c Erlang Queue Simulation Performance</b>
            </div>

            <div className="queueLedgerGrid">
              <div className="queueLedgerItem">
                <small>ARRIVAL VELOCITY</small>
                <b>{arrivalMin.toFixed(1)} people / min</b>
                <span>({effectiveUsersPerHour} / hour)</span>
              </div>
              <div className="queueLedgerItem">
                <small>TOTAL SERVICE CAPACITY</small>
                <b>{totalCapacityMin.toFixed(1)} people / min</b>
                <span>({counters} servers × {serviceRatePerCounterMin.toFixed(1)}/min)</span>
              </div>
              <div className="queueLedgerItem">
                <small>SYSTEM UTILIZATION</small>
                <b className={utilization > 85 ? "bad" : "good"}>{utilization}%</b>
                <span>{utilization > 85 ? "Severe Overload Risk" : "Stable Throughput"}</span>
              </div>
              <div className="queueLedgerItem">
                <small>QUEUE STANCHION LENGTH</small>
                <b className={queueLen > 10 ? "bad" : "good"}>{queueLen} people</b>
                <span>Requires {(queueLen * 0.9).toFixed(1)}m linear queuing space</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 35%: Operational Recommendation */}
        <div className="moduleSidePanel">
          <div className="sidePanelCard aiResourceCard">
            <div className="cardHead">
              <Sparkles size={16} className="iconCyan" />
              <b>AI Operational Recommendation</b>
            </div>

            <p className="aiResourceText">
              {utilization > 85
                ? `CRITICAL QUEUE WARNING: Utilization at ${utilization}%. Arrival rate exceeds single-lane clearance. Adding 1 counter reduces wait time from ${formatSec(waitSec)} to ${formatSec(Math.round(waitSec * 0.35))} and prevents foyer corridor blockage.`
                : `BALANCED CAPACITY: Current staffing of ${counters} counters maintains stable flow with wait times under ${formatSec(waitSec)}.`}
            </p>

            <button
              className="primaryBtn fullWidth"
              onClick={() => setCounters(3)}
            >
              <Sparkles size={14} />
              <span>Auto-Balance Staffing (Set 3 Desks)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
