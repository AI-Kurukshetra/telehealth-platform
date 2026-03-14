import { unstable_noStore as noStore } from "next/cache";
import { cache } from "react";

import { requireAuth } from "@/lib/auth";
import { demoMessages } from "@/lib/demo-data";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AppUser,
  Appointment,
  DoctorProfile,
  Message,
  MessageContact,
  MedicalRecord,
  MedicalRecordWithDoctor,
  MedicalRecordWithPatient,
  PatientProfile
} from "@/lib/types";

type UserRecord = AppUser;

type DoctorDirectoryItem = DoctorProfile & {
  user?: Pick<AppUser, "id" | "email" | "full_name"> | null;
};

type AppointmentWithDoctor = Appointment & {
  doctor?: { full_name?: string | null };
};

type AppointmentWithPatient = Appointment & {
  patient?: { full_name?: string | null };
};

type CurrentUserContext = {
  authUserId: string;
  user: UserRecord;
  patientProfile?: PatientProfile;
  doctorProfile?: DoctorProfile;
};

async function getUsersByIds(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, UserRecord>();
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, role, created_at, updated_at")
    .in("id", userIds);

  if (error) {
    throw new Error(error.message);
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
    .select("id, user_id, specialization, years_of_experience, consultation_fee, bio, created_at, updated_at")
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

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("doctors")
    .select("id, user_id, specialization, years_of_experience, consultation_fee, bio, created_at, updated_at")
    .order("specialization", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const doctors = (data ?? []) as DoctorProfile[];
  const usersById = await getUsersByIds(doctors.map((doctor) => doctor.user_id));

  return doctors.map((doctor) => ({
    ...doctor,
    user: usersById.get(doctor.user_id)
      ? {
          id: usersById.get(doctor.user_id)!.id,
          email: usersById.get(doctor.user_id)!.email,
          full_name: usersById.get(doctor.user_id)!.full_name
        }
      : null
  }));
}

export async function listPatientAppointments(): Promise<AppointmentWithDoctor[]> {
  noStore();

  const { patientProfile } = await getCurrentUserContext();

  if (!patientProfile) {
    throw new Error("Patient profile not found.");
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, appointment_date, time_slot, status, video_room_id, payment_status, consultation_fee, created_at, updated_at")
    .eq("patient_id", patientProfile.id)
    .order("appointment_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const appointments = (data ?? []) as Appointment[];
  const doctorIds = [...new Set(appointments.map((appointment) => appointment.doctor_id))];

  if (doctorIds.length === 0) {
    return [];
  }

  const { data: doctorProfiles, error: doctorError } = await supabase
    .from("doctors")
    .select("id, user_id")
    .in("id", doctorIds);

  if (doctorError) {
    throw new Error(doctorError.message);
  }

  const doctorProfileMap = new Map(
    (doctorProfiles ?? []).map((doctor) => [
      doctor.id as string,
      doctor.user_id as string
    ])
  );

  const usersById = await getUsersByIds(
    [...doctorProfileMap.values()]
  );

  return appointments.map((appointment) => {
    const doctorUserId = doctorProfileMap.get(appointment.doctor_id);
    const doctorUser = doctorUserId ? usersById.get(doctorUserId) : null;

    return {
      ...appointment,
      doctor: doctorUser ? { full_name: doctorUser.full_name } : undefined
    };
  });
}

export async function listDoctorAppointments(): Promise<AppointmentWithPatient[]> {
  noStore();

  const { doctorProfile } = await getCurrentUserContext();

  if (!doctorProfile) {
    throw new Error("Doctor profile not found.");
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, doctor_id, patient_id, appointment_date, time_slot, status, video_room_id, payment_status, consultation_fee, created_at, updated_at")
    .eq("doctor_id", doctorProfile.id)
    .order("appointment_date", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const appointments = (data ?? []) as Appointment[];
  const patientIds = [...new Set(appointments.map((appointment) => appointment.patient_id))];

  if (patientIds.length === 0) {
    return [];
  }

  const { data: patientProfiles, error: patientError } = await supabase
    .from("patients")
    .select("id, user_id")
    .in("id", patientIds);

  if (patientError) {
    throw new Error(patientError.message);
  }

  const patientProfileMap = new Map(
    (patientProfiles ?? []).map((patient) => [
      patient.id as string,
      patient.user_id as string
    ])
  );

  const usersById = await getUsersByIds(
    [...patientProfileMap.values()]
  );

  return appointments.map((appointment) => {
    const patientUserId = patientProfileMap.get(appointment.patient_id);
    const patientUser = patientUserId ? usersById.get(patientUserId) : null;

    return {
      ...appointment,
      patient: patientUser ? { full_name: patientUser.full_name } : undefined
    };
  });
}

export function listMessagesForCurrentPatient() {
  return demoMessages.filter(
    (message) =>
      message.sender_id === "44444444-4444-4444-4444-444444444444" ||
      message.receiver_id === "44444444-4444-4444-4444-444444444444"
  );
}

export function listMessagesForCurrentDoctor() {
  return demoMessages.filter(
    (message) =>
      message.sender_id === "11111111-1111-1111-1111-111111111111" ||
      message.receiver_id === "11111111-1111-1111-1111-111111111111"
  );
}

export async function listCurrentPatientRecords(): Promise<MedicalRecordWithDoctor[]> {
  noStore();

  const { patientProfile } = await getCurrentUserContext();

  if (!patientProfile) {
    throw new Error("Patient profile not found.");
  }

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("medical_records")
    .select("id, appointment_id, doctor_id, patient_id, diagnosis, prescription, clinical_notes, created_at")
    .eq("patient_id", patientProfile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const records = (data ?? []) as MedicalRecord[];
  const doctorIds = [...new Set(records.map((record) => record.doctor_id))];

  if (doctorIds.length === 0) {
    return [];
  }

  const { data: doctorProfiles, error: doctorError } = await supabase
    .from("doctors")
    .select("id, user_id")
    .in("id", doctorIds);

  if (doctorError) {
    throw new Error(doctorError.message);
  }

  const doctorProfileMap = new Map(
    (doctorProfiles ?? []).map((doctor) => [
      doctor.id as string,
      doctor.user_id as string
    ])
  );

  const usersById = await getUsersByIds([...doctorProfileMap.values()]);

  return records.map((record) => {
    const doctorUserId = doctorProfileMap.get(record.doctor_id);
    const doctorUser = doctorUserId ? usersById.get(doctorUserId) : null;

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

  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from("medical_records")
    .select("id, appointment_id, doctor_id, patient_id, diagnosis, prescription, clinical_notes, created_at")
    .eq("doctor_id", doctorProfile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const records = (data ?? []) as MedicalRecord[];
  const patientIds = [...new Set(records.map((record) => record.patient_id))];

  if (patientIds.length === 0) {
    return [];
  }

  const { data: patientProfiles, error: patientError } = await supabase
    .from("patients")
    .select("id, user_id")
    .in("id", patientIds);

  if (patientError) {
    throw new Error(patientError.message);
  }

  const patientProfileMap = new Map(
    (patientProfiles ?? []).map((patient) => [
      patient.id as string,
      patient.user_id as string
    ])
  );

  const usersById = await getUsersByIds([...patientProfileMap.values()]);

  return records.map((record) => {
    const patientUserId = patientProfileMap.get(record.patient_id);
    const patientUser = patientUserId ? usersById.get(patientUserId) : null;

    return {
      ...record,
      patient: patientUser ? { full_name: patientUser.full_name } : undefined
    };
  });
}

async function getUserRecordsMap(userIds: string[]) {
  const uniqueIds = [...new Set(userIds)];
  return getUsersByIds(uniqueIds);
}

async function listCurrentUserMessageRows() {
  const { user } = await getCurrentUserContext();
  const supabase = createAdminSupabaseClient();

  const { data, error } = await supabase
    .from("messages")
    .select("id, sender_id, receiver_id, message, created_at")
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
  return rows.length;
}

export async function listMessageContactsForCurrentUser(): Promise<MessageContact[]> {
  noStore();

  const context = await getCurrentUserContext();
  const supabase = createAdminSupabaseClient();
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
      counterpartProfileIds.add(row.doctor_id as string);
    });

    if (counterpartProfileIds.size > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("doctors")
        .select("id, user_id, specialization")
        .in("id", [...counterpartProfileIds]);

      if (profileError) {
        throw new Error(profileError.message);
      }

      (profiles ?? []).forEach((profile) => {
        const userId = profile.user_id as string;
        profileToUserId.set(profile.id as string, userId);
        specializationByUserId.set(
          userId,
          (profile.specialization as string | null) ?? null
        );
      });
    }
  } else {
    const { data: appointments, error: appointmentError } = await supabase
      .from("appointments")
      .select("patient_id")
      .eq("doctor_id", context.doctorProfile!.id);

    if (appointmentError) {
      throw new Error(appointmentError.message);
    }

    (appointments ?? []).forEach((row) => {
      counterpartProfileIds.add(row.patient_id as string);
    });

    if (counterpartProfileIds.size > 0) {
      const { data: profiles, error: profileError } = await supabase
        .from("patients")
        .select("id, user_id")
        .in("id", [...counterpartProfileIds]);

      if (profileError) {
        throw new Error(profileError.message);
      }

      (profiles ?? []).forEach((profile) => {
        profileToUserId.set(profile.id as string, profile.user_id as string);
      });
    }
  }

  const messageRows = await listCurrentUserMessageRows();
  const counterpartUserIdsFromMessages = messageRows.map((message) =>
    message.sender_id === currentUserId ? message.receiver_id : message.sender_id
  );

  const counterpartUserIds = new Set<string>([
    ...[...counterpartProfileIds].map((profileId) => profileToUserId.get(profileId) ?? ""),
    ...counterpartUserIdsFromMessages
  ]);

  counterpartUserIds.delete("");
  counterpartUserIds.delete(currentUserId);

  const usersById = await getUserRecordsMap([...counterpartUserIds]);
  const latestMessageByUserId = new Map<string, string>();

  messageRows.forEach((message) => {
    const counterpartId =
      message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
    const currentLatest = latestMessageByUserId.get(counterpartId);

    if (!currentLatest || new Date(message.created_at) > new Date(currentLatest)) {
      latestMessageByUserId.set(counterpartId, message.created_at);
    }
  });

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
      last_message_at: latestMessageByUserId.get(user.id) ?? null
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
  const supabase = createAdminSupabaseClient();

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
    .select("id, sender_id, receiver_id, message, created_at")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Message[];
}
