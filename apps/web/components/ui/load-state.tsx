/** Shown while API data loads, or when it fails, with a retry. */
export function LoadingState({ label }: { label: string }) {
  return (
    <div className="empty-state load-state" role="status">
      <span className="spinner spinner-dark" aria-hidden="true" /> {label}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="error-banner load-error" role="alert">
      <div>
        <strong>{title}</strong> {message}
      </div>
      {onRetry && (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
