"use client";

import { useActionState } from "react";

import { updateDoctorAvailabilityAction } from "@/app/actions/appointments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TIME_SLOTS, WEEKDAY_OPTIONS } from "@/lib/constants";
import type { DoctorAvailability } from "@/lib/types";

const initialState = {
  error: "",
  success: false,
  savedCount: 0
};

export function DoctorAvailabilityForm({
  availability
}: {
  availability: DoctorAvailability[];
}) {
  const [state, action, pending] = useActionState(
    updateDoctorAvailabilityAction,
    initialState
  );
  const selected = new Set(
    availability.map((slot) => `${slot.weekday}|${slot.time_slot}`)
  );

  return (
    <Card className="bg-white/95">
      <CardHeader>
        <CardTitle>Weekly availability</CardTitle>
        <CardDescription>
          Update the recurring slots patients can book. Changes apply immediately to new bookings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-6">
          <div className="grid gap-4 xl:grid-cols-2">
            {WEEKDAY_OPTIONS.map((day) => (
              <div key={day.value} className="rounded-[1.5rem] border border-border/70 bg-muted/30 p-4">
                <p className="mb-3 font-semibold">{day.label}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {TIME_SLOTS.map((slot) => {
                    const value = `${day.value}|${slot}`;
                    return (
                      <label
                        key={value}
                        className="flex items-center gap-2 rounded-xl border border-transparent bg-white/80 px-3 py-2 text-sm text-muted-foreground hover:border-border/80 hover:text-foreground"
                      >
                        <input
                          type="checkbox"
                          name="slots"
                          value={value}
                          defaultChecked={selected.has(value)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span>{slot}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
          {state.success ? (
            <p className="text-sm text-emerald-700">
              Availability saved. {state.savedCount} weekly slots are active.
            </p>
          ) : null}
          <Button disabled={pending}>{pending ? "Saving..." : "Save availability"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
