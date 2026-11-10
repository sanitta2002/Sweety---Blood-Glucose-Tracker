import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "./context/AuthContext.js";
import { Navbar } from "./components/Navbar.js";
import { AuthView } from "./components/AuthView.js";
import { ReportsView } from "./components/ReportsView.js";
import { ReadingHistoryTable } from "./components/ReadingHistoryTable.js";
import { ReadingFormModal } from "./components/ReadingFormModal.js";
import { api } from "./services/api.js";
import type { Reading, ComprehensiveReport } from "./types/index.js";

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [reports, setReports] = useState<ComprehensiveReport | null>(null);
  const [allReadings, setAllReadings] = useState<Reading[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
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
        api.readings.getReports(selectedDate),
        api.readings.getAll(),
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

  const handleDelete = async (id: string): Promise<void> => {
    const confirm = window.confirm("Are you sure you want to delete this reading?");
    if (!confirm) return;

    try {
      await api.readings.delete(id);
      showNotification("success", "Reading deleted successfully.");
      loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        showNotification("error", err.message);
      }
    }
  };

  const handleSaved = (): void => {
    showNotification("success", editingReading ? "Reading updated successfully." : "Reading recorded successfully.");
    loadData();
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading Sweety...</p>
      </div>
    );
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
          onDeleteReading={handleDelete}
        />

        <ReadingHistoryTable
          readings={allReadings}
          onEdit={handleEdit}
          onDelete={handleDelete}
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
    </div>
  );
};

export default App;
