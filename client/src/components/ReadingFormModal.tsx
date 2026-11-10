import React, { useState, useEffect } from "react";
import type { Reading, ReadingSlot } from "../types/index.js";
import { READING_SLOT_LABELS, VALIDATION_MESSAGES } from "../constants/messages.js";
import { readingZodSchema } from "../validators/index.js";
import { api } from "../services/api.js";

interface ReadingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialReading?: Reading | null;
  defaultDate?: string;
  existingReadings?: Reading[];
}

const SLOTS: ReadingSlot[] = [
  "MORNING",
  "AFTER_BREAKFAST",
  "AFTER_LUNCH",
  "AFTER_DINNER",
];

export const ReadingFormModal: React.FC<ReadingFormModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialReading,
  defaultDate,
  existingReadings = [],
}) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const [readingDate, setReadingDate] = useState<string>(defaultDate || todayStr);
  const [slot, setSlot] = useState<ReadingSlot>("MORNING");
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialReading) {
      setReadingDate(initialReading.reading_date);
      setSlot(initialReading.slot);
      setValue(String(initialReading.value));
    } else {
      setReadingDate(defaultDate || todayStr);
      setSlot("MORNING");
      setValue("");
    }
    setError(null);
  }, [initialReading, defaultDate, isOpen, todayStr]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const zodResult = readingZodSchema.safeParse({ readingDate, slot, value });
    if (!zodResult.success) {
      setError(zodResult.error.issues[0]?.message || VALIDATION_MESSAGES.VALUE_REQUIRED);
      return false;
    }

    const readingsOnDate = existingReadings.filter(
      (r) => r.reading_date === readingDate && (!initialReading || r.id !== initialReading.id)
    );

    if (readingsOnDate.length >= 4) {
      setError(VALIDATION_MESSAGES.MAX_READINGS_PER_DAY);
      return false;
    }

    const duplicateSlot = readingsOnDate.find((r) => r.slot === slot);
    if (duplicateSlot) {
      const slotLabel = READING_SLOT_LABELS[slot];
      setError(VALIDATION_MESSAGES.SLOT_ALREADY_EXISTS(slotLabel));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      if (initialReading) {
        await api.readings.update(initialReading.id, {
          readingDate,
          slot,
          value: Number(value),
        });
      } else {
        await api.readings.create(readingDate, slot, Number(value));
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save reading. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{initialReading ? "Edit Reading" : "Record Blood Glucose"}</h3>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reading-date">Date</label>
            <input
              id="reading-date"
              type="date"
              className="input"
              max={todayStr}
              value={readingDate}
              onChange={(e) => {
                setReadingDate(e.target.value);
                setError(null);
              }}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reading-slot">Time Slot</label>
            <select
              id="reading-slot"
              className="input"
              value={slot}
              onChange={(e) => {
                setSlot(e.target.value as ReadingSlot);
                setError(null);
              }}
              required
            >
              {SLOTS.map((s) => (
                <option key={s} value={s}>
                  {READING_SLOT_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="reading-value">
              Glucose Level <span className="text-muted">(mg/dl)</span>
            </label>
            <input
              id="reading-value"
              type="number"
              className="input"
              placeholder="e.g. 110"
              min={40}
              max={600}
              step={1}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              required
            />
            <small className="help-text">Whole number between 40 and 600 mg/dl</small>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : initialReading ? "Save Changes" : "Add Reading"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
