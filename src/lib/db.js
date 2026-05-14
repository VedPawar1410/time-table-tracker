import { supabase } from "./supabase.js";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Daily Logs ───────────────────────────────────────────────────────────────

export async function getLogsForDateRange(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date");
  if (error) throw error;

  // Reshape to { dateKey: { taskId: {...} } } — same shape as old localStorage
  const result = {};
  for (const row of data) {
    if (!result[row.log_date]) result[row.log_date] = {};
    result[row.log_date][row.task_id] = {
      done: row.done,
      duration_min: row.duration_min,
      notes: row.notes,
      ...(row.metadata || {}),
    };
  }
  return result;
}

export async function upsertLog(userId, date, taskId, payload) {
  const { done, duration_min, notes, ...rest } = payload;
  const { error } = await supabase.from("daily_logs").upsert({
    user_id: userId,
    log_date: date,
    task_id: taskId,
    done: !!done,
    duration_min: duration_min ?? null,
    notes: notes ?? null,
    metadata: Object.keys(rest).length > 0 ? rest : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id,log_date,task_id" });
  if (error) throw error;
}

export async function toggleLog(userId, date, taskId, currentDone) {
  await upsertLog(userId, date, taskId, { done: !currentDone });
}

// ─── Custom Tasks ─────────────────────────────────────────────────────────────

export async function getCustomTasks(userId) {
  const { data, error } = await supabase
    .from("custom_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function createCustomTask(userId, task) {
  const { data, error } = await supabase
    .from("custom_tasks")
    .insert({ user_id: userId, ...task })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCustomTask(taskId, updates) {
  const { error } = await supabase.from("custom_tasks").update(updates).eq("id", taskId);
  if (error) throw error;
}

export async function archiveCustomTask(taskId) {
  await updateCustomTask(taskId, { is_active: false });
}

// ─── Gym ──────────────────────────────────────────────────────────────────────

export async function getGymSessions(userId, limit = 20) {
  const { data, error } = await supabase
    .from("gym_workouts")
    .select(`*, gym_exercises(*, gym_sets(*))`)
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getGymSessionById(id) {
  const { data, error } = await supabase
    .from("gym_workouts")
    .select(`*, gym_exercises(*, gym_sets(*))`)
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createGymWorkout(userId, workout) {
  const { exercises, ...meta } = workout;
  const { data: wk, error: wkErr } = await supabase
    .from("gym_workouts")
    .insert({ user_id: userId, ...meta })
    .select()
    .single();
  if (wkErr) throw wkErr;

  for (let ei = 0; ei < (exercises || []).length; ei++) {
    const { sets, ...exMeta } = exercises[ei];
    const { data: ex, error: exErr } = await supabase
      .from("gym_exercises")
      .insert({ workout_id: wk.id, sort_order: ei, ...exMeta })
      .select()
      .single();
    if (exErr) throw exErr;

    const setRows = (sets || []).map((s, si) => ({ exercise_id: ex.id, set_number: si + 1, ...s }));
    if (setRows.length) {
      const { error: sErr } = await supabase.from("gym_sets").insert(setRows);
      if (sErr) throw sErr;
    }
  }
  return wk;
}

export async function deleteGymWorkout(workoutId) {
  const { error } = await supabase.from("gym_workouts").delete().eq("id", workoutId);
  if (error) throw error;
}

export async function getExerciseLibrary(userId) {
  const { data, error } = await supabase
    .from("exercise_library")
    .select("*")
    .eq("user_id", userId)
    .order("name");
  if (error) throw error;
  return data;
}

export async function upsertExerciseInLibrary(userId, name, muscle_group) {
  const { error } = await supabase.from("exercise_library").upsert(
    { user_id: userId, name, muscle_group },
    { onConflict: "user_id,name", ignoreDuplicates: true }
  );
  if (error) throw error;
}

export async function updateExercisePR(userId, name, { weight_kg, reps, date }) {
  const { error } = await supabase
    .from("exercise_library")
    .update({ pr_weight_kg: weight_kg, pr_reps: reps, pr_date: date })
    .eq("user_id", userId)
    .eq("name", name);
  if (error) throw error;
}

// ─── Reading ──────────────────────────────────────────────────────────────────

export async function getBooks(userId) {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getBookById(bookId) {
  const { data, error } = await supabase.from("books").select("*").eq("id", bookId).single();
  if (error) throw error;
  return data;
}

export async function createBook(userId, book) {
  const { data, error } = await supabase
    .from("books")
    .insert({ user_id: userId, ...book })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBook(bookId, updates) {
  const { error } = await supabase.from("books").update(updates).eq("id", bookId);
  if (error) throw error;
}

export async function getReadingSessions(userId, bookId) {
  const { data, error } = await supabase
    .from("reading_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .order("log_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addReadingSession(userId, session) {
  const { data, error } = await supabase
    .from("reading_sessions")
    .insert({ user_id: userId, ...session })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Job Prep ─────────────────────────────────────────────────────────────────

export async function getJobPrepSessions(userId, limit = 30) {
  const { data, error } = await supabase
    .from("job_prep_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function addJobPrepSession(userId, session) {
  const { data, error } = await supabase
    .from("job_prep_sessions")
    .insert({ user_id: userId, ...session })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLeetcodeProblems(userId, filters = {}) {
  let q = supabase
    .from("leetcode_problems")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false });
  if (filters.difficulty) q = q.eq("difficulty", filters.difficulty);
  if (filters.status) q = q.eq("status", filters.status);
  if (filters.search) q = q.ilike("problem_name", `%${filters.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}

export async function addLeetcodeProblem(userId, problem) {
  const { data, error } = await supabase
    .from("leetcode_problems")
    .insert({ user_id: userId, ...problem })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLeetcodeProblem(problemId, updates) {
  const { error } = await supabase.from("leetcode_problems").update(updates).eq("id", problemId);
  if (error) throw error;
}

// ─── CAT Prep ─────────────────────────────────────────────────────────────────

export async function getCatSessions(userId, limit = 30) {
  const { data, error } = await supabase
    .from("cat_prep_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function addCatSession(userId, session) {
  const { data, error } = await supabase
    .from("cat_prep_sessions")
    .insert({ user_id: userId, ...session })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Generic Task Sessions ────────────────────────────────────────────────────

export async function getTaskSessions(userId, taskId, limit = 30) {
  const { data, error } = await supabase
    .from("task_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .order("log_date", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function addTaskSession(userId, taskId, session) {
  const { data, error } = await supabase
    .from("task_sessions")
    .insert({ user_id: userId, task_id: taskId, ...session })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export async function getHeatmapData(userId, year) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const { data, error } = await supabase
    .from("daily_logs")
    .select("log_date, task_id, done")
    .eq("user_id", userId)
    .gte("log_date", start)
    .lte("log_date", end)
    .eq("done", true);
  if (error) throw error;

  const map = {};
  for (const row of data) {
    if (!map[row.log_date]) map[row.log_date] = { count: 0, tasks: [] };
    map[row.log_date].count++;
    map[row.log_date].tasks.push(row.task_id);
  }
  return map;
}
