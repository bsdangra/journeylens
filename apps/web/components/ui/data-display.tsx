import type { ReactNode } from "react";

export type Tone =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary";

export function Badge({
  tone = "neutral",
  dot,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}${dot ? " badge-dot" : ""}`}>
      {children}
    </span>
  );
}

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const STATUS_TONE: Record<string, Tone> = {
  completed: "success",
  passed: "success",
  failed: "danger",
  running: "info",
  pending: "neutral",
  skipped: "neutral",
};

/** Execution and run status, e.g. completed, failed or passed. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={STATUS_TONE[status] ?? "neutral"} dot>
      {capitalize(status)}
    </Badge>
  );
}

export const SEVERITY_TONE: Record<string, Tone> = {
  critical: "danger",
  high: "danger",
  medium: "warning",
  low: "info",
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge tone={SEVERITY_TONE[severity] ?? "neutral"}>
      {capitalize(severity)}
    </Badge>
  );
}

export function Stat({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="card stat">
      <span className="stat-label">
        {icon && <span className="stat-icon">{icon}</span>}
        {label}
      </span>
      <span className="stat-value">{value}</span>
      {meta && <span className="stat-meta">{meta}</span>}
    </div>
  );
}

/** Initials avatar with a stable tint per name. */
export function Avatar({ name, size }: { name: string; size?: "sm" }) {
  const initials = name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  const tone =
    [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 6;
  return (
    <span
      className={`avatar tone-${tone}${size === "sm" ? " avatar-sm" : ""}`}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/** Circular 0-100 score. A null score renders as pending. */
export function ScoreRing({
  score,
  size = 64,
}: {
  score: number | null;
  size?: number;
}) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score ?? 0;
  const color =
    score === null
      ? "var(--border-strong)"
      : value >= 80
        ? "var(--success-solid)"
        : value >= 60
          ? "var(--warning-solid)"
          : "var(--danger-solid)";

  return (
    <div
      className="score-ring"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        score === null ? "Not scored yet" : `Score ${score} out of 100`
      }
    >
      <svg width={size} height={size}>
        <circle
          className="score-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
        />
        <circle
          className="score-ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
        />
      </svg>
      <span className="score-ring-label">
        <strong>{score ?? "–"}</strong>
        <small>{score === null ? "pending" : "/ 100"}</small>
      </span>
    </div>
  );
}

export function ProgressBar({
  value,
  tone,
  label,
}: {
  value: number;
  tone?: "success" | "danger";
  label: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`progress${tone ? ` is-${tone}` : ""}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${clamped}%` }} />
    </div>
  );
}
