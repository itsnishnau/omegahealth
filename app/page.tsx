"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bell,
  BookOpenText,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Dumbbell,
  FileHeart,
  Heart,
  Home,
  Menu,
  Mic,
  NotebookPen,
  Pencil,
  Plus,
  Salad,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  SunMedium,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

type Screen = "welcome" | "auth" | "onboarding" | "app";
type Section = "dashboard" | "doctor-notes" | "nutrition" | "education" | "wellness" | "settings";
type CycleType = "regular" | "irregular" | "not-sure";
type Mood = "Happy" | "Neutral" | "Sad";
type Flow = "Spotting" | "Light" | "Medium" | "Heavy";

interface Profile {
  preferredName: string;
  age: number;
  cycleType: CycleType;
  onboardingCompleted: boolean;
  aiConsent: boolean;
  remindersEnabled: boolean;
}

interface PeriodRecord {
  id: string;
  startDate: string;
  endDate?: string | null;
}

interface SymptomEntry {
  id: string;
  date: string;
  text: string;
}

interface DailyLog {
  mood?: Mood;
  flow?: Flow;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface WellnessEntry {
  id: string;
  date: string;
  activity: string;
  energy: "Low" | "Moderate" | "High";
}

interface AppState {
  profile: Profile;
  periods: PeriodRecord[];
  symptoms: SymptomEntry[];
  dailyLogs: Record<string, DailyLog>;
  notes: Note[];
  wellnessLogs: WellnessEntry[];
}

const STORAGE_KEY = "omega-health-demo-state-v1";
const todayKey = () => new Date().toISOString().slice(0, 10);

const initialProfile: Profile = {
  preferredName: "Ava",
  age: 15,
  cycleType: "irregular",
  onboardingCompleted: false,
  aiConsent: false,
  remindersEnabled: false,
};

const demoState: AppState = {
  profile: initialProfile,
  periods: [
    { id: "p1", startDate: "2026-09-21", endDate: "2026-09-26" },
    { id: "p2", startDate: "2026-10-20", endDate: "2026-10-25" },
  ],
  symptoms: [
    { id: "s1", date: "2026-10-12", text: "Lower back pain and cramps" },
    { id: "s2", date: "2026-10-18", text: "Feeling bloated and tired" },
    { id: "s3", date: "2026-10-22", text: "Headache and nausea" },
  ],
  dailyLogs: {
    "2026-10-20": { mood: "Sad", flow: "Medium" },
    "2026-10-21": { mood: "Neutral", flow: "Heavy" },
    "2026-10-22": { mood: "Happy", flow: "Light" },
    "2026-10-23": { mood: "Neutral", flow: "Spotting" },
  },
  notes: [
    {
      id: "n1",
      title: "School trip notes",
      content: "Cramping is worse in the afternoon. Bring extra supplies and plan rest breaks.",
      createdAt: "2026-10-18T08:30:00.000Z",
      updatedAt: "2026-10-18T08:30:00.000Z",
    },
  ],
  wellnessLogs: [
    { id: "w1", date: "2026-10-17", activity: "Walking", energy: "Moderate" },
    { id: "w2", date: "2026-10-21", activity: "Stretching", energy: "Low" },
  ],
};

const navItems: { label: string; key: Section; icon: typeof Home }[] = [
  { label: "Home", key: "dashboard", icon: Home },
  { label: "Doctor Notes", key: "doctor-notes", icon: FileHeart },
  { label: "Nutrition", key: "nutrition", icon: Utensils },
  { label: "Teen Education", key: "education", icon: BookOpenText },
  { label: "Wellness", key: "wellness", icon: Dumbbell },
  { label: "Settings", key: "settings", icon: Settings },
];

const moodOptions: { label: Mood; emoji: string }[] = [
  { label: "Happy", emoji: "😊" },
  { label: "Neutral", emoji: "😐" },
  { label: "Sad", emoji: "😕" },
];

const flowOptions: Flow[] = ["Spotting", "Light", "Medium", "Heavy"];
const energyLevels = ["Low", "Moderate", "High"] as const;

function formatShortDate(dateValue: string) {
  if (!dateValue) return "—";
  const date = new Date(`${dateValue}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function getDifferenceInDays(start: string, end: string) {
  const from = new Date(`${start}T12:00:00`);
  const to = new Date(`${end}T12:00:00`);
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function getMonthGrid(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((leadingDays + lastDay.getDate()) / 7) * 7;
  const cells: Array<{ key: string; value: number; inCurrentMonth: boolean }> = [];

  for (let i = 0; i < totalCells; i += 1) {
    const dayNumber = i - leadingDays + 1;
    const cellDate = new Date(year, month, dayNumber);
    cells.push({
      key: cellDate.toISOString().slice(0, 10),
      value: cellDate.getDate(),
      inCurrentMonth: cellDate.getMonth() === month,
    });
  }

  return cells;
}

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [section, setSection] = useState<Section>("dashboard");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => todayKey());
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [symptomInput, setSymptomInput] = useState("");
  const [noteEditor, setNoteEditor] = useState({ id: "", title: "", content: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [appState, setAppState] = useState<AppState>(demoState);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AppState;
        setAppState(parsed);
      } catch {
        setAppState(demoState);
      }
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }
  }, [appState, hasHydrated]);

  const symptomCount = appState.symptoms.length;

  const activePeriod = useMemo(
    () => [...appState.periods].sort((a, b) => (a.startDate > b.startDate ? -1 : 1)).find((period) => !period.endDate),
    [appState.periods],
  );

  const latestPeriodStart = useMemo(
    () => [...appState.periods].sort((a, b) => (a.startDate > b.startDate ? -1 : 1))[0]?.startDate,
    [appState.periods],
  );

  const dayStatus = useMemo(() => {
    if (!latestPeriodStart) {
      return {
        title: "Add cycle dates to get an estimate.",
        detail: "Your history is still too short for a meaningful period estimate.",
      };
    }

    const daysSinceLast = getDifferenceInDays(latestPeriodStart, todayKey());

    if (appState.profile.cycleType === "regular") {
      return {
        title: `Your next period may begin around ${new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)}`,
        detail: "Based on your recent period history and a cautious estimate, not a medical prediction.",
      };
    }

    return {
      title: `Days since last recorded period: ${daysSinceLast}`,
      detail: "Log more dates to build a clearer window and look for patterns over time.",
    };
  }, [appState.periods, appState.profile.cycleType]);

  const monthDays = useMemo(() => getMonthGrid(calendarMonth), [calendarMonth]);
  const dailyRecord = appState.dailyLogs[selectedDate] ?? {};
  const notesForSelected = appState.notes.filter((note) => note.title.toLowerCase().includes("school") || true);

  const completeOnboarding = () => {
    setAppState((prev) => ({
      ...prev,
      profile: { ...prev.profile, onboardingCompleted: true },
    }));
    setScreen("app");
  };

  const handlePeriodToggle = () => {
    const currentDate = todayKey();
    const existingOpen = appState.periods.find((period) => !period.endDate);

    if (existingOpen) {
      setAppState((prev) => ({
        ...prev,
        periods: prev.periods.map((period) =>
          period.id === existingOpen.id ? { ...period, endDate: currentDate } : period,
        ),
      }));
      return;
    }

    setAppState((prev) => ({
      ...prev,
      periods: [{ id: crypto.randomUUID(), startDate: currentDate, endDate: null }, ...prev.periods],
    }));
  };

  const handleSymptomSubmit = () => {
    const trimmed = symptomInput.trim();
    if (!trimmed) return;

    const entry: SymptomEntry = { id: crypto.randomUUID(), date: selectedDate, text: trimmed };
    setAppState((prev) => ({ ...prev, symptoms: [entry, ...prev.symptoms] }));
    setSymptomInput("");
  };

  const handleMoodSelect = (mood: Mood) => {
    setAppState((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [selectedDate]: { ...prev.dailyLogs[selectedDate], mood },
      },
    }));
  };

  const handleFlowSelect = (flow: Flow) => {
    setAppState((prev) => ({
      ...prev,
      dailyLogs: {
        ...prev.dailyLogs,
        [selectedDate]: { ...prev.dailyLogs[selectedDate], flow },
      },
    }));
  };

  const handleExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: appState.profile,
      periods: appState.periods,
      symptoms: appState.symptoms,
      notes: appState.notes,
      dailyLogs: appState.dailyLogs,
      wellnessLogs: appState.wellnessLogs,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "omega-health-export.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAllData = () => {
    setAppState({
      profile: { ...initialProfile, preferredName: appState.profile.preferredName },
      periods: [],
      symptoms: [],
      dailyLogs: {},
      notes: [],
      wellnessLogs: [],
    });
    setDeleteDialogOpen(false);
  };

  const saveNote = () => {
    if (!noteEditor.title.trim() && !noteEditor.content.trim()) return;

    if (noteEditor.id) {
      setAppState((prev) => ({
        ...prev,
        notes: prev.notes.map((note) =>
          note.id === noteEditor.id
            ? {
                ...note,
                title: noteEditor.title.trim() || "Untitled note",
                content: noteEditor.content.trim(),
                updatedAt: new Date().toISOString(),
              }
            : note,
        ),
      }));
    } else {
      const created: Note = {
        id: crypto.randomUUID(),
        title: noteEditor.title.trim() || "Untitled note",
        content: noteEditor.content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAppState((prev) => ({ ...prev, notes: [created, ...prev.notes] }));
    }

    setNoteEditor({ id: "", title: "", content: "" });
  };

  const editNote = (note: Note) => {
    setNoteEditor({ id: note.id, title: note.title, content: note.content });
    setSection("doctor-notes");
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="rounded-[28px] bg-gradient-to-br from-omega-purple via-omega-purple to-omega-plum p-6 text-white shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Welcome</p>
            <h2 className="mt-2 text-3xl font-semibold">{`Hello, ${appState.profile.preferredName}!`}</h2>
          </div>
          <div className="rounded-full border border-white/20 bg-white/10 p-3">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 text-omega-lilac">
            <Heart className="h-5 w-5" />
            <span className="text-sm font-medium">Cycle status</span>
          </div>
          <p className="mt-3 text-xl font-semibold">{dayStatus.title}</p>
          <p className="mt-2 text-sm text-omega-lilac">{dayStatus.detail}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-[28px] border border-omega-lilac/60 bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-omega-purple">
              <CalendarRange className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Calendar</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                className="rounded-full border border-omega-lilac p-2 text-omega-purple"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[120px] text-center text-sm font-medium">
                {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(calendarMonth)}
              </span>
              <button
                type="button"
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                className="rounded-full border border-omega-lilac p-2 text-omega-purple"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium uppercase tracking-[0.15em] text-omega-slate">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {monthDays.map((day) => {
              const dateKey = day.key;
              const isSelected = dateKey === selectedDate;
              const isToday = dateKey === todayKey();
              const hasPeriod = appState.periods.some((period) => dateKey >= period.startDate && (!period.endDate || dateKey <= period.endDate));
              const hasDailyLog = Boolean(appState.dailyLogs[dateKey]);

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  className={`flex h-12 items-center justify-center rounded-2xl border text-sm font-medium transition ${
                    !day.inCurrentMonth ? "text-omega-slate/40" : "text-omega-ink"
                  } ${isSelected ? "border-omega-purple bg-omega-lavender text-omega-purple" : "border-transparent bg-omega-beige/70"} ${isToday ? "ring-2 ring-omega-seafoam" : ""} ${hasPeriod ? "shadow-inner bg-omega-seafoam/40" : ""}`}
                >
                  <span className="relative">
                    {day.value}
                    {hasDailyLog ? <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-omega-purple" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-omega-lilac/60 bg-white p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-omega-purple">{formatShortDate(selectedDate)}</h3>
            <button type="button" onClick={handlePeriodToggle} className="rounded-full bg-omega-purple px-3 py-2 text-xs font-semibold text-white">
              {activePeriod ? "Ended today" : "Started now"}
            </button>
          </div>

          <div className="rounded-2xl bg-omega-beige p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-omega-slate">Daily details</p>
            <div className="mt-3 space-y-2 text-sm text-omega-ink">
              <p>Flow: {dailyRecord.flow ?? "Not logged"}</p>
              <p>Mood: {dailyRecord.mood ?? "Not logged"}</p>
              <p>Symptoms: {appState.symptoms.filter((entry) => entry.date === selectedDate).length || 0} saved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[26px] border border-omega-lilac/60 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3 text-omega-purple">
            <Heart className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Mood</h3>
          </div>
          <div className="mt-4 flex gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => handleMoodSelect(option.label)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium ${
                  dailyRecord.mood === option.label ? "border-omega-purple bg-omega-lavender text-omega-purple" : "border-omega-lilac bg-omega-beige text-omega-ink"
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-omega-lilac/60 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3 text-omega-purple">
            <CalendarRange className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Flow</h3>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {flowOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleFlowSelect(option)}
                className={`rounded-2xl border px-3 py-2 text-sm font-medium ${
                  dailyRecord.flow === option ? "border-omega-purple bg-omega-lavender text-omega-purple" : "border-omega-lilac bg-omega-beige text-omega-ink"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[26px] border border-omega-lilac/60 bg-white p-4 shadow-soft">
          <div className="flex items-center gap-3 text-omega-purple">
            <NotebookPen className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Log symptoms</h3>
          </div>
          <textarea
            value={symptomInput}
            onChange={(event) => setSymptomInput(event.target.value)}
            placeholder="Feeling bloated and tired..."
            className="mt-4 min-h-24 w-full rounded-2xl border border-omega-lilac bg-omega-beige p-3 text-sm text-omega-ink outline-none ring-0 placeholder:text-omega-slate"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <button type="button" className="rounded-full border border-omega-lilac bg-white p-2 text-omega-purple" aria-label="Voice entry unavailable">
              <Mic className="h-4 w-4" />
            </button>
            <button type="button" onClick={handleSymptomSubmit} className="rounded-full bg-omega-purple px-4 py-2 text-sm font-semibold text-white">
              Save symptom
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-omega-lilac/60 bg-white p-4 shadow-soft">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-omega-purple">Quick history</h3>
          <div className="text-sm text-omega-slate">{symptomCount} symptom entries</div>
        </div>
        <div className="mt-4 space-y-3">
          {appState.symptoms.slice(0, 4).map((entry) => (
            <div key={entry.id} className="flex items-start justify-between gap-3 rounded-2xl bg-omega-beige p-3">
              <div>
                <p className="text-sm font-medium text-omega-ink">{entry.text}</p>
                <p className="mt-1 text-xs text-omega-slate">{formatShortDate(entry.date)}</p>
              </div>
              <button type="button" className="text-omega-purple">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDoctorNotes = () => (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Doctor notes</p>
        <h2 className="mt-2 text-3xl font-semibold">Prepare for your next appointment</h2>
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        {noteEditor.id || noteEditor.content || noteEditor.title ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1.4fr_0.6fr]">
              <input
                value={noteEditor.title}
                onChange={(event) => setNoteEditor((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Appointment note title"
                className="rounded-2xl border border-omega-lilac bg-omega-beige px-4 py-3 text-sm outline-none"
              />
              <button type="button" className="rounded-2xl border border-omega-lilac bg-white px-4 py-3 text-sm font-medium text-omega-purple">
                <span className="inline-flex items-center gap-2"><Mic className="h-4 w-4" /> Dictate</span>
              </button>
            </div>
            <textarea
              value={noteEditor.content}
              onChange={(event) => setNoteEditor((prev) => ({ ...prev, content: event.target.value }))}
              placeholder="Record symptoms, questions, and how it affects everyday life..."
              className="min-h-[220px] w-full rounded-2xl border border-omega-lilac bg-omega-beige p-4 text-sm outline-none"
            />
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={saveNote} className="inline-flex items-center gap-2 rounded-full bg-omega-purple px-4 py-2 text-sm font-semibold text-white">
                <Save className="h-4 w-4" /> Save note
              </button>
              <button type="button" onClick={() => setNoteEditor({ id: "", title: "", content: "" })} className="rounded-full border border-omega-lilac px-4 py-2 text-sm font-medium text-omega-ink">
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[26px] border border-dashed border-omega-lilac bg-omega-beige/60 p-8 text-center">
            <NotebookPen className="h-12 w-12 text-omega-purple" />
            <h3 className="mt-4 text-2xl font-semibold text-omega-ink">Get started</h3>
            <p className="mt-2 max-w-md text-sm text-omega-slate">Keep a private record of symptoms, questions, and concerns for your next appointment.</p>
            <button type="button" onClick={() => setNoteEditor({ id: "", title: "", content: "" })} className="mt-6 rounded-full bg-omega-purple px-5 py-3 text-sm font-semibold text-white">
              New note
            </button>
          </div>
        )}
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <h3 className="text-lg font-semibold text-omega-purple">Saved notes</h3>
        <div className="mt-4 space-y-3">
          {appState.notes.length ? (
            appState.notes.map((note) => (
              <div key={note.id} className="rounded-2xl bg-omega-beige p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-omega-ink">{note.title}</p>
                    <p className="text-xs text-omega-slate">Updated {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(note.updatedAt))}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => editNote(note)} className="rounded-full border border-omega-lilac p-2 text-omega-purple" aria-label="Edit note">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => setAppState((prev) => ({ ...prev, notes: prev.notes.filter((item) => item.id !== note.id) }))} className="rounded-full border border-omega-lilac p-2 text-omega-purple" aria-label="Delete note">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-omega-ink">{note.content}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-omega-slate">No notes saved yet.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderNutrition = () => (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Nutrition</p>
        <h2 className="mt-2 text-3xl font-semibold">Food and comfort support</h2>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-4">
          {[
            { title: "Iron-rich foods", text: "Beans, leafy greens, and lentils can help support a balanced diet.", icon: "🌿" },
            { title: "Stay hydrated", text: "Water and hydrating snacks can help during heavier days.", icon: "💧" },
            { title: "Balanced meals", text: "Pair carbs, protein, and fiber for steady energy.", icon: "🥗" },
            { title: "Nausea support", text: "Small, bland snacks may feel easier on rough days.", icon: "🍚" },
            { title: "School-day snacks", text: "Keep easy options ready for busy afternoons.", icon: "🥪" },
          ].map((item) => (
            <div key={item.title} className="w-72 rounded-[28px] bg-white p-5 shadow-soft">
              <div className="text-4xl">{item.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-omega-purple">{item.title}</h3>
              <p className="mt-2 text-sm text-omega-slate">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <h3 className="text-xl font-semibold text-omega-purple">Tips based on your symptoms</h3>
        {symptomCount >= 3 ? (
          <div className="mt-4 space-y-3">
            <p className="rounded-2xl bg-omega-seafoam/30 p-3 text-sm text-omega-ink">Try gentle, regular meals and keep a hydration routine when you notice bloating or fatigue.</p>
            <p className="rounded-2xl bg-omega-lavender p-3 text-sm text-omega-ink">Small, nourishing snacks can help on low-energy days without feeling overwhelming.</p>
            <p className="rounded-2xl bg-omega-beige p-3 text-sm text-omega-ink">When cramps are strong, a warm drink or a lighter meal may feel easier on your body.</p>
          </div>
        ) : (
          <div className="mt-4 rounded-[24px] bg-omega-beige p-5">
            <p className="text-base font-medium text-omega-ink">{symptomCount} of 3 entries added</p>
            <p className="mt-2 text-sm text-omega-slate">Log a few symptoms to unlock personalized nutrition guidance based on your history.</p>
            <button type="button" onClick={() => setSection("dashboard")} className="mt-4 rounded-full bg-omega-purple px-4 py-2 text-sm font-semibold text-white">Log symptoms</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Teen education</p>
        <h2 className="mt-2 text-3xl font-semibold">Clear information for everyday life</h2>
      </div>

      {[
        {
          title: "What’s happening to me?",
          body: "Menstruation is a normal part of puberty and the body’s cycle. Over time, your cycle may vary because hormones, stress, sleep, and other lifestyle factors can influence timing.",
        },
        {
          title: "Periods at school",
          body: "A small kit with pads, liners, and a few extra pair of underwear can make a big difference. If you start unexpectedly, tell a trusted adult or school nurse and take breaks when you need them.",
        },
        {
          title: "Pregnancy information",
          body: "Pregnancy can happen if sperm meets an egg during a fertile window. Reliable information, access to contraception, and trusted health guidance can all help you make informed choices.",
        },
      ].map((item) => (
        <div key={item.title} className="rounded-[28px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-semibold text-omega-purple">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-omega-ink">{item.body}</p>
        </div>
      ))}
    </div>
  );

  const renderWellness = () => (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Wellness</p>
        <h2 className="mt-2 text-3xl font-semibold">Comfort, recovery, and gentle support</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[
          { title: "Gentle stretching", icon: "🧘" },
          { title: "Yoga", icon: "🧘‍♀️" },
          { title: "Relaxation", icon: "🌿" },
          { title: "Rest and recovery", icon: "🛌" },
          { title: "Hydration", icon: "💧" },
          { title: "Self-care", icon: "✨" },
        ].map((item) => (
          <div key={item.title} className="rounded-[28px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
            <div className="text-4xl">{item.icon}</div>
            <h3 className="mt-3 text-lg font-semibold text-omega-purple">{item.title}</h3>
          </div>
        ))}
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <h3 className="text-xl font-semibold text-omega-purple">Activity and energy</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-omega-slate">Suggested activity</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Walking', 'Stretching', 'Yoga', 'Sports', 'Rest'].map((activity) => (
                <button key={activity} type="button" className="rounded-full border border-omega-lilac bg-omega-beige px-3 py-2 text-sm text-omega-ink">
                  {activity}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-omega-slate">Energy level</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {energyLevels.map((level) => (
                <button key={level} type="button" className="rounded-full border border-omega-lilac bg-omega-lavender px-3 py-2 text-sm text-omega-ink">
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold">Your privacy and preferences</h2>
      </div>

      <div className="space-y-4 rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-omega-beige p-4">
          <div>
            <p className="text-sm font-semibold text-omega-ink">Preferred name</p>
            <p className="text-sm text-omega-slate">{appState.profile.preferredName}</p>
          </div>
          <input
            value={appState.profile.preferredName}
            onChange={(event) => setAppState((prev) => ({ ...prev, profile: { ...prev.profile, preferredName: event.target.value } }))}
            className="rounded-xl border border-omega-lilac bg-white px-3 py-2 text-sm outline-none"
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-omega-beige p-4">
          <div>
            <p className="text-sm font-semibold text-omega-ink">Cycle type</p>
            <p className="text-sm text-omega-slate">{appState.profile.cycleType}</p>
          </div>
          <select
            value={appState.profile.cycleType}
            onChange={(event) => setAppState((prev) => ({ ...prev, profile: { ...prev.profile, cycleType: event.target.value as CycleType } }))}
            className="rounded-xl border border-omega-lilac bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="regular">Regular</option>
            <option value="irregular">Irregular</option>
            <option value="not-sure">Not sure</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl bg-omega-beige p-4">
          <div>
            <p className="text-sm font-semibold text-omega-ink">AI consent</p>
            <p className="text-sm text-omega-slate">Opt in for future assistant support.</p>
          </div>
          <button
            type="button"
            onClick={() => setAppState((prev) => ({ ...prev, profile: { ...prev.profile, aiConsent: !prev.profile.aiConsent } }))}
            className={`rounded-full px-4 py-2 text-sm font-medium ${appState.profile.aiConsent ? "bg-omega-purple text-white" : "bg-white text-omega-purple"}`}
          >
            {appState.profile.aiConsent ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="rounded-2xl bg-omega-beige p-4">
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-full bg-omega-purple px-4 py-2 text-sm font-semibold text-white">
            <Download className="h-4 w-4" /> Export my data
          </button>
        </div>

        <div className="rounded-2xl bg-red-50 p-4">
          <button type="button" onClick={() => setDeleteDialogOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white">
            <Trash2 className="h-4 w-4" /> Delete all data
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case "doctor-notes":
        return renderDoctorNotes();
      case "nutrition":
        return renderNutrition();
      case "education":
        return renderEducation();
      case "wellness":
        return renderWellness();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  const onboardingQuestions = [
    {
      title: "Welcome",
      body: "Omega Health can be personalized to how your cycle feels and fits into your weekly rhythm.",
      input: null,
    },
    {
      title: "Basic information",
      body: "Tell us a little about you so the app feels personal.",
      input: "age",
    },
    {
      title: "How would you describe your cycle?",
      body: "This helps us shape your dashboard without forcing a regular pattern.",
      input: "cycleType",
    },
    {
      title: "Recent period history",
      body: "Add the dates you remember so your history is more useful.",
      input: "history",
    },
    {
      title: "You're all set",
      body: "Your health journey starts here.",
      input: null,
    },
  ];

  const onboardingPage = (
    <div className="min-h-screen bg-omega-beige px-4 py-8">
      <div className="mx-auto max-w-2xl rounded-[38px] bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-omega-purple p-3 text-white">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-omega-slate">Omega Health</p>
              <p className="text-lg font-semibold text-omega-ink">Onboarding</p>
            </div>
          </div>
          <span className="text-sm text-omega-slate">{onboardingStep + 1}/5</span>
        </div>

        <div className="mb-8 h-2 rounded-full bg-omega-beige">
          <div className="h-2 rounded-full bg-omega-purple" style={{ width: `${((onboardingStep + 1) / 5) * 100}%` }} />
        </div>

        <div className="space-y-5">
          <h2 className="text-3xl font-semibold text-omega-ink">{onboardingQuestions[onboardingStep].title}</h2>
          <p className="text-base text-omega-slate">{onboardingQuestions[onboardingStep].body}</p>

          {onboardingStep === 1 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-omega-ink">
                Preferred name
                <input
                  value={appState.profile.preferredName}
                  onChange={(event) => setAppState((prev) => ({ ...prev, profile: { ...prev.profile, preferredName: event.target.value } }))}
                  className="mt-2 w-full rounded-2xl border border-omega-lilac bg-omega-beige px-4 py-3 outline-none"
                />
              </label>
              <label className="block text-sm font-medium text-omega-ink">
                Age
                <input
                  type="number"
                  min={10}
                  max={25}
                  value={appState.profile.age || ""}
                  onChange={(event) => setAppState((prev) => ({ ...prev, profile: { ...prev.profile, age: Number(event.target.value) || 0 } }))}
                  className="mt-2 w-full rounded-2xl border border-omega-lilac bg-omega-beige px-4 py-3 outline-none"
                />
              </label>
            </div>
          )}

          {onboardingStep === 2 && (
            <div className="grid gap-3 md:grid-cols-3">
              {(["regular", "irregular", "not-sure"] as CycleType[]).map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setAppState((prev) => ({ ...prev, profile: { ...prev.profile, cycleType: type } }))}
                  className={`rounded-[24px] border p-4 text-left ${appState.profile.cycleType === type ? "border-omega-purple bg-omega-lavender text-omega-purple" : "border-omega-lilac bg-omega-beige text-omega-ink"}`}
                >
                  <p className="text-lg font-semibold capitalize">{type === "not-sure" ? "Not sure" : type}</p>
                  <p className="mt-2 text-sm opacity-80">
                    {type === "regular" && "You usually track a predictable pattern."}
                    {type === "irregular" && "Your cycle timing can vary from month to month."}
                    {type === "not-sure" && "You want flexible tracking without assuming a pattern."}
                  </p>
                </button>
              ))}
            </div>
          )}

          {onboardingStep === 3 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-omega-ink">
                Most recent period start date
                <input
                  type="date"
                  value={appState.periods[0]?.startDate ?? ""}
                  onChange={(event) => setAppState((prev) => ({ ...prev, periods: [{ id: crypto.randomUUID(), startDate: event.target.value, endDate: null }, ...prev.periods] }))}
                  className="mt-2 w-full rounded-2xl border border-omega-lilac bg-omega-beige px-4 py-3 outline-none"
                />
              </label>
              <p className="text-sm text-omega-slate">You can add or adjust details later from the dashboard.</p>
            </div>
          )}

          {onboardingStep === 4 && (
            <div className="space-y-4 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-omega-seafoam" />
              <p className="text-xl font-semibold text-omega-ink">You are all set!</p>
              <p className="text-sm text-omega-slate">Your health journey starts here.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setOnboardingStep((current) => Math.max(0, current - 1))}
            className="rounded-full border border-omega-lilac px-4 py-2 text-sm font-medium text-omega-ink"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              if (onboardingStep === 4) {
                completeOnboarding();
                return;
              }
              setOnboardingStep((current) => Math.min(4, current + 1));
            }}
            className="inline-flex items-center gap-2 rounded-full bg-omega-purple px-5 py-3 text-sm font-semibold text-white"
          >
            {onboardingStep === 4 ? "Go to my dashboard" : "Next"}
            {onboardingStep !== 4 ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </div>
      </div>
    </div>
  );

  if (screen === "welcome") {
    return (
      <main className="min-h-screen bg-omega-beige px-4 py-8 text-omega-ink">
        <div className="mx-auto max-w-6xl rounded-[40px] bg-[#fffaf4] p-5 shadow-soft md:p-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-omega-purple p-3 text-white">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-omega-slate">Omega Health</p>
                <p className="text-sm font-medium text-omega-purple">Your cycle. Your pace. Your health.</p>
              </div>
            </div>
            <button type="button" onClick={() => setScreen("auth")} className="rounded-full border border-omega-lilac bg-white px-4 py-2 text-sm font-medium text-omega-purple">
              Sign in
            </button>
          </header>

          <section className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-omega-plum">Teen-friendly wellness</p>
              <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight text-omega-ink">Track your cycle, understand your patterns, and feel more prepared.</h1>
              <p className="mt-5 max-w-lg text-lg text-omega-slate">
                Omega Health brings period tracking, symptom awareness, and gentle education together in one caring daily space.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <button type="button" onClick={() => setScreen("auth")} className="rounded-full bg-omega-purple px-6 py-3 text-base font-semibold text-white shadow-soft">
                  Get Started
                </button>
                <button type="button" onClick={() => setScreen("app")} className="rounded-full border border-omega-lilac bg-white px-6 py-3 text-base font-semibold text-omega-purple">
                  Preview dashboard
                </button>
              </div>
            </div>

            <div className="relative rounded-[32px] bg-gradient-to-br from-omega-lavender via-omega-beige to-omega-seafoam p-5 shadow-soft">
              <div className="rounded-[30px] bg-white/80 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-omega-slate">Today</p>
                    <p className="mt-2 text-2xl font-semibold text-omega-ink">{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date())}</p>
                  </div>
                  <div className="rounded-full bg-omega-seafoam p-3 text-omega-purple">
                    <SunMedium className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm text-omega-ink">
                  <div className="flex items-center justify-between rounded-2xl bg-omega-lavender p-3">
                    <span>Cycle status</span>
                    <span className="font-semibold">Tracking</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-omega-beige p-3">
                    <span>Mood</span>
                    <span className="text-2xl">😐</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-omega-beige p-3">
                    <span>Flow</span>
                    <span className="font-semibold">Light</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (screen === "auth") {
    return (
      <main className="min-h-screen bg-omega-beige px-4 py-8">
        <div className="mx-auto max-w-md rounded-[32px] bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-omega-purple p-3 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-omega-slate">Welcome back</p>
                <h2 className="text-2xl font-semibold text-omega-ink">Sign in</h2>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-omega-ink">
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-omega-lilac bg-omega-beige px-4 py-3 text-sm outline-none"
                placeholder="you@example.com"
              />
            </label>
            <label className="block text-sm font-medium text-omega-ink">
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-omega-lilac bg-omega-beige px-4 py-3 text-sm outline-none"
                placeholder="••••••••"
              />
            </label>
          </div>

          <button type="button" onClick={() => setScreen("onboarding")} className="mt-6 w-full rounded-full bg-omega-purple px-5 py-3 text-base font-semibold text-white">
            Continue to onboarding
          </button>
          <button type="button" onClick={() => setScreen("welcome")} className="mt-3 w-full rounded-full border border-omega-lilac bg-white px-5 py-3 text-base font-semibold text-omega-purple">
            Back
          </button>
        </div>
      </main>
    );
  }

  if (screen === "onboarding") {
    return onboardingPage;
  }

  return (
    <main className="min-h-screen bg-omega-beige px-3 py-4 text-omega-ink md:px-6">
      <div className="mx-auto flex max-w-7xl gap-4">
        <aside className="hidden min-h-[calc(100vh-2rem)] w-72 rounded-[30px] bg-omega-purple p-5 text-white shadow-soft lg:block">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-omega-lilac">Omega</p>
              <p className="text-xl font-semibold">Health</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map(({ label, key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium ${section === key ? "bg-white/10 text-white" : "text-omega-lilac"}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-5">
            <button type="button" onClick={() => setDeleteDialogOpen(true)} className="flex w-full items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-left text-sm font-medium text-red-100">
              <Trash2 className="h-4 w-4" />
              Delete all data
            </button>
          </div>
        </aside>

        <div className="flex-1 rounded-[30px] bg-[#fffaf5] p-4 shadow-soft md:p-6">
          <header className="flex items-center justify-between gap-3 border-b border-omega-lilac/60 pb-4">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-full border border-omega-lilac bg-white p-2 lg:hidden">
                <Menu className="h-5 w-5 text-omega-purple" />
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-omega-slate">Dashboard</p>
                <h1 className="mt-1 text-2xl font-semibold text-omega-ink">{`Welcome, ${appState.profile.preferredName}!`}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-full border border-omega-lilac bg-white p-2 text-omega-purple">
                <Bell className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setScreen("welcome")} className="rounded-full border border-omega-lilac bg-white px-3 py-2 text-sm font-medium text-omega-purple">Sign out</button>
            </div>
          </header>

          <div className="mt-6 pb-20 lg:pb-6">{renderContent()}</div>

          <nav className="fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 gap-2 rounded-[24px] border border-omega-lilac/60 bg-white/90 p-2 shadow-soft backdrop-blur-md lg:hidden">
            {[
              { label: "Home", key: "dashboard", icon: Home },
              { label: "Notes", key: "doctor-notes", icon: NotebookPen },
              { label: "Nutrition", key: "nutrition", icon: Utensils },
              { label: "Wellness", key: "wellness", icon: Dumbbell },
            ].map(({ label, key, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setSection(key as Section)} className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium ${section === key ? "bg-omega-purple text-white" : "text-omega-slate"}`}>
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {deleteDialogOpen ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-omega-ink/40 p-4">
          <div className="w-full max-w-md rounded-[30px] bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-omega-ink">Delete all data</h3>
              <button type="button" onClick={() => setDeleteDialogOpen(false)} className="rounded-full border border-omega-lilac p-2 text-omega-purple">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-omega-slate">
              This will permanently remove your profile information, period records, symptoms, mood logs, flow logs, wellness entries, and doctor notes.
            </p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setDeleteDialogOpen(false)} className="flex-1 rounded-full border border-omega-lilac bg-white px-4 py-3 text-sm font-medium text-omega-ink">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteAllData} className="flex-1 rounded-full bg-red-600 px-4 py-3 text-sm font-semibold text-white">
                Delete all data
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
