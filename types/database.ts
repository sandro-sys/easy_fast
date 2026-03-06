export type ReservationStatus = "pre" | "confirmed" | "cancelled" | "completed" | "no_show";

export interface Reservation {
  id: string;
  guest_name: string;
  guest_phone: string;
  observation: string | null;
  reservation_date: string;
  reservation_time: string;
  status: ReservationStatus;
  attended: boolean | null;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_cents: number | null;
  features: string[];
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClosedDate {
  id: string;
  date: string;
  reason: string | null;
  created_at: string;
}

export interface Settings {
  reservation_limit_per_slot: number;
  reservation_slot_minutes: number;
  business_open_time: string;
  business_close_time: string;
}
