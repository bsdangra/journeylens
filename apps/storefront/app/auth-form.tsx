"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  DEMO_ACCOUNT,
  getDemoAccounts,
  saveDemoAccounts,
  setDemoSession,
} from "./demo-auth";

type AuthMode = "login" | "signup" | "forgot-password";

const pageCopy: Record<AuthMode, { eyebrow: string; title: string; description: string }> = {
  login: {
    eyebrow: "Welcome back",
    title: "Sign in to your account",
    description: "Access your orders, saved items, and personalized recommendations.",
  },
  signup: {
    eyebrow: "Join LuxeCart",
    title: "Create your account",
    description: "Sign up to save your favorites and get a more personal shopping experience.",
  },
  "forgot-password": {
    eyebrow: "Password help",
    title: "Choose a new password",
    description: "Enter your account email and choose a new password to regain access.",
  },
};

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const copy = pageCopy[mode];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim().toLowerCase();
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirm-password") ?? "");

    if (mode !== "login" && password.length < 8) {
      setIsError(true);
      setMessage("Use at least 8 characters for your password.");
      return;
    }

    if (mode !== "login" && password !== confirmation) {
      setIsError(true);
      setMessage("The passwords do not match. Please try again.");
      return;
    }

    try {
      const accounts = getDemoAccounts();

      if (mode === "signup") {
        if (accounts.some((account) => account.email === email)) {
          setIsError(true);
          setMessage("An account with this email already exists. Please sign in instead.");
          return;
        }

        saveDemoAccounts([...accounts, { email, password }]);
        setIsError(false);
        setMessage("Your account is ready. Sign in with your new email and password.");
        return;
      }

      if (mode === "forgot-password") {
        const accountIndex = accounts.findIndex((account) => account.email === email);
        if (accountIndex === -1) {
          setIsError(true);
          setMessage("No account was found for this email address.");
          return;
        }

        accounts[accountIndex] = { email, password };
        saveDemoAccounts(accounts);
        setIsError(false);
        setMessage("Your password has been changed. You can now sign in.");
        return;
      }

      const accountExists = accounts.some(
        (account) => account.email === email && account.password === password,
      );
      if (!accountExists) {
        setIsError(true);
        setMessage("Email or password is incorrect.");
        return;
      }

      setDemoSession(email);
      router.push("/");
    } catch {
      setIsError(true);
      setMessage("Could not access locally saved demo accounts. Check your browser storage and try again.");
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel" aria-labelledby="auth-title">
        <Link href="/" className="brand-row" aria-label="LuxeCart home">
          <span className="brand-mark" aria-hidden="true">L</span>
          <span className="brand-name">LuxeCart</span>
        </Link>

        <div className="login-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1 id="auth-title">{copy.title}</h1>
          <p>{copy.description}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">
            Email address (your user ID)
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </label>

          <label htmlFor="password">
            {mode === "forgot-password" ? "New password" : "Password"}
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "login" ? "Enter your password" : "At least 8 characters"}
              minLength={mode === "login" ? undefined : 8}
              required
            />
          </label>

          {mode !== "login" && (
            <label htmlFor="confirm-password">
              Re-enter password
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Enter the password again"
                minLength={8}
                required
              />
            </label>
          )}

          {mode === "login" && (
            <div className="form-row">
              <span>Demo: {DEMO_ACCOUNT.email} / {DEMO_ACCOUNT.password}</span>
              <Link href="/forgot-password">Forgot password?</Link>
            </div>
          )}

          {message && (
            <p className={`auth-notice${isError ? " error" : " success"}`} role={isError ? "alert" : "status"}>
              {message}
              {!isError && mode !== "login" && (
                <>
                  {" "}
                  <Link href="/login">Go to sign in</Link>
                </>
              )}
            </p>
          )}

          <button type="submit" className="primary-btn login-btn" id={`${mode}-submit`}>
            {mode === "login" ? "Sign in" : mode === "signup" ? "Create account" : "Change password"}
          </button>
        </form>

        <p className="signup-text">
          {mode === "login" ? (
            <>
              Don’t have an account? <Link href="/signup">Create one</Link>
            </>
          ) : mode === "signup" ? (
            <>
              Already have an account? <Link href="/login">Sign in</Link>
            </>
          ) : (
            <>
              Remembered your password? <Link href="/login">Sign in</Link>
            </>
          )}
        </p>
        <p className="auth-demo-note">
          Demo only: account details are stored in this browser and are not protected by a secure authentication service.
        </p>
      </section>

      <aside className="promo-panel" aria-label="LuxeCart member perks">
        <div className="promo-card">
          <p className="eyebrow light">Member perks</p>
          <h2>Save up to 30% this week</h2>
          <ul>
            <li>Exclusive drops</li>
            <li>Free shipping over $100</li>
            <li>Early access to sales</li>
          </ul>
          <Link href="/" className="secondary-btn light-btn">Explore deals</Link>
        </div>
      </aside>
    </main>
  );
}
