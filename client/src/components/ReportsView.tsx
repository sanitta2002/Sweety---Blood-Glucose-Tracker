import React from "react";
import type { ComprehensiveReport, Reading, ReadingSlot } from "../types/index.js";
import { READING_SLOT_LABELS } from "../constants/messages.js";
import { Badge, type BadgeVariant } from "./common/index.js";

interface ReportsViewProps {
  reports: ComprehensiveReport | null;
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  onEditReading?: (reading: Reading) => void;
  onDeleteReading?: (id: string) => void;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return "";
  const [sYear, sMonth, sDay] = startDateStr.split("-").map(Number);
  const [eYear, eMonth, eDay] = endDateStr.split("-").map(Number);
  const sDate = new Date(sYear, sMonth - 1, sDay);
  const eDate = new Date(eYear, eMonth - 1, eDay);

  const startFormatted = sDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
  const endFormatted = eDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${startFormatted} – ${endFormatted}`;
}

function getGlucoseBadgeVariant(val: number): BadgeVariant {
  if (val < 70) return "hypo";
  if (val <= 130) return "normal";
  if (val <= 180) return "elevated";
  return "high";
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  selectedDate,
  onDateChange,
  onEditReading,
  onDeleteReading,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="reports-section">
      <div className="reports-toolbar">
        <div>
          <h2 className="section-title">Blood Glucose Reports</h2>
          <p className="section-subtitle">
            Insights and summaries for {formatDisplayDate(selectedDate)}
          </p>
        </div>

        <div className="date-selector">
          <label htmlFor="report-date-picker">Selected Date:</label>
          <input
            id="report-date-picker"
            type="date"
            className="input input-date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <div className="report-card-header">
            <div>
              <span className="report-badge">Daily</span>
              <h3 className="report-title">{formatDisplayDate(selectedDate)}</h3>
            </div>
            <span className="report-count">
              {reports?.daily.count ?? 0} {reports?.daily.count === 1 ? "reading" : "readings"}
            </span>
          </div>

          {reports?.daily && reports.daily.count > 0 ? (
            <>
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-label">Average</span>
                  <span className="stat-value text-primary">{reports.daily.average}</span>
                  <span className="stat-unit">mg/dl</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Highest</span>
                  <span className="stat-value text-danger">{reports.daily.highest}</span>
                  <span className="stat-unit">mg/dl</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Lowest</span>
                  <span className="stat-value text-success">{reports.daily.lowest}</span>
                  <span className="stat-unit">mg/dl</span>
                </div>
              </div>

              <div className="daily-readings-list">
                <h4 className="readings-list-title">Readings Breakdown</h4>
                <div className="slot-grid">
                  {reports.daily.readings.map((reading) => (
                    <div key={reading.id} className="slot-item">
                      <div className="slot-info">
                        <span className="slot-name">
                          {READING_SLOT_LABELS[reading.slot as ReadingSlot]}
                        </span>
                        <Badge variant={getGlucoseBadgeVariant(reading.value)}>
                          {reading.value} mg/dl
                        </Badge>
                      </div>
                      <div className="slot-actions">
                        {onEditReading && (
                          <button
                            type="button"
                            className="btn-icon"
                            onClick={() => onEditReading(reading)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                        )}
                        {onDeleteReading && (
                          <button
                            type="button"
                            className="btn-icon btn-danger"
                            onClick={() => onDeleteReading(reading.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📊</span>
              <p className="empty-title">No readings for this date</p>
              <p className="empty-description">
                Use the "Record Reading" button to log your blood glucose for this day.
              </p>
            </div>
          )}
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div>
              <span className="report-badge">Month-to-Date</span>
              <h3 className="report-title">
                {reports ? formatRange(reports.monthToDate.startDate, reports.monthToDate.endDate) : ""}
              </h3>
            </div>
            <span className="report-count">
              {reports?.monthToDate.count ?? 0} {reports?.monthToDate.count === 1 ? "reading" : "readings"}
            </span>
          </div>

          {reports?.monthToDate && reports.monthToDate.count > 0 ? (
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-label">Average</span>
                <span className="stat-value text-primary">{reports.monthToDate.average}</span>
                <span className="stat-unit">mg/dl</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Highest</span>
                <span className="stat-value text-danger">{reports.monthToDate.highest}</span>
                <span className="stat-unit">mg/dl</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Lowest</span>
                <span className="stat-value text-success">{reports.monthToDate.lowest}</span>
                <span className="stat-unit">mg/dl</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📈</span>
              <p className="empty-title">No readings this month yet</p>
              <p className="empty-description">
                Readings logged from the 1st of this month up to the selected date will appear here.
              </p>
            </div>
          )}
        </div>

        <div className="report-card">
          <div className="report-card-header">
            <div>
              <span className="report-badge">Previous Month</span>
              <h3 className="report-title">
                {reports ? formatRange(reports.monthly.startDate, reports.monthly.endDate) : ""}
              </h3>
            </div>
            <span className="report-count">
              {reports?.monthly.count ?? 0} {reports?.monthly.count === 1 ? "reading" : "readings"}
            </span>
          </div>

          {reports?.monthly && reports.monthly.count > 0 ? (
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-label">Average</span>
                <span className="stat-value text-primary">{reports.monthly.average}</span>
                <span className="stat-unit">mg/dl</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Highest</span>
                <span className="stat-value text-danger">{reports.monthly.highest}</span>
                <span className="stat-unit">mg/dl</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Lowest</span>
                <span className="stat-value text-success">{reports.monthly.lowest}</span>
                <span className="stat-unit">mg/dl</span>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">📅</span>
              <p className="empty-title">No readings for previous month</p>
              <p className="empty-description">
                Run the database seed script to view sample historical monthly data.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
