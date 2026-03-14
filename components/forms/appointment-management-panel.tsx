"use client";

import { useActionState, useMemo, useState } from "react";

import {
  cancelAppointmentAction,
  rescheduleAppointmentAction,
  startCheckoutAction
} from "@/app/actions/appointments";
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
import { formatAppointmentDateTime, getWeekdayFromDate } from "@/lib/helpers";
import type { AppointmentWithDoctor, DoctorAvailability } from "@/lib/types";

const initialState = { error: "", success: false };

function getWeekdaySlots(availability: DoctorAvailability[], date: string) {
  if (!date) {
    return [];
  }

  const weekday = getWeekdayFromDate(date);
  return availability
    .filter((slot) => slot.weekday === weekday)
    .map((slot) => slot.time_slot);
}

export function AppointmentManagementPanel({
  appointment,
  availability
}: {
  appointment: AppointmentWithDoctor;
  availability: DoctorAvailability[];
}) {
  const [selectedDate, setSelectedDate] = useState(appointment.appointment_date);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(appointment.time_slot);
  const [rescheduleState, rescheduleAction, reschedulePending] = useActionState(
    rescheduleAppointmentAction,
    initialState
  );

  const availableSlots = useMemo(
    () => getWeekdaySlots(availability, selectedDate),
    [availability, selectedDate]
  );

  return (
    <div className="space-y-6">
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>{appointment.doctor?.full_name ?? "Assigned doctor"}</CardTitle>
          <CardDescription>
            {formatAppointmentDateTime(appointment.appointment_date, appointment.time_slot)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap gap-2">
            <Badge variant={appointment.status === "cancelled" ? "destructive" : "default"}>
              {appointment.status.replace("_", " ")}
            </Badge>
            <Badge variant={appointment.payment_status === "paid" ? "success" : "warning"}>
              Payment {appointment.payment_status}
            </Badge>
            {appointment.doctor?.specialization ? (
              <Badge variant="outline">{appointment.doctor.specialization}</Badge>
            ) : null}
          </div>
          <p>
            Room ID: <span className="font-medium text-foreground">{appointment.video_room_id}</span>
          </p>
          {appointment.cancellation_reason ? (
            <p>
              Cancellation note:{" "}
              <span className="font-medium text-foreground">{appointment.cancellation_reason}</span>
            </p>
          ) : null}
          {appointment.payment_status !== "paid" && appointment.status !== "cancelled" ? (
            <form action={startCheckoutAction}>
              <input type="hidden" name="appointmentId" value={appointment.id} />
              <Button variant="outline">Complete payment</Button>
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>Reschedule appointment</CardTitle>
          <CardDescription>
            Pick a new date and only the slots from the doctor&apos;s configured schedule will be shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={rescheduleAction} className="space-y-4">
            <input type="hidden" name="appointmentId" value={appointment.id} />
            <div className="space-y-2">
              <Label htmlFor="reschedule-date">New date</Label>
              <Input
                id="reschedule-date"
                name="date"
                type="date"
                value={selectedDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => {
                  const nextDate = event.target.value;
                  setSelectedDate(nextDate);
                  const nextSlots = getWeekdaySlots(availability, nextDate);
                  setSelectedTimeSlot((current) =>
                    nextSlots.includes(current) ? current : (nextSlots[0] ?? "")
                  );
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>New time slot</Label>
              <Select name="timeSlot" value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a new time slot" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableSlots.length === 0 ? (
                <p className="text-sm text-amber-700">
                  No configured availability exists for that day. Choose another date.
                </p>
              ) : null}
            </div>
            {rescheduleState.error ? (
              <p className="text-sm text-rose-600">{rescheduleState.error}</p>
            ) : null}
            {rescheduleState.success ? (
              <p className="text-sm text-emerald-700">Appointment rescheduled successfully.</p>
            ) : null}
            <Button disabled={reschedulePending || availableSlots.length === 0 || !selectedTimeSlot}>
              {reschedulePending ? "Saving..." : "Save new slot"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-rose-200 bg-rose-50/80">
        <CardHeader>
          <CardTitle>Cancel appointment</CardTitle>
          <CardDescription>
            Cancelling frees the doctor&apos;s slot so it can be booked again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={cancelAppointmentAction} className="space-y-4">
            <input type="hidden" name="appointmentId" value={appointment.id} />
            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">Reason</Label>
              <Textarea
                id="cancellation-reason"
                name="reason"
                placeholder="Briefly explain why the visit is being cancelled."
                defaultValue={appointment.cancellation_reason ?? ""}
              />
            </div>
            <Button variant="destructive" disabled={appointment.status === "cancelled"}>
              {appointment.status === "cancelled" ? "Already cancelled" : "Cancel appointment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
