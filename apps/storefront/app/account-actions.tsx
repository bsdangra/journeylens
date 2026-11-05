"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearDemoSession, getDemoSession } from "./demo-auth";

export default function AccountActions() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setEmail(getDemoSession());
  }, []);

  if (!email) {
    return (
      <Link href="/login" className="primary-btn" id="login-link">
        Login
      </Link>
    );
  }

  return (
    <>
      <span className="account-greeting">Hi, {email}</span>
      <button
        type="button"
        className="secondary-btn"
        id="sign-out-button"
        onClick={() => {
          clearDemoSession();
          setEmail(null);
        }}
      >
        Sign out
      </button>
    </>
  );
}
