/**
 * Content dates are calendar dates (YYYY-MM-DD). Formatting them in UTC keeps
 * the day stable across server and client time zones.
 */
const toDate = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** "02 Nov 2026" — metadata columns (set in caps by CSS). */
export const formatShortDate = (isoDate: string) => shortDate.format(toDate(isoDate));

export const formatYear = (isoDate: string) => isoDate.slice(0, 4);

/** "2025–2026", or a single year; null without dates. */
export function formatYearSpan(isoDates: readonly string[]) {
  if (isoDates.length === 0) return null;
  const years = isoDates.map((isoDate) => Number(formatYear(isoDate)));
  const first = Math.min(...years);
  const last = Math.max(...years);
  return first === last ? String(first) : `${first}–${last}`;
}

export const formatUsd = (amount: number) => usd.format(amount);

export const formatReadingTime = (minutes: number) => `${minutes} min read`;
