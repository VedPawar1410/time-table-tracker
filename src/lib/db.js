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

export async function deleteReadingSession(sessionId) {
  const { error } = await supabase.from("reading_sessions").delete().eq("id", sessionId);
  if (error) throw error;
}

export async function deleteBook(bookId) {
  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) throw error;
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

export async function deleteJobPrepSession(sessionId) {
  const { error } = await supabase.from("job_prep_sessions").delete().eq("id", sessionId);
  if (error) throw error;
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

export async function deleteLeetcodeProblem(problemId) {
  const { error } = await supabase.from("leetcode_problems").delete().eq("id", problemId);
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

export async function deleteCatSession(sessionId) {
  const { error } = await supabase.from("cat_prep_sessions").delete().eq("id", sessionId);
  if (error) throw error;
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

export async function deleteTaskSession(sessionId) {
  const { error } = await supabase.from("task_sessions").delete().eq("id", sessionId);
  if (error) throw error;
}

// ─── Gym — Extended ───────────────────────────────────────────────────────────

export async function getExerciseHistory(userId, exerciseName) {
  // Returns the most recent session's sets for a given exercise name
  const { data, error } = await supabase
    .from("gym_workouts")
    .select("log_date, gym_exercises!inner(exercise_name, gym_sets(set_number, reps, weight_kg))")
    .eq("user_id", userId)
    .eq("gym_exercises.exercise_name", exerciseName)
    .order("log_date", { ascending: false })
    .limit(1);
  if (error) throw error;
  if (!data || data.length === 0) return [];
  const exs = data[0].gym_exercises;
  if (!exs || exs.length === 0) return [];
  return exs[0].gym_sets.sort((a, b) => a.set_number - b.set_number);
}

export async function getGymCalendarData(userId, year, month) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

  const [{ data: workouts, error: wErr }, { data: logs, error: lErr }] = await Promise.all([
    supabase.from("gym_workouts").select("log_date, workout_type").eq("user_id", userId).gte("log_date", start).lte("log_date", end),
    supabase.from("daily_logs").select("log_date, metadata").eq("user_id", userId).eq("task_id", "gym").gte("log_date", start).lte("log_date", end),
  ]);
  if (wErr) throw wErr;
  if (lErr) throw lErr;

  const map = {};
  for (const row of workouts) {
    map[row.log_date] = { type: row.workout_type };
  }
  for (const row of logs) {
    if (row.metadata?.rest_day && !map[row.log_date]) {
      map[row.log_date] = { type: "rest" };
    }
  }
  return map;
}

// ─── Body Measurements ────────────────────────────────────────────────────────

export async function getMeasurements(userId, metric) {
  const { data, error } = await supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .eq("metric", metric)
    .order("log_date", { ascending: true });
  if (error) throw error;
  return data;
}

export async function getAllLatestMeasurements(userId) {
  const { data, error } = await supabase
    .from("body_measurements")
    .select("metric, value_num, unit, log_date")
    .eq("user_id", userId)
    .order("log_date", { ascending: false });
  if (error) throw error;
  // Keep only the most recent entry per metric
  const seen = new Set();
  const latest = [];
  for (const row of data) {
    if (!seen.has(row.metric)) {
      seen.add(row.metric);
      latest.push(row);
    }
  }
  return latest;
}

export async function addMeasurement(userId, { log_date, metric, value_num, unit }) {
  const { data, error } = await supabase
    .from("body_measurements")
    .insert({ user_id: userId, log_date, metric, value_num, unit })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMeasurement(id) {
  const { error } = await supabase.from("body_measurements").delete().eq("id", id);
  if (error) throw error;
}

// ─── Progress Photos ──────────────────────────────────────────────────────────

export async function getProgressPhotos(userId) {
  const { data, error } = await supabase
    .from("gym_progress_photos")
    .select("*")
    .eq("user_id", userId)
    .order("photo_date", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadProgressPhoto(userId, photoDate, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${photoDate}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("gym-photos")
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;

  const { data: urlData } = supabase.storage.from("gym-photos").getPublicUrl(path);
  const { data, error } = await supabase
    .from("gym_progress_photos")
    .upsert({ user_id: userId, photo_date: photoDate, storage_path: path }, { onConflict: "user_id,photo_date" })
    .select()
    .single();
  if (error) throw error;
  return { ...data, public_url: urlData.publicUrl };
}

export async function deleteProgressPhoto(id, storagePath) {
  await supabase.storage.from("gym-photos").remove([storagePath]);
  const { error } = await supabase.from("gym_progress_photos").delete().eq("id", id);
  if (error) throw error;
}

// ─── Diet ─────────────────────────────────────────────────────────────────────

export async function getDietLogsForDate(userId, date) {
  const { data, error } = await supabase
    .from("diet_logs")
    .select("*, diet_items(*)")
    .eq("user_id", userId)
    .eq("log_date", date)
    .order("sort_order");
  if (error) throw error;
  return data;
}

export async function getDietLogsForRange(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from("diet_logs")
    .select("log_date, diet_items(calories, protein_g, carbs_g, fat_g)")
    .eq("user_id", userId)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date");
  if (error) throw error;
  return data;
}

export async function createMeal(userId, { log_date, meal_type, meal_time, sort_order }) {
  const { data, error } = await supabase
    .from("diet_logs")
    .insert({ user_id: userId, log_date, meal_type, meal_time, sort_order })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMealTime(mealId, meal_time) {
  const { error } = await supabase.from("diet_logs").update({ meal_time }).eq("id", mealId);
  if (error) throw error;
}

export async function updateMealSortOrder(mealId, sort_order) {
  const { error } = await supabase.from("diet_logs").update({ sort_order }).eq("id", mealId);
  if (error) throw error;
}

export async function deleteMeal(mealId) {
  const { error } = await supabase.from("diet_logs").delete().eq("id", mealId);
  if (error) throw error;
}

export async function addFoodItem(userId, mealId, nutrition) {
  const { food_name, weight_g, calories, protein_g, carbs_g, fat_g, raw_api_data } = nutrition;
  const { data, error } = await supabase
    .from("diet_items")
    .insert({ user_id: userId, meal_id: mealId, food_name, weight_g, calories, protein_g, carbs_g, fat_g, raw_api_data })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteFoodItem(itemId) {
  const { error } = await supabase.from("diet_items").delete().eq("id", itemId);
  if (error) throw error;
}

export async function uploadFoodPhoto(userId, mealId, itemId, file) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${mealId}/${itemId}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("diet-photos")
    .upload(path, file, { upsert: true });
  if (upErr) throw upErr;
  const { data: urlData } = supabase.storage.from("diet-photos").getPublicUrl(path);
  const { error } = await supabase
    .from("diet_items")
    .update({ photo_storage_path: path })
    .eq("id", itemId);
  if (error) throw error;
  return { path, publicUrl: urlData.publicUrl };
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

// ─── Job Prep Daily Logs ──────────────────────────────────────────────────────

export async function getJobPrepDailyLog(userId, date) {
  const { data, error } = await supabase
    .from("jobprep_daily_logs")
    .select("*")
    .eq("user_id", userId)
    .eq("log_date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertJobPrepDailyLog(userId, date, { duration_min, activities, resources_used, learnings, notes }) {
  const { error } = await supabase
    .from("jobprep_daily_logs")
    .upsert(
      { user_id: userId, log_date: date, duration_min, activities, resources_used, learnings, notes, updated_at: new Date().toISOString() },
      { onConflict: "user_id,log_date" }
    );
  if (error) throw error;
}

export async function getJobPrepDailyLogsForRange(userId, startDate, endDate) {
  const { data, error } = await supabase
    .from("jobprep_daily_logs")
    .select("log_date, duration_min, activities")
    .eq("user_id", userId)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date");
  if (error) throw error;
  return data;
}
