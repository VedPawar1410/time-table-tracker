import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { THEME, DIET_MEAL_DEFS } from "../../lib/constants.js";
import { TASK_PALETTE, F, lighten, shadeDarken } from "../../lib/theme.js";
import { useAuth } from "../../hooks/useAuth.js";
import { PageHeader } from "../../components/layout/PageHeader.jsx";
const FONTS = { mono: F.mono, sans: F.body, nunito: F.display };
import {
  getDietLogsForDate, getDietLogsForRange,
  createMeal, updateMealTime, updateMealSortOrder, deleteMeal,
  addFoodItem, deleteFoodItem, uploadFoodPhoto,
} from "../../lib/db.js";
import { searchFoodNutrition } from "../../lib/nutritionApi.js";
import { Modal } from "../../components/ui/Modal.jsx";
import { Input } from "../../components/ui/Input.jsx";

// ─── helpers ──────────────────────────────────────────────────────────────────

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

// Warm macro colors
const MC = {
  cal:  { color: "#6BAD3A", bg: "#DCEFC8" },
  pro:  { color: "#5A7CC4", bg: "#D9E4FB" },
  carb: { color: "#D69B1F", bg: "#FFEDC2" },
  fat:  { color: "#D6395B", bg: "#FFD6DF" },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function DailyTotalsBar({ meals }) {
  const t = totals(meals);
  const chips = [
    { label: "kcal",    value: t.cal,         ...MC.cal  },
    { label: "protein", value: `${t.pro}g`,   ...MC.pro  },
    { label: "carbs",   value: `${t.carb}g`,  ...MC.carb },
    { label: "fat",     value: `${t.fat}g`,   ...MC.fat  },
  ];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
      {chips.map(c => (
        <div key={c.label} style={{
          background: c.bg,
          border: `1px solid ${c.color}44`,
          borderRadius: THEME.rMd, padding: "8px 14px",
          display: "flex", flexDirection: "column", alignItems: "center", minWidth: 68,
          boxShadow: THEME.shadowSm,
        }}>
          <span style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 18, color: c.color }}>
            {c.value}
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 1 }}>
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
      padding: "8px 0", borderBottom: `1px solid ${THEME.line}`,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: THEME.rSm, flexShrink: 0,
        background: THEME.bgAlt, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        {photoUrl
          ? <img src={photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : "🍽️"
        }
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONTS.sans, fontSize: 13, color: THEME.ink, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.food_name}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, marginTop: 2 }}>
          {item.weight_g}g · {Math.round(item.calories)} kcal · {item.protein_g}g P · {item.carbs_g}g C · {item.fat_g}g F
        </div>
      </div>
      <button
        onClick={() => onDelete(item.id)}
        style={{ background: "none", border: "none", color: THEME.inkFaint, fontSize: 14, padding: "4px 6px", flexShrink: 0, cursor: "pointer" }}
      >
        ✕
      </button>
    </div>
  );
}

const MEAL_PALETTE = {
  breakfast: TASK_PALETTE.sidehustle,
  lunch: TASK_PALETTE.diet,
  dinner: TASK_PALETTE.hobbies,
  snack: TASK_PALETTE.book,
};

function MealCard({ meal, onAddFood, onUpdateTime, onDeleteMeal, onDeleteFood }) {
  const { label, icon } = getMealLabel(meal.meal_type);
  const isSnack = meal.meal_type === "snack";
  const mp = MEAL_PALETTE[meal.meal_type] || TASK_PALETTE.routine;
  const mealTotals = totals([meal]);

  return (
    <div style={{
      background: THEME.surface,
      border: `1.5px solid ${THEME.line}`,
      borderRadius: THEME.rLg, marginBottom: 14, overflow: "hidden",
      boxShadow: THEME.shadowSm,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 16px", background: lighten(mp.fg, 0.88),
        borderBottom: `1.5px solid ${lighten(mp.fg, 0.72)}`,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: lighten(mp.fg, 0.75), border: `1.5px solid ${lighten(mp.fg, 0.55)}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontFamily: F.display, fontWeight: 800, fontSize: 14, color: THEME.ink }}>
            {label}
          </span>
          {mealTotals.cal > 0 && (
            <div style={{ fontFamily: F.mono, fontSize: 10, color: mp.fg, marginTop: 1 }}>
              {mealTotals.cal} kcal · {mealTotals.pro}g P · {mealTotals.carb}g C
            </div>
          )}
        </div>
        <input
          type="time"
          value={meal.meal_time || ""}
          onChange={e => onUpdateTime(meal.id, e.target.value)}
          style={{
            background: "transparent", border: "none",
            fontFamily: F.mono, fontSize: 11, color: THEME.inkFaint,
            cursor: "pointer",
          }}
        />
        {isSnack && (
          <button
            onClick={() => onDeleteMeal(meal.id)}
            style={{ background: "none", border: "none", color: THEME.inkFaint, fontSize: 13, marginLeft: 4, cursor: "pointer" }}
          >🗑</button>
        )}
      </div>
      <div style={{ padding: "0 16px" }}>
        {(meal.diet_items || []).length === 0 ? (
          <div style={{ padding: "12px 0", fontFamily: F.body, fontSize: 12, color: THEME.inkFaint, textAlign: "center" }}>
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
            width: "100%", padding: "8px", borderRadius: THEME.rMd,
            background: lighten(mp.fg, 0.9), border: `1.5px dashed ${lighten(mp.fg, 0.65)}`,
            color: mp.fg, fontFamily: F.display, fontWeight: 700, fontSize: 12, cursor: "pointer",
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
    { label: "kcal",    value: nutrition.calories,        ...MC.cal  },
    { label: "protein", value: `${nutrition.protein_g}g`, ...MC.pro  },
    { label: "carbs",   value: `${nutrition.carbs_g}g`,   ...MC.carb },
    { label: "fat",     value: `${nutrition.fat_g}g`,     ...MC.fat  },
  ];
  return (
    <div style={{
      background: "#DCEFC8", border: "1px solid #CADBB5",
      borderRadius: THEME.rSm, padding: "12px 14px", marginTop: 12,
    }}>
      <div style={{ fontFamily: FONTS.sans, fontSize: 12, color: "#6BAD3A", marginBottom: 8, fontWeight: 600 }}>
        ✓ {nutrition.food_name}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {chips.map(c => (
          <div key={c.label} style={{
            background: c.bg, border: `1px solid ${c.color}44`,
            borderRadius: THEME.rSm, padding: "4px 10px",
            fontFamily: FONTS.mono, fontSize: 11, color: c.color,
          }}>
            {c.value} {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

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
          width: "100%", height: 90, borderRadius: THEME.rSm, marginBottom: 14,
          background: photoPreview ? "transparent" : THEME.surfaceAlt,
          border: `1px dashed ${THEME.lineStrong}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", overflow: "hidden",
        }}
      >
        {photoPreview
          ? <img src={photoPreview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ fontFamily: FONTS.sans, fontSize: 12, color: THEME.inkFaint }}>📷 Add Photo (optional)</span>
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
          width: "100%", padding: "10px", borderRadius: THEME.rSm,
          background: fetching || !foodName.trim() || !weightG ? THEME.surfaceAlt : "#DCEFC8",
          border: `1px solid ${fetching || !foodName.trim() || !weightG ? THEME.line : "#CADBB5"}`,
          color: fetching || !foodName.trim() || !weightG ? THEME.inkFaint : "#6BAD3A",
          fontFamily: FONTS.sans, fontSize: 13, fontWeight: 500,
          marginBottom: 4, cursor: "pointer",
        }}
      >
        {fetching ? "Fetching nutrition…" : "Fetch Nutrition"}
      </button>

      {fetchError && (
        <div style={{ color: "#D6395B", fontFamily: FONTS.sans, fontSize: 12, marginTop: 8 }}>
          ⚠ {fetchError}
        </div>
      )}

      {nutrition && <NutritionCard nutrition={nutrition} />}

      <button
        onClick={handleSave}
        disabled={!nutrition || saving}
        style={{
          width: "100%", padding: "11px", borderRadius: THEME.rSm, marginTop: 14,
          background: !nutrition || saving ? THEME.surfaceAlt : "#6BAD3A",
          border: "none",
          color: !nutrition || saving ? THEME.inkFaint : "#fff",
          fontFamily: FONTS.nunito, fontSize: 14, fontWeight: 700, cursor: "pointer",
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
    background: THEME.surface, border: `1px solid ${THEME.line}`,
    borderRadius: 8, fontFamily: FONTS.sans, fontSize: 11,
  };

  const RangeToggle = () => (
    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
      {INSIGHT_RANGES.map(r => (
        <button
          key={r.key}
          onClick={() => onRangeChange(r.key)}
          style={{
            padding: "6px 16px", borderRadius: THEME.rPill, border: "1px solid",
            borderColor: range === r.key ? "#6BAD3A" : THEME.line,
            background: range === r.key ? "#DCEFC8" : THEME.surfaceAlt,
            color: range === r.key ? "#6BAD3A" : THEME.inkMuted,
            fontFamily: FONTS.sans, fontSize: 12, cursor: "pointer",
          }}
        >{r.label}</button>
      ))}
    </div>
  );

  // ── Day view ────────────────────────────────────────────────────────────────
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
    const totalCal  = mealSummaries.reduce((s, m) => s + m.cal,  0);
    const totalPro  = Math.round(mealSummaries.reduce((s, m) => s + m.pro,  0) * 10) / 10;
    const totalCarb = Math.round(mealSummaries.reduce((s, m) => s + m.carb, 0) * 10) / 10;
    const totalFat  = Math.round(mealSummaries.reduce((s, m) => s + m.fat,  0) * 10) / 10;
    const activeMeals = mealSummaries.filter(m => m.cal > 0);

    return (
      <div>
        <RangeToggle />
        <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>
          {selectedDate === today() ? "Today" : fmt(selectedDate)}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {[
            { label: "Total Calories", value: `${totalCal} kcal`, ...MC.cal  },
            { label: "Protein",        value: `${totalPro}g`,     ...MC.pro  },
            { label: "Carbs",          value: `${totalCarb}g`,    ...MC.carb },
            { label: "Fat",            value: `${totalFat}g`,     ...MC.fat  },
          ].map(c => (
            <div key={c.label} style={{
              background: c.bg, border: `1px solid ${c.color}44`,
              borderRadius: THEME.rMd, padding: "10px 14px", flex: 1, minWidth: 90,
              boxShadow: THEME.shadowSm,
            }}>
              <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 18, color: c.color }}>{c.value}</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {activeMeals.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: THEME.inkFaint, fontFamily: FONTS.sans, fontSize: 13 }}>
            No food logged yet for this day
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 8, fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>
              Calories by Meal
            </div>
            {activeMeals.map(m => (
              <div key={m.label} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 13, color: THEME.inkSoft }}>{m.icon} {m.label}</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: THEME.ink }}>{m.cal} kcal</span>
                </div>
                <div style={{ height: 6, background: THEME.bgAlt, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: "#6BAD3A",
                    width: totalCal > 0 ? `${(m.cal / totalCal) * 100}%` : "0%",
                    transition: "width 0.4s ease",
                  }} />
                </div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, marginTop: 4 }}>
                  P {m.pro}g · C {m.carb}g · F {m.fat}g
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, marginBottom: 8, fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>
              Macros by Meal (g)
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={activeMeals} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                <XAxis dataKey="label" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontFamily: FONTS.sans, fontSize: 11 }} />
                <Bar dataKey="pro"  name="Protein" stackId="a" fill={MC.pro.color}  radius={[0,0,0,0]} />
                <Bar dataKey="carb" name="Carbs"   stackId="a" fill={MC.carb.color} radius={[0,0,0,0]} />
                <Bar dataKey="fat"  name="Fat"     stackId="a" fill={MC.fat.color}  radius={[3,3,0,0]} />
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
        <div style={{ textAlign: "center", padding: 40, color: THEME.inkFaint, fontFamily: FONTS.sans }}>Loading…</div>
      </div>
    );
  }

  // ── Year view ────────────────────────────────────────────────────────────────
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
            { label: "Avg Daily Cal (active months)", value: avgCal + " kcal", ...MC.cal  },
            { label: "Avg Daily Protein",             value: avgPro + "g",     ...MC.pro  },
            { label: "Months Logged",                 value: `${monthsLogged}/12`, color: "#8C6BD9", bg: "#E6DCFF" },
          ].map(c => (
            <div key={c.label} style={{
              background: c.bg, border: `1px solid ${c.color}44`,
              borderRadius: THEME.rMd, padding: "10px 14px", flex: 1, minWidth: 100,
              boxShadow: THEME.shadowSm,
            }}>
              <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 20, color: c.color }}>{c.value}</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{c.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 8, fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>
          Avg Daily Calories by Month
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={yearChartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <XAxis dataKey="date" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="calories" fill={MC.cal.color} radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>

        <div style={{ margin: "20px 0 8px", fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>
          Avg Daily Macros by Month (g)
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={yearChartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <XAxis dataKey="date" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontFamily: FONTS.sans, fontSize: 11 }} />
            <Bar dataKey="protein" stackId="a" fill={MC.pro.color}  radius={[0,0,0,0]} />
            <Bar dataKey="carbs"   stackId="a" fill={MC.carb.color} radius={[0,0,0,0]} />
            <Bar dataKey="fat"     stackId="a" fill={MC.fat.color}  radius={[3,3,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // ── Week / Month view ────────────────────────────────────────────────────────
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
          { label: "Avg Daily Calories", value: avgCal + " kcal",        ...MC.cal  },
          { label: "Avg Daily Protein",  value: avgPro + "g",            ...MC.pro  },
          { label: "Days Logged",        value: `${daysLogged}/${days}`, color: "#8C6BD9", bg: "#E6DCFF" },
        ].map(c => (
          <div key={c.label} style={{
            background: c.bg, border: `1px solid ${c.color}44`,
            borderRadius: THEME.rMd, padding: "10px 14px", flex: 1, minWidth: 100,
            boxShadow: THEME.shadowSm,
          }}>
            <div style={{ fontFamily: FONTS.nunito, fontWeight: 800, fontSize: 20, color: c.color }}>{c.value}</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: THEME.inkMuted, textTransform: "uppercase", letterSpacing: 1, marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 8, fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>
        Daily Calories
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <XAxis dataKey="date" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} interval={range === "week" ? 0 : 4} />
          <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="calories" stroke={MC.cal.color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div style={{ margin: "20px 0 8px", fontFamily: FONTS.mono, fontSize: 10, color: THEME.inkMuted, letterSpacing: 1, textTransform: "uppercase" }}>
        Macro Breakdown (g)
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
          <XAxis dataKey="date" tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} interval={range === "week" ? 0 : 4} />
          <YAxis tick={{ fontFamily: FONTS.mono, fontSize: 9, fill: THEME.inkFaint }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontFamily: FONTS.sans, fontSize: 11 }} />
          <Bar dataKey="protein" stackId="a" fill={MC.pro.color}  radius={[0,0,0,0]} />
          <Bar dataKey="carbs"   stackId="a" fill={MC.carb.color} radius={[0,0,0,0]} />
          <Bar dataKey="fat"     stackId="a" fill={MC.fat.color}  radius={[3,3,0,0]} />
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

  const loadInsights = useCallback(async (range) => {
    if (!user) return;
    setInsightLoading(true);
    try {
      let start;
      if      (range === "week")  start = addDays(today(), -6);
      else if (range === "month") start = addDays(today(), -29);
      else if (range === "year")  start = addDays(today(), -364);
      else return;
      const data = await getDietLogsForRange(user.id, start, today());
      setInsightData(data);
    } finally {
      setInsightLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeTab === "insights" && insightRange !== "day") loadInsights(insightRange);
  }, [activeTab, insightRange, loadInsights]);

  const handleAddFood    = (mealId) => setAddFoodModal({ open: true, mealId });

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

  const handleUpdateTime  = async (mealId, time) => {
    await updateMealTime(mealId, time);
    setMeals(prev => prev.map(m => m.id === mealId ? { ...m, meal_time: time } : m));
  };

  const handleDeleteMeal  = async (mealId) => {
    await deleteMeal(mealId);
    setMeals(prev => prev.filter(m => m.id !== mealId));
  };

  const handleDeleteFood  = async (itemId) => {
    await deleteFoodItem(itemId);
    setMeals(prev => prev.map(m => ({
      ...m,
      diet_items: (m.diet_items || []).filter(it => it.id !== itemId),
    })));
  };

  const handleAddSnack = async (parentSortOrder) => {
    const snacksInSlot = meals.filter(m =>
      m.meal_type === "snack" &&
      m.sort_order > parentSortOrder &&
      m.sort_order < parentSortOrder + 10
    ).length;
    const snackSortOrder = parentSortOrder + 5 + snacksInSlot;
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

  const mealRows = [];
  const lunchMeal  = sortedMeals.find(m => m.meal_type === "lunch");
  const dinnerMeal = sortedMeals.find(m => m.meal_type === "dinner");
  for (let i = 0; i < sortedMeals.length; i++) {
    const meal = sortedMeals[i];
    if (meal.meal_type === "dinner" && lunchMeal) {
      mealRows.push({ type: "snack_btn", parentSortOrder: lunchMeal.sort_order });
    }
    mealRows.push({ type: "meal", data: meal });
  }
  if (dinnerMeal) {
    mealRows.push({ type: "snack_btn", parentSortOrder: dinnerMeal.sort_order });
  }

  const dp = TASK_PALETTE.diet;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", fontFamily: F.body }}>
      <PageHeader
        kicker="DEEP DIVE · DIET"
        title="Diet & Nutrition"
        subtitle="Track every meal, every macro, every day"
      />

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 20,
        background: THEME.surface, borderRadius: THEME.rMd, padding: 5,
        border: `1.5px solid ${THEME.line}`, boxShadow: THEME.shadowSm,
      }}>
        {[
          { key: "today",    label: "Today",    icon: "🍽️" },
          { key: "insights", label: "Insights", icon: "📊" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 14px", borderRadius: THEME.rSm, border: "none",
              background: activeTab === tab.key ? lighten(dp.fg, 0.78) : "transparent",
              color: activeTab === tab.key ? shadeDarken(dp.fg, 0.3) : THEME.inkSoft,
              fontFamily: F.display, fontSize: 13, fontWeight: activeTab === tab.key ? 800 : 600,
              cursor: "pointer", boxShadow: activeTab === tab.key ? THEME.shadowSm : "none",
              transition: "all 0.15s",
            }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ paddingBottom: 80 }}>

        {/* ── Today Tab ── */}
        {activeTab === "today" && (
          <>
            {/* Date nav */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <button
                onClick={() => setSelectedDate(d => addDays(d, -1))}
                style={{ background: THEME.surfaceAlt, border: `1px solid ${THEME.line}`, color: THEME.inkSoft, borderRadius: THEME.rSm, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12, cursor: "pointer" }}
              >←</button>

              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                <span style={{ fontFamily: FONTS.nunito, fontWeight: 700, fontSize: 15, color: THEME.ink, userSelect: "none" }}>
                  {isToday ? "Today" : fmt(selectedDate)}
                </span>
                <span style={{ fontSize: 13, color: THEME.inkFaint }}>📅</span>
                <input
                  type="date"
                  value={selectedDate}
                  max={today()}
                  onChange={(e) => { if (e.target.value) setSelectedDate(e.target.value); }}
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%", fontSize: 16 }}
                />
              </div>

              <button
                onClick={() => !isToday && setSelectedDate(d => addDays(d, 1))}
                style={{
                  background: isToday ? "transparent" : THEME.surfaceAlt,
                  border: `1px solid ${THEME.line}`,
                  color: isToday ? THEME.line : THEME.inkSoft,
                  borderRadius: THEME.rSm, padding: "6px 12px", fontFamily: FONTS.mono, fontSize: 12,
                  cursor: isToday ? "default" : "pointer",
                }}
              >→</button>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: 40, color: THEME.inkFaint, fontFamily: FONTS.sans }}>Loading…</div>
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
                          background: THEME.surfaceAlt, border: `1px dashed ${THEME.lineStrong}`,
                          borderRadius: THEME.rSm, padding: "5px 16px", color: THEME.inkMuted,
                          fontFamily: FONTS.sans, fontSize: 11, cursor: "pointer",
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
