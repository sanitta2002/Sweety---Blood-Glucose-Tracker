import React, { useState, useEffect } from "react";
import type { Reading, ReadingSlot } from "../types/index.js";
import { READING_SLOT_LABELS, VALIDATION_MESSAGES } from "../constants/messages.js";
import { readingZodSchema } from "../validators/index.js";
import { readingService } from "../services/reading.service.js";
import { Modal, Input, Button, Alert } from "./common/index.js";

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
        await readingService.update(initialReading.id, {
          readingDate,
          slot,
          value: Number(value),
        });
      } else {
        await readingService.create({
          readingDate,
          slot,
          value: Number(value),
        });
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialReading ? "Edit Reading" : "Record Blood Glucose"}
    >
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit} className="reading-form">
        <Input
          label="Date"
          type="date"
          max={todayStr}
          value={readingDate}
          onChange={(e) => {
            setReadingDate(e.target.value);
            setError(null);
          }}
          required
        />

        <div className="form-group">
          <label htmlFor="reading-slot" className="form-label">
            Time Slot
          </label>
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

        <Input
          label="Glucose Level (mg/dl)"
          type="number"
          placeholder="e.g. 110"
          min={40}
          max={600}
          step={1}
          value={value}
          helpText="Whole number between 40 and 600 mg/dl"
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          required
        />

        <div className="modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {initialReading ? "Save Changes" : "Add Reading"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
