/**
 * @fileoverview Query string helper for endpoint render functions
 * @description Appends scalar query parameters to a path, skipping the ones left undefined
 */

/**
 * A query parameter value. `undefined` leaves the parameter out.
 */
export type QueryValue = string | number | boolean | undefined;

/**
 * Appends `params` to `path` as a query string, in insertion order, skipping `undefined` values.
 * Returns `path` unchanged when no parameter is set.
 *
 * `params` değerlerini `path`'e sorgu dizesi olarak ekler; `undefined` olanları atlar.
 */
export function withQuery(path: string, params: Readonly<Record<string, QueryValue>>): string {
  const query = Object.entries(params)
    .filter((entry): entry is [string, string | number | boolean] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  return query.length > 0 ? `${path}?${query.join('&')}` : path;
}
