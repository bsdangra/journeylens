// A fixed locale and time zone keep server and client output identical.
const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function formatShortDate(iso: string) {
  return dateFormat.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return `${dateTimeFormat.format(new Date(iso))} UTC`;
}

export function formatDuration(ms: number) {
  return `${(ms / 1000).toFixed(1)} s`;
}

export function hostnameOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}
