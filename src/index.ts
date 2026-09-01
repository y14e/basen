/**
 * BaseN
 *
 * @version 1.0.2
 * @author Yusuke Kamiyamane
 * @license MIT
 * @copyright Copyright (c) Yusuke Kamiyamane
 * @see {@link https://github.com/y14e/basen-ts}
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

export function generateBase36Hash(
  data: string | Buffer = '',
  length = 8,
): string {
  return generateBaseNHash(BASE36_CHARS, data, length);
}

export function generateBase36Random(length = 8): string {
  return generateBaseNRandom(BASE36_CHARS, length);
}

export function generateBase62Hash(
  data: string | Buffer = '',
  length = 8,
): string {
  return generateBaseNHash(BASE62_CHARS, data, length);
}

export function generateBase62Random(length = 8): string {
  return generateBaseNRandom(BASE62_CHARS, length);
}

// -----------------------------------------------------------------------------
// Core
// -----------------------------------------------------------------------------

function generateBaseNHash(
  chars: string,
  data: string | Buffer,
  length: number,
): string {
  if (typeof data !== 'string' && !Buffer.isBuffer(data)) {
    console.warn('Invalid data. Fallback: empty string.');
    data = '';
  }

  if (length < 1 || length > 64) {
    console.warn('Invalid length. Fallback: 8.');
    length = 8;
  }

  let result = '';
  let n = BigInt(`0x${createHash('sha256').update(data).digest('hex')}`);
  const base = BigInt(chars.length);

  while (result.length < length) {
    result = chars[Number(n % base)] + result;
    n /= base;
  }

  return result;
}

function generateBaseNRandom(chars: string, length: number): string {
  if (length < 1 || length > 64) {
    console.warn('Invalid length. Fallback: 8.');
    length = 8;
  }

  let result = '';
  const randoms = crypto.getRandomValues(new Uint8Array(length));
  const base = chars.length;

  for (let i = 0; i < length; i++) {
    result += chars[(randoms[i] ?? 0) % base];
  }

  return result;
}
