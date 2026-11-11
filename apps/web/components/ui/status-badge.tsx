export type BadgeStatus = "active" | "inactive" | "completed" | "failed";

const LABELS: Record<BadgeStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  completed: "Completed",
  failed: "Failed",
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <span className={`status-badge badge-${status}`}>
      <span className="status-badge-dot" aria-hidden="true" />
      {LABELS[status]}
    </span>
  );
}
