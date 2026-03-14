export type UserRole = "patient" | "doctor";

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "in_progress";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type SpecialistRecommendation =
  | "General Physician"
  | "Dermatologist"
  | "Cardiologist"
  | "Neurologist"
  | "Pediatrician";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  specialization: string;
  years_of_experience: number;
  consultation_fee: number;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  age: number;
  gender: string;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string;
  time_slot: string;
  status: AppointmentStatus;
  video_room_id: string;
  payment_status: PaymentStatus;
  consultation_fee: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export interface MessageContact {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  specialization?: string | null;
  last_message_at?: string | null;
}

export interface MedicalRecord {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  diagnosis: string;
  prescription: string;
  clinical_notes: string;
  created_at: string;
}

export interface MedicalRecordWithDoctor extends MedicalRecord {
  doctor?: { full_name?: string | null };
}

export interface MedicalRecordWithPatient extends MedicalRecord {
  patient?: { full_name?: string | null };
}

export interface SymptomAnalysis {
  possibleConditions: string[];
  recommendedSpecialist: SpecialistRecommendation;
  urgencyLevel: "low" | "medium" | "high";
  basicAdvice: string[];
}
