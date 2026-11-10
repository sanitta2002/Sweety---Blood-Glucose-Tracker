import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext.js";
import { Navbar } from "./components/Navbar.js";
import { AuthView } from "./components/AuthView.js";
import { ReportsView } from "./components/ReportsView.js";
import { MonthlyTrendChart } from "./components/MonthlyTrendChart.js";
import { ReadingHistoryTable } from "./components/ReadingHistoryTable.js";
import { ReadingFormModal } from "./components/ReadingFormModal.js";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal.js";
import { Spinner } from "./components/common/index.js";
import { readingService } from "./services/reading.service.js";
import type { Reading, ComprehensiveReport } from "./types/index.js";

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [reports, setReports] = useState<ComprehensiveReport | null>(null);
  const [allReadings, setAllReadings] = useState<Reading[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showNotification = (type: "success" | "error", text: string): void => {
    setNotification({ type, text });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadData = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const [reportsRes, readingsRes] = await Promise.all([
        readingService.getReports(selectedDate),
        readingService.getAll(),
      ]);

      if (reportsRes.data) {
        setReports(reportsRes.data);
      }
      if (readingsRes.data) {
        setAllReadings(readingsRes.data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification("error", err.message);
      }
    }
  }, [user, selectedDate]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleAddNew = (): void => {
    setEditingReading(null);
    setIsModalOpen(true);
  };

  const handleEdit = (reading: Reading): void => {
    setEditingReading(reading);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string): void => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async (): Promise<void> => {
    if (!deletingId) return;

    setIsDeleting(true);
    try {
      await readingService.delete(deletingId);
      showNotification("success", "Reading deleted successfully.");
      setDeletingId(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification("error", err.message);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaved = (): void => {
    showNotification("success", editingReading ? "Reading updated successfully." : "Reading recorded successfully.");
    loadData();
  };

  if (isLoading) {
    return <Spinner label="Loading Sweety..." />;
  }

  if (!user) {
    return <AuthView />;
  }

  return (
    <div className="app-layout">
      <Navbar />

      <main className="main-content">
        {notification && (
          <div className={`notification notification-${notification.type}`} role="alert">
            <span>{notification.type === "success" ? "✅" : "⚠️"}</span>
            <span>{notification.text}</span>
          </div>
        )}

        <ReportsView
          reports={reports}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          onEditReading={handleEdit}
          onDeleteReading={handleDeleteRequest}
        />

        <MonthlyTrendChart
          readings={allReadings}
          selectedDate={selectedDate}
        />

        <ReadingHistoryTable
          readings={allReadings}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onAddNew={handleAddNew}
        />
      </main>

      <ReadingFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={handleSaved}
        initialReading={editingReading}
        defaultDate={selectedDate}
        existingReadings={allReadings}
      />

      <ConfirmDeleteModal
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default App;
