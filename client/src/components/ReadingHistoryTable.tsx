import React from "react";
import type { Reading, ReadingSlot } from "../types/index.js";
import { READING_SLOT_LABELS } from "../constants/messages.js";

interface ReadingHistoryTableProps {
  readings: Reading[];
  onEdit: (reading: Reading) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

function getGlucoseTagClass(val: number): string {
  if (val < 70) return "badge-hypo";
  if (val <= 130) return "badge-normal";
  if (val <= 180) return "badge-elevated";
  return "badge-high";
}

function formatTableDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const ReadingHistoryTable: React.FC<ReadingHistoryTableProps> = ({
  readings,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  return (
    <div className="history-section">
      <div className="history-header">
        <div>
          <h2 className="section-title">All Logged Readings</h2>
          <p className="section-subtitle">
            Complete chronological record of your blood glucose measurements
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onAddNew}>
          + Record Reading
        </button>
      </div>

      {readings.length === 0 ? (
        <div className="empty-state card">
          <span className="empty-icon">🩺</span>
          <p className="empty-title">No readings recorded yet</p>
          <p className="empty-description">
            Start tracking your diabetes readings by clicking "+ Record Reading".
          </p>
          <button type="button" className="btn btn-primary" onClick={onAddNew}>
            Record First Reading
          </button>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="readings-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Glucose Value</th>
                <th>Category</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((reading) => {
                const tagClass = getGlucoseTagClass(reading.value);
                const category =
                  reading.value < 70
                    ? "Low (Hypo)"
                    : reading.value <= 130
                    ? "Normal"
                    : reading.value <= 180
                    ? "Elevated"
                    : "High";

                return (
                  <tr key={reading.id}>
                    <td className="font-medium">{formatTableDate(reading.reading_date)}</td>
                    <td>{READING_SLOT_LABELS[reading.slot as ReadingSlot]}</td>
                    <td>
                      <span className="font-bold text-lg">{reading.value}</span>{" "}
                      <span className="text-muted text-sm">mg/dl</span>
                    </td>
                    <td>
                      <span className={`glucose-tag ${tagClass}`}>{category}</span>
                    </td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => onEdit(reading)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-danger btn-sm"
                        onClick={() => onDelete(reading.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
