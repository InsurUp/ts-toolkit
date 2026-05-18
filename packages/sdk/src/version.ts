/**
 * SDK version information.
 * @module version
 */

import pkg from '../package.json' with { type: 'json' };

/**
 * The current version of the InsurUp SDK.
 * This value is automatically derived from package.json.
 */
export const VERSION: string = pkg.version;
