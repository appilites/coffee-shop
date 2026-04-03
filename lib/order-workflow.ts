import type { LucideIcon } from "lucide-react"
import { Clock, CheckCircle2, Package, Car, Truck, XCircle } from "lucide-react"

/** Must match `orders.status` in DB (lowercase). Admin dashboard updates this column. */
export type OrderWorkflowStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "completed"
  | "cancelled"

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Order received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for pickup",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
}

/** Linear timeline for progress UI (cancelled is handled separately). */
export const ORDER_WORKFLOW_STEPS: Array<{ id: OrderWorkflowStatus; label: string; icon: LucideIcon }> = [
  { id: "pending", label: ORDER_STATUS_LABELS.pending, icon: Clock },
  { id: "confirmed", label: ORDER_STATUS_LABELS.confirmed, icon: CheckCircle2 },
  { id: "preparing", label: ORDER_STATUS_LABELS.preparing, icon: Package },
  { id: "ready", label: ORDER_STATUS_LABELS.ready, icon: Car },
  { id: "delivered", label: ORDER_STATUS_LABELS.delivered, icon: Truck },
  { id: "completed", label: ORDER_STATUS_LABELS.completed, icon: CheckCircle2 },
]

export function normalizeOrderStatus(raw: string | undefined | null): string {
  return (raw || "pending").toLowerCase().trim()
}

/** Index in ORDER_WORKFLOW_STEPS for the current status (clamped). Cancelled → -1. */
export function getWorkflowStepIndex(status: string | undefined | null): number {
  const s = normalizeOrderStatus(status)
  if (s === "cancelled") return -1
  const i = ORDER_WORKFLOW_STEPS.findIndex((step) => step.id === s)
  return i >= 0 ? i : 0
}

export const cancelledMeta = { label: ORDER_STATUS_LABELS.cancelled, icon: XCircle }
