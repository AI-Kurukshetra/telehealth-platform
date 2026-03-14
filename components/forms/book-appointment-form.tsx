"use client";

import { useActionState, useMemo, useState } from "react";
import { BrainCircuit, CalendarClock, Clock3, Stethoscope } from "lucide-react";

import { bookAppointmentAction } from "@/app/actions/appointments";
import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
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
  const [includeVisitPrep, setIncludeVisitPrep] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [symptomDuration, setSymptomDuration] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [state, action, pending] = useActionState(bookAppointmentAction, initialState);

  const filteredDoctors = doctors.filter((doctor) => doctor.specialization === specialization);
  const selectedDoctor =
    doctors.find((doctor) => doctor.id === doctorId) ?? filteredDoctors[0] ?? null;
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
          Choose your specialist, review the visit details, and reserve a time that fits your care plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_23rem]">
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-2">
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
              </div>

              <div className="rounded-[1.75rem] border border-border/60 bg-[#fffaf2] p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                      AI visit prep
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Add your symptoms and current concerns now so the doctor sees a concise intake
                      summary before the appointment starts.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={includeVisitPrep ? "secondary" : "outline"}
                    onClick={() => setIncludeVisitPrep((current) => !current)}
                  >
                    {includeVisitPrep ? "Hide intake" : "Add intake"}
                  </Button>
                </div>

                <input
                  type="hidden"
                  name="includeVisitPrep"
                  value={includeVisitPrep ? "true" : "false"}
                />

                {includeVisitPrep ? (
                  <div className="mt-5 space-y-4">
                    <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="booking-symptoms">What symptoms are you experiencing?</Label>
                      <Textarea
                        id="booking-symptoms"
                        name="symptoms"
                        value={symptoms}
                        onChange={(event) => setSymptoms(event.target.value)}
                        placeholder="Describe the main symptoms, severity, and anything that makes them better or worse."
                        required={includeVisitPrep}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="booking-symptom-duration">How long has this been happening?</Label>
                      <Input
                        id="booking-symptom-duration"
                        name="symptomDuration"
                        value={symptomDuration}
                        onChange={(event) => setSymptomDuration(event.target.value)}
                        placeholder="For example: 3 days, 2 weeks, since yesterday"
                      />
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="booking-medications">Current medications</Label>
                        <Textarea
                          id="booking-medications"
                          name="currentMedications"
                          value={currentMedications}
                          onChange={(event) => setCurrentMedications(event.target.value)}
                          placeholder="Prescription medicines, supplements, or home remedies."
                          className="min-h-[140px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="booking-allergies">Allergies</Label>
                        <Textarea
                          id="booking-allergies"
                          name="allergies"
                          value={allergies}
                          onChange={(event) => setAllergies(event.target.value)}
                          placeholder="Medication, food, environmental, or seasonal allergies."
                          className="min-h-[140px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="booking-history">Relevant medical history</Label>
                      <Textarea
                        id="booking-history"
                        name="medicalHistory"
                        value={medicalHistory}
                        onChange={(event) => setMedicalHistory(event.target.value)}
                        placeholder="Previous diagnoses, surgeries, recurring issues, or family history that may matter."
                        className="min-h-[140px]"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.85rem] border border-border/60 bg-muted/30 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Visit summary
                </p>
                {selectedDoctor ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-foreground">
                          {selectedDoctor.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDoctor.specialization}
                        </p>
                      </div>
                      <Badge variant="outline">${selectedDoctor.consultation_fee}</Badge>
                    </div>
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
                        <Stethoscope className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Specialist</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedDoctor.specialization}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
                        <CalendarClock className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Selected date</p>
                          <p className="text-sm text-muted-foreground">
                            {appointmentDate || "Choose a date to continue"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-[1.25rem] bg-white/80 px-4 py-3">
                        <Clock3 className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Selected time</p>
                          <p className="text-sm text-muted-foreground">
                            {timeSlot || "Choose a time slot"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Booking reserves the appointment first and then takes you to secure checkout to
                      complete payment.
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Select a specialization to review the consultation details.
                  </p>
                )}
              </div>
            </div>
          </div>
          <div>
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
