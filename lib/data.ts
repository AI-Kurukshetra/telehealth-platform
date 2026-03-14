import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { requireAuth } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AppUser,
  Appointment,
  AppointmentWithDoctor,
  AppointmentWithPatient,
  DoctorAvailability,
  DoctorDirectoryItem,
  DoctorProfile,
  Message,
  MessageContact,
  MedicalRecord,
  MedicalRecordWithDoctor,
  MedicalRecordWithPatient,
  PatientProfile,
  VisitPreparation
} from "@/lib/types";

type UserRecord = AppUser;

type CurrentUserContext = {
  authUserId: string;
  user: UserRecord;
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
};

function mapSchemaError(message: string) {
  if (message.includes("doctor_availability")) {
    return "Missing Supabase migration: run supabase/migrations/202603140004_hardening_and_scheduling.sql, then refresh the app.";
  }

  return message;
}

async function getUsersByIds(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)].filter(Boolean);

  if (uniqueIds.length === 0) {
    return new Map<string, UserRecord>();
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at, updated_at")
    .in("id", uniqueIds);

  if (error) {
    throw new Error(mapSchemaError(error.message));
  }

  return new Map((data ?? []).map((user) => [user.id, user as UserRecord]));
}

async function getCurrentUserRecord() {
  const authUser = await requireAuth();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at, updated_at")
    .eq("auth_user_id", authUser.id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to load current app user.");
  }

  return {
    authUserId: authUser.id,
    user: data as UserRecord
  };
}

export const getCurrentUserContext = cache(async (): Promise<CurrentUserContext> => {
  const base = await getCurrentUserRecord();
  const supabase = await createServerSupabaseClient();

  if (base.user.role === "patient") {
    const { data, error } = await supabase
      .from("patients")
      .select("id, user_id, age, gender, created_at, updated_at")
      .eq("user_id", base.user.id)
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Unable to load patient profile.");
    }

    return {
      ...base,
      patientProfile: data as PatientProfile
    };
  }

  const { data, error } = await supabase
    .from("doctors")
    .select(
      "id, user_id, specialization, years_of_experience, consultation_fee, bio, created_at, updated_at"
    )
    .eq("user_id", base.user.id)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Unable to load doctor profile.");
  }

  return {
    ...base,
    doctorProfile: data as DoctorProfile
  };
});

export async function listDoctors(): Promise<DoctorDirectoryItem[]> {
  noStore();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("doctor_directory")
    .select(
      "id, user_id, full_name, specialization, years_of_experience, consultation_fee, bio, created_at, updated_at"
    )
    .order("specialization", { ascending: true })
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(mapSchemaError(error.message));
  }

  return (data ?? []) as DoctorDirectoryItem[];
}

export async function listDoctorAvailability(): Promise<DoctorAvailability[]> {
  noStore();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("doctor_availability")
    .select("id, doctor_id, weekday, time_slot, created_at, updated_at")
    .order("weekday", { ascending: true })
    .order("time_slot", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DoctorAvailability[];
}

export async function listCurrentDoctorAvailability(): Promise<DoctorAvailability[]> {
  noStore();

  const { doctorProfile } = await getCurrentUserContext();

  if (!doctorProfile) {
    throw new Error("Doctor profile not found.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("doctor_availability")
    .select("id, doctor_id, weekday, time_slot, created_at, updated_at")
    .eq("doctor_id", doctorProfile.id)
    .order("weekday", { ascending: true })
    .order("time_slot", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as DoctorAvailability[];
}

export async function getVisitPreparationForAppointment(
  appointmentId: string
): Promise<VisitPreparation | null> {
  noStore();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("visit_preparations")
    .select(
      "id, appointment_id, doctor_id, patient_id, symptoms, symptom_duration, current_medications, allergies, medical_history, visit_goals, ai_summary, created_at, updated_at"
    )
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as VisitPreparation | null) ?? null;
}

async function getDoctorProfilesByIds(doctorIds: string[]) {
  const uniqueDoctorIds = [...new Set(doctorIds)].filter(Boolean);

  if (uniqueDoctorIds.length === 0) {
    return new Map<string, DoctorProfile>();
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("doctors")
    .select(
      "id, user_id, specialization, years_of_experience, consultation_fee, bio, created_at, updated_at"
    )
    .in("id", uniqueDoctorIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((doctor) => [doctor.id, doctor as DoctorProfile]));
}

async function getPatientProfilesByIds(patientIds: string[]) {
  const uniquePatientIds = [...new Set(patientIds)].filter(Boolean);

  if (uniquePatientIds.length === 0) {
    return new Map<string, PatientProfile>();
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("patients")
    .select("id, user_id, age, gender, created_at, updated_at")
    .in("id", uniquePatientIds);

  if (error) {
    throw new Error(error.message);
  }

  return new Map((data ?? []).map((patient) => [patient.id, patient as PatientProfile]));
}

export async function listPatientAppointments(): Promise<AppointmentWithDoctor[]> {
  noStore();

  const { patientProfile } = await getCurrentUserContext();

  if (!patientProfile) {
    throw new Error("Patient profile not found.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, doctor_id, patient_id, appointment_date, time_slot, status, video_room_id, payment_status, consultation_fee, cancelled_at, cancelled_by_user_id, cancellation_reason, created_at, updated_at"
    )
    .eq("patient_id", patientProfile.id)
    .order("appointment_date", { ascending: true })
    .order("time_slot", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const appointments = (data ?? []) as Appointment[];
  const doctorProfiles = await getDoctorProfilesByIds(
    appointments.map((appointment) => appointment.doctor_id)
  );
  const usersById = await getUsersByIds(
    [...doctorProfiles.values()].map((doctor) => doctor.user_id)
  );

  return appointments.map((appointment) => {
    const doctor = doctorProfiles.get(appointment.doctor_id);
    const doctorUser = doctor ? usersById.get(doctor.user_id) : null;

    return {
      ...appointment,
      doctor: doctor
        ? {
            full_name: doctorUser?.full_name ?? null,
            specialization: doctor.specialization
          }
        : undefined
    };
  });
}

export async function listDoctorAppointments(): Promise<AppointmentWithPatient[]> {
  noStore();

  const { doctorProfile } = await getCurrentUserContext();

  if (!doctorProfile) {
    throw new Error("Doctor profile not found.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, doctor_id, patient_id, appointment_date, time_slot, status, video_room_id, payment_status, consultation_fee, cancelled_at, cancelled_by_user_id, cancellation_reason, created_at, updated_at"
    )
    .eq("doctor_id", doctorProfile.id)
    .order("appointment_date", { ascending: true })
    .order("time_slot", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const appointments = (data ?? []) as Appointment[];
  const patientProfiles = await getPatientProfilesByIds(
    appointments.map((appointment) => appointment.patient_id)
  );
  const usersById = await getUsersByIds(
    [...patientProfiles.values()].map((patient) => patient.user_id)
  );

  return appointments.map((appointment) => {
    const patient = patientProfiles.get(appointment.patient_id);
    const patientUser = patient ? usersById.get(patient.user_id) : null;

    return {
      ...appointment,
      patient: patient
        ? {
            full_name: patientUser?.full_name ?? null,
            age: patient.age,
            gender: patient.gender
          }
        : undefined
    };
  });
}

export async function listCurrentPatientRecords(): Promise<MedicalRecordWithDoctor[]> {
  noStore();

  const { patientProfile } = await getCurrentUserContext();

  if (!patientProfile) {
    throw new Error("Patient profile not found.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("medical_records")
    .select(
      "id, appointment_id, doctor_id, patient_id, diagnosis, prescription, clinical_notes, created_at"
    )
    .eq("patient_id", patientProfile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const records = (data ?? []) as MedicalRecord[];
  const doctorProfiles = await getDoctorProfilesByIds(records.map((record) => record.doctor_id));
  const usersById = await getUsersByIds(
    [...doctorProfiles.values()].map((doctor) => doctor.user_id)
  );

  return records.map((record) => {
    const doctor = doctorProfiles.get(record.doctor_id);
    const doctorUser = doctor ? usersById.get(doctor.user_id) : null;

    return {
      ...record,
      doctor: doctorUser ? { full_name: doctorUser.full_name } : undefined
    };
  });
}

export async function listDoctorMedicalRecords(): Promise<MedicalRecordWithPatient[]> {
  noStore();

  const { doctorProfile } = await getCurrentUserContext();

  if (!doctorProfile) {
    throw new Error("Doctor profile not found.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("medical_records")
    .select(
      "id, appointment_id, doctor_id, patient_id, diagnosis, prescription, clinical_notes, created_at"
    )
    .eq("doctor_id", doctorProfile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const records = (data ?? []) as MedicalRecord[];
  const patientProfiles = await getPatientProfilesByIds(
    records.map((record) => record.patient_id)
  );
  const usersById = await getUsersByIds(
    [...patientProfiles.values()].map((patient) => patient.user_id)
  );

  return records.map((record) => {
    const patient = patientProfiles.get(record.patient_id);
    const patientUser = patient ? usersById.get(patient.user_id) : null;

    return {
      ...record,
      patient: patientUser ? { full_name: patientUser.full_name } : undefined
    };
  });
}

async function listCurrentUserMessageRows() {
  const { user } = await getCurrentUserContext();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, message, created_at, read_at")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Message[];
}

export async function countMessagesForCurrentUser() {
  noStore();
  const rows = await listCurrentUserMessageRows();
  return rows.filter((message) => !message.read_at).length;
}

export async function listMessageContactsForCurrentUser(): Promise<MessageContact[]> {
  noStore();

  const context = await getCurrentUserContext();
  const supabase = await createServerSupabaseClient();
  const currentUserId = context.user.id;
  const profileToUserId = new Map<string, string>();
  const specializationByUserId = new Map<string, string | null>();
  const counterpartProfileIds = new Set<string>();

  if (context.user.role === "patient") {
    const { data: appointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("doctor_id")
      .eq("patient_id", context.patientProfile!.id);

    if (appointmentError) {
      throw new Error(appointmentError.message);
    }

    (appointments ?? []).forEach((row) => {
      counterpartProfileIds.add(String(row.doctor_id));
    });

    const doctorProfiles = await getDoctorProfilesByIds([...counterpartProfileIds]);
    doctorProfiles.forEach((profile, doctorId) => {
      profileToUserId.set(doctorId, profile.user_id);
      specializationByUserId.set(profile.user_id, profile.specialization);
    });
  } else {
    const { data: appointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("patient_id")
      .eq("doctor_id", context.doctorProfile!.id);

    if (appointmentError) {
      throw new Error(appointmentError.message);
    }

    (appointments ?? []).forEach((row) => {
      counterpartProfileIds.add(String(row.patient_id));
    });

    const patientProfiles = await getPatientProfilesByIds([...counterpartProfileIds]);
    patientProfiles.forEach((profile, patientId) => {
      profileToUserId.set(patientId, profile.user_id);
    });
  }

  const messageRows = await listCurrentUserMessageRows();
  const counterpartUserIds = new Set<string>();
  const latestMessageAt = new Map<string, string>();
  const latestMessagePreview = new Map<string, string>();
  const unreadCountByUser = new Map<string, number>();

  messageRows.forEach((message) => {
    const counterpartId =
      message.sender_id === currentUserId ? message.receiver_id : message.sender_id;

    counterpartUserIds.add(counterpartId);
    const currentLatest = latestMessageAt.get(counterpartId);

    if (!currentLatest || new Date(message.created_at) > new Date(currentLatest)) {
      latestMessageAt.set(counterpartId, message.created_at);
      latestMessagePreview.set(counterpartId, message.message);
    }

    if (message.receiver_id === currentUserId && !message.read_at) {
      unreadCountByUser.set(
        counterpartId,
        (unreadCountByUser.get(counterpartId) ?? 0) + 1
      );
    }
  });

  [...counterpartProfileIds].forEach((profileId) => {
    const userId = profileToUserId.get(profileId);

    if (userId) {
      counterpartUserIds.add(userId);
    }
  });

  counterpartUserIds.delete(currentUserId);

  const usersById = await getUsersByIds([...counterpartUserIds]);

  const contacts: MessageContact[] = [];

  [...counterpartUserIds].forEach((userId) => {
    const user = usersById.get(userId);

    if (!user) {
      return;
    }

    contacts.push({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      specialization: specializationByUserId.get(user.id) ?? null,
      last_message_at: latestMessageAt.get(user.id) ?? null,
      last_message_preview: latestMessagePreview.get(user.id) ?? null,
      unread_count: unreadCountByUser.get(user.id) ?? 0
    });
  });

  return contacts.sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bTime - aTime || a.full_name.localeCompare(b.full_name);
    });
}

export async function listConversationMessagesForCurrentUser(
  otherUserId: string
): Promise<Message[]> {
  noStore();

  const { user } = await getCurrentUserContext();
  const supabase = await createServerSupabaseClient();

  const { data: otherUser, error: otherUserError } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", otherUserId)
    .single();

  if (otherUserError || !otherUser) {
    throw new Error(otherUserError?.message ?? "Conversation participant not found.");
  }

  if (otherUser.role === user.role) {
    throw new Error("Messaging is only allowed between doctors and patients.");
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, message, created_at, read_at")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Message[];
}

export async function markConversationAsRead(otherUserId: string) {
  const { user } = await getCurrentUserContext();
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("messages")
    .update({
      read_at: new Date().toISOString()
    })
    .eq("sender_id", otherUserId)
    .eq("receiver_id", user.id)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }
}
