import React, { useState } from "react";
import type { Reading, ReadingSlot } from "../types/index.js";
import { READING_SLOT_LABELS } from "../constants/messages.js";

interface MonthlyTrendChartProps {
  readings: Reading[];
  selectedDate: string;
}

interface TooltipData {
  x: number;
  y: number;
  reading: Reading;
}

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  readings,
  selectedDate,
}) => {
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);

  const [yearStr, monthStr] = selectedDate.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const monthReadings = readings
    .filter((r) => {
      const [rYear, rMonth] = r.reading_date.split("-").map(Number);
      return rYear === year && rMonth === month;
    })
    .sort((a, b) => {
      if (a.reading_date !== b.reading_date) {
        return a.reading_date.localeCompare(b.reading_date);
      }
      const slotOrder: Record<ReadingSlot, number> = {
        MORNING: 1,
        AFTER_BREAKFAST: 2,
        AFTER_LUNCH: 3,
        AFTER_DINNER: 4,
      };
      return slotOrder[a.slot] - slotOrder[b.slot];
    });

  const monthName = new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  if (monthReadings.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Monthly Glucose Trend ({monthName})</h3>
          <span className="report-badge">Bonus: Chart</span>
        </div>
        <div className="empty-state">
          <span className="empty-icon">📉</span>
          <p className="empty-title">No readings for this month to plot</p>
          <p className="empty-description">
            Log readings in {monthName} to view your blood glucose trend line.
          </p>
        </div>
      </div>
    );
  }

  const svgWidth = 800;
  const svgHeight = 260;
  const padding = { top: 25, right: 30, bottom: 40, left: 55 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const yMin = 40;
  const yMax = 300;

  const getY = (val: number): number => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return padding.top + chartHeight - ((clamped - yMin) / (yMax - yMin)) * chartHeight;
  };

  const getX = (index: number): number => {
    if (monthReadings.length === 1) {
      return padding.left + chartWidth / 2;
    }
    return padding.left + (index / (monthReadings.length - 1)) * chartWidth;
  };

  const points = monthReadings.map((r, i) => ({
    x: getX(i),
    y: getY(r.value),
    reading: r,
  }));

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const normalTopY = getY(130);
  const normalBottomY = getY(70);
  const normalHeight = normalBottomY - normalTopY;

  const yTicks = [40, 70, 100, 130, 180, 240, 300];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Monthly Glucose Trend ({monthName})</h3>
          <p className="chart-subtitle">
            Visual tracking across all {monthReadings.length} readings in {monthName}
          </p>
        </div>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-color legend-normal"></span> Target Zone (70–130)
          </span>
          <span className="legend-item">
            <span className="legend-color legend-line"></span> Readings
          </span>
        </div>
      </div>

      <div className="chart-svg-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="chart-svg"
          onMouseLeave={() => setActiveTooltip(null)}
        >
          <rect
            x={padding.left}
            y={normalTopY}
            width={chartWidth}
            height={normalHeight}
            fill="#dcfce7"
            opacity="0.6"
          />

          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray={tick === 70 || tick === 130 ? "4 4" : undefined}
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#94a3b8"
                  fontWeight="500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          <path
            d={pathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, idx) => {
            const isHovered = activeTooltip?.reading.id === p.reading.id;
            const fillColor =
              p.reading.value < 70
                ? "#dc2626"
                : p.reading.value <= 130
                ? "#16a34a"
                : p.reading.value <= 180
                ? "#d97706"
                : "#dc2626";

            return (
              <g key={p.reading.id || idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  fill={fillColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="chart-dot"
                  onMouseEnter={() => setActiveTooltip({ x: p.x, y: p.y, reading: p.reading })}
                />
              </g>
            );
          })}

          {points.length <= 15
            ? points.map((p, idx) => {
                const day = p.reading.reading_date.split("-")[2];
                return (
                  <text
                    key={idx}
                    x={p.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748b"
                  >
                    {day}th
                  </text>
                );
              })
            : [0, Math.floor(points.length / 2), points.length - 1].map((idx) => {
                const p = points[idx];
                const day = p.reading.reading_date.split("-")[2];
                return (
                  <text
                    key={idx}
                    x={p.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#64748b"
                  >
                    Day {day}
                  </text>
                );
              })}
        </svg>

        {activeTooltip && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(activeTooltip.x / svgWidth) * 100}%`,
              top: `${(activeTooltip.y / svgHeight) * 100}%`,
            }}
          >
            <div className="tooltip-date">{activeTooltip.reading.reading_date}</div>
            <div className="tooltip-slot">
              {READING_SLOT_LABELS[activeTooltip.reading.slot]}
            </div>
            <div className="tooltip-value font-bold">
              {activeTooltip.reading.value} mg/dl
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
