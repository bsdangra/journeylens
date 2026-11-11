"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Sidebar } from "./sidebar";

const MOBILE_QUERY = "(max-width: 700px)";

function subscribeToViewport(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const MenuContext = createContext<{
  expanded: boolean;
  toggle: () => void;
}>({ expanded: true, toggle: () => {} });

export function useMenu() {
  return useContext(MenuContext);
}

export function AppShell({ children }: { children: ReactNode }) {
  const isMobile = useSyncExternalStore(
    subscribeToViewport,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const expanded = isMobile ? mobileOpen : desktopOpen;
  const drawerOpen = isMobile && mobileOpen;

  function toggle() {
    if (isMobile) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setMobileOpen((open) => !open);
    } else {
      setDesktopOpen((open) => !open);
    }
  }

  useEffect(() => {
    if (!drawerOpen) return;

    sidebarRef.current?.querySelector("a")?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      returnFocusRef.current?.focus();
    };
  }, [drawerOpen]);

  const classNames = [
    "dashboard",
    desktopOpen ? "" : "sidebar-collapsed",
    mobileOpen ? "sidebar-open" : "",
  ].join(" ");

  return (
    <MenuContext.Provider value={{ expanded, toggle }}>
      <main className={classNames}>
        <Sidebar
          ref={sidebarRef}
          inert={!expanded}
          onNavigate={() => setMobileOpen(false)}
        />
        {drawerOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
        )}
        {children}
      </main>
    </MenuContext.Provider>
  );
}
