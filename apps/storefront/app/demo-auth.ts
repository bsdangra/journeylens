const ACCOUNTS_STORAGE_KEY = "luxecart-demo-accounts";
const SESSION_STORAGE_KEY = "luxecart-demo-session";

export type DemoAccount = {
  email: string;
  password: string;
};

export const DEMO_ACCOUNT: DemoAccount = {
  email: "hello@luxecart.com",
  password: "password123",
};

function isDemoAccount(value: unknown): value is DemoAccount {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const account = value as Record<string, unknown>;
  return typeof account.email === "string" && typeof account.password === "string";
}

export function getDemoAccounts(): DemoAccount[] {
  const storedAccounts = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);

  if (storedAccounts === null) {
    saveDemoAccounts([DEMO_ACCOUNT]);
    return [DEMO_ACCOUNT];
  }

  const accounts: unknown = JSON.parse(storedAccounts);
  if (!Array.isArray(accounts) || !accounts.every(isDemoAccount)) {
    throw new Error("Saved demo accounts are invalid.");
  }

  return accounts;
}

export function saveDemoAccounts(accounts: DemoAccount[]) {
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export function setDemoSession(email: string) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, email);
}

export function getDemoSession() {
  return window.localStorage.getItem(SESSION_STORAGE_KEY);
}

export function clearDemoSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
