import Link from "next/link";
import { CalendarDays, Clock3, MoreHorizontal } from "lucide-react";

import { startCheckoutAction } from "@/app/actions/appointments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatAppointmentDate } from "@/lib/helpers";

type AppointmentRow = {
  id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  payment_status: string;
  video_room_id: string;
  cancellation_reason?: string | null;
  doctor?: { full_name?: string | null };
  patient?: { full_name?: string | null };
};

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

export function AppointmentTable({
  appointments,
  role,
  managementBasePath,
  selectedAppointmentId
}: {
  appointments: AppointmentRow[];
  role: "patient" | "doctor";
  managementBasePath?: string;
  selectedAppointmentId?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{role === "patient" ? "Doctor" : "Patient"}</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((appointment) => {
            const isCancelled = appointment.status === "cancelled";
            const canJoin = !isCancelled && (role === "doctor" || appointment.payment_status === "paid");

            return (
              <TableRow
                key={appointment.id}
                className={selectedAppointmentId === appointment.id ? "bg-primary/5" : undefined}
              >
                <TableCell className="font-semibold">
                  {role === "patient"
                    ? appointment.doctor?.full_name
                    : appointment.patient?.full_name}
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>{formatAppointmentDate(appointment.appointment_date)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-2 text-muted-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    <span>{appointment.time_slot}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className="rounded-full capitalize" variant={getStatusVariant(appointment.status)}>
                    {appointment.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="rounded-full capitalize" variant={getPaymentVariant(appointment.payment_status)}>
                    {appointment.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {role === "patient" && appointment.payment_status !== "paid" && !isCancelled ? (
                      <form action={startCheckoutAction}>
                        <input type="hidden" name="appointmentId" value={appointment.id} />
                        <Button size="sm" variant="outline">
                          Pay now
                        </Button>
                      </form>
                    ) : null}
                    {canJoin ? (
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`https://meet.jit.si/${appointment.video_room_id}`}>Join</Link>
                      </Button>
                    ) : null}
                    {managementBasePath ? (
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`${managementBasePath}?appointment=${appointment.id}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Link>
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
