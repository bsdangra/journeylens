"use client";

import type { ReactNode } from "react";
import { useMenu } from "./app-shell";

export function PageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
}) {
  const { expanded, toggle } = useMenu();

  return (
    <header className="topbar">
      <div className="topbar-start">
        <button
          type="button"
          className="menu-button"
          aria-label={expanded ? "Close menu" : "Open menu"}
          aria-expanded={expanded}
          onClick={toggle}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        <div className="topbar-title">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        {actions}
        <div className="avatar">B</div>
      </div>
    </header>
  );
}

/** Standard page frame: header, content and footer. */
export function ContentPage({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="main-content">
      <PageHeader eyebrow={eyebrow} title={title} actions={actions} />
      {children}
      <footer className="page-footer">
        <span>JourneyLens · Evidence-led website experience evaluation</span>
        <span className="demo-tag">LIVE DATA · JOURNEYLENS API</span>
      </footer>
    </section>
  );
}
