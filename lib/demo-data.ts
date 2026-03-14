import type {
  Appointment,
  AppUser,
  DoctorProfile,
  MedicalRecord,
  Message,
  PatientProfile,
  SymptomAnalysis
} from "@/lib/types";

export const demoUsers: AppUser[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    email: "sarah@carebridge.ai",
    full_name: "Dr Sarah Johnson",
    role: "doctor",
    created_at: "2026-03-10T10:00:00Z",
    updated_at: "2026-03-10T10:00:00Z"
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    email: "michael@carebridge.ai",
    full_name: "Dr Michael Lee",
    role: "doctor",
    created_at: "2026-03-10T10:05:00Z",
    updated_at: "2026-03-10T10:05:00Z"
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    email: "emily@carebridge.ai",
    full_name: "Dr Emily Carter",
    role: "doctor",
    created_at: "2026-03-10T10:10:00Z",
    updated_at: "2026-03-10T10:10:00Z"
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    email: "alex@carebridge.ai",
    full_name: "Alex Rivera",
    role: "patient",
    created_at: "2026-03-10T11:00:00Z",
    updated_at: "2026-03-10T11:00:00Z"
  },
  {
    id: "55555555-5555-5555-5555-555555555555",
    email: "maya@carebridge.ai",
    full_name: "Maya Patel",
    role: "patient",
    created_at: "2026-03-10T11:05:00Z",
    updated_at: "2026-03-10T11:05:00Z"
  }
];

export const demoDoctors: DoctorProfile[] = [
  {
    id: "aaaaaaa1-1111-4111-8111-111111111111",
    user_id: demoUsers[0].id,
    specialization: "Dermatologist",
    years_of_experience: 12,
    consultation_fee: 85,
    bio: "Specialist in acne, eczema, and preventive skin care.",
    created_at: "2026-03-10T10:00:00Z",
    updated_at: "2026-03-10T10:00:00Z"
  },
  {
    id: "aaaaaaa2-2222-4222-8222-222222222222",
    user_id: demoUsers[1].id,
    specialization: "Cardiologist",
    years_of_experience: 15,
    consultation_fee: 130,
    bio: "Focuses on hypertension, chest discomfort, and heart rhythm care.",
    created_at: "2026-03-10T10:05:00Z",
    updated_at: "2026-03-10T10:05:00Z"
  },
  {
    id: "aaaaaaa3-3333-4333-8333-333333333333",
    user_id: demoUsers[2].id,
    specialization: "General Physician",
    years_of_experience: 9,
    consultation_fee: 60,
    bio: "Primary care physician handling common acute and chronic issues.",
    created_at: "2026-03-10T10:10:00Z",
    updated_at: "2026-03-10T10:10:00Z"
  }
];

export const demoPatients: PatientProfile[] = [
  {
    id: "bbbbbbb1-1111-4111-8111-111111111111",
    user_id: demoUsers[3].id,
    age: 31,
    gender: "Male",
    created_at: "2026-03-10T11:00:00Z",
    updated_at: "2026-03-10T11:00:00Z"
  },
  {
    id: "bbbbbbb2-2222-4222-8222-222222222222",
    user_id: demoUsers[4].id,
    age: 28,
    gender: "Female",
    created_at: "2026-03-10T11:05:00Z",
    updated_at: "2026-03-10T11:05:00Z"
  }
];

export const demoAppointments: Appointment[] = [
  {
    id: "ccccccc1-1111-4111-8111-111111111111",
    doctor_id: demoDoctors[0].id,
    patient_id: demoPatients[0].id,
    appointment_date: "2026-03-15",
    time_slot: "09:30 AM",
    status: "scheduled",
    video_room_id: "carebridge-derm-001",
    payment_status: "paid",
    consultation_fee: 85,
    created_at: "2026-03-14T08:00:00Z",
    updated_at: "2026-03-14T08:00:00Z"
  },
  {
    id: "ccccccc2-2222-4222-8222-222222222222",
    doctor_id: demoDoctors[1].id,
    patient_id: demoPatients[1].id,
    appointment_date: "2026-03-16",
    time_slot: "11:00 AM",
    status: "scheduled",
    video_room_id: "carebridge-cardio-002",
    payment_status: "pending",
    consultation_fee: 130,
    created_at: "2026-03-14T08:10:00Z",
    updated_at: "2026-03-14T08:10:00Z"
  },
  {
    id: "ccccccc3-3333-4333-8333-333333333333",
    doctor_id: demoDoctors[2].id,
    patient_id: demoPatients[0].id,
    appointment_date: "2026-03-13",
    time_slot: "02:00 PM",
    status: "completed",
    video_room_id: "carebridge-gp-003",
    payment_status: "paid",
    consultation_fee: 60,
    created_at: "2026-03-12T10:00:00Z",
    updated_at: "2026-03-13T14:30:00Z"
  }
];

export const demoMessages: Message[] = [
  {
    id: "ddddddd1-1111-4111-8111-111111111111",
    sender_id: demoUsers[3].id,
    receiver_id: demoUsers[0].id,
    message: "Hi Dr Sarah, I have a recurring rash on my hands.",
    created_at: "2026-03-14T08:15:00Z"
  },
  {
    id: "ddddddd2-2222-4222-8222-222222222222",
    sender_id: demoUsers[0].id,
    receiver_id: demoUsers[3].id,
    message: "Please upload a photo before the consultation and avoid new skin products.",
    created_at: "2026-03-14T08:17:00Z"
  },
  {
    id: "ddddddd3-3333-4333-8333-333333333333",
    sender_id: demoUsers[4].id,
    receiver_id: demoUsers[1].id,
    message: "I want to confirm whether my ECG report should be brought to the video visit.",
    created_at: "2026-03-14T09:00:00Z"
  }
];

export const demoMedicalRecords: MedicalRecord[] = [
  {
    id: "eeeeeee1-1111-4111-8111-111111111111",
    appointment_id: demoAppointments[2].id,
    doctor_id: demoDoctors[2].id,
    patient_id: demoPatients[0].id,
    diagnosis: "Upper respiratory tract infection",
    prescription: "Paracetamol 650mg, hydration, steam inhalation",
    clinical_notes: "Mild fever and cough for 3 days. No respiratory distress noted.",
    created_at: "2026-03-13T14:35:00Z"
  }
];

export const demoSymptomResponse: SymptomAnalysis = {
  possibleConditions: ["Seasonal allergies", "Viral upper respiratory infection"],
  recommendedSpecialist: "General Physician",
  urgencyLevel: "low",
  basicAdvice: [
    "Monitor fever, shortness of breath, or worsening symptoms.",
    "Stay hydrated and rest.",
    "Seek urgent care if breathing becomes difficult."
  ]
};
