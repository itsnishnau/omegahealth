"use client";
import {estimateCycle} from "../components/cycle-estimate";
import Image from 'next/image';
import EpsilonChat from '../components/EpsilonChat';
import ReadAloudButton from '../components/ReadAloudButton';
import SpeechToTextButton from '../components/SpeechToTextButton';
import './epsilon.css';

import { Dancing_Script } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import doctorNotesTypography from "./doctor-notes-typography.module.css";
import homeTypography from "./home-typography.module.css";
import onboardingTypography from "./onboarding-typography.module.css";
import wellnessTypography from "./wellness-typography.module.css";
import {
  ArrowRight,
  Apple,
  Baby,
  Backpack,
  Bell,
  Brain,
  BookOpenText,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  Dumbbell,
  FileHeart,
  Heart,
  HeartPulse,
  Home,
  Menu,
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
  nutrition?: string;
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

type ThemePreference = "light" | "dark";
type TextSizePreference = "small" | "default" | "large" | "extra-large";

interface UiPreferences {
  theme: ThemePreference;
  textSize: TextSizePreference;
  readAloudEnabled: boolean;
  speechRate: number;
}

interface EducationSection {
  title: string;
  body: string;
}

interface EducationCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof HeartPulse;
  accent: string;
  sections: EducationSection[];
  sources: { label: string; href: string }[];
}

interface NutritionRecommendation {
  id: string;
  title: string;
  text: string;
  symptoms: RegExp;
}

const nutritionRecommendations: NutritionRecommendation[] = [
  {
    id: "bloating",
    title: "Bloating: hydration and gentle choices",
    text: "Sip fluids regularly and consider moderating very salty foods if they seem to affect how you feel. Foods that are easy for you to tolerate may feel more comfortable; there is no single food that works for everyone.",
    symptoms: /\bbloat(?:ed|ing)?\b/i,
  },
  {
    id: "cramps",
    title: "Cramps: balanced nourishment",
    text: "Regular meals and hydration support general wellbeing. Magnesium is found in foods such as beans, lentils, nuts, seeds, and leafy greens; these foods are nutritious but are not a treatment or cure for cramps.",
    symptoms: /\bcramp(?:s|ing)?\b/i,
  },
  {
    id: "nausea",
    title: "Nausea: small, simple meals",
    text: "If tolerated, smaller meals and bland foods such as toast, rice, or crackers may feel easier. Sip fluids in a way that feels comfortable and ask for help if you cannot keep fluids down.",
    symptoms: /\bnausea|nauseous|queasy\b/i,
  },
  {
    id: "fatigue",
    title: "Fatigue: steady energy and iron foods",
    text: "Try regular balanced meals and include iron-containing foods such as lentils, beans, tofu, or fortified cereals. Persistent or severe fatigue can have many causes and may warrant medical evaluation.",
    symptoms: /\bfatigue|tired|low energy|exhausted\b/i,
  },
  {
    id: "headaches",
    title: "Headaches: regular meals and fluids",
    text: "Regular meals and hydration can support general wellbeing. Food changes cannot prevent every headache; talk with a trusted adult or clinician if headaches are severe, frequent, or concerning.",
    symptoms: /\bheadache|headaches|migraine\b/i,
  },
];

const generalNutritionCards = [
  { title: "Build a balanced plate", text: "A mix of grains or other carbohydrates, protein foods, and fruits or vegetables can support general nourishment.", icon: Apple },
  { title: "Hydration through the day", text: "Keep a drink nearby and sip when thirsty. Hydration needs vary with activity, weather, and individual circumstances.", icon: HeartPulse },
  { title: "Everyday iron sources", text: "Beans, lentils, tofu, leafy greens, and some fortified cereals are examples of plant-based foods containing iron.", icon: ClipboardList },
];

const uiPreferencesStorageKey = "omega-health-ui-preferences-v1";
const defaultUiPreferences: UiPreferences = {
  theme: "light",
  textSize: "default",
  readAloudEnabled: true,
  speechRate: 1,
};

const educationCategories: EducationCategory[] = [
  {
    id: "body",
    title: "Understanding My Body",
    subtitle: "Anatomy, hormones, puberty, and body changes.",
    icon: HeartPulse,
    accent: "bg-omega-lavender",
    sections: [
      { title: "The menstrual cycle", body: "The menstrual cycle is a repeating set of changes involving the ovaries and uterus. Hormones help coordinate these changes, but the timing and experience can differ from person to person." },
      { title: "Puberty and body changes", body: "Puberty happens over several years, and its timing varies. Changes such as breast development, body hair, skin changes, and periods are common parts of development; there is no single schedule everyone follows." },
      { title: "Learning your own patterns", body: "Noticing changes over time can help you describe your experience to a trusted adult or clinician. Tracking is optional and is not a way to diagnose a health condition." },
    ],
    sources: [{ label: "ACOG: Your First Period", href: "https://www.acog.org/womens-health/faqs/your-first-period" }],
  },
  {
    id: "periods",
    title: "Periods 101",
    subtitle: "What menstruation is and what can vary.",
    icon: CalendarDays,
    accent: "bg-[#f8edf0]",
    sections: [
      { title: "What a period is", body: "Menstruation is bleeding from the uterus that leaves the body through the vagina. It happens as part of the menstrual cycle when a pregnancy has not occurred." },
      { title: "Cycle length and bleeding", body: "Cycle timing and the number of bleeding days can vary, especially in the first years after periods begin. A calendar estimate is only an estimate, not a guarantee." },
      { title: "Period products", body: "Pads, tampons, menstrual cups, and period underwear are options. Follow product directions, change products regularly, and choose what feels comfortable and accessible for you." },
    ],
    sources: [{ label: "ACOG: Your First Period", href: "https://www.acog.org/womens-health/faqs/your-first-period" }],
  },
  {
    id: "irregular",
    title: "Irregular Cycles",
    subtitle: "Understand variation and when to ask for support.",
    icon: CalendarClock,
    accent: "bg-[#eef5f3]",
    sections: [
      { title: "Variation can happen", body: "Cycle timing may vary, particularly during adolescence. Stress, changes in routine, illness, and many other factors can affect timing; a change does not by itself identify a cause." },
      { title: "Keep useful notes", body: "If you choose, note dates and changes that matter to you. A record can help you explain what you have noticed, but it cannot diagnose why a cycle changed." },
      { title: "When to talk with someone", body: "Consider speaking with a trusted adult or healthcare professional if you have concerns, if periods stop for several months after being established, or if bleeding or pain is affecting daily activities." },
    ],
    sources: [{ label: "ACOG: Menstruation in Girls and Adolescents", href: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/12/menstruation-in-girls-and-adolescents-using-the-menstrual-cycle-as-a-vital-sign" }],
  },
  {
    id: "symptoms",
    title: "Cramps & Symptoms",
    subtitle: "Common experiences and comfort options.",
    icon: Heart,
    accent: "bg-[#f4eef8]",
    sections: [
      { title: "Common symptoms", body: "Some people notice cramps, bloating, headaches, nausea, or changes in energy or mood around a period. Experiences vary and symptoms can have causes unrelated to a menstrual cycle." },
      { title: "Gentle comfort ideas", body: "Rest, fluids, a warm compress, or gentle movement may feel comforting to some people. Choose what feels safe and comfortable for you; these ideas are not treatments or cures." },
      { title: "Get support when needed", body: "Pain that is severe, new, worsening, or interfering with school and daily life deserves attention from a trusted adult or healthcare professional." },
    ],
    sources: [{ label: "NHS: Period pain", href: "https://www.nhs.uk/conditions/period-pain/" }],
  },
  {
    id: "emotional-health",
    title: "Mental & Emotional Health",
    subtitle: "Mood, stress, and supportive ways to check in.",
    icon: Brain,
    accent: "bg-[#f7f1e9]",
    sections: [
      { title: "Feelings can change", body: "Mood and stress can shift for many reasons. Some people notice a pattern around their cycle, while others do not; tracking does not mean every feeling is caused by hormones." },
      { title: "Small supportive steps", body: "A break, a conversation with someone you trust, or a simple note about how you feel can help you express what is going on. You do not have to manage difficult feelings alone." },
      { title: "When to reach out", body: "If distress feels overwhelming or lasts, talk with a trusted adult or health professional. If you feel unsafe or may hurt yourself, seek immediate help from local emergency or crisis support." },
    ],
    sources: [{ label: "CDC: Adolescent and School Health", href: "https://www.cdc.gov/healthyyouth/" }],
  },
  {
    id: "school",
    title: "Periods at School",
    subtitle: "Prepare for classes, sports, and busy days.",
    icon: Backpack,
    accent: "bg-[#eef1f8]",
    sections: [
      { title: "A small period kit", body: "If it is useful, pack a period product, spare underwear, and a small bag for used clothing. A kit can be simple and tailored to what you can comfortably carry." },
      { title: "Activities and classes", body: "Many people continue usual activities during a period. Take a break or ask for help when you need it, and speak with a school nurse or trusted staff member if supplies or support are needed." },
      { title: "Asking for support", body: "You can tell a trusted adult, school nurse, or teacher what practical help you need. You do not have to share more personal detail than you are comfortable sharing." },
    ],
    sources: [{ label: "CDC: Adolescent and School Health", href: "https://www.cdc.gov/healthyyouth/" }],
  },
  {
    id: "reproductive-health",
    title: "Pregnancy & Reproductive Health",
    subtitle: "Clear, age-appropriate reproductive biology.",
    icon: Baby,
    accent: "bg-[#f8edf0]",
    sections: [
      { title: "Basic biology", body: "Pregnancy can begin when sperm fertilizes an egg and the fertilized egg implants in the uterus. Menstrual timing alone cannot confirm or rule out pregnancy." },
      { title: "Reliable information matters", body: "Questions about sex, contraception, or pregnancy are best discussed with a qualified healthcare professional or another trusted, reliable source. Laws, services, and confidential-care rules differ by location." },
      { title: "Avoid common assumptions", body: "Symptoms and cycle predictions are not reliable ways to determine pregnancy. If you may be pregnant or have a concern, seek timely advice from a healthcare professional." },
    ],
    sources: [{ label: "NHS: Pregnancy", href: "https://www.nhs.uk/pregnancy/" }],
  },
  {
    id: "nutrition",
    title: "Nutrition & Menstrual Health",
    subtitle: "Balanced meals, hydration, and everyday nourishment.",
    icon: Apple,
    accent: "bg-[#eef5f3]",
    sections: [
      { title: "Build balanced meals", body: "A mix of foods, including grains or other carbohydrates, protein foods, fruits or vegetables, and fats can support general nourishment. Needs and preferences differ." },
      { title: "Iron-containing foods", body: "Iron is found in foods such as beans, lentils, tofu, leafy greens, and some fortified cereals, as well as meat and seafood. A varied diet can include different sources." },
      { title: "No food is a cure", body: "Food and hydration can support general wellbeing, but no single food is proven to treat menstrual symptoms. Ask a healthcare professional about individual nutrition concerns." },
    ],
    sources: [{ label: "NIH: Office of Dietary Supplements", href: "https://ods.od.nih.gov/factsheets/Iron-Consumer/" }],
  },
  {
    id: "medical-support",
    title: "When to Seek Medical Support",
    subtitle: "Recognize concerns and prepare to talk with a clinician.",
    icon: ClipboardList,
    accent: "bg-[#f0eef8]",
    sections: [
      { title: "Pay attention to impact", body: "Very heavy bleeding, severe pain, faintness, or symptoms that disrupt school and everyday activities are good reasons to ask a trusted adult and healthcare professional for help." },
      { title: "Prepare for a conversation", body: "You can share when symptoms started, how often they happen, how they affect you, and any questions you have. Notes can help you remember what you want to discuss." },
      { title: "You deserve respectful care", body: "A clinician can listen, ask questions, and help decide whether an evaluation is needed. This information is educational and cannot replace personal medical advice." },
    ],
    sources: [{ label: "ACOG: Menstruation in Girls and Adolescents", href: "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2015/12/menstruation-in-girls-and-adolescents-using-the-menstrual-cycle-as-a-vital-sign" }],
  },
];

const STORAGE_KEY = "omega-health-demo-state-v1";
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [doctorNotesNotificationsOpen, setDoctorNotesNotificationsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [appState, setAppState] = useState<AppState>(demoState);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(defaultUiPreferences);
  const [uiPreferencesHydrated, setUiPreferencesHydrated] = useState(false);
  const [uiPreferencesError, setUiPreferencesError] = useState("");
  const [epsilonOpen, setEpsilonOpen] = useState(false);
  const [periodFeedback, setPeriodFeedback] = useState<string | null>(null);
  const [educationCategoryId, setEducationCategoryId] = useState<string | null>(null);
  const [nutritionSlide, setNutritionSlide] = useState(0);
  const nutritionTouchStart = useRef<number | null>(null);
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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(uiPreferencesStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<UiPreferences>;
        setUiPreferences({
          theme: parsed.theme === "dark" ? "dark" : "light",
          textSize: parsed.textSize === "small" || parsed.textSize === "large" || parsed.textSize === "extra-large"
            ? parsed.textSize
            : "default",
          readAloudEnabled: typeof parsed.readAloudEnabled === "boolean" ? parsed.readAloudEnabled : true,
          speechRate: parsed.speechRate === 0.8 || parsed.speechRate === 1.2 ? parsed.speechRate : 1,
        });
      }
    } catch {
      setUiPreferencesError("Your saved accessibility preferences could not be read. Defaults are active.");
    } finally {
      setUiPreferencesHydrated(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = uiPreferences.theme;
    document.documentElement.dataset.textSize = uiPreferences.textSize;
  }, [uiPreferences.theme, uiPreferences.textSize]);

  useEffect(() => {
    if (!uiPreferencesHydrated) return;
    try {
      localStorage.setItem(uiPreferencesStorageKey, JSON.stringify(uiPreferences));
    } catch {
      setUiPreferencesError("Your preference change could not be saved. Check your browser storage settings.");
    }
  }, [uiPreferences, uiPreferencesHydrated]);

  useEffect(() => {
    if (!periodFeedback) return;
    const timeoutId = window.setTimeout(() => setPeriodFeedback(null), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [periodFeedback]);

  const symptomCount = appState.symptoms.length;
  const nutritionCards = useMemo(() => {
    const recentSymptoms = [...appState.symptoms].sort((a, b) => b.date.localeCompare(a.date));
    const matched = new Map<string, NutritionRecommendation>();
    recentSymptoms.forEach((symptom) => {
      nutritionRecommendations.forEach((recommendation) => {
        if (recommendation.symptoms.test(symptom.text) && !matched.has(recommendation.id)) {
          matched.set(recommendation.id, recommendation);
        }
      });
    });
    return matched.size > 0 ? Array.from(matched.values()) : generalNutritionCards;
  }, [appState.symptoms]);
  useEffect(() => {
    setNutritionSlide((current) => Math.min(current, nutritionCards.length - 1));
  }, [nutritionCards.length]);

  const activePeriod = useMemo(
    () => [...appState.periods].sort((a, b) => (a.startDate > b.startDate ? -1 : 1)).find((period) => !period.endDate),
    [appState.periods],
  );

  const periodSummary = estimateCycle(appState, todayKey());

  const monthDays = useMemo(() => getMonthGrid(calendarMonth), [calendarMonth]);
  const selectedEducationCategory = educationCategories.find((category) => category.id === educationCategoryId) ?? null;
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

  const handlePeriodStart = () => {
    const currentDate = todayKey();
    const existingOpen = appState.periods.find((period) => !period.endDate);

    if (existingOpen) {
      setPeriodFeedback("Your active period is already logged for today.");
      return;
    }

    setAppState((prev) => ({
      ...prev,
      periods: [{ id: crypto.randomUUID(), startDate: currentDate, endDate: null }, ...prev.periods],
    }));
    setPeriodFeedback("Period start saved for today.");
  };

  const handlePeriodEnd = () => {
    const currentDate = todayKey();
    const activePeriod = appState.periods.find((period) => !period.endDate);

    if (!activePeriod) {
      setPeriodFeedback("There is no active period to end.");
      return;
    }

    if (activePeriod.startDate > currentDate) {
      setPeriodFeedback("A future start date cannot be marked as ended.");
      return;
    }

    setAppState((prev) => ({
      ...prev,
      periods: prev.periods.map((period) =>
        period.id === activePeriod.id ? { ...period, endDate: currentDate } : period,
      ),
    }));
    setPeriodFeedback("Period end saved for today.");
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
          <div className="flex flex-col items-start gap-2">
            <button
              type="button"
              onClick={() => setEpsilonOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-omega-lilac bg-white/80 px-3 py-2 text-sm font-medium text-omega-purple shadow-soft transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Sparkles className="h-4 w-4" />
              <span>Check in with Epsilon</span>
            </button>
            <p className="text-sm text-omega-slate">Not feeling quite yourself? Epsilon is here to help you understand what&apos;s going on.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-[26px] border border-omega-lilac/80 bg-white/80 p-5 shadow-soft backdrop-blur-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-omega-slate">Period estimate</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-omega-ink md:text-4xl">{periodSummary.title}</p>
              </div>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3 border-t border-omega-lilac/80 pt-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-omega-slate">{periodSummary.subtitle}</p>
                <p className="mt-2 text-2xl font-semibold text-omega-purple">{periodSummary.date}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {!activePeriod ? (
                <button
                  type="button"
                  onClick={handlePeriodStart}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-omega-lavender to-omega-pink px-4 py-2.5 text-sm font-semibold text-omega-purple shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  My Period Started Today
                </button>
              ) : (
                <>
                  <div className="inline-flex items-center rounded-full border border-omega-lilac bg-omega-beige px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-omega-purple">
                    Active period • {formatShortDate(activePeriod.startDate)}
                  </div>
                  <button
                    type="button"
                    onClick={handlePeriodEnd}
                    className="inline-flex items-center justify-center rounded-full border border-omega-lilac bg-white px-4 py-2.5 text-sm font-semibold text-omega-purple transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                  >
                    My Period Ended Today
                  </button>
                </>
              )}
            </div>

            {periodFeedback ? (
              <p className="mt-3 text-sm text-omega-purple">{periodFeedback}</p>
            ) : null}
          </div>

          <div className="rounded-[26px] bg-omega-purple p-5 text-white shadow-soft">
            <p className="text-[11px] uppercase tracking-[0.2em] text-omega-lilac">Cycle status</p>
            <p className={`${homeTypography.heading} mt-3 text-2xl font-semibold tracking-[-0.04em]`}>{appState.profile.cycleType === "regular" ? "Regular rhythm" : appState.profile.cycleType === "irregular" ? "Flexible rhythm" : "Pattern in progress"}</p>
            <p className="mt-3 text-sm leading-6 text-omega-lilac">{periodSummary.detail}</p>
            <ReadAloudButton text={periodSummary.detail} enabled={uiPreferences.readAloudEnabled} rate={uiPreferences.speechRate} className="mt-3" />
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
                aria-pressed={dailyRecord.mood === option.label}
                className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_10px_28px_rgba(81,59,112,0.18)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple ${
                  dailyRecord.mood === option.label ? "border-omega-purple bg-omega-lavender text-omega-purple shadow-[0_0_0_3px_rgba(217,201,238,0.65),0_8px_24px_rgba(81,59,112,0.14)]" : "border-omega-lilac bg-omega-beige text-omega-ink"
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                {option.label}
              </button>
            ))}
          </div>
          <label className="mt-5 block text-sm font-medium text-omega-ink">Nutrition check-in
            <select aria-label="Nutrition check-in" value={dailyRecord.nutrition ?? ""} onChange={event => setAppState(prev => ({...prev,dailyLogs:{...prev.dailyLogs,[selectedDate]:{...prev.dailyLogs[selectedDate],nutrition:event.target.value || undefined}}}))} className="mt-2 w-full rounded-xl border border-omega-lilac bg-omega-beige p-3">
              <option value="">Not logged</option><option value="Usual eating pattern">Usual eating pattern</option><option value="Appetite lower than usual">Appetite lower than usual</option><option value="Appetite higher than usual">Appetite higher than usual</option><option value="Meal routine changed">Meal routine changed</option>
            </select>
          </label>
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
                aria-pressed={dailyRecord.flow === option}
                className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_10px_28px_rgba(81,59,112,0.18)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple ${
                  dailyRecord.flow === option ? "border-omega-purple bg-omega-lavender text-omega-purple shadow-[0_0_0_3px_rgba(217,201,238,0.65),0_8px_24px_rgba(81,59,112,0.14)]" : "border-omega-lilac bg-omega-beige text-omega-ink"
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
            aria-label="Describe symptoms"
            className="mt-4 min-h-24 w-full rounded-2xl border border-omega-lilac bg-omega-beige p-3 text-sm text-omega-ink outline-none ring-0 placeholder:text-omega-slate"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <SpeechToTextButton onTranscript={(transcript) => setSymptomInput((previous) => `${previous}${previous && !/\s$/.test(previous) ? " " : ""}${transcript}`)} />
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
    <div className={`${homeScript.variable} ${doctorNotesTypography.page} space-y-6`}>
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
                    <p className={`${doctorNotesTypography.cardTitle} text-base font-semibold text-omega-ink`}>{note.title}</p>
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

  const renderNutrition = () => {
    const activeNutritionCard = nutritionCards[nutritionSlide] ?? nutritionCards[0];
    const isPersonalized = activeNutritionCard && "id" in activeNutritionCard;
    const moveNutritionSlide = (offset: number) => {
      setNutritionSlide((current) => (current + offset + nutritionCards.length) % nutritionCards.length);
    };

    return (
      <div className={`${homeScript.variable} ${homeTypography.page} space-y-6`}>
        <div className="rounded-[30px] bg-gradient-to-br from-omega-purple to-[#735b91] p-6 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Nutrition</p>
          <h2 className="mt-2 text-3xl font-semibold">Food and comfort support</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">Explore general nutrition education shaped by symptoms you have chosen to log. These ideas are not treatment plans.</p>
        </div>

        <section className="rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft" aria-label="Nutrition guidance carousel">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-omega-purple">{isPersonalized ? "Tips informed by your logged symptoms" : "Everyday nutrition education"}</h3>
              <p className="mt-1 text-sm text-omega-slate">{isPersonalized ? "Based only on symptom text you entered in Home." : "Log a symptom in Home to see related general guidance here."}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => moveNutritionSlide(-1)} aria-label="Previous nutrition card" className="rounded-full border border-omega-lilac bg-white p-2 text-omega-purple hover:bg-omega-lavender focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => moveNutritionSlide(1)} aria-label="Next nutrition card" className="rounded-full border border-omega-lilac bg-white p-2 text-omega-purple hover:bg-omega-lavender focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div
            className="overflow-hidden rounded-[26px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-omega-purple"
            role="region"
            aria-roledescription="carousel"
            aria-label="Nutrition information"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                moveNutritionSlide(1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveNutritionSlide(-1);
              }
            }}
            onTouchStart={(event) => {
              nutritionTouchStart.current = event.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const startX = nutritionTouchStart.current;
              const endX = event.changedTouches[0]?.clientX;
              nutritionTouchStart.current = null;
              if (startX === null || endX === undefined || Math.abs(endX - startX) < 45) return;
              moveNutritionSlide(endX < startX ? 1 : -1);
            }}
          >
            <div className="flex transition-transform duration-300 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${nutritionSlide * 100}%)` }}>
              {nutritionCards.map((item, index) => {
                const Icon = "icon" in item ? item.icon : HeartPulse;
                const text = "text" in item ? item.text : "";
                return (
                  <article key={"id" in item ? item.id : item.title} className="w-full shrink-0 px-1" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${nutritionCards.length}`}>
                    <div className="min-h-64 rounded-[28px] border border-omega-lilac/70 bg-gradient-to-br from-omega-lavender via-white to-omega-beige p-6 shadow-soft transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(81,59,112,0.18)]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-omega-purple shadow-sm">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-omega-plum">{isPersonalized ? "Logged symptom insight" : "General guidance"}</p>
                      <h4 className="mt-2 text-xl font-semibold text-omega-purple">{item.title}</h4>
                      <p className="mt-2 max-w-3xl text-base leading-7 text-omega-ink">{text}</p>
                      <ReadAloudButton text={`${item.title}. ${text}`} enabled={uiPreferences.readAloudEnabled} rate={uiPreferences.speechRate} className="mt-4" />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-2" aria-label="Choose nutrition card">
            {nutritionCards.map((item, index) => (
              <button
                key={"id" in item ? item.id : item.title}
                type="button"
                onClick={() => setNutritionSlide(index)}
                aria-label={`Show nutrition card ${index + 1}: ${item.title}`}
                aria-current={nutritionSlide === index ? "true" : undefined}
                className={`h-2.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple ${nutritionSlide === index ? "w-7 bg-omega-purple" : "w-2.5 bg-omega-lilac hover:bg-omega-plum"}`}
              />
            ))}
          </div>
        </section>

        <div className="rounded-[26px] border border-omega-lilac/70 bg-omega-beige/80 p-4 text-sm leading-6 text-omega-slate">
          Nutrition guidance here is general education, not a diagnosis, treatment plan, supplement recommendation, or individualized diet. If a symptom is persistent or severe, talk with a trusted adult or healthcare professional.
          <button type="button" onClick={() => setSection("dashboard")} className="ml-2 font-semibold text-omega-purple underline underline-offset-2">Log a symptom</button>
        </div>
      </div>
    );
  };

  const renderEducation = () => (
    <div className={`${homeScript.variable} ${homeTypography.page} space-y-6`}>
      <div className="rounded-[30px] bg-gradient-to-br from-omega-purple to-[#735b91] p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Teen education</p>
        <h2 className="mt-2 text-3xl font-semibold">Clear information for everyday life</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85">Explore supportive, age-appropriate information. These resources are educational and are not a substitute for individual medical advice.</p>
      </div>

      {selectedEducationCategory ? (
        <article className="space-y-5">
          <div className="rounded-[28px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
            <button type="button" onClick={() => setEducationCategoryId(null)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-omega-lilac px-3 py-2 text-sm font-medium text-omega-purple hover:bg-omega-lavender focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple">
              <ChevronLeft className="h-4 w-4" /> All topics
            </button>
            <div className="flex items-start gap-4">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${selectedEducationCategory.accent} text-omega-purple`}>
                <selectedEducationCategory.icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-omega-slate">{selectedEducationCategory.subtitle}</p>
                <h2 className="mt-1 text-3xl font-semibold text-omega-purple">{selectedEducationCategory.title}</h2>
              </div>
            </div>
          </div>

          {selectedEducationCategory.sections.map((section) => (
            <section key={section.title} className="rounded-[26px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
              <h3 className="text-xl font-semibold text-omega-purple">{section.title}</h3>
              <p className="mt-3 text-base leading-7 text-omega-ink">{section.body}</p>
              <ReadAloudButton text={`${section.title}. ${section.body}`} enabled={uiPreferences.readAloudEnabled} rate={uiPreferences.speechRate} className="mt-4" />
            </section>
          ))}

          <section className="rounded-[26px] border border-omega-lilac/70 bg-omega-lavender/70 p-5">
            <h3 className="text-lg font-semibold text-omega-purple">Trusted resources</h3>
            <div className="mt-3 flex flex-wrap gap-3">
              {selectedEducationCategory.sources.map((source) => (
                <a key={source.href} href={source.href} target="_blank" rel="noreferrer" className="rounded-full border border-omega-lilac bg-white px-4 py-2 text-sm font-medium text-omega-purple underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple">
                  {source.label}
                </a>
              ))}
            </div>
          </section>

          <div className="rounded-[28px] bg-gradient-to-r from-omega-lavender to-omega-beige p-5 shadow-soft">
            <h3 className="text-xl font-semibold text-omega-purple">Want to explore this topic?</h3>
            <p className="mt-2 text-sm leading-6 text-omega-slate">Epsilon can help you find the right place in the app and answer general questions. No personal health history is sent automatically.</p>
            <button type="button" onClick={() => setEpsilonOpen(true)} className="mt-4 rounded-full bg-omega-purple px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple">
              Get More Info
            </button>
          </div>
        </article>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {educationCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setEducationCategoryId(category.id)}
                className="group min-h-52 rounded-[28px] border border-omega-lilac/70 bg-white p-5 text-left shadow-soft transition-all duration-200 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(81,59,112,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-omega-purple motion-reduce:transform-none"
              >
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${category.accent} text-omega-purple transition-transform duration-200 group-hover:scale-105`}>
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-xl font-semibold text-omega-purple">{category.title}</h3>
                <p className="mt-2 text-sm leading-6 text-omega-slate">{category.subtitle}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-omega-plum">Explore topic <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderWellnessInfoPage = (topic: WellnessTopic) => {
    const content = wellnessTopicConfig[topic];

    return (
      <div className={`${homeScript.variable} ${wellnessTypography.page} space-y-6`}>
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
    <div className={`${homeScript.variable} ${wellnessTypography.page} space-y-6`}>
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
    <div className={`${homeScript.variable} ${wellnessTypography.page} space-y-6`}>
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
      <div className={`${homeScript.variable} ${wellnessTypography.page} space-y-6`}>
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
    <div className={`${homeScript.variable} ${homeTypography.page} space-y-6`}>
      <div className="rounded-[30px] bg-omega-purple p-6 text-white shadow-soft">
        <p className="text-sm uppercase tracking-[0.2em] text-omega-lilac">Settings</p>
        <h2 className="mt-2 text-3xl font-semibold">Your privacy and preferences</h2>
      </div>

      <div className="space-y-4 rounded-[30px] border border-omega-lilac/70 bg-white p-5 shadow-soft">
        <section className="rounded-2xl border border-omega-lilac/70 bg-gradient-to-br from-omega-lavender to-omega-beige p-4" aria-labelledby="appearance-accessibility-title">
          <h3 id="appearance-accessibility-title" className="text-lg font-semibold text-omega-purple">Appearance & accessibility</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-omega-ink">
              Color theme
              <select
                value={uiPreferences.theme}
                onChange={(event) => setUiPreferences((previous) => ({ ...previous, theme: event.target.value as ThemePreference }))}
                className="mt-2 w-full rounded-xl border border-omega-lilac bg-white px-3 py-2 text-sm font-normal text-omega-ink outline-none focus-visible:ring-2 focus-visible:ring-omega-purple"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-omega-ink">
              Text size
              <select
                value={uiPreferences.textSize}
                onChange={(event) => setUiPreferences((previous) => ({ ...previous, textSize: event.target.value as TextSizePreference }))}
                className="mt-2 w-full rounded-xl border border-omega-lilac bg-white px-3 py-2 text-sm font-normal text-omega-ink outline-none focus-visible:ring-2 focus-visible:ring-omega-purple"
              >
                <option value="small">Small</option>
                <option value="default">Default</option>
                <option value="large">Large</option>
                <option value="extra-large">Extra large</option>
              </select>
            </label>
          </div>
          <div className="mt-4 rounded-xl bg-white/70 p-3">
            <label className="flex items-start gap-3 text-sm font-semibold text-omega-ink">
              <input
                type="checkbox"
                checked={uiPreferences.readAloudEnabled}
                onChange={(event) => setUiPreferences((previous) => ({ ...previous, readAloudEnabled: event.target.checked }))}
                className="mt-1 h-4 w-4 accent-[#513B70]"
              />
              <span>
                Enable read-aloud controls
                <span className="mt-1 block text-sm font-normal leading-6 text-omega-slate">Speech plays only when you choose a read-aloud button. The browser’s built-in speech service is used.</span>
              </span>
            </label>
            <label className={`mt-3 block text-sm font-semibold text-omega-ink ${uiPreferences.readAloudEnabled ? "" : "opacity-60"}`}>
              Speech rate
              <select
                value={uiPreferences.speechRate}
                disabled={!uiPreferences.readAloudEnabled}
                onChange={(event) => setUiPreferences((previous) => ({ ...previous, speechRate: Number(event.target.value) }))}
                className="mt-2 w-full rounded-xl border border-omega-lilac bg-white px-3 py-2 text-sm font-normal text-omega-ink outline-none focus-visible:ring-2 focus-visible:ring-omega-purple disabled:cursor-not-allowed"
              >
                <option value={0.8}>Slower</option>
                <option value={1}>Normal</option>
                <option value={1.2}>Faster</option>
              </select>
            </label>
          </div>
          {uiPreferencesError ? <p className="mt-3 text-sm text-red-700" role="alert">{uiPreferencesError}</p> : null}
        </section>

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

        <div className="rounded-2xl bg-omega-beige p-4"><p className="text-sm font-semibold text-omega-ink">Epsilon FAQ guide</p><p className="text-sm text-omega-slate">Free preset replies on your device. No API key needed and no chat messages sent to an AI service.</p></div>

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
    <div className={`${homeScript.variable} ${onboardingTypography.page} min-h-screen bg-omega-beige px-4 py-8`}>
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
          <h2 className={`${onboardingStep === 2 ? onboardingTypography.question : ""} text-3xl font-semibold text-omega-ink`}>{onboardingQuestions[onboardingStep].title}</h2>
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
        <div className={`${homeScript.variable} ${onboardingTypography.page} mx-auto max-w-6xl rounded-[40px] bg-[#fffaf4] p-5 shadow-soft md:p-8`}>
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image src="/omegahealth-logo.png" width={150} height={104} alt="Omega Health" priority className="h-auto w-28 sm:w-36" />
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
      <EpsilonChat onNavigate={destination => {setSection(destination);setScreen('app');}} inApp={false} isOpen={epsilonOpen} onOpenChange={setEpsilonOpen} />
</main>
    );
  }

  if (screen === "auth") {
    return (
      <main className="min-h-screen bg-omega-beige px-4 py-8">
        <div className={`${homeScript.variable} ${onboardingTypography.page} mx-auto max-w-md rounded-[32px] bg-white p-6 shadow-soft`}>
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
      <EpsilonChat onNavigate={destination => {setSection(destination);setScreen('app');}} inApp={false} isOpen={epsilonOpen} onOpenChange={setEpsilonOpen} />
</main>
    );
  }

  if (screen === "onboarding") {
    return <>{onboardingPage}<EpsilonChat onNavigate={destination => {setSection(destination);setScreen('app');}} inApp={false} isOpen={epsilonOpen} onOpenChange={setEpsilonOpen} /></>;
  }

  return (
    <main className="min-h-screen bg-omega-beige px-3 py-4 text-omega-ink md:px-6">
      <div className="mx-auto flex max-w-7xl gap-4">
        <aside className="hidden min-h-[calc(100vh-2rem)] w-72 rounded-[30px] bg-omega-purple p-5 text-white shadow-soft lg:block">
          <div className="flex items-center gap-3">
            <div className="w-full rounded-2xl bg-white px-5 py-3"><Image src="/omegahealth-logo.png" width={200} height={139} alt="Omega Health" priority className="mx-auto h-auto w-40" /></div>
          </div>

          <nav className={`${homeTypography.bodyText} mt-8 space-y-2`}>
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

        <div className="min-w-0 flex-1 rounded-[30px] bg-[#fffaf5] p-4 shadow-soft md:p-6">
          <header className="flex items-center justify-between gap-3 border-b border-omega-lilac/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                  className="rounded-full border border-omega-lilac bg-white p-2 lg:hidden"
                >
                  <Menu className="h-5 w-5 text-omega-purple" />
                </button>
                {mobileMenuOpen ? (
                  <nav className="absolute left-0 top-full z-30 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-omega-lilac bg-white p-2 shadow-soft" aria-label="App sections">
                    {navItems.map(({ label, key, icon: Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSection(key);
                          setMobileMenuOpen(false);
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
              <div className={`${homeScript.variable} ${homeTypography.header}`}>
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

          <nav className={`${homeTypography.bodyText} fixed inset-x-3 bottom-3 z-20 grid grid-cols-4 gap-2 rounded-[24px] border border-omega-lilac/60 bg-white/90 p-2 shadow-soft backdrop-blur-md lg:hidden`}>
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
    <EpsilonChat onNavigate={destination => {setSection(destination);setScreen('app');}} inApp={true} isOpen={epsilonOpen} onOpenChange={setEpsilonOpen} />
</main>
  );
}
