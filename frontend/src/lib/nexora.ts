export type Role = "doctor" | "patient" | "admin";

export const roleMeta: Record<
  Role,
  { label: string; tagline: string; blurb: string; accent: string }
> = {
  doctor: {
    label: "Doctor",
    tagline: "Clinical command center",
    blurb: "Live rounds, patient charts, prescriptions and AI triage support.",
    accent: "Care delivery",
  },
  patient: {
    label: "Patient",
    tagline: "Your health, clarified",
    blurb: "Appointments, prescriptions, reports and vitals in one calm place.",
    accent: "Personal health",
  },
  admin: {
    label: "Admin",
    tagline: "Operations & compliance",
    blurb: "Capacity, staffing, audit trails and platform-wide governance.",
    accent: "Governance",
  },
};

export const roleDashboards: Record<
  Role,
  {
    greeting: string;
    stats: { label: string; value: string; delta: string }[];
    panels: { title: string; items: { primary: string; secondary: string; tag: string }[] }[];
    actions: string[];
  }
> = {
  doctor: {
    greeting: "Today's clinic is running 4 minutes ahead of schedule.",
    stats: [
      { label: "Patients today", value: "18", delta: "+3 vs avg" },
      { label: "Critical alerts", value: "2", delta: "needs review" },
      { label: "Pending notes", value: "5", delta: "due 6:00 PM" },
      { label: "Avg consult", value: "12m", delta: "-2m" },
    ],
    panels: [
      {
        title: "Next in queue",
        items: [
          { primary: "Aarav Mehta · 34", secondary: "Post-op review · Room 2", tag: "10:20" },
          { primary: "Lena Fischer · 61", secondary: "Hypertension follow-up", tag: "10:45" },
          { primary: "Sam Okoye · 8", secondary: "Pediatric asthma", tag: "11:10" },
        ],
      },
      {
        title: "AI triage signals",
        items: [
          { primary: "Elevated troponin trend", secondary: "Bed 14 · cardiology", tag: "High" },
          { primary: "Drug interaction flag", secondary: "Warfarin + NSAID", tag: "Check" },
          { primary: "Sepsis risk score 0.71", secondary: "ICU · bed 3", tag: "Watch" },
        ],
      },
    ],
    actions: ["Start consultation", "Write prescription", "Order lab panel", "Dictate note"],
  },
  patient: {
    greeting: "Your next appointment is in 2 days. Vitals look steady.",
    stats: [
      { label: "Next visit", value: "Fri", delta: "Dr. Rao · 09:30" },
      { label: "Active meds", value: "3", delta: "1 refill soon" },
      { label: "Reports", value: "6", delta: "2 new" },
      { label: "Care score", value: "82", delta: "+4 this month" },
    ],
    panels: [
      {
        title: "Upcoming care",
        items: [
          { primary: "Cardiology follow-up", secondary: "Dr. Ananya Rao · Clinic B", tag: "Fri" },
          { primary: "Blood panel", secondary: "Fasting required", tag: "Mon" },
          { primary: "Physio session", secondary: "Tele-visit", tag: "Wed" },
        ],
      },
      {
        title: "Medications",
        items: [
          { primary: "Amlodipine 5mg", secondary: "Once daily · morning", tag: "12 left" },
          { primary: "Metformin 500mg", secondary: "Twice daily · with food", tag: "Refill" },
          { primary: "Vitamin D3", secondary: "Weekly", tag: "30 left" },
        ],
      },
    ],
    actions: ["Book appointment", "Message care team", "Upload report", "Request refill"],
  },
  admin: {
    greeting: "All systems nominal. One compliance task needs your sign-off.",
    stats: [
      { label: "Bed occupancy", value: "78%", delta: "+6% WoW" },
      { label: "Staff on duty", value: "142", delta: "9 on call" },
      { label: "Open tickets", value: "11", delta: "3 urgent" },
      { label: "Uptime", value: "99.98%", delta: "30d" },
    ],
    panels: [
      {
        title: "Operations feed",
        items: [
          { primary: "ICU capacity 92%", secondary: "Overflow protocol suggested", tag: "Urgent" },
          { primary: "Pharmacy stock low", secondary: "Insulin glargine", tag: "Order" },
          { primary: "Night shift gap", secondary: "Ward 4 · 2 nurses", tag: "Staff" },
        ],
      },
      {
        title: "Compliance & audit",
        items: [
          { primary: "HIPAA access review", secondary: "12 accounts pending", tag: "Sign" },
          { primary: "Data retention job", secondary: "Completed 03:00", tag: "OK" },
          { primary: "Role escalation request", secondary: "Dr. K. Iyer → admin", tag: "Review" },
        ],
      },
    ],
    actions: ["Approve requests", "Manage roles", "Export audit log", "Broadcast notice"],
  },
};

export const roleStyle: Record<
  Role,
  {
    shell: string;
    statGrid: string;
    statCard: string;
    statValue: string;
    panelGrid: string;
    panel: string;
    item: string;
    tag: string;
    eyebrow: string;
  }
> = {
  doctor: {
    shell: "rounded-3xl border border-primary/30 bg-primary/5 p-6",
    statGrid: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
    statCard: "surface-card rounded-xl border-l-4 border-l-primary p-5",
    statValue: "mt-2 text-3xl font-bold text-primary-glow",
    panelGrid: "mt-6 grid gap-5 lg:grid-cols-2",
    panel: "surface-card rounded-2xl p-6",
    item: "flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-secondary/40 px-4 py-3",
    tag: "shrink-0 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-glow",
    eyebrow: "text-sm uppercase tracking-[0.3em] text-primary-glow",
  },
  patient: {
    shell: "rounded-[2rem] border border-accent/30 bg-accent/5 p-6",
    statGrid: "grid gap-4 sm:grid-cols-2",
    statCard: "surface-card rounded-3xl p-6 text-center",
    statValue: "mt-2 text-4xl font-bold text-accent",
    panelGrid: "mt-6 grid gap-5",
    panel: "surface-card rounded-3xl p-6",
    item: "flex items-center justify-between gap-4 rounded-2xl border border-accent/25 bg-accent/5 px-4 py-3",
    tag: "shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent",
    eyebrow: "text-sm uppercase tracking-[0.3em] text-accent",
  },
  admin: {
    shell: "rounded-lg border border-border bg-secondary/20 p-6",
    statGrid: "grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4",
    statCard: "bg-card p-5",
    statValue: "mt-2 text-2xl font-bold text-foreground",
    panelGrid: "mt-6 grid gap-5 lg:grid-cols-2",
    panel: "surface-card rounded-lg p-6",
    item: "flex items-center justify-between gap-4 border-b border-border/60 px-1 py-3 last:border-b-0",
    tag: "shrink-0 rounded-sm bg-warning/15 px-2 py-1 font-mono text-[11px] font-semibold text-warning uppercase",
    eyebrow: "text-sm uppercase tracking-[0.3em] font-mono text-warning",
  },
};
