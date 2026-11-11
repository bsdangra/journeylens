"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Mount only while open. Uses the native <dialog>, which provides the focus
 * trap, Escape handling and top-layer stacking. The effect cleanup also covers
 * Next.js hiding a route with <Activity>: the dialog closes when the route is
 * hidden and reopens when it is shown again.
 */
export function Modal({
  title,
  description,
  onClose,
  wide,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  wide?: boolean;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={wide ? "modal modal-wide" : "modal"}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="modal-header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        <button
          type="button"
          className="modal-close"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}

export function ConfirmDialog({
  title,
  children,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-body modal-copy">{children}</div>
      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
