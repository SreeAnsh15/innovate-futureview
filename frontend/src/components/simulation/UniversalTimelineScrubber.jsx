import React, { useEffect } from "react";
import { Play, Pause, RotateCcw, FastForward, Clock } from "lucide-react";
import { useFutureView } from "../../context/FutureViewContext";

export function UniversalTimelineScrubber({ className = "" }) {
  const { 
    timelineT, 
    setTimelineT, 
    isTimelinePlaying, 
    setIsTimelinePlaying 
  } = useFutureView();

  const timeStops = [0, 10, 20, 30, 60];

  useEffect(() => {
    let interval;
    if (isTimelinePlaying) {
      interval = setInterval(() => {
        setTimelineT((prev) => {
          if (prev >= 60) {
            setIsTimelinePlaying(false);
            return 60;
          }
          return prev + 1;
        });
      }, 180);
    }
    return () => clearInterval(interval);
  }, [isTimelinePlaying, setTimelineT, setIsTimelinePlaying]);

  return (
    <div className={`timelineScrubberBar ${className}`}>
      <div className="timelineLeft">
        <div className="timelineClockBadge">
          <Clock size={14} className="iconCyan" />
          <span>TIME MACHINE:</span>
          <b className="cyan">T+{timelineT} MIN</b>
        </div>

        <div className="timelineControls">
          <button
            className="iconBtnSmall"
            onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
            title={isTimelinePlaying ? "Pause" : "Play Timeline"}
          >
            {isTimelinePlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
          <button
            className="iconBtnSmall"
            onClick={() => {
              setIsTimelinePlaying(false);
              setTimelineT(0);
            }}
            title="Reset Timeline to T+0"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div className="timelineSliderWrapper">
        <input
          type="range"
          min="0"
          max="60"
          step="1"
          value={timelineT}
          onChange={(e) => setTimelineT(Number(e.target.value))}
          className="timelineRangeSlider"
        />

        <div className="timelineStopsRow">
          {timeStops.map((stop) => (
            <button
              key={stop}
              className={`timeStopBtn ${timelineT === stop ? "active" : ""}`}
              onClick={() => setTimelineT(stop)}
            >
              T+{stop}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
