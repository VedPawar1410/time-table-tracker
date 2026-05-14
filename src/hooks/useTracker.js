import { useState, useEffect, useCallback, useRef } from "react";
import { TRACKED_TASKS } from "../lib/constants.js";
import { getLogsForDateRange, upsertLog } from "../lib/db.js";

function todayKey() {
  return new Date().toISOString().split("T")[0];
}

function dateKey(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split("T")[0];
}

function rangeForMonth(year, month) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export function useTracker(userId) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const loadedRanges = useRef(new Set());

  const ensureRange = useCallback(async (start, end) => {
    const rangeKey = `${start}:${end}`;
    if (loadedRanges.current.has(rangeKey) || !userId) return;
    loadedRanges.current.add(rangeKey);
    setLoading(true);
    try {
      const remote = await getLogsForDateRange(userId, start, end);
      setData(prev => {
        const merged = { ...prev };
        for (const [date, tasks] of Object.entries(remote)) {
          merged[date] = { ...(merged[date] || {}), ...tasks };
        }
        return merged;
      });
    } catch (e) {
      console.warn("Failed to load logs:", e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Always load current month + previous month on mount
  useEffect(() => {
    if (!userId) return;
    const now = new Date();
    const r1 = rangeForMonth(now.getFullYear(), now.getMonth() + 1);
    const r2 = rangeForMonth(now.getFullYear(), now.getMonth() === 0 ? 12 : now.getMonth());
    ensureRange(r1.start, r1.end);
    ensureRange(r2.start, r2.end);
  }, [userId, ensureRange]);

  const isDone = useCallback((date, taskId) => {
    const entry = data[date]?.[taskId];
    if (!entry) return false;
    return !!entry.done;
  }, [data]);

  const getTaskData = useCallback((date, taskId) => {
    return data[date]?.[taskId] || { done: false };
  }, [data]);

  const toggle = useCallback(async (date, taskId) => {
    const current = isDone(date, taskId);
    // Optimistic update
    setData(prev => ({
      ...prev,
      [date]: { ...(prev[date] || {}), [taskId]: { ...(prev[date]?.[taskId] || {}), done: !current } },
    }));
    if (userId) {
      try {
        await upsertLog(userId, date, taskId, { ...getTaskData(date, taskId), done: !current });
      } catch (e) {
        // Roll back on failure
        setData(prev => ({
          ...prev,
          [date]: { ...(prev[date] || {}), [taskId]: { ...(prev[date]?.[taskId] || {}), done: current } },
        }));
      }
    }
  }, [isDone, getTaskData, userId]);

  const updateTaskDetails = useCallback(async (date, taskId, details) => {
    setData(prev => ({
      ...prev,
      [date]: { ...(prev[date] || {}), [taskId]: { ...(prev[date]?.[taskId] || {}), ...details } },
    }));
    if (userId) {
      try {
        const current = data[date]?.[taskId] || {};
        await upsertLog(userId, date, taskId, { ...current, ...details });
      } catch (e) {
        console.warn("Failed to save task details:", e.message);
      }
    }
  }, [data, userId]);

  const getStreak = useCallback((taskId) => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      if (isDone(dateKey(i), taskId)) streak++;
      else break;
    }
    return streak;
  }, [isDone]);

  const getRate = useCallback((taskId) => {
    let done = 0;
    for (let i = 0; i < 30; i++) {
      if (isDone(dateKey(i), taskId)) done++;
    }
    return Math.round((done / 30) * 100);
  }, [isDone]);

  const getStatsForDate = useCallback((date) => {
    const done = TRACKED_TASKS.filter(t => isDone(date, t.id)).length;
    const total = TRACKED_TASKS.length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [isDone]);

  const getBestStreak = useCallback(() => {
    return Math.max(...TRACKED_TASKS.map(t => getStreak(t.id)), 0);
  }, [getStreak]);

  return {
    loading, data, ensureRange,
    isDone, getTaskData, toggle, updateTaskDetails,
    getStreak, getRate, getStatsForDate, getBestStreak,
  };
}
