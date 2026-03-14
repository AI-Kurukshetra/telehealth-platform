"use client";

import { useState } from "react";
import { CalendarClock, ClipboardList, FilePenLine, UserRound } from "lucide-react";

import { MedicalRecordForm } from "@/components/forms/medical-record-form";
import { VisitPrepSummaryCard } from "@/components/visit-prep-summary-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAppointmentDateTime } from "@/lib/helpers";
import type {
  AppointmentWithPatient,
  MedicalRecordWithPatient,
  VisitPreparation
} from "@/lib/types";

function getStatusVariant(status: string) {
  if (status === "completed") {
    return "success";
  }

  if (status === "cancelled") {
    return "destructive";
  }

  if (status === "in_progress") {
    return "warning";
  }

  return "default";
}

function getPaymentVariant(paymentStatus: string) {
  if (paymentStatus === "paid") {
    return "success";
  }

  if (paymentStatus === "failed") {
    return "destructive";
  }

  return "warning";
}

export function DoctorAppointmentWorkspace({
  appointment,
  existingRecord,
  visitPreparation
}: {
  appointment: AppointmentWithPatient | null;
  existingRecord: MedicalRecordWithPatient | null;
  visitPreparation: VisitPreparation | null;
}) {
  const [activeTab, setActiveTab] = useState<"brief" | "notes">("brief");

  if (!appointment) {
    return (
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle>No appointment selected</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Select an appointment to review patient context, AI intake, and clinical notes.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <span>{appointment.patient?.full_name ?? "Patient appointment"}</span>
            <div className="flex flex-wrap gap-2">
              <Badge variant={getStatusVariant(appointment.status)} className="capitalize">
                {appointment.status.replace("_", " ")}
              </Badge>
              <Badge variant={getPaymentVariant(appointment.payment_status)} className="capitalize">
                {appointment.payment_status}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.3rem] bg-muted/35 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <CalendarClock className="h-4 w-4 text-primary" />
                Visit time
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {formatAppointmentDateTime(appointment.appointment_date, appointment.time_slot)}
              </p>
            </div>
            <div className="rounded-[1.3rem] bg-muted/35 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <UserRound className="h-4 w-4 text-primary" />
                Patient details
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {appointment.patient?.age ? `${appointment.patient.age} years old` : "Age unavailable"}
                {appointment.patient?.gender ? `, ${appointment.patient.gender}` : ""}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 rounded-[1.3rem] bg-[#fffaf2] p-2">
            <Button
              type="button"
              size="sm"
              variant={activeTab === "brief" ? "default" : "ghost"}
              onClick={() => setActiveTab("brief")}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Visit brief
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeTab === "notes" ? "default" : "ghost"}
              onClick={() => setActiveTab("notes")}
            >
              <FilePenLine className="mr-2 h-4 w-4" />
              Medical note
            </Button>
          </div>
        </CardContent>
      </Card>

      {activeTab === "brief" ? (
        <VisitPrepSummaryCard preparation={visitPreparation} />
      ) : (
        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>{existingRecord ? "Update medical note" : "Add medical note"}</CardTitle>
          </CardHeader>
          <CardContent>
            <MedicalRecordForm
              appointmentId={appointment.id}
              patientId={appointment.patient_id}
              defaultValues={
                existingRecord
                  ? {
                      diagnosis: existingRecord.diagnosis,
                      prescription: existingRecord.prescription,
                      clinicalNotes: existingRecord.clinical_notes
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
