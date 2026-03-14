import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const patientSignupSchema = z.object({
  role: z.literal("patient"),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.coerce.number().int().min(0),
  gender: z.string().min(1)
});

export const doctorSignupSchema = z.object({
  role: z.literal("doctor"),
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  specialization: z.string().min(2),
  years_of_experience: z.coerce.number().int().min(0),
  consultation_fee: z.coerce.number().positive()
});

export const bookingSchema = z.object({
  specialization: z.string().min(2),
  doctorId: z.string().uuid(),
  date: z.string().min(1),
  timeSlot: z.string().min(1)
});

export const messageSchema = z.object({
  receiverId: z.string().uuid(),
  message: z.string().min(1).max(1000)
});

export const medicalRecordSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  diagnosis: z.string().min(3),
  prescription: z.string().min(3),
  clinicalNotes: z.string().min(3)
});

export const symptomSchema = z.object({
  symptoms: z.string().min(10)
});
