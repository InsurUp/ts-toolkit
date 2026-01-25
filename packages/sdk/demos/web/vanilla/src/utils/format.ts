/**
 * Formatting utilities for dates, numbers, and strings.
 */

import { Currency, PolicyState } from "@insurup/contracts";

// Map SDK Currency enum values to ISO 4217 currency codes
const CURRENCY_TO_ISO: Record<string, string> = {
  [Currency.Unknown]: "TRY",           // Default fallback
  [Currency.TurkishLira]: "TRY",
  [Currency.UnitedStatesDollar]: "USD",
  [Currency.Euro]: "EUR",
};

/**
 * Convert SDK Currency enum value to ISO 4217 currency code.
 */
function toIsoCurrencyCode(currency: Currency | string): string {
  return CURRENCY_TO_ISO[currency] ?? currency;
}

/**
 * Format a date for display.
 */
export function formatDate(date: Date | string | number | undefined | null): string {
  if (!date) return "-";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date | string | number | undefined | null): string {
  if (!date) return "-";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "-";

  return d.toLocaleString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a number as currency.
 * Accepts SDK Currency enum values and converts them to ISO 4217 codes.
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency: Currency | string = Currency.TurkishLira
): string {
  if (amount === undefined || amount === null) return "-";

  const isoCode = toIsoCurrencyCode(currency);

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: isoCode,
  }).format(amount);
}

/**
 * Format a number with thousands separator.
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "-";

  return new Intl.NumberFormat("tr-TR").format(num);
}

/**
 * Format relative time (e.g., "2 hours ago").
 */
export function formatRelativeTime(date: Date | string | number | undefined | null): string {
  if (!date) return "-";

  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "-";

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  } else {
    return formatDate(d);
  }
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string | undefined | null, maxLength: number): string {
  if (!str) return "-";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Format customer type for display.
 */
export function formatCustomerType(type: string | undefined | null): string {
  if (!type) return "-";

  const types: Record<string, string> = {
    Individual: "Individual",
    Company: "Company",
    Foreign: "Foreign",
  };

  return types[type] || type;
}

/**
 * Format policy state for display.
 * Accepts SDK PolicyState enum values.
 */
export function formatPolicyState(state: PolicyState | string | undefined | null): string {
  if (!state) return "-";

  const states: Record<string, string> = {
    [PolicyState.Active]: "Active",
    [PolicyState.EndOfLife]: "Expired",
    [PolicyState.Cancelled]: "Cancelled",
    // Fallback for string values
    "Active": "Active",
    "Expired": "Expired",
    "Cancelled": "Cancelled",
  };

  return states[state] || state;
}

/**
 * Get badge class for policy state.
 * Accepts SDK PolicyState enum values.
 */
export function getPolicyStateBadgeClass(state: PolicyState | string | undefined | null): string {
  if (!state) return "";

  const classes: Record<string, string> = {
    [PolicyState.Active]: "success",
    [PolicyState.EndOfLife]: "warning",
    [PolicyState.Cancelled]: "danger",
    // Fallback for string values
    "Active": "success",
    "Expired": "warning",
    "Cancelled": "danger",
  };

  return classes[state] || "";
}
