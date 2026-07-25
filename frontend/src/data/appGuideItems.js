import { Activity, FileText, ScanLine, ShieldAlert, Bot, LogIn } from "lucide-react";

export const APP_GUIDE_ITEMS = [
  {
    icon: LogIn,
    title: "Sign in with your role",
    description: "Patients, doctors, and admins each get their own dashboard after logging in.",
  },
  {
    icon: Activity,
    title: "Log your vitals",
    description:
      "On the Health Dashboard, pick a metric (blood pressure, heart rate, etc.) and save a reading to track trends over time.",
  },
  {
    icon: ScanLine,
    title: "Upload a prescription",
    description:
      "In the Prescription OCR section, upload a photo and the app automatically extracts the text.",
  },
  {
    icon: FileText,
    title: "Analyze a medical report",
    description:
      "Upload a lab report photo to get flagged findings (low/high/normal) and any medicines mentioned.",
  },
  {
    icon: ShieldAlert,
    title: "Check drug interactions",
    description:
      "Add two or more medicines in the Drug Interaction Checker to see any known interaction warnings.",
  },
  {
    icon: Bot,
    title: "Ask the AI Health Assistant",
    description: "Use the chat for general health questions — not a substitute for a doctor.",
  },
];
