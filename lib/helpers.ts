import { format, isAfter, isBefore, parseISO } from "date-fns";

import { demoAppointments, demoDoctors, demoPatients, demoUsers } from "@/lib/demo-data";

export function formatAppointmentDate(date: string) {
  return format(parseISO(date), "MMM d, yyyy");
}

export function formatAppointmentDateTime(date: string, timeSlot: string) {
  return `${formatAppointmentDate(date)} at ${timeSlot}`;
}

export function getWeekdayFromDate(date: string) {
  return parseISO(date).getDay();
}

export function isPastAppointmentDate(date: string) {
  return isBefore(parseISO(date), new Date("2026-03-14T00:00:00Z"));
}

export function isUpcoming(date: string) {
  return isAfter(parseISO(date), new Date("2026-03-14T00:00:00Z"));
}

export function getDoctorUserByDoctorId(doctorId: string) {
  const doctor = demoDoctors.find((item) => item.id === doctorId);
  return demoUsers.find((item) => item.id === doctor?.user_id);
}

export function getPatientUserByPatientId(patientId: string) {
  const patient = demoPatients.find((item) => item.id === patientId);
  return demoUsers.find((item) => item.id === patient?.user_id);
}

export function getAppointmentsForRole(role: "patient" | "doctor") {
  const targetId =
    role === "patient" ? demoPatients[0].id : demoDoctors[0].id;

  return demoAppointments.filter((appointment) =>
    role === "patient"
      ? appointment.patient_id === targetId
      : appointment.doctor_id === targetId
  );
}

export function createVideoRoomId(doctorId: string, patientId: string, date: string, timeSlot: string) {
  return `carebridge-${doctorId.slice(0, 4)}-${patientId.slice(0, 4)}-${date}-${timeSlot
    .replace(/[^0-9]/g, "")
    .slice(0, 4)}`.toLowerCase();
}
