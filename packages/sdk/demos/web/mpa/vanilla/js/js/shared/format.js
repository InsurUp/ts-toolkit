/**
 * Formatting utilities.
 */

import { Currency, PolicyState } from '@insurup/contracts';

const CURRENCY_TO_ISO = {
  [Currency.Unknown]: 'TRY',
  [Currency.TurkishLira]: 'TRY',
  [Currency.UnitedStatesDollar]: 'USD',
  [Currency.Euro]: 'EUR',
};

function toIsoCurrencyCode(currency) {
  return CURRENCY_TO_ISO[currency] ?? currency;
}

/**
 * @param {Date|string|number|undefined|null} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * @param {Date|string|number|undefined|null} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '-';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * @param {number|undefined|null} amount
 * @param {string} [currency]
 * @returns {string}
 */
export function formatCurrency(amount, currency = Currency.TurkishLira) {
  if (amount === undefined || amount === null) return '-';
  const isoCode = toIsoCurrencyCode(currency);
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: isoCode,
  }).format(amount);
}

/**
 * @param {string|undefined|null} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength) {
  if (!str) return '-';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/**
 * @param {string|undefined|null} type
 * @returns {string}
 */
export function formatCustomerType(type) {
  if (!type) return '-';
  const types = {
    Individual: 'Individual',
    Company: 'Company',
    Foreign: 'Foreign',
  };
  return types[type] || type;
}

/**
 * @param {string|undefined|null} state
 * @returns {string}
 */
export function formatPolicyState(state) {
  if (!state) return '-';
  const states = {
    [PolicyState.Active]: 'Active',
    [PolicyState.EndOfLife]: 'Expired',
    [PolicyState.Cancelled]: 'Cancelled',
  };
  return states[state] || state;
}

/**
 * @param {string|undefined|null} state
 * @returns {string}
 */
export function getPolicyStateBadgeClass(state) {
  if (!state) return '';
  const classes = {
    [PolicyState.Active]: 'success',
    [PolicyState.EndOfLife]: 'warning',
    [PolicyState.Cancelled]: 'danger',
  };
  return classes[state] || '';
}
