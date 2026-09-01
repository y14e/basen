/**
 * base.ts
 *
 * @version 1.0.0
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/base-ts}
 */

// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import { createHash } from 'node:crypto';

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const BASE36_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';
const BASE62_CHARS =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

// -----------------------------------------------------------------------------
// APIs
// -----------------------------------------------------------------------------

export function generateBase36Hash(data: string | Buffer, length = 8): string {
  let result = '';
  let n = BigInt(`0x${createHash('sha256').update(data).digest('hex')}`);

  while (result.length < length) {
    result = BASE36_CHARS[Number(n % 36n)] + result;
    n /= 36n;
  }

  return result;
}

export function generateBase36Random(length = 8): string {
  let result = '';
  const randoms = crypto.getRandomValues(new Uint8Array(length));

  for (let i = 0; i < length; i++) {
    result += BASE36_CHARS[randoms[i] % 36];
  }

  return result;
}

export function generateBase62Hash(data: string | Buffer, length = 8): string {
  let result = '';
  let n = BigInt(`0x${createHash('sha256').update(data).digest('hex')}`);

  while (result.length < length) {
    result = BASE62_CHARS[Number(n % 62n)] + result;
    n /= 62n;
  }

  return result;
}

export function generateBase62Random(length = 8): string {
  let result = '';
  const randoms = crypto.getRandomValues(new Uint8Array(length));

  for (let i = 0; i < length; i++) {
    result += BASE62_CHARS[randoms[i] % 62];
  }

  return result;
}
