export const VITAL_TYPES = [
  { value: "blood_pressure", label: "Blood Pressure", unit: "mmHg", placeholder: "120/80" },
  { value: "heart_rate", label: "Heart Rate", unit: "bpm", placeholder: "72" },
  { value: "weight", label: "Weight", unit: "kg", placeholder: "68" },
  { value: "blood_sugar", label: "Blood Sugar", unit: "mg/dL", placeholder: "95" },
  { value: "temperature", label: "Temperature", unit: "°C", placeholder: "36.8" },
  { value: "spo2", label: "SpO2", unit: "%", placeholder: "98" },
];

export function labelFor(type) {
  return VITAL_TYPES.find((t) => t.value === type)?.label || type;
}

export function unitFor(type) {
  return VITAL_TYPES.find((t) => t.value === type)?.unit || "";
}
