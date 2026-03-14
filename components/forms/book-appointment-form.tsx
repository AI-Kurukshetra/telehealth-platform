"use client";

import { useActionState, useMemo, useState } from "react";

import { bookAppointmentAction } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { getWeekdayFromDate } from "@/lib/helpers";
import type { DoctorAvailability, DoctorDirectoryItem } from "@/lib/types";

const initialState = { error: "", success: false, videoRoomId: "", paymentStatus: "" };

function getSlotsForDate(
  availability: DoctorAvailability[],
  doctorId: string,
  date: string
) {
  if (!doctorId || !date) {
    return [];
  }

  const weekday = getWeekdayFromDate(date);

  return availability
    .filter((slot) => slot.doctor_id === doctorId && slot.weekday === weekday)
    .map((slot) => slot.time_slot);
}

export function BookAppointmentForm({
  doctors,
  availability
}: {
  doctors: DoctorDirectoryItem[];
  availability: DoctorAvailability[];
}) {
  const specializations = [...new Set(doctors.map((doctor) => doctor.specialization))];
  const initialSpecialization = specializations[0] ?? "";
  const initialDoctorId =
    doctors.find((doctor) => doctor.specialization === initialSpecialization)?.id ?? "";
  const [specialization, setSpecialization] = useState<string>(initialSpecialization);
  const [doctorId, setDoctorId] = useState<string>(initialDoctorId);
  const [appointmentDate, setAppointmentDate] = useState<string>("");
  const [timeSlot, setTimeSlot] = useState<string>("");
  const [state, action, pending] = useActionState(bookAppointmentAction, initialState);

  const filteredDoctors = doctors.filter((doctor) => doctor.specialization === specialization);
  const availableSlots = useMemo(
    () => getSlotsForDate(availability, doctorId, appointmentDate),
    [appointmentDate, availability, doctorId]
  );

  function handleSpecializationChange(nextSpecialization: string) {
    const nextDoctors = doctors.filter(
      (doctor) => doctor.specialization === nextSpecialization
    );
    const nextDoctorId = nextDoctors[0]?.id ?? "";

    setSpecialization(nextSpecialization);
    setDoctorId(nextDoctorId);
    setTimeSlot(getSlotsForDate(availability, nextDoctorId, appointmentDate)[0] ?? "");
  }

  function handleDoctorChange(nextDoctorId: string) {
    setDoctorId(nextDoctorId);
    setTimeSlot(getSlotsForDate(availability, nextDoctorId, appointmentDate)[0] ?? "");
  }

  function handleDateChange(nextDate: string) {
    setAppointmentDate(nextDate);
    setTimeSlot(getSlotsForDate(availability, doctorId, nextDate)[0] ?? "");
  }

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle>Book a consultation</CardTitle>
        <CardDescription>
          Choose a specialist, select your doctor, and confirm a visit time that fits your care plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <Label>Specialization</Label>
            <Select
              name="specialization"
              value={specialization}
              onValueChange={handleSpecializationChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select specialization" />
              </SelectTrigger>
              <SelectContent>
                {specializations.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Doctor</Label>
            <Select name="doctorId" value={doctorId} onValueChange={handleDoctorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.full_name} (${doctor.consultation_fee})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={appointmentDate}
              onChange={(event) => handleDateChange(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Time Slot</Label>
            <Select name="timeSlot" value={timeSlot} onValueChange={setTimeSlot}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {appointmentDate && availableSlots.length === 0 ? (
              <p className="text-sm text-amber-700">
                This doctor is unavailable on the selected day. Choose another date or doctor.
              </p>
            ) : null}
          </div>
          <div className="lg:col-span-2">
            {filteredDoctors.length === 0 ? (
              <p className="mb-3 text-sm text-amber-700">
                No doctors are currently available for this specialization.
              </p>
            ) : null}
            {state.error ? <p className="mb-3 text-sm text-rose-600">{state.error}</p> : null}
            <Button
              disabled={
                pending ||
                filteredDoctors.length === 0 ||
                !doctorId ||
                !appointmentDate ||
                !timeSlot
              }
            >
              {pending ? "Preparing payment..." : "Continue to payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
