"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ComponentType, type Ref } from "react";
import {
  HistoryIcon,
  LayoutDashboardIcon,
  LogoMark,
  RouteIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { API_URL } from "@/lib/api";
import { useApiHealth } from "@/lib/use-api-health";

type NavLink = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
};

const NAV_GROUPS: { caption: string; links: NavLink[] }[] = [
  {
    caption: "Workspace",
    links: [
      { href: "/", label: "New evaluation", icon: LayoutDashboardIcon },
      { href: "/evaluations", label: "Evaluation history", icon: HistoryIcon },
    ],
  },
  {
    caption: "Library",
    links: [
      { href: "/masters/journeys", label: "Journeys", icon: RouteIcon },
      { href: "/masters/personas", label: "Personas", icon: UsersIcon },
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
          {group.links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="nav-item"
              aria-current={isActive(pathname, href) ? "page" : undefined}
              onClick={onNavigate}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

function SidebarNavWithPath({ onNavigate }: { onNavigate: () => void }) {
  return <SidebarNav pathname={usePathname()} onNavigate={onNavigate} />;
}

const HEALTH_COPY = {
  checking: "Checking connection…",
  online: "Connected",
  offline: "Unreachable",
} as const;

function ApiStatus() {
  const health = useApiHealth();
  return (
    <div className="api-status" role="status" aria-live="polite">
      <span
        className={`pulse-dot ${
          health === "online" ? "is-online" : health === "offline" ? "is-offline" : ""
        }`}
        aria-hidden="true"
      />
      <div>
        <strong>API · {HEALTH_COPY[health]}</strong>
        <span title={API_URL}>{API_URL.replace(/^https?:\/\//, "")}</span>
      </div>
    </div>
  );
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
      <Link href="/" className="sidebar-brand" onClick={onNavigate}>
        <LogoMark size={32} />
        <div>
          <strong>JourneyLens</strong>
          <span>UX evaluation</span>
        </div>
      </Link>

      {/* usePathname suspends on dynamic routes under cacheComponents. */}
      <Suspense fallback={<SidebarNav pathname={null} onNavigate={onNavigate} />}>
        <SidebarNavWithPath onNavigate={onNavigate} />
      </Suspense>

      <div className="sidebar-footer">
        <ApiStatus />
      </div>
    </aside>
  );
}
