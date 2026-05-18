/**
 * Formatting utilities.
 */

import { Currency, PolicyState, DateTime, DateOnly } from '@insurup/contracts';

const CURRENCY_TO_ISO: Record<string, string> = {
  [Currency.Unknown]: 'TRY',
  [Currency.TurkishLira]: 'TRY',
  [Currency.UnitedStatesDollar]: 'USD',
  [Currency.Euro]: 'EUR',
};

function toIsoCurrencyCode(currency: Currency | string): string {
  return CURRENCY_TO_ISO[currency] ?? currency;
}

type DateInput = Date | DateTime | DateOnly | string | number | undefined | null;

function toNativeDate(date: DateInput): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;
  if (date instanceof DateTime) return date.toDate();
  if (date instanceof DateOnly) return date.toDate();
  if (typeof date === 'string' || typeof date === 'number') return new Date(date);
  return null;
}

export function formatDate(date: DateInput): string {
  const d = toNativeDate(date);
  if (!d || isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: DateInput): string {
  const d = toNativeDate(date);
  if (!d || isNaN(d.getTime())) return '-';
  return d.toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(
  amount: number | undefined | null,
  currency: Currency | string = Currency.TurkishLira
): string {
  if (amount === undefined || amount === null) return '-';
  const isoCode = toIsoCurrencyCode(currency);
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: isoCode,
  }).format(amount);
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return '-';
  return new Intl.NumberFormat('tr-TR').format(num);
}

export function truncate(str: string | undefined | null, maxLength: number): string {
  if (!str) return '-';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

export function formatCustomerType(type: string | undefined | null): string {
  if (!type) return '-';
  const types: Record<string, string> = {
    Individual: 'Individual',
    Company: 'Company',
    Foreign: 'Foreign',
  };
  return types[type] || type;
}

export function formatPolicyState(state: PolicyState | string | undefined | null): string {
  if (!state) return '-';
  const states: Record<string, string> = {
    [PolicyState.Active]: 'Active',
    [PolicyState.EndOfLife]: 'Expired',
    [PolicyState.Cancelled]: 'Cancelled',
  };
  return states[state] || state;
}

export function getPolicyStateBadgeClass(state: PolicyState | string | undefined | null): string {
  if (!state) return '';
  const classes: Record<string, string> = {
    [PolicyState.Active]: 'success',
    [PolicyState.EndOfLife]: 'warning',
    [PolicyState.Cancelled]: 'danger',
  };
  return classes[state] || '';
}
