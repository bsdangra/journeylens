"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { ChevronRightIcon, PanelLeftIcon } from "@/components/ui/icons";
import { useMenu } from "./app-shell";

export type Crumb = { label: string; href?: string };

function Topbar({ breadcrumbs }: { breadcrumbs: Crumb[] }) {
  const { expanded, toggle } = useMenu();

  return (
    <header className="topbar">
      <button
        type="button"
        className="btn btn-ghost btn-icon"
        aria-label={expanded ? "Hide navigation" : "Show navigation"}
        aria-expanded={expanded}
        onClick={toggle}
      >
        <PanelLeftIcon size={18} />
      </button>
      <nav aria-label="Breadcrumb">
        <ol className="breadcrumbs">
          {breadcrumbs.map((crumb, index) => {
            const last = index === breadcrumbs.length - 1;
            return (
              <Fragment key={`${crumb.label}-${index}`}>
                {index > 0 && <ChevronRightIcon size={14} />}
                <li>
                  {last || !crumb.href ? (
                    <span aria-current={last ? "page" : undefined}>
                      {crumb.label}
                    </span>
                  ) : (
                    <Link href={crumb.href}>{crumb.label}</Link>
                  )}
                </li>
              </Fragment>
            );
          })}
        </ol>
      </nav>
    </header>
  );
}

/** Standard page frame: top bar with breadcrumbs, page header, content, footer. */
export function Page({
  breadcrumbs,
  title,
  description,
  actions,
  children,
}: {
  breadcrumbs: Crumb[];
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <Topbar breadcrumbs={breadcrumbs} />
      <div className="page">
        <div className="page-header">
          <div>
            <h1>{title}</h1>
            {description && <p className="page-description">{description}</p>}
          </div>
          {actions && <div className="page-actions">{actions}</div>}
        </div>
        {children}
        <footer className="page-footer">
          <span>JourneyLens · Evidence-led website experience evaluation</span>
          <span>Data served live by the JourneyLens API</span>
        </footer>
      </div>
    </>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
  id,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  id?: string;
}) {
  return (
    <div className="section-header">
      <div>
        <h2 id={id}>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}
