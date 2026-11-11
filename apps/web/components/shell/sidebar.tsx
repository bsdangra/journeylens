"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type Ref } from "react";

const NAV_GROUPS = [
  {
    caption: "WORKSPACE",
    links: [
      { href: "/", icon: "◫", label: "Overview" },
      { href: "/evaluations", icon: "◎", label: "Evaluations" },
    ],
  },
  {
    caption: "MASTERS",
    links: [
      { href: "/masters/journeys", icon: "⇢", label: "Journeys" },
      { href: "/masters/personas", icon: "♙", label: "Personas" },
    ],
  },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label="Main">
      {NAV_GROUPS.map((group) => (
        <div className="nav-group" key={group.caption}>
          <p className="nav-caption">{group.caption}</p>
          {group.links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-item ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
              >
                <span aria-hidden="true">{link.icon}</span> {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarNavWithPath({ onNavigate }: { onNavigate: () => void }) {
  return <SidebarNav pathname={usePathname()} onNavigate={onNavigate} />;
}

export function Sidebar({
  ref,
  inert,
  onNavigate,
}: {
  ref: Ref<HTMLElement>;
  inert: boolean;
  onNavigate: () => void;
}) {
  return (
    <aside className="sidebar" ref={ref} inert={inert}>
      <div className="brand">
        <div className="brand-mark">J</div>
        <span>journey<span className="brand-light">lens</span></span>
      </div>

      {/* usePathname suspends on dynamic routes under cacheComponents. */}
      <Suspense fallback={<SidebarNav pathname={null} onNavigate={onNavigate} />}>
        <SidebarNavWithPath onNavigate={onNavigate} />
      </Suspense>

      <div className="sidebar-bottom">
        <div className="status-dot" />
        <span>Local environment</span>
      </div>
    </aside>
  );
}
