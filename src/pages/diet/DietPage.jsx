import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { FONTS, DIET_MEAL_DEFS } from "../../lib/constants.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getDietLogsForDate, getDietLogsForRange,
  createMeal, updateMealTime, updateMealSortOrder, deleteMeal,
  addFoodItem, deleteFoodItem, uploadFoodPhoto,
} from "../../lib/db.js";
import { searchFoodNutrition } from "../../lib/nutritionApi.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";

// ─── helpers ──────────────────────────────────────────────────────────────────

// Use local date to avoid UTC offset skipping dates in non-UTC timezones
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt(dateStr) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

function addDays(dateStr, n) {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const date = new Date(y, mo - 1, d);
  date.setDate(date.getDate() + n);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getMealLabel(type) {
  return DIET_MEAL_DEFS.find(m => m.type === type) ?? { label: "Snack", icon: "🍎" };
}

function totals(meals) {
  let cal = 0, pro = 0, carb = 0, fat = 0;
  for (const m of meals) {
    for (const it of (m.diet_items || [])) {
      cal  += Number(it.calories  || 0);
      pro  += Number(it.protein_g || 0);
      carb += Number(it.carbs_g   || 0);
      fat  += Number(it.fat_g     || 0);
    }
  }
  return {
    cal:  Math.round(cal),
    pro:  Math.round(pro * 10) / 10,
    carb: Math.round(carb * 10) / 10,
    fat:  Math.round(fat  * 10) / 10,
  };
}

function getPhotoUrl(storagePath, supabaseUrl) {
  if (!storagePath) return null;
  return `${supabaseUrl}/storage/v1/object/public/diet-photos/${storagePath}`;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ─── sub-components ───────────────────────────────────────────────────────────

function DailyTotalsBar({ meals }) {
  const t = totals(meals);
  const chips = [
    { label: "kcal",    value: t.cal,         color: "#4ADE80" },
    { label: "protein", value: `${t.pro}g`,   color: "#22D3EE" },
    { label: "carbs",   value: `${t.carb}g`,  color: "#FCD34D" },
    { label: "fat",     value: `${t.fat}g`,   color: "#F87171" },
  ];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
      {chips.map(c => (
        <div key={c.label} style={{
          background: "rgba(255,255,255,0.04)",
          border: `1px solid ${c.color}30`,
          borderRadius: 10, padding: "8px 14px",
          display: "flex", flexDirection: "column", alignItems: "center", minWidth: 68,
        }}>
          <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 18, color: c.color }}>
            {c.value}
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function FoodItemRow({ item, onDelete }) {
  const photoUrl = getPhotoUrl(item.photo_storage_path, SUPABASE_URL);
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 8, flexShrink: 0,
        background: "#1E293B", overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        {photoUrl
          ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "🍽️"
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 13, color: "#E2E8F0", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.food_name}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#64748B", marginTop: 2 }}>
          {item.weight_g}g · {Math.round(item.calories)} kcal · {item.protein_g}g P · {item.carbs_g}g C · {item.fat_g}g F
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        style={{ background: "none", border: "none", color: "#475569", fontSize: 14, padding: "4px 6px", flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}

function MealCard({ meal, onAddFood, onUpdateTime, onDeleteMeal, onDeleteFood }) {
  const { label, icon } = getMealLabel(meal.meal_type);
  const isSnack = meal.meal_type === "snack";

  return (
    <div style={{
      background: "rgba(15,23,42,0.6)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 14, marginBottom: 12, overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 14, color: "#E2E8F0", flex: 1 }}>
          {label}
        </span>
        <input
          type="time"
          value={meal.meal_time || ""}
          onChange={e => onUpdateTime(meal.id, e.target.value)}
          style={{
            background: "transparent", border: "none",
            fontFamily: FONTS.mono, fontSize: 11, color: "#64748B",
            cursor: "pointer",
          }}
        />
        {isSnack && (
          <button
            onClick={() => onDeleteMeal(meal.id)}
            style={{ background: "none", border: "none", color: "#475569", fontSize: 13, marginLeft: 4 }}
          >
            🗑
          </button>
        )}
      </div>
      <div style={{ padding: "0 16px" }}>
        {(meal.diet_items || []).length === 0 ? (
          <div style={{ padding: "12px 0", fontFamily: FONTS.sans, fontSize: 12, color: "#334155", textAlign: "center" }}>
            Nothing logged yet
          </div>
        ) : (
          (meal.diet_items || []).map(item => (
            <FoodItemRow key={item.id} item={item} onDelete={onDeleteFood} />
          ))
        )}
      </div>
      <div style={{ padding: "10px 16px" }}>
        <button
          onClick={() => onAddFood(meal.id)}
          style={{
            width: "100%", padding: "7px", borderRadius: 8,
            background: "transparent", border: "1px dashed rgba(74,222,128,0.25)",
            color: "#4ADE80", fontFamily: FONTS.sans, fontSize: 12,
          }}
        >
          + Add Food
        </button>
      </div>
    </div>
  );
}

function NutritionCard({ nutrition }) {
  const chips = [
    { label: "kcal",    value: nutrition.calories,       color: "#4ADE80" },
    { label: "protein", value: `${nutrition.protein_g}g`, color: "#22D3EE" },
    { label: "carbs",   value: `${nutrition.carbs_g}g`,   color: "#FCD34D" },
    { label: "fat",     value: `${nutrition.fat_g}g`,     color: "#F87171" },
  ];
  return (
    <div style={{
      background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)",
      borderRadius: 10, padding: "12px 14px", marginTop: 12,
    }}>
      <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: "#4ADE80", marginBottom: 8, fontWeight: 500 }}>
        ✓ {nutrition.food_name}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {chips.map(c => (
          <div key={c.label} style={{
            background: `${c.color}15`, border: `1px solid ${c.color}30`,
            borderRadius: 6, padding: "4px 10px",
            fontFamily: FONTS.mono, fontSize: 11, color: c.color,
          }}>
            {c.value} {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// Input component passes value string directly (not an event), so handlers accept value, not e
function AddFoodModal({ open, onClose, onSave, saving }) {
  const [foodName, setFoodName]         = useState("");
  const [weightG, setWeightG]           = useState("");
  const [fetching, setFetching]         = useState(false);
  const [nutrition, setNutrition]       = useState(null);
  const [fetchError, setFetchError]     = useState("");
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const fileRef = useRef();

  const reset = () => {
    setFoodName(""); setWeightG(""); setFetching(false);
    setNutrition(null); setFetchError(""); setPhotoFile(null); setPhotoPreview("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFoodNameChange = (value) => {
    setFoodName(value);
    setNutrition(null);
    setFetchError("");
  };

  const handleWeightChange = (value) => {
    setWeightG(value);
    setNutrition(null);
    setFetchError("");
  };

  const handleFetch = async () => {
    if (!foodName.trim() || !weightG) return;
    setFetching(true);
    setFetchError("");
    setNutrition(null);
    try {
      const result = await searchFoodNutrition(foodName.trim(), Number(weightG));
      setNutrition(result);
    } catch (e) {
      setFetchError(e.message);
    } finally {
      setFetching(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = () => {
    if (!nutrition) return;
    onSave({ nutrition, photoFile });
    reset();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add Food Item">
      {/* Photo picker */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          width: "100%", height: 90, borderRadius: 10, marginBottom: 14,
          background: photoPreview ? "transparent" : "rgba(255,255,255,0.03)",
          border: "1px dashed rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden",
        }}
      >
        {photoPreview
          ? <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: "#475569" }}>📷 Add Photo (optional)</span>
        }
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handlePhotoChange} />

      <div style={{ marginBottom: 10 }}>
        <Input
          placeholder="Food name (e.g. Paneer, Chicken Breast)"
          value={foodName}
          onChange={handleFoodNameChange}
        />
      </div>
      <div style={{ marginBottom: 14 }}>
        <Input
          type="number"
          placeholder="Weight in grams (e.g. 150)"
          value={weightG}
          onChange={handleWeightChange}
        />
      </div>

      <button
        onClick={handleFetch}
        disabled={fetching || !foodName.trim() || !weightG}
        style={{
          width: "100%", padding: "10px", borderRadius: 10,
          background: fetching || !foodName.trim() || !weightG ? "#1E293B" : "rgba(74,222,128,0.12)",
          border: "1px solid rgba(74,222,128,0.25)",
          color: fetching || !foodName.trim() || !weightG ? "#475569" : "#4ADE80",
          fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
          marginBottom: 4,
        }}
      >
        {fetching ? "Fetching nutrition…" : "Fetch Nutrition"}
      </button>

      {fetchError && (
        <div style={{ color: "#F87171", fontFamily: FONTS.sans, fontSize: 12, marginTop: 8 }}>
          ⚠ {fetchError}
        </div>
      )}

      {nutrition && <NutritionCard nutrition={nutrition} />}

      <button
        onClick={handleSave}
        disabled={!nutrition || saving}
        style={{
          width: "100%", padding: "11px", borderRadius: 10, marginTop: 14,
          background: !nutrition || saving ? "#1E293B" : "#4ADE80",
          border: "none",
          color: !nutrition || saving ? "#475569" : "#0F172A",
          fontFamily: FONTS.syne, fontSize: 14, fontWeight: 700,
        }}
      >
        {saving ? "Saving…" : "Save Food Item"}
      </button>
    </Modal>
  );
}

// ─── InsightsTab ──────────────────────────────────────────────────────────────

const INSIGHT_RANGES = [
  { key: "day",   label: "Day"   },
  { key: "week",  label: "Week"  },
  { key: "month", label: "Month" },
  { key: "year",  label: "Year"  },
];

function InsightsTab({ insightData, loading, range, onRangeChange, dailyMeals, selectedDate }) {
  const tooltipStyle = {
    background: "#0D1117", border: "1px solid #1E293B",
    borderRadius: 8, fontFamily: FONTS.sans, fontSize: 11,
  };

  const RangeToggle = () => (
    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
      {INSIGHT_RANGES.map(r => (
        <button
          key={r.key}
          onClick={() => onRangeChange(r.key)}
          style={{
            padding: "6px 16px", borderRadius: 20, border: "1px solid",
            borderColor: range === r.key ? "#4ADE80" : "#1E293B",
            background: range === r.key ? "rgba(74,222,128,0.12)" : "transparent",
            color: range === r.key ? "#4ADE80" : "#4A5568",
            fontFamily: FONTS.sans, fontSize: 12,
          }}
        >{r.label}</button>
      ))}
    </div>
  );

  // ── Day view: per-meal breakdown from dailyMeals ──────────────────────────
  if (range === "day") {
    const mealSummaries = (dailyMeals || []).map(meal => {
      const def = getMealLabel(meal.meal_type);
      let cal = 0, pro = 0, carb = 0, fat = 0;
      for (const item of (meal.diet_items || [])) {
        cal  += Number(item.calories  || 0);
        pro  += Number(item.protein_g || 0);
        carb += Number(item.carbs_g   || 0);
        fat  += Number(item.fat_g     || 0);
      }
      return { label: def.label, icon: def.icon, cal: Math.round(cal), pro: Math.round(pro * 10) / 10, carb: Math.round(carb * 10) / 10, fat: Math.round(fat * 10) / 10 };
    });
    const totalCal = mealSummaries.reduce((s, m) => s + m.cal, 0);
    const totalPro = Math.round(mealSummaries.reduce((s, m) => s + m.pro, 0) * 10) / 10;
    const totalCarb = Math.round(mealSummaries.reduce((s, m) => s + m.carb, 0) * 10) / 10;
    const totalFat = Math.round(mealSummaries.reduce((s, m) => s + m.fat, 0) * 10) / 10;

    const activeMeals = mealSummaries.filter(m => m.cal > 0);

    return (
      <div>
        <RangeToggle />
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
          {selectedDate === today() ? "Today" : fmt(selectedDate)}
        </div>

        {/* Day totals */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { label: "Total Calories", value: `${totalCal} kcal`, color: "#4ADE80" },
            { label: "Protein",        value: `${totalPro}g`,     color: "#22D3EE" },
            { label: "Carbs",          value: `${totalCarb}g`,    color: "#FCD34D" },
            { label: "Fat",            value: `${totalFat}g`,     color: "#F87171" },
          ].map(c => (
            <div key={c.label} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}25`,
              borderRadius: 10, padding: "10px 14px", flex: 1, minWidth: 90,
            }}>
              <div style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 18, color: c.color }}>{c.value}</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Per-meal calorie bars */}
        {activeMeals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#334155", fontFamily: FONTS.sans, fontSize: 13 }}>
            No food logged yet for this day
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8, fontFamily: FONTS.mono, fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>
              Calories by Meal
            </div>
            {activeMeals.map(m => (
              <div key={m.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: "#94A3B8" }}>{m.icon} {m.label}</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: "#E2E8F0" }}>{m.cal} kcal</span>
                </div>
                <div style={{ height: 6, background: "#1E293B", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: "#4ADE80",
                    width: totalCal > 0 ? `${(m.cal / totalCal) * 100}%` : "0%",
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: "#475569", marginTop: 4 }}>
                  P {m.pro}g · C {m.carb}g · F {m.fat}g
                </div>
              </div>
            ))}

            {/* Meal macro bar chart */}
            <div style={{ marginTop: 20, marginBottom: 8, fontFamily: FONTS.mono, fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>
              Macros by Meal (g)
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={activeMeals} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <XAxis dataKey="label" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: FONTS.sans, fontSize: 11 }} />
                <Bar dataKey="pro"  name="Protein" stackId="a" fill="#22D3EE" radius={[0,0,0,0]} />
                <Bar dataKey="carb" name="Carbs"   stackId="a" fill="#FCD34D" radius={[0,0,0,0]} />
                <Bar dataKey="fat"  name="Fat"     stackId="a" fill="#F87171" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <RangeToggle />
        <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: FONTS.sans }}>Loading…</div>
      </div>
    );
  }

  // ── Year view: aggregate insightData by month ─────────────────────────────
  if (range === "year") {
    const macroByMonth = {};
    for (const meal of insightData) {
      const month = meal.log_date.slice(0, 7);
      if (!macroByMonth[month]) macroByMonth[month] = { calories: 0, protein: 0, carbs: 0, fat: 0, days: new Set() };
      macroByMonth[month].days.add(meal.log_date);
      for (const item of (meal.diet_items || [])) {
        macroByMonth[month].calories += Number(item.calories  || 0);
        macroByMonth[month].protein  += Number(item.protein_g || 0);
        macroByMonth[month].carbs    += Number(item.carbs_g   || 0);
        macroByMonth[month].fat      += Number(item.fat_g     || 0);
      }
    }

    const yearChartData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-IN", { month: "short" });
      const m = macroByMonth[key];
      const daysCount = m ? m.days.size : 0;
      yearChartData.push({
        date: label,
        calories: daysCount ? Math.round(m.calories / daysCount) : 0,
        protein:  daysCount ? Math.round(m.protein  / daysCount * 10) / 10 : 0,
        carbs:    daysCount ? Math.round(m.carbs    / daysCount * 10) / 10 : 0,
        fat:      daysCount ? Math.round(m.fat      / daysCount * 10) / 10 : 0,
      });
    }

    const monthsLogged = yearChartData.filter(d => d.calories > 0).length;
    const avgCal = monthsLogged ? Math.round(yearChartData.reduce((s, d) => s + d.calories, 0) / monthsLogged) : 0;
    const avgPro = monthsLogged ? Math.round(yearChartData.reduce((s, d) => s + d.protein,  0) / monthsLogged * 10) / 10 : 0;

    return (
      <div>
        <RangeToggle />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { label: "Avg Daily Cal (active months)", value: avgCal + " kcal", color: "#4ADE80" },
            { label: "Avg Daily Protein",             value: avgPro + "g",     color: "#22D3EE" },
            { label: "Months Logged",                 value: `${monthsLogged}/12`, color: "#A78BFA" },
          ].map(c => (
            <div key={c.label} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}25`,
              borderRadius: 10, padding: "10px 14px", flex: 1, minWidth: 100,
            }}>
              <div style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 20, color: c.color }}>{c.value}</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 8, fontFamily: FONTS.mono, fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>
          Avg Daily Calories by Month
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={yearChartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <XAxis dataKey="date" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="calories" fill="#4ADE80" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>

        <div style={{ margin: "20px 0 8px", fontFamily: FONTS.mono, fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>
          Avg Daily Macros by Month (g)
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={yearChartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <XAxis dataKey="date" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontFamily: FONTS.sans, fontSize: 11 }} />
            <Bar dataKey="protein" stackId="a" fill="#22D3EE" radius={[0,0,0,0]} />
            <Bar dataKey="carbs"   stackId="a" fill="#FCD34D" radius={[0,0,0,0]} />
            <Bar dataKey="fat"     stackId="a" fill="#F87171" radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ── Week / Month view ─────────────────────────────────────────────────────
  const macroByDate = {};
  for (const meal of insightData) {
    const d = meal.log_date;
    if (!macroByDate[d]) macroByDate[d] = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    for (const item of (meal.diet_items || [])) {
      macroByDate[d].calories  += Number(item.calories  || 0);
      macroByDate[d].protein_g += Number(item.protein_g || 0);
      macroByDate[d].carbs_g   += Number(item.carbs_g   || 0);
      macroByDate[d].fat_g     += Number(item.fat_g     || 0);
    }
  }

  const days = range === "week" ? 7 : 30;
  const chartData = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today(), -i);
    const m = macroByDate[d] || { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    chartData.push({
      date: d.slice(5),
      calories: Math.round(m.calories),
      protein:  Math.round(m.protein_g * 10) / 10,
      carbs:    Math.round(m.carbs_g   * 10) / 10,
      fat:      Math.round(m.fat_g     * 10) / 10,
    });
  }

  const daysLogged = chartData.filter(d => d.calories > 0).length;
  const avgCal = daysLogged ? Math.round(chartData.reduce((s, d) => s + d.calories, 0) / daysLogged) : 0;
  const avgPro = daysLogged ? Math.round(chartData.reduce((s, d) => s + d.protein,  0) / daysLogged * 10) / 10 : 0;

  return (
    <div>
      <RangeToggle />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { label: "Avg Daily Calories", value: avgCal + " kcal", color: "#4ADE80" },
          { label: "Avg Daily Protein",  value: avgPro + "g",     color: "#22D3EE" },
          { label: "Days Logged",        value: `${daysLogged}/${days}`, color: "#A78BFA" },
        ].map(c => (
          <div key={c.label} style={{
            background: "rgba(255,255,255,0.03)", border: `1px solid ${c.color}25`,
            borderRadius: 10, padding: "10px 14px", flex: 1, minWidth: 100,
          }}>
            <div style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 20, color: c.color }}>{c.value}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 8, fontFamily: FONTS.mono, fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>
        Daily Calories
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <XAxis dataKey="date" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} interval={range === "week" ? 0 : 4} />
          <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="calories" stroke="#4ADE80" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ margin: "20px 0 8px", fontFamily: FONTS.mono, fontSize: 10, color: "#475569", letterSpacing: 1, textTransform: "uppercase" }}>
        Macro Breakdown (g)
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <XAxis dataKey="date" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} interval={range === "week" ? 0 : 4} />
          <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: "#334155" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontFamily: FONTS.sans, fontSize: 11 }} />
          <Bar dataKey="protein" stackId="a" fill="#22D3EE" radius={[0,0,0,0]} />
          <Bar dataKey="carbs"   stackId="a" fill="#FCD34D" radius={[0,0,0,0]} />
          <Bar dataKey="fat"     stackId="a" fill="#F87171" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── DietPage ─────────────────────────────────────────────────────────────────

export default function DietPage() {
  const { user } = useAuth();
  const [activeTab,      setActiveTab]      = useState("today");
  const [selectedDate,   setSelectedDate]   = useState(today());
  const [meals,          setMeals]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [addFoodModal,   setAddFoodModal]   = useState({ open: false, mealId: null });
  const [saving,         setSaving]         = useState(false);
  const [insightRange,   setInsightRange]   = useState("week");
  const [insightData,    setInsightData]    = useState([]);
  const [insightLoading, setInsightLoading] = useState(false);

  // ── load day ────────────────────────────────────────────────────────────────
  const loadDay = useCallback(async (date) => {
    if (!user) return;
    setLoading(true);
    try {
      let rows = await getDietLogsForDate(user.id, date);
      if (rows.length === 0) {
        await Promise.all(
          DIET_MEAL_DEFS.map(def =>
            createMeal(user.id, {
              log_date: date,
              meal_type: def.type,
              meal_time: def.defaultTime,
              sort_order: def.sortOrder,
            })
          )
        );
        rows = await getDietLogsForDate(user.id, date);
      } else {
        // Migrate old sort_orders (0,1,2) to new scale (0,10,20) so integer snacks fit
        const migrations = [];
        for (const def of DIET_MEAL_DEFS) {
          const meal = rows.find(r => r.meal_type === def.type);
          if (meal && meal.sort_order !== def.sortOrder && meal.sort_order < 5) {
            migrations.push(updateMealSortOrder(meal.id, def.sortOrder));
          }
        }
        if (migrations.length > 0) {
          await Promise.all(migrations);
          rows = await getDietLogsForDate(user.id, date);
        }
      }
      setMeals(rows);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadDay(selectedDate); }, [loadDay, selectedDate]);

  // ── load insights ────────────────────────────────────────────────────────────
  const loadInsights = useCallback(async (range) => {
    if (!user) return;
    setInsightLoading(true);
    try {
      let start;
      if      (range === "week")  start = addDays(today(), -6);
      else if (range === "month") start = addDays(today(), -29);
      else if (range === "year")  start = addDays(today(), -364);
      else return; // "day" uses dailyMeals — no DB call needed
      const data = await getDietLogsForRange(user.id, start, today());
      setInsightData(data);
    } finally {
      setInsightLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === "insights" && insightRange !== "day") loadInsights(insightRange);
  }, [activeTab, insightRange, loadInsights]);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleAddFood = (mealId) => setAddFoodModal({ open: true, mealId });

  const handleSaveFood = async ({ nutrition, photoFile }) => {
    if (!addFoodModal.mealId) return;
    setSaving(true);
    try {
      const item = await addFoodItem(user.id, addFoodModal.mealId, nutrition);
      if (photoFile) await uploadFoodPhoto(user.id, addFoodModal.mealId, item.id, photoFile);
      setAddFoodModal({ open: false, mealId: null });
      await loadDay(selectedDate);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTime = async (mealId, time) => {
    await updateMealTime(mealId, time);
    setMeals(prev => prev.map(m => m.id === mealId ? { ...m, meal_time: time } : m));
  };

  const handleDeleteMeal = async (mealId) => {
    await deleteMeal(mealId);
    setMeals(prev => prev.filter(m => m.id !== mealId));
  };

  const handleDeleteFood = async (itemId) => {
    await deleteFoodItem(itemId);
    setMeals(prev => prev.map(m => ({
      ...m,
      diet_items: (m.diet_items || []).filter(it => it.id !== itemId),
    })));
  };

  const handleAddSnack = async (parentSortOrder) => {
    // Count existing snacks already in this slot (parent+1 … parent+9) to avoid collisions
    const snacksInSlot = meals.filter(m =>
      m.meal_type === "snack" &&
      m.sort_order > parentSortOrder &&
      m.sort_order < parentSortOrder + 10
    ).length;
    const snackSortOrder = parentSortOrder + 5 + snacksInSlot; // always an integer
    const meal = await createMeal(user.id, {
      log_date: selectedDate,
      meal_type: "snack",
      meal_time: null,
      sort_order: snackSortOrder,
    });
    meal.diet_items = [];
    setMeals(prev => [...prev, meal].sort((a, b) => a.sort_order - b.sort_order));
  };

  const isToday = selectedDate === today();

  const sortedMeals = [...meals].sort((a, b) => a.sort_order - b.sort_order);

  // Build mealRows: insert snack_btn RIGHT BEFORE dinner (captures lunch-slot snacks above it)
  // and at the very end (captures dinner-slot snacks above it)
  const mealRows = [];
  const lunchMeal  = sortedMeals.find(m => m.meal_type === "lunch");
  const dinnerMeal = sortedMeals.find(m => m.meal_type === "dinner");
  for (let i = 0; i < sortedMeals.length; i++) {
    const meal = sortedMeals[i];
    // Insert snack_btn slot just before the dinner card
    if (meal.meal_type === "dinner" && lunchMeal) {
      mealRows.push({ type: "snack_btn", parentSortOrder: lunchMeal.sort_order });
    }
    mealRows.push({ type: "meal", data: meal });
  }
  // Snack slot after dinner
  if (dinnerMeal) {
    mealRows.push({ type: "snack_btn", parentSortOrder: dinnerMeal.sort_order });
  }

  return (
    <div style={{
      minHeight: "100%",
      background: "radial-gradient(ellipse at top, #021A0A 0%, #08091A 55%)",
      fontFamily: FONTS.sans,
    }}>
      <div style={{ padding: "24px 20px 80px", maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: FONTS.syne, fontWeight: 800, fontSize: 26, color: "#F1F5F9" }}>
            🥗 Diet
          </div>
          <div style={{ fontSize: 11, color: "#4ADE80", fontFamily: FONTS.mono, marginTop: 2 }}>
            Track every meal · every day
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 24 }}>
          {[
            { key: "today",    label: "Today",    icon: "🍽️" },
            { key: "insights", label: "Insights", icon: "📊" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "10px 16px", background: "transparent", border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #4ADE80" : "2px solid transparent",
                color: activeTab === tab.key ? "#4ADE80" : "#4A5568",
                fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
                marginBottom: -1,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Today Tab ── */}
        {activeTab === "today" && (
          <>
            {/* Date nav with calendar picker */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button
                onClick={() => setSelectedDate(d => addDays(d, -1))}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #1E293B", color: "#94A3B8", borderRadius: 8, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12 }}
              >
                ←
              </button>

              {/* Clickable date — opens native date picker */}
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <span style={{ fontFamily: FONTS.syne, fontWeight: 700, fontSize: 15, color: "#E2E8F0", userSelect: "none" }}>
                  {isToday ? "Today" : fmt(selectedDate)}
                </span>
                <span style={{ fontSize: 13, color: "#4A5568" }}>📅</span>
                <input
                  type="date"
                  value={selectedDate}
                  max={today()}
                  onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }}
                  style={{
                    position: "absolute", inset: 0, opacity: 0,
                    cursor: "pointer", width: "100%", height: "100%",
                    fontSize: 16,
                  }}
                />
              </div>

              <button
                onClick={() => !isToday && setSelectedDate(d => addDays(d, 1))}
                style={{
                  background: isToday ? "transparent" : "rgba(255,255,255,0.05)",
                  border: "1px solid #1E293B",
                  color: isToday ? "#1E293B" : "#94A3B8",
                  borderRadius: 8, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12,
                  cursor: isToday ? "default" : "pointer",
                }}
              >
                →
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: "#334155", fontFamily: FONTS.sans }}>Loading…</div>
            ) : (
              <>
                <DailyTotalsBar meals={meals} />
                {mealRows.map((row, idx) =>
                  row.type === "meal" ? (
                    <MealCard
                      key={row.data.id}
                      meal={row.data}
                      onAddFood={handleAddFood}
                      onUpdateTime={handleUpdateTime}
                      onDeleteMeal={handleDeleteMeal}
                      onDeleteFood={handleDeleteFood}
                    />
                  ) : (
                    <div key={`snack-${idx}`} style={{ textAlign: "center", marginBottom: 8 }}>
                      <button
                        onClick={() => handleAddSnack(row.parentSortOrder)}
                        style={{
                          background: "transparent", border: "1px dashed rgba(255,255,255,0.08)",
                          borderRadius: 8, padding: "5px 16px", color: "#334155",
                          fontFamily: FONTS.sans, fontSize: 11,
                        }}
                      >
                        + Add Snack Here
                      </button>
                    </div>
                  )
                )}
              </>
            )}
          </>
        )}

        {/* ── Insights Tab ── */}
        {activeTab === "insights" && (
          <InsightsTab
            insightData={insightData}
            loading={insightLoading}
            range={insightRange}
            onRangeChange={(r) => setInsightRange(r)}
            dailyMeals={meals}
            selectedDate={selectedDate}
          />
        )}
      </div>

      <AddFoodModal
        open={addFoodModal.open}
        onClose={() => setAddFoodModal({ open: false, mealId: null })}
        onSave={handleSaveFood}
        saving={saving}
      />
    </div>
  );
}
