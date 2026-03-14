"use client";

import { useActionState, useState } from "react";

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
import { TIME_SLOTS } from "@/lib/constants";
import type { DoctorProfile } from "@/lib/types";

const initialState = { error: "", success: false, videoRoomId: "", paymentStatus: "" };

type DoctorOption = DoctorProfile & {
  user?: {
    id: string;
    email: string;
    full_name: string;
  } | null;
};

export function BookAppointmentForm({
  doctors
}: {
  doctors: DoctorOption[];
}) {
  const specializations = [...new Set(doctors.map((doctor) => doctor.specialization))];
  const [specialization, setSpecialization] = useState<string>(
    specializations[0] ?? ""
  );
  const [doctorId, setDoctorId] = useState<string>(doctors[0]?.id ?? "");
  const [state, action, pending] = useActionState(bookAppointmentAction, initialState);

  const filteredDoctors = doctors.filter(
    (doctor) => doctor.specialization === specialization
  );

  function handleSpecializationChange(nextSpecialization: string) {
    const nextDoctors = doctors.filter(
      (doctor) => doctor.specialization === nextSpecialization
    );

    setSpecialization(nextSpecialization);
    setDoctorId(nextDoctors[0]?.id ?? "");
  }

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle>Book a consultation</CardTitle>
        <CardDescription>Choose a specialist, doctor, date, and fixed 30-minute slot.</CardDescription>
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
            <Select name="doctorId" value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {filteredDoctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.user?.full_name} (${doctor.consultation_fee})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label>Time Slot</Label>
            <Select name="timeSlot" defaultValue={TIME_SLOTS[0]}>
              <SelectTrigger>
                <SelectValue placeholder="Select time slot" />
              </SelectTrigger>
              <SelectContent>
                {TIME_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-2">
            {filteredDoctors.length === 0 ? (
              <p className="mb-3 text-sm text-amber-700">
                No doctors are currently available for this specialization.
              </p>
            ) : null}
            {state.error ? <p className="mb-3 text-sm text-rose-600">{state.error}</p> : null}
            <p className="mb-3 text-sm text-muted-foreground">
              After confirmation you will be redirected to Stripe Checkout to complete payment securely.
            </p>
            <Button disabled={pending || filteredDoctors.length === 0 || !doctorId}>
              {pending ? "Preparing payment..." : "Continue to payment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
