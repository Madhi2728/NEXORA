// Reference ranges are general adult ranges for illustration purposes only —
// not a substitute for a clinician's interpretation. Real ranges vary by lab,
// age, sex, and method.
module.exports = [
  { test: "Hemoglobin", aliases: ["hemoglobin", "hb", "hgb"], unit: "g/dL", low: 12, high: 17 },
  { test: "WBC Count", aliases: ["wbc", "white blood cell", "leukocyte"], unit: "x10^3/uL", low: 4, high: 11 },
  { test: "RBC Count", aliases: ["rbc", "red blood cell"], unit: "x10^6/uL", low: 4.2, high: 5.9 },
  { test: "Platelet Count", aliases: ["platelet", "plt"], unit: "x10^3/uL", low: 150, high: 450 },
  { test: "Fasting Blood Glucose", aliases: ["glucose", "fbs", "blood sugar"], unit: "mg/dL", low: 70, high: 100 },
  { test: "Total Cholesterol", aliases: ["cholesterol", "total cholesterol"], unit: "mg/dL", low: 0, high: 200 },
  { test: "LDL Cholesterol", aliases: ["ldl"], unit: "mg/dL", low: 0, high: 100 },
  { test: "HDL Cholesterol", aliases: ["hdl"], unit: "mg/dL", low: 40, high: 60 },
  { test: "Triglycerides", aliases: ["triglyceride", "tg"], unit: "mg/dL", low: 0, high: 150 },
  { test: "Creatinine", aliases: ["creatinine"], unit: "mg/dL", low: 0.6, high: 1.3 },
  { test: "ALT", aliases: ["alt", "sgpt"], unit: "U/L", low: 7, high: 56 },
  { test: "AST", aliases: ["ast", "sgot"], unit: "U/L", low: 8, high: 48 },
  { test: "TSH", aliases: ["tsh", "thyroid stimulating hormone"], unit: "mIU/L", low: 0.4, high: 4.0 },
  { test: "Vitamin D", aliases: ["vitamin d", "25-oh vitamin d"], unit: "ng/mL", low: 20, high: 50 },
  { test: "HbA1c", aliases: ["hba1c", "a1c"], unit: "%", low: 4, high: 5.7 },
];
