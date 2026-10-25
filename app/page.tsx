"use client";

import { Dancing_Script } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import homeTypography from "./home-typography.module.css";
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

const homeScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-home-script",
});

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
  activity?: string;
  energy?: "Low" | "Moderate" | "High";
  note?: string;
}

type WellnessTopic =
  | "gentle-stretching"
  | "yoga"
  | "relaxation"
  | "rest-recovery"
  | "hydration";

const wellnessTopicConfig: Record<
  WellnessTopic,
  {
    title: string;
    emoji: string;
    intro: string;
    sections: { title: string; body: string }[];
  }
> = {
  "gentle-stretching": {
    title: "Gentle Stretching",
    emoji: "🧘",
    intro: "Simple, gentle movements can help some people feel more comfortable and relaxed.",
    sections: [
      {
        title: "Why gentle stretching may feel helpful",
        body: "Gentle movement can help some people ease tension in the shoulders, back, and hips. It may feel calming when you want a slow reset without pushing your body too hard.",
      },
      {
        title: "Simple stretches for beginners",
        body: "Try shoulder rolls, relaxed neck turns, and a seated side stretch. Keep the motion small and comfortable. You are not aiming for intensity; the goal is to feel supported and at ease.",
      },
      {
        title: "A short, optional routine",
        body: "Sit or stand tall. Roll your shoulders backward 5 times, gently turn your head side to side, then reach one arm overhead and lean slightly to the other side. Repeat slowly and stop if anything feels uncomfortable.",
      },
      {
        title: "Tips for moving comfortably",
        body: "Breathe steadily, keep your range of motion easy, and pause whenever you need to. Offer yourself rest instead of pushing through discomfort.",
      },
      {
        title: "When to stop or modify a movement",
        body: "Stop or ease off if you feel pain, dizziness, pressure, or anything that does not feel comfortable. You do not need to stretch if you feel unwell or if movement is not feeling right for your body today.",
      },
    ],
  },
  yoga: {
    title: "Yoga & Gentle Movement",
    emoji: "🧘‍♀️",
    intro: "Yoga can offer an opportunity to slow down, stretch comfortably, and focus on breathing.",
    sections: [
      {
        title: "Benefits of gentle movement",
        body: "Gentle movement can help you settle your body, support mindful breathing, and create a little space to reset during a busy day.",
      },
      {
        title: "Beginner-friendly poses",
        body: "Try a seated cat-cow stretch, a gentle child’s pose using a cushion or folded blanket, or a supported standing stretch. Choose poses that feel easy and unforced.",
      },
      {
        title: "A short, optional sequence",
        body: "Start with a few slow breaths. Then try a seated twist, a standing side stretch, and a forward fold with a soft bend in the knees. Finish by resting in a comfortable seated position.",
      },
      {
        title: "Simple breathing guidance",
        body: "Inhale slowly through your nose, then exhale for a little longer than you inhale. Let breathing stay easy and unhurried.",
      },
      {
        title: "Ways to adapt movements for comfort",
        body: "Use a chair, stay seated, take extra breaks, or skip any pose that feels too intense. Rest is a completely valid choice.",
      },
    ],
  },
  relaxation: {
    title: "Relaxation",
    emoji: "🌿",
    intro: "Taking a short pause can help you create space to unwind during a busy day.",
    sections: [
      {
        title: "Simple ways to relax",
        body: "Put your feet on the floor, lower your shoulders, and take a moment to notice what your body is doing. Small changes can make a big difference when you feel overloaded.",
      },
      {
        title: "A brief guided breathing exercise",
        body: "Breathe in for 4 counts, hold gently for 1, and breathe out for 6 counts. Repeat 4 to 6 times, or keep going at your own pace.",
      },
      {
        title: "A short grounding exercise",
        body: "Name 3 things you can see, 2 things you can feel, and 1 thing you can hear. This can help bring your attention back to the present moment.",
      },
      {
        title: "Relaxation ideas for school or home",
        body: "Listen to one quiet song, dim the lights, or step outside for a minute. Try a short reset between classes, tasks, or homework.",
      },
      {
        title: "Creating a calm environment",
        body: "A comfy blanket, a clean corner, or a calming playlist can make a rest break feel easier to settle into. Keep it simple and personal.",
      },
    ],
  },
  "rest-recovery": {
    title: "Rest & Recovery",
    emoji: "🛌",
    intro: "Rest is a valid part of taking care of yourself. You do not have to be productive all the time.",
    sections: [
      {
        title: "Recognizing when you might need a break",
        body: "If you feel tired, overstimulated, achy, or low on focus, it may be a good time to slow down. A break is not a failure; it is a healthy response.",
      },
      {
        title: "Creating a comfortable resting environment",
        body: "Dim the lights, grab a blanket, adjust the temperature, and keep your space quiet enough that you can unwind. A comfortable setup can make rest easier to access.",
      },
      {
        title: "Simple ways to make a busy day easier",
        body: "A short pause between school tasks, a snack, or a few minutes away from screens can help your body reset. You do not need a perfect routine to benefit from rest.",
      },
      {
        title: "General sleep-supportive habits",
        body: "Keeping a regular wind-down, limiting screens close to bedtime, and making your sleep space feel calm can support better rest over time.",
      },
      {
        title: "Balancing activities with rest",
        body: "The goal is not perfection. It is about noticing when your body needs a reset and giving yourself permission to recover without guilt.",
      },
    ],
  },
  hydration: {
    title: "Hydration & Self-Care",
    emoji: "💧",
    intro: "Small, practical habits can help you take care of yourself throughout the day.",
    sections: [
      {
        title: "Remembering to drink throughout the day",
        body: "Try keeping a water bottle nearby and sipping regularly instead of waiting until you feel very thirsty. Small, steady habits tend to feel more realistic.",
      },
      {
        title: "Keeping a water bottle nearby",
        body: "A bottle in your backpack, desk, or bedside table makes hydration easier to keep up with during school, sports, or study time.",
      },
      {
        title: "General hydration guidance",
        body: "Your needs may vary based on the weather, how active you are, and how your body feels. The goal is consistency and comfort, not strict rules.",
      },
      {
        title: "Simple personal comfort ideas",
        body: "Pack a lip balm, keep a snack in your bag, or bring a comfort item for the day. Small self-care habits can make a routine feel more manageable.",
      },
      {
        title: "Preparing a small self-care kit",
        body: "A reusable water bottle, tissues, a spare pair of underwear, a snack, and a small comfort item can help you feel more prepared during busy days.",
      },
    ],
  },
};

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

function formatNoteDate(dateValue: string) {
  const date = new Date(dateValue);
  if (!dateValue || Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatHomeDate(dateValue: string) {
  if (!dateValue) return "—";
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";

  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

function getAverageCycleLength(periods: PeriodRecord[]) {
  const sortedDates = [...periods]
    .map((period) => period.startDate)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (sortedDates.length < 2) return null;

  const cycleLengths = [] as number[];
  for (let index = 1; index < sortedDates.length; index += 1) {
    const previous = new Date(`${sortedDates[index - 1]}T12:00:00`).getTime();
    const current = new Date(`${sortedDates[index]}T12:00:00`).getTime();
    const length = Math.round((current - previous) / 86400000);
    if (length > 0) {
      cycleLengths.push(length);
    }
  }

  if (cycleLengths.length === 0) return null;

  const average = cycleLengths.reduce((total, length) => total + length, 0) / cycleLengths.length;
  return Number.isFinite(average) && average > 0 ? average : null;
}

function getPredictedNextPeriodDate(periods: PeriodRecord[]) {
  const sorted = [...periods]
    .filter((period) => Boolean(period.startDate))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  if (sorted.length === 0) return null;

  const lastStart = sorted[sorted.length - 1];
  const averageCycleLength = getAverageCycleLength(sorted);
  if (!averageCycleLength) return null;

  let predicted = new Date(`${lastStart.startDate}T12:00:00`);
  predicted = new Date(predicted.getTime() + averageCycleLength * 86400000);

  const today = new Date(`${todayKey()}T12:00:00`);
  while (predicted.getTime() <= today.getTime()) {
    predicted = new Date(predicted.getTime() + averageCycleLength * 86400000);
  }

  return predicted;
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
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const noteSaveInProgress = useRef(false);
  const [doctorNotesMenuOpen, setDoctorNotesMenuOpen] = useState(false);
  const [doctorNotesNotificationsOpen, setDoctorNotesNotificationsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [appState, setAppState] = useState<AppState>(demoState);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [wellnessTopic, setWellnessTopic] = useState<WellnessTopic | null>(null);
  const [wellnessPanel, setWellnessPanel] = useState<"overview" | "activity" | "energy">("overview");
  const [activityForm, setActivityForm] = useState({
    date: todayKey(),
    activity: "",
    customActivity: "",
    note: "",
    editingId: "",
  });
  const [activityError, setActivityError] = useState("");
  const [activitySuccessMessage, setActivitySuccessMessage] = useState("");
  const [energyForm, setEnergyForm] = useState({
    date: todayKey(),
    level: "Moderate" as WellnessEntry["energy"],
    editingId: "",
  });
  const [energyError, setEnergyError] = useState("");
  const [energySuccessMessage, setEnergySuccessMessage] = useState("");

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

  const periodSummary = useMemo(() => {
    const predictedDate = getPredictedNextPeriodDate(appState.periods);

    if (!predictedDate) {
      return {
        title: "Add your period dates to see your prediction.",
        subtitle: "Predicted start",
        date: "—",
        detail: "Log a few recent period starts to estimate your next cycle more accurately.",
        daysUntil: null,
      };
    }

    const today = new Date(`${todayKey()}T12:00:00`);
    const daysUntil = Math.max(0, Math.round((predictedDate.getTime() - today.getTime()) / 86400000));

    return {
      title: daysUntil === 0 ? "Period today" : `Period in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`,
      subtitle: "Predicted start",
      date: formatHomeDate(dateKeyFromDate(predictedDate)),
      detail: "Based on your recent period history and a cautious estimate, not a medical prediction.",
      daysUntil,
    };
  }, [appState.periods]);

  const monthDays = useMemo(() => getMonthGrid(calendarMonth), [calendarMonth]);
  const dailyRecord = appState.dailyLogs[selectedDate] ?? {};
  const notesForSelected = appState.notes.filter((note) => note.title.toLowerCase().includes("school") || true);
  const activityHistory = useMemo(
    () =>
      [...appState.wellnessLogs]
        .filter((entry) => Boolean(entry.activity))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [appState.wellnessLogs],
  );
  const energyHistory = useMemo(
    () =>
      [...appState.wellnessLogs]
        .filter((entry) => Boolean(entry.energy))
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [appState.wellnessLogs],
  );

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

  const resetActivityForm = (date = todayKey()) => {
    setActivityForm({ date, activity: "", customActivity: "", note: "", editingId: "" });
    setActivityError("");
  };

  const resetEnergyForm = (date = todayKey()) => {
    setEnergyForm({ date, level: "Moderate", editingId: "" });
    setEnergyError("");
  };

  const handleActivitySave = () => {
    const selectedActivity = activityForm.activity === "Other" ? activityForm.customActivity.trim() : activityForm.activity.trim();
    if (!selectedActivity) {
      setActivityError("Choose an activity or enter one for Other before saving.");
      return;
    }

    const entryId = activityForm.editingId || crypto.randomUUID();
    const newEntry: WellnessEntry = {
      id: entryId,
      date: activityForm.date,
      activity: selectedActivity,
      note: activityForm.note.trim() || undefined,
    };

    setAppState((prev) => ({
      ...prev,
      wellnessLogs: [
        ...prev.wellnessLogs.filter((entry) => !(entry.activity && entry.date === activityForm.date && entry.id !== entryId)),
        newEntry,
      ],
    }));

    const message = `Saved ${selectedActivity} for ${formatShortDate(activityForm.date)}.`;
    setActivitySuccessMessage(message);
    setActivityError("");
    resetActivityForm(activityForm.date);
  };

  const handleEnergySave = () => {
    if (!energyForm.level) {
      setEnergyError("Select a current energy level before saving.");
      return;
    }

    const entryId = energyForm.editingId || crypto.randomUUID();
    const newEntry: WellnessEntry = {
      id: entryId,
      date: energyForm.date,
      energy: energyForm.level,
    };

    setAppState((prev) => {
      const filteredEntries = prev.wellnessLogs.filter((entry) => entry.id !== entryId && !(entry.energy && entry.date === energyForm.date));
      return { ...prev, wellnessLogs: [...filteredEntries, newEntry] };
    });

    const message = `Saved ${energyForm.level} energy for ${formatShortDate(energyForm.date)}.`;
    setEnergySuccessMessage(message);
    setEnergyError("");
    resetEnergyForm(energyForm.date);
  };

  const handleActivityDelete = (entryId: string) => {
    setAppState((prev) => ({
      ...prev,
      wellnessLogs: prev.wellnessLogs.filter((entry) => entry.id !== entryId),
    }));
  };

  const handleEnergyDelete = (entryId: string) => {
    setAppState((prev) => ({
      ...prev,
      wellnessLogs: prev.wellnessLogs.filter((entry) => entry.id !== entryId),
    }));
  };

  const hasUnsavedNoteChanges = () => {
    if (noteEditor.id) {
      const savedNote = appState.notes.find((note) => note.id === noteEditor.id);
      return !savedNote || noteEditor.title !== savedNote.title || noteEditor.content !== savedNote.content;
    }
    return noteEditor.title.length > 0 || noteEditor.content.length > 0;
  };

  const closeNoteEditor = () => {
    if (hasUnsavedNoteChanges() && !window.confirm("Discard your unsaved note changes?")) return;
    setNoteEditor({ id: "", title: "", content: "" });
    setNoteEditorOpen(false);
    setNoteError("");
  };

  const startNewNote = () => {
    setNoteEditor({ id: "", title: "", content: "" });
    setNoteError("");
    setNoteEditorOpen(true);
  };

  const saveNote = () => {
    if (noteSaveInProgress.current) return;
    const title = noteEditor.title.trim();
    const content = noteEditor.content.trim();

    if (!title || !content) {
      setNoteError("Add a title and note content before saving.");
      return;
    }

    if (noteEditor.id && !appState.notes.some((note) => note.id === noteEditor.id)) {
      setNoteError("This saved note is no longer available. Reopen the notes list and try again.");
      return;
    }

    noteSaveInProgress.current = true;
    setIsSavingNote(true);
    const timestamp = new Date().toISOString();
    const nextNotes = noteEditor.id
      ? appState.notes.map((note) =>
          note.id === noteEditor.id ? { ...note, title, content, updatedAt: timestamp } : note,
        )
      : [{ id: crypto.randomUUID(), title, content, createdAt: timestamp, updatedAt: timestamp }, ...appState.notes];
    const nextState = { ...appState, notes: nextNotes };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      setAppState(nextState);
      setNoteEditor({ id: "", title: "", content: "" });
      setNoteEditorOpen(false);
      setNoteError("");
    } catch {
      setNoteError("Your note could not be saved. Check your device storage and try again.");
    } finally {
      noteSaveInProgress.current = false;
      setIsSavingNote(false);
    }
  };

  const editNote = (note: Note) => {
    if (noteEditorOpen && hasUnsavedNoteChanges() && !window.confirm("Discard your unsaved note changes?")) return;
    setNoteEditor({ id: note.id, title: note.title, content: note.content });
    setNoteError("");
    setNoteEditorOpen(true);
    setSection("doctor-notes");
  };

  const renderDashboard = () => (
    <div className={`${homeScript.variable} ${homeTypography.page} space-y-6`}>
      <div className="rounded-[30px] border border-omega-lilac/60 bg-[#f4edf9] p-5 shadow-soft md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.26em] text-omega-plum">Today</p>
            <h2 className={`${homeTypography.greeting} mt-3 text-4xl font-semibold tracking-[-0.04em] text-omega-ink md:text-5xl`}>{`Hello, ${appState.profile.preferredName}!`}</h2>
            <p className="mt-2 text-sm text-omega-slate">{formatHomeDate(todayKey())}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm text-omega-purple shadow-soft">
            <Sparkles className="h-4 w-4" />
            <span>Gentle check-in</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[26px] border border-omega-lilac/80 bg-white/80 p-5 shadow-soft backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-omega-slate">Period countdown</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-omega-ink md:text-4xl">{periodSummary.title}</p>
              </div>
              <div className="rounded-full bg-omega-lavender px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-omega-purple">
                {periodSummary.daysUntil === null ? "Est." : `${periodSummary.daysUntil}d`}
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3 border-t border-omega-lilac/80 pt-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-omega-slate">{periodSummary.subtitle}</p>
                <p className="mt-2 text-2xl font-semibold text-omega-purple">{periodSummary.date}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-omega-seafoam/60 text-omega-purple">
                <Heart className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-[26px] bg-omega-purple p-5 text-white shadow-soft">
            <p className="text-[11px] uppercase tracking-[0.2em] text-omega-lilac">Cycle status</p>
            <p className={`${homeTypography.heading} mt-3 text-2xl font-semibold tracking-[-0.04em]`}>{appState.profile.cycleType === "regular" ? "Regular rhythm" : appState.profile.cycleType === "irregular" ? "Flexible rhythm" : "Pattern in progress"}</p>
            <p className="mt-3 text-sm leading-6 text-omega-lilac">{periodSummary.detail}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
        <div className="rounded-[28px] border border-omega-lilac/60 bg-white p-4 shadow-soft md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
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
              <span className="min-w-[120px] text-center text-sm font-medium text-omega-ink">
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

          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-omega-slate">
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
                  } ${isSelected ? "border-omega-purple bg-omega-lavender text-omega-purple" : "border-transparent bg-omega-beige/70"} ${isToday ? "ring-2 ring-omega-seafoam" : ""} ${hasPeriod ? "bg-omega-seafoam/35 shadow-inner" : ""}`}
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

        <div className="space-y-4 rounded-[28px] border border-omega-lilac/60 bg-white p-4 shadow-soft md:p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className={`${homeTypography.bodyText} text-lg font-semibold text-omega-purple`}>{formatHomeDate(selectedDate)}</h3>
            <button type="button" onClick={handlePeriodToggle} className="rounded-full bg-omega-purple px-3 py-2 text-xs font-semibold text-white">
              {activePeriod ? "Ended today" : "Started now"}
            </button>
          </div>

          <div className="rounded-[22px] bg-omega-beige p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] text-omega-slate">Daily details</p>
            <div className="mt-3 space-y-2 text-sm text-omega-ink">
              <p><span className="font-medium">Flow:</span> {dailyRecord.flow ?? "Not logged"}</p>
              <p><span className="font-medium">Mood:</span> {dailyRecord.mood ?? "Not logged"}</p>
              <p><span className="font-medium">Symptoms:</span> {appState.symptoms.filter((entry) => entry.date === selectedDate).length || 0} saved</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
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
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-omega-purple">Quick history</h3>
          <div className="text-sm text-omega-slate">{symptomCount} symptom entries</div>
        </div>
        <div className="mt-4 space-y-3">
          {appState.symptoms.slice(0, 4).map((entry) => (
            <div key={entry.id} className="flex items-start justify-between gap-3 rounded-2xl bg-omega-beige p-3">
              <div>
                <p className="text-sm font-medium text-omega-ink">{entry.text}</p>
                <p className="mt-1 text-xs text-omega-slate">{formatHomeDate(entry.date)}</p>
              </div>
              <button type="button" className="text-omega-purple" aria-label={`Edit symptom from ${formatHomeDate(entry.date)}`}>
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
        {noteEditorOpen ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-omega-purple">{noteEditor.id ? "Edit note" : "New note"}</h3>
              <button type="button" onClick={closeNoteEditor} className="rounded-full border border-omega-lilac p-2 text-omega-purple" aria-label="Close note editor">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="block text-sm font-medium text-omega-ink">
              Title
              <input
                value={noteEditor.title}
                onChange={(event) => {
                  setNoteEditor((prev) => ({ ...prev, title: event.target.value }));
                  setNoteError("");
                }}
                placeholder="Appointment note title"
                className="mt-2 w-full rounded-2xl border border-omega-lilac bg-omega-beige px-4 py-3 text-sm outline-none"
              />
            </label>
            <label className="block text-sm font-medium text-omega-ink">
              Note
              <textarea
                value={noteEditor.content}
                onChange={(event) => {
                  setNoteEditor((prev) => ({ ...prev, content: event.target.value }));
                  setNoteError("");
                }}
                placeholder="Record symptoms, questions, and how it affects everyday life..."
                className="mt-2 min-h-[220px] w-full rounded-2xl border border-omega-lilac bg-omega-beige p-4 text-sm outline-none"
              />
            </label>
            {noteError ? <p role="alert" className="text-sm text-red-700">{noteError}</p> : null}
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={saveNote} disabled={isSavingNote} className="inline-flex items-center gap-2 rounded-full bg-omega-purple px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                <Save className="h-4 w-4" /> {isSavingNote ? "Saving..." : "Save Note"}
              </button>
              <button type="button" onClick={closeNoteEditor} className="rounded-full border border-omega-lilac px-4 py-2 text-sm font-medium text-omega-ink">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[26px] border border-dashed border-omega-lilac bg-omega-beige/60 p-8 text-center">
            <NotebookPen className="h-12 w-12 text-omega-purple" />
            <h3 className="mt-4 text-2xl font-semibold text-omega-ink">Get started</h3>
            <p className="mt-2 max-w-md text-sm text-omega-slate">Keep a private record of symptoms, questions, and concerns for your next appointment.</p>
            <button type="button" onClick={startNewNote} className="mt-6 rounded-full bg-omega-purple px-5 py-3 text-sm font-semibold text-white">
              New Note
            </button>
          </div>
        )}
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <h3 className="text-lg font-semibold text-omega-purple">Saved notes</h3>
        <div className="mt-4 space-y-3">
          {appState.notes.length ? (
            appState.notes.map((note) => {
              const preview = note.content.trim();
              const updatedDate = formatNoteDate(note.updatedAt);

              return (
              <div key={note.id} className="rounded-2xl bg-omega-beige p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-omega-ink">{note.title}</p>
                    {updatedDate ? <p className="text-xs text-omega-slate">Updated {updatedDate}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => editNote(note)} className="inline-flex items-center gap-2 rounded-full border border-omega-lilac bg-white px-3 py-2 text-xs font-medium text-omega-purple" aria-label={`Open and edit ${note.title}`}>
                      <Pencil className="h-4 w-4" /> Open note
                    </button>
                    <button type="button" onClick={() => setAppState((prev) => ({ ...prev, notes: prev.notes.filter((item) => item.id !== note.id) }))} className="rounded-full border border-omega-lilac p-2 text-omega-purple" aria-label="Delete note">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-omega-ink">{preview.length > 180 ? `${preview.slice(0, 180)}...` : preview || "No content"}</p>
              </div>
              );
            })
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

  const renderWellnessInfoPage = (topic: WellnessTopic) => {
    const content = wellnessTopicConfig[topic];

    return (
      <div className="space-y-6">
        <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
          <button
            type="button"
            onClick={() => {
              setWellnessTopic(null);
              setWellnessPanel("overview");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Wellness
          </button>
          <p className="mt-4 text-sm uppercase tracking-[0.2em] text-omega-lilac">Wellness resources</p>
          <h2 className="mt-2 text-3xl font-semibold">{content.title}</h2>
        </div>

        <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">{content.emoji}</span>
            <p className="text-lg leading-7 text-omega-ink">{content.intro}</p>
          </div>
        </div>

        <div className="space-y-4">
          {content.sections.map((section) => (
            <div key={section.title} className="rounded-[28px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
              <h3 className="text-xl font-semibold text-omega-purple">{section.title}</h3>
              <p className="mt-3 text-sm leading-7 text-omega-ink">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActivityPanel = () => (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
        <button
          type="button"
          onClick={() => {
            setWellnessPanel("overview");
            setActivitySuccessMessage("");
            resetActivityForm();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Wellness
        </button>
        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-omega-lilac">Activity</p>
        <h2 className="mt-2 text-3xl font-semibold">Log an activity</h2>
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-omega-ink">Date</label>
            <input
              type="date"
              value={activityForm.date}
              onChange={(event) => setActivityForm((prev) => ({ ...prev, date: event.target.value }))}
              className="w-full rounded-2xl border border-omega-lilac bg-omega-beige px-3 py-2 text-sm text-omega-ink outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-omega-ink">Activity</label>
            <select
              value={activityForm.activity}
              onChange={(event) => setActivityForm((prev) => ({ ...prev, activity: event.target.value }))}
              className="w-full rounded-2xl border border-omega-lilac bg-omega-beige px-3 py-2 text-sm text-omega-ink outline-none"
            >
              <option value="">Select an activity</option>
              {['Walking', 'Stretching', 'Yoga', 'Sports', 'Other', 'Rest'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {activityForm.activity === "Other" && (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-omega-ink">Custom activity</label>
            <input
              value={activityForm.customActivity}
              onChange={(event) => setActivityForm((prev) => ({ ...prev, customActivity: event.target.value }))}
              placeholder="Enter the activity you want to log"
              className="w-full rounded-2xl border border-omega-lilac bg-omega-beige px-3 py-2 text-sm text-omega-ink outline-none"
            />
          </div>
        )}

        <div className="mt-4">
          <label className="mb-2 block text-sm font-semibold text-omega-ink">Optional note</label>
          <textarea
            rows={3}
            value={activityForm.note}
            onChange={(event) => setActivityForm((prev) => ({ ...prev, note: event.target.value }))}
            placeholder="Add a quick note if you want to remember how you felt."
            className="w-full rounded-2xl border border-omega-lilac bg-omega-beige px-3 py-2 text-sm text-omega-ink outline-none"
          />
        </div>

        {activityError && <p className="mt-4 text-sm font-medium text-red-600">{activityError}</p>}
        {activitySuccessMessage && <p className="mt-4 text-sm font-medium text-emerald-700">{activitySuccessMessage}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handleActivitySave} className="rounded-full bg-omega-purple px-4 py-2 text-sm font-semibold text-white">
            Save activity
          </button>
          <button
            type="button"
            onClick={() => {
              setWellnessPanel("overview");
              resetActivityForm();
            }}
            className="rounded-full border border-omega-lilac bg-white px-4 py-2 text-sm font-semibold text-omega-purple"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <h3 className="text-xl font-semibold text-omega-purple">Your activity history</h3>
        {activityHistory.length === 0 ? (
          <p className="mt-4 text-sm text-omega-slate">No activities logged yet. Add one whenever you&apos;d like.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {activityHistory.map((entry) => (
              <li key={entry.id} className="rounded-2xl bg-omega-beige p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-omega-ink">{entry.activity}</p>
                    <p className="text-sm text-omega-slate">{formatShortDate(entry.date)}</p>
                    {entry.note && <p className="mt-2 text-sm text-omega-slate">{entry.note}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActivityForm({
                          date: entry.date,
                          activity: entry.activity && ['Walking', 'Stretching', 'Yoga', 'Sports', 'Rest'].includes(entry.activity) ? entry.activity : "Other",
                          customActivity: entry.activity && !['Walking', 'Stretching', 'Yoga', 'Sports', 'Rest'].includes(entry.activity) ? entry.activity : "",
                          note: entry.note ?? "",
                          editingId: entry.id,
                        });
                        setActivityError("");
                        setActivitySuccessMessage("");
                      }}
                      className="rounded-full border border-omega-lilac bg-white p-2 text-omega-purple"
                      aria-label={`Edit ${entry.activity}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleActivityDelete(entry.id)}
                      className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600"
                      aria-label={`Delete ${entry.activity}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderEnergyPanel = () => (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
        <button
          type="button"
          onClick={() => {
            setWellnessPanel("overview");
            setEnergySuccessMessage("");
            resetEnergyForm();
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Wellness
        </button>
        <p className="mt-4 text-sm uppercase tracking-[0.2em] text-omega-lilac">Energy</p>
        <h2 className="mt-2 text-3xl font-semibold">How is your energy today?</h2>
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-omega-ink">Date</label>
            <input
              type="date"
              value={energyForm.date}
              onChange={(event) => setEnergyForm((prev) => ({ ...prev, date: event.target.value }))}
              className="w-full rounded-2xl border border-omega-lilac bg-omega-beige px-3 py-2 text-sm text-omega-ink outline-none"
            />
          </div>
          <div className="md:col-span-1">
            <p className="mb-2 text-sm font-semibold text-omega-ink">Choose your energy level</p>
            <div className="flex flex-wrap gap-2">
              {energyLevels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEnergyForm((prev) => ({ ...prev, level }))}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    energyForm.level === level
                      ? "border-omega-purple bg-omega-purple text-white shadow-soft"
                      : "border-omega-lilac bg-omega-beige text-omega-ink"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {energyError && <p className="mt-4 text-sm font-medium text-red-600">{energyError}</p>}
        {energySuccessMessage && <p className="mt-4 text-sm font-medium text-emerald-700">{energySuccessMessage}</p>}

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={handleEnergySave} className="rounded-full bg-omega-purple px-4 py-2 text-sm font-semibold text-white">
            Save energy
          </button>
          <button
            type="button"
            onClick={() => {
              setWellnessPanel("overview");
              resetEnergyForm();
            }}
            className="rounded-full border border-omega-lilac bg-white px-4 py-2 text-sm font-semibold text-omega-purple"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <h3 className="text-xl font-semibold text-omega-purple">Your energy history</h3>
        {energyHistory.length === 0 ? (
          <p className="mt-4 text-sm text-omega-slate">No energy check-ins yet. Save your first one whenever you&apos;re ready.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {energyHistory.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl bg-omega-beige p-4">
                <div>
                  <p className="font-semibold text-omega-ink">{entry.energy}</p>
                  <p className="text-sm text-omega-slate">{formatShortDate(entry.date)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEnergyForm({
                        date: entry.date,
                        level: entry.energy ?? "Moderate",
                        editingId: entry.id,
                      });
                      setEnergyError("");
                      setEnergySuccessMessage("");
                    }}
                    className="rounded-full border border-omega-lilac bg-white p-2 text-omega-purple"
                    aria-label={`Edit ${entry.energy} energy`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEnergyDelete(entry.id)}
                    className="rounded-full border border-red-200 bg-red-50 p-2 text-red-600"
                    aria-label={`Delete ${entry.energy} energy`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderWellness = () => {
    if (wellnessTopic) {
      return renderWellnessInfoPage(wellnessTopic);
    }

    if (wellnessPanel === "activity") {
      return renderActivityPanel();
    }

    if (wellnessPanel === "energy") {
      return renderEnergyPanel();
    }

    return (
      <div className="space-y-6">
        <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Wellness</p>
          <h2 className="mt-2 text-3xl font-semibold">Comfort, recovery, and gentle support</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { key: "gentle-stretching" as const, title: "Gentle stretching", icon: "🧘" },
            { key: "yoga" as const, title: "Yoga", icon: "🧘‍♀️" },
            { key: "relaxation" as const, title: "Relaxation", icon: "🌿" },
            { key: "rest-recovery" as const, title: "Rest and recovery", icon: "🛌" },
            { key: "hydration" as const, title: "Hydration & self-care", icon: "💧" },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setWellnessTopic(item.key)}
              className="rounded-[28px] border border-omega-lilac/70 bg-white p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="text-4xl">{item.icon}</div>
              <h3 className="mt-3 text-lg font-semibold text-omega-purple">{item.title}</h3>
            </button>
          ))}
        </div>

        <div className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
          <h3 className="text-xl font-semibold text-omega-purple">Activity and energy</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <button
                type="button"
                onClick={() => {
                  setWellnessPanel("activity");
                  setWellnessTopic(null);
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-omega-lilac bg-omega-beige px-4 py-3 text-left text-sm font-medium text-omega-ink"
              >
                <span>Open activity logger</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  setWellnessPanel("energy");
                  setWellnessTopic(null);
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-omega-lilac bg-omega-lavender px-4 py-3 text-left text-sm font-medium text-omega-ink"
              >
                <span>Check energy</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

        <div className={`flex-1 rounded-[30px] bg-[#fffaf5] p-4 shadow-soft md:p-6 ${section === "dashboard" ? "min-w-0" : ""}`}>
          <header className="flex items-center justify-between gap-3 border-b border-omega-lilac/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (section === "doctor-notes") setDoctorNotesMenuOpen((open) => !open);
                  }}
                  aria-label="Open navigation menu"
                  aria-expanded={section === "doctor-notes" && doctorNotesMenuOpen}
                  className="rounded-full border border-omega-lilac bg-white p-2 lg:hidden"
                >
                  <Menu className="h-5 w-5 text-omega-purple" />
                </button>
                {section === "doctor-notes" && doctorNotesMenuOpen ? (
                  <nav className="absolute left-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-omega-lilac bg-white p-2 shadow-soft" aria-label="App sections">
                    {navItems.map(({ label, key, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSection(key);
                          setDoctorNotesMenuOpen(false);
                          setDoctorNotesNotificationsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-omega-ink hover:bg-omega-beige"
                      >
                        <Icon className="h-4 w-4 text-omega-purple" />
                        {label}
                      </button>
                    ))}
                  </nav>
                ) : null}
              </div>
              <div className={section === "dashboard" ? `${homeScript.variable} ${homeTypography.header}` : undefined}>
                <p className="text-xs uppercase tracking-[0.2em] text-omega-slate">{section === "doctor-notes" ? "Doctor Notes" : "Dashboard"}</p>
                <h1 className="mt-1 text-2xl font-semibold text-omega-ink">{`Welcome, ${appState.profile.preferredName}!`}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (section === "doctor-notes") setDoctorNotesNotificationsOpen((open) => !open);
                  }}
                  aria-label="Notifications"
                  aria-expanded={section === "doctor-notes" && doctorNotesNotificationsOpen}
                  className="rounded-full border border-omega-lilac bg-white p-2 text-omega-purple"
                >
                  <Bell className="h-4 w-4" />
                </button>
                {section === "doctor-notes" && doctorNotesNotificationsOpen ? (
                  <section className="absolute right-0 top-full z-30 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-omega-lilac bg-white p-4 shadow-soft" aria-label="Notifications">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold text-omega-ink">Notifications</h2>
                      <button type="button" onClick={() => setDoctorNotesNotificationsOpen(false)} className="rounded-full p-1 text-omega-purple" aria-label="Close notifications">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-omega-slate" role="status">No notifications right now.</p>
                  </section>
                ) : null}
              </div>
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
