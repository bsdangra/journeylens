import type { ReactNode } from "react";
import { AlertTriangleIcon, RefreshIcon } from "./icons";

export function EmptyState({
  icon,
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actions && <div className="empty-actions">{actions}</div>}
    </div>
  );
}

/** Placeholder rows shown while API data loads. */
export function SkeletonRows({
  rows = 3,
  label,
}: {
  rows?: number;
  label: string;
}) {
  return (
    <div className="skeleton-rows" role="status" aria-label={label}>
      {Array.from({ length: rows }, (_, index) => (
        <div className="skeleton-row" key={index}>
          <div
            className="skeleton"
            style={{ width: 36, height: 36, borderRadius: "50%" }}
          />
          <div style={{ flex: 1, display: "grid", gap: 8 }}>
            <div className="skeleton" style={{ width: "38%", height: 12 }} />
            <div className="skeleton" style={{ width: "64%", height: 10 }} />
          </div>
          <div
            className="skeleton"
            style={{ width: 72, height: 22, borderRadius: 999 }}
          />
        </div>
      ))}
    </div>
  );
}

export function ErrorAlert({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="alert alert-danger" role="alert">
      <AlertTriangleIcon size={18} />
      <div className="alert-content">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onRetry}
        >
          <RefreshIcon size={14} /> Try again
        </button>
      )}
    </div>
  );
}
