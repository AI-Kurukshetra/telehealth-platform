import Link from "next/link";
import { CalendarDays, Clock3 } from "lucide-react";

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
  doctor?: { full_name?: string | null };
  patient?: { full_name?: string | null };
};

export function AppointmentTable({
  appointments,
  role
}: {
  appointments: AppointmentRow[];
  role: "patient" | "doctor";
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{role === "patient" ? "Doctor" : "Patient"}</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
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
              <Badge className="rounded-full" variant={appointment.status === "completed" ? "success" : "default"}>
                {appointment.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className="rounded-full" variant={appointment.payment_status === "paid" ? "success" : "warning"}>
                {appointment.payment_status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {role === "patient" && appointment.payment_status !== "paid" ? (
                <form action={startCheckoutAction}>
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <Button size="sm" variant="outline">
                    Pay now
                  </Button>
                </form>
              ) : (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`https://meet.jit.si/${appointment.video_room_id}`}>Join</Link>
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
