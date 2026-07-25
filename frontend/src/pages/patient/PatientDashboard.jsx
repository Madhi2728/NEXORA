import { useAuth } from "../../context/AuthContext";
import HealthDashboard from "../dashboard/HealthDashboard";
import PrescriptionOCR from "../prescription-ocr/PrescriptionOCR";
import MedicalReportAnalysis from "../medical-reports/MedicalReportAnalysis";
import DrugInteractionChecker from "../drug-interaction/DrugInteractionChecker";
import MedicalChatbot from "../chatbot/MedicalChatbot";
import SectionCard from "../../components/common/SectionCard";
import { Activity, Bot, ScanLine, ShieldAlert, FileText } from "lucide-react";

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden">
      {/* Background decoration so the page doesn't feel flat */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-fuchsia-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Patient Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome, {user?.name}</p>
          </div>
          <button onClick={logout} className="text-sm text-red-600">
            Log out
          </button>
        </div>

        {/* Top row: Health Dashboard + Chatbot side by side, equal height */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <SectionCard
            icon={Activity}
            title="Health Dashboard"
            accent="from-violet-500 to-purple-500"
            iconBg="bg-violet-100 text-violet-600"
            fullHeight
          >
            <HealthDashboard />
          </SectionCard>

          <SectionCard
            icon={Bot}
            title="AI Health Intelligence"
            accent="from-fuchsia-500 to-pink-500"
            iconBg="bg-fuchsia-100 text-fuchsia-600"
            fullHeight
          >
            <MedicalChatbot />
          </SectionCard>
        </div>

        {/* Second row: Prescription OCR + Drug Interaction Checker */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          <SectionCard
            icon={ScanLine}
            title="Prescription OCR"
            accent="from-indigo-500 to-blue-500"
            iconBg="bg-indigo-100 text-indigo-600"
          >
            <PrescriptionOCR />
          </SectionCard>

          <SectionCard
            icon={ShieldAlert}
            title="Drug Interaction Checker"
            accent="from-amber-500 to-orange-500"
            iconBg="bg-amber-100 text-amber-600"
          >
            <DrugInteractionChecker />
          </SectionCard>
        </div>

        {/* Third row: Medical Report Analysis, full width */}
        <SectionCard
          icon={FileText}
          title="Medical Report Analysis"
          accent="from-emerald-500 to-teal-500"
          iconBg="bg-emerald-100 text-emerald-600"
        >
          <MedicalReportAnalysis />
        </SectionCard>

        <p className="text-slate-400 text-xs">
          Reminders and Appointments will be added here in upcoming modules.
        </p>
      </div>
    </div>
  );
}
