import { useCallback, useEffect, useRef, useState } from "react";
import {
  uploadPrescription,
  getMyPrescriptions,
  deletePrescription,
} from "../../services/prescriptionService";
import PrescriptionUpload from "../../components/patient/PrescriptionUpload";
import PrescriptionList from "../../components/patient/PrescriptionList";

export default function PrescriptionOCR() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await getMyPrescriptions();
      setPrescriptions(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // While anything is still processing, poll every 3s so the extracted
  // text appears automatically once OCR finishes in the background.
  useEffect(() => {
    const hasPending = prescriptions.some(
      (p) => p.status === "processing" || p.status === "pending"
    );
    if (hasPending) {
      pollRef.current = setInterval(load, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [prescriptions, load]);

  async function handleUpload(file) {
    await uploadPrescription(file);
    load();
  }

  async function handleDelete(id) {
    await deletePrescription(id);
    load();
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-slate-500 text-center">
              Loading...
            </div>
          ) : (
            <PrescriptionList prescriptions={prescriptions} onDelete={handleDelete} />
          )}
        </div>
        <div>
          <PrescriptionUpload onUploaded={handleUpload} />
        </div>
      </div>
    </div>
  );
}
