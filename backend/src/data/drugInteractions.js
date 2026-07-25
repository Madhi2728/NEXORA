// Well-documented, textbook-level drug interactions only. This is NOT an
// exhaustive clinical database and must not be treated as medical advice --
// always confirm with a pharmacist or doctor. Severity: "mild" | "moderate" | "severe".
module.exports = [
  {
    drugs: ["Warfarin", "Aspirin"],
    severity: "severe",
    description: "Combined use significantly increases the risk of serious bleeding.",
  },
  {
    drugs: ["Warfarin", "Ibuprofen"],
    severity: "severe",
    description: "NSAIDs like ibuprofen increase bleeding risk when combined with warfarin.",
  },
  {
    drugs: ["Warfarin", "Amoxicillin"],
    severity: "moderate",
    description: "Some antibiotics can potentiate warfarin's blood-thinning effect.",
  },
  {
    drugs: ["Warfarin", "Ciprofloxacin"],
    severity: "moderate",
    description: "Ciprofloxacin can increase warfarin's effect, raising bleeding risk.",
  },
  {
    drugs: ["Warfarin", "Sertraline"],
    severity: "moderate",
    description: "SSRIs combined with anticoagulants can further increase bleeding risk.",
  },
  {
    drugs: ["Aspirin", "Sertraline"],
    severity: "moderate",
    description: "Combining an SSRI with aspirin raises the risk of gastrointestinal bleeding.",
  },
  {
    drugs: ["Lisinopril", "Ibuprofen"],
    severity: "moderate",
    description: "NSAIDs can reduce the blood-pressure-lowering effect and stress the kidneys.",
  },
  {
    drugs: ["Lisinopril", "Losartan"],
    severity: "moderate",
    description: "Combining an ACE inhibitor and ARB is generally not recommended -- raises risk of high potassium and kidney issues.",
  },
  {
    drugs: ["Furosemide", "Lisinopril"],
    severity: "mild",
    description: "Combined use can cause additive blood-pressure lowering; monitor for dizziness.",
  },
  {
    drugs: ["Amlodipine", "Atorvastatin"],
    severity: "moderate",
    description: "Amlodipine can raise statin levels in the blood, increasing risk of muscle-related side effects.",
  },
  {
    drugs: ["Clopidogrel", "Omeprazole"],
    severity: "moderate",
    description: "Omeprazole may reduce how well clopidogrel works, lowering its protective effect.",
  },
  {
    drugs: ["Levothyroxine", "Omeprazole"],
    severity: "mild",
    description: "Acid-reducing medication can reduce levothyroxine absorption -- often managed by spacing doses apart.",
  },
  {
    drugs: ["Gabapentin", "Alprazolam"],
    severity: "moderate",
    description: "Combining these increases drowsiness and risk of slowed breathing.",
  },
  {
    drugs: ["Prednisone", "Ibuprofen"],
    severity: "moderate",
    description: "Combined use raises the risk of stomach irritation, ulcers, and GI bleeding.",
  },
  {
    drugs: ["Prednisone", "Metformin"],
    severity: "mild",
    description: "Prednisone can raise blood sugar levels, working against metformin's effect.",
  },
];
