"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

const POLL_MS = 30_000;

export type ApiHealth = "checking" | "online" | "offline";

/** Polls GET /health so the shell can show whether the API is reachable. */
export function useApiHealth(): ApiHealth {
  const [health, setHealth] = useState<ApiHealth>("checking");

  useEffect(() => {
    let cancelled = false;
    const check = () =>
      fetch(`${API_URL}/health`, { cache: "no-store" })
        .then((response) => !cancelled && setHealth(response.ok ? "online" : "offline"))
        .catch(() => !cancelled && setHealth("offline"));

    check();
    const timer = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  return health;
}
