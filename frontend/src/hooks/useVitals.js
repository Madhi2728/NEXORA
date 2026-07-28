// frontend/src/hooks/useVitals.js
//
// Single source of truth for vitals readings.
// Both the chart and the table read from this hook's `readings` state,
// so deleting a row instantly updates the graph too.

import { useState, useEffect, useCallback } from "react";

export function useVitals(patientId) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReadings = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/vitals?patientId=${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load readings");
      const data = await res.json();
      setReadings(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const addReading = async (payload) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/vitals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...payload, patientId }),
    });
    if (!res.ok) throw new Error("Failed to save reading");
    await fetchReadings();
  };

  const deleteReading = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/vitals/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete reading");

    // Optimistic update so the graph/table feel instant,
    // then reconcile with the server list.
    setReadings((prev) => prev.filter((r) => r._id !== id));
    fetchReadings();
  };

  return { readings, loading, error, addReading, deleteReading, refetch: fetchReadings };
}
