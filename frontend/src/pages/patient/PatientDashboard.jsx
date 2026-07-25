import { useAuth } from "../../context/AuthContext";
import HealthDashboard from "../dashboard/HealthDashboard";
import PrescriptionOCR from "../prescription-ocr/PrescriptionOCR";
import MedicalReportAnalysis from "../medical-reports/MedicalReportAnalysis";
import DrugInteractionChecker from "../drug-interaction/DrugInteractionChecker";

export default function PatientDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Patient Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome, {user?.name}</p>
        </div>
        <button onClick={logout} className="text-sm text-red-600">
          Log out
        </button>
      </div>

      <HealthDashboard />
      <PrescriptionOCR />
      <MedicalReportAnalysis />
      <DrugInteractionChecker />

      <p className="text-slate-400 text-xs">
        Reminders, Appointments, and the Chatbot widget will be added here in upcoming
        modules.
      </p>
    </div>
  );
}
