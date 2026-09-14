import React from "react";
import { Check, AlertTriangle, Info, X } from "lucide-react";

export function Toast({ message, type = "success", onClose }) {
  if (!message) return null;

  return (
    <div className={`toastContainer ${type}`}>
      {type === "success" && <Check size={16} className="toastIcon success" />}
      {type === "warning" && <AlertTriangle size={16} className="toastIcon warning" />}
      {type === "info" && <Info size={16} className="toastIcon info" />}
      <span>{message}</span>
      {onClose && (
        <button className="toastClose" onClick={onClose}>
          <X size={13} />
        </button>
      )}
    </div>
  );
}

export function DataHonestyBadge({ text = "SIMULATED PREDICTION", tooltip = "Estimates generated via deterministic spatial multi-agent modeling." }) {
  return (
    <div className="dataHonestyBadge" title={tooltip}>
      <span className="dot" />
      <span>{text}</span>
    </div>
  );
}
