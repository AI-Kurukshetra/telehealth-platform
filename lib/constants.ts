export const SPECIALIZATIONS = [
  "General Physician",
  "Dermatologist",
  "Cardiologist"
] as const;

export const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM"
] as const;

export const WEEKDAY_OPTIONS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" }
] as const;

export const PATIENT_NAV_ITEMS = [
  { href: "/patient/dashboard", label: "Dashboard" },
  { href: "/patient/book", label: "Book Visit" },
  { href: "/patient/appointments", label: "Appointments" },
  { href: "/patient/messages", label: "Messages" },
  { href: "/patient/records", label: "Records" },
  { href: "/patient/symptom-checker", label: "Symptom Checker" },
  { href: "/patient/settings", label: "Settings" }
] as const;

export const DOCTOR_NAV_ITEMS = [
  { href: "/doctor/dashboard", label: "Dashboard" },
  { href: "/doctor/appointments", label: "Appointments" },
  { href: "/doctor/availability", label: "Availability" },
  { href: "/doctor/messages", label: "Messages" },
  { href: "/doctor/patient-records", label: "Patient Records" },
  { href: "/doctor/settings", label: "Settings" }
] as const;
