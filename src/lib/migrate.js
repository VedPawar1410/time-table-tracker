import { supabase } from "./supabase.js";

const STORAGE_KEY = "timetable_tracker";
const MIGRATION_FLAG = "migration_v1_done";

export async function migrateLocalStorageToSupabase(userId) {
  if (localStorage.getItem(MIGRATION_FLAG) === "true") return;

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(MIGRATION_FLAG, "true");
    return;
  }

  let localData;
  try { localData = JSON.parse(raw); }
  catch { return; }

  const entries = Object.entries(localData);
  if (entries.length === 0) {
    localStorage.setItem(MIGRATION_FLAG, "true");
    return;
  }

  const rows = [];
  for (const [date, tasks] of entries) {
    for (const [taskId, taskData] of Object.entries(tasks)) {
      const isObj = typeof taskData === "object" && taskData !== null;
      const done = isObj ? !!taskData.done : !!taskData;
      const { done: _d, duration, notes, ...rest } = isObj ? taskData : { done };

      rows.push({
        user_id: userId,
        log_date: date,
        task_id: taskId,
        done,
        duration_min: duration ? parseInt(duration) : null,
        notes: notes || null,
        metadata: Object.keys(rest).length > 0 ? rest : null,
        updated_at: new Date().toISOString(),
      });
    }
  }

  // Batch in groups of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { error } = await supabase.from("daily_logs").upsert(batch, {
      onConflict: "user_id,log_date,task_id",
      ignoreDuplicates: true,
    });
    if (error) {
      console.warn("Migration batch failed:", error.message);
      return;
    }
  }

  localStorage.setItem(MIGRATION_FLAG, "true");
}
